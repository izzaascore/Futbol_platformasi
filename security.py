from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, UserStatus

import os
from dotenv import load_dotenv
from models import UserRole

# .env fayldan barcha maxfiy ma'lumotlarni yuklash
load_dotenv()

# Xavfsizlik kalitlari (.env dan o'qiladi)
SECRET_KEY = os.getenv("SECRET_KEY", "FOOTBALL_RISE_ULTIMATE_SECRET_KEY_PROD")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))
MASTER_TOKEN = os.getenv("MASTER_TOKEN", "super-secret-admin-token")

import bcrypt
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password: str) -> str:
    pwd_bytes = password[:72].encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password[:72].encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Tizimga kirgan foydalanuvchini aniqlash
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if token == MASTER_TOKEN:
        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if admin_user:
            return admin_user

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Tasdiqlash tokeni xato yoki muddati tugagan",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    try:
        uid = int(user_id)
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == uid).first()
    if user is None:
        raise credentials_exception
    return user

# Maxsus ruxsatlarni tekshirish (RBAC)
def RequireRole(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        # Banned userlarni bloklash
        if current_user.status == UserStatus.BANNED:
            raise HTTPException(status_code=403, detail="Hisobingiz bloklangan!")
            
        # Skautlarning tasdiqlanishini kutish
        if current_user.role == "scout" and current_user.status == UserStatus.PENDING:
            raise HTTPException(status_code=403, detail="Skautlik hisobingiz hali admin tomonidan tasdiqlanmagan. Iltimos kuting.")
            
        # Ruxsatni tekshirish
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Sizda bu sahifaga kirish (amalni bajarish) uchun ruxsat yo'q!")
            
        return current_user
    return role_checker
