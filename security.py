from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, UserStatus

# Xavfsizlik kalitlari (Productionda bular .env faylda bo'lishi shart!)
SECRET_KEY = "FOOTBALL_RISE_ULTIMATE_SECRET_KEY_PROD"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 hafta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Tizimga kirgan foydalanuvchini aniqlash
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
        
    user = db.query(User).filter(User.id == int(user_id)).first()
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
