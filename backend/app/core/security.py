from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import User, UserStatus, UserRole

import os
import hmac
import hashlib
import urllib.parse
import time
import logging
from collections import defaultdict
from dotenv import load_dotenv

# .env fayldan barcha maxfiy ma'lumotlarni yuklash
load_dotenv()

logger = logging.getLogger("security")

# Xavfsizlik kalitlari (.env dan o'qiladi)
def _require_env(name: str, min_len: int = 1) -> str:
    """Majburiy sir. .env / Railway o'zgaruvchilarida bo'lmasa ilova ishga tushmaydi."""
    value = (os.getenv(name) or "").strip()
    if len(value) < min_len:
        raise RuntimeError(
            f"{name} o'rnatilmagan yoki juda qisqa (kamida {min_len} belgi). "
            f".env faylga yoki Railway Variables ga qo'shing."
        )
    return value


IS_PRODUCTION = (
    os.getenv("ENVIRONMENT", "development").lower() == "production"
    or os.getenv("RAILWAY_ENVIRONMENT") is not None
    or os.getenv("RAILWAY_PROJECT_ID") is not None
)

# Standart (default) qiymatlar YO'Q: sirlar faqat muhit o'zgaruvchilaridan olinadi
SECRET_KEY = _require_env("SECRET_KEY", 32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))
BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()

# Admin boshqaruv kalitlari
ADMIN_USERNAME = _require_env("ADMIN_USERNAME", 3)
ADMIN_PASSKEY = _require_env("ADMIN_PASSKEY", 12)

# Telegram bot -> API uchun alohida kalit (admin huquqi bermaydi, faqat bot endpointlari)
BOT_API_KEY = (os.getenv("BOT_API_KEY") or "").strip()

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

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

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
        
    try:
        uid = int(user_id)
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == uid).first()
    if user is None:
        raise credentials_exception
        
    if user.status == UserStatus.BANNED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Hisobingiz bloklangan!")
        
    return user

oauth2_optional = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


def get_optional_user(token: str | None = Depends(oauth2_optional), db: Session = Depends(get_db)):
    """Token bo'lsa foydalanuvchini qaytaradi; yo'q yoki noto'g'ri bo'lsa None (xato bermaydi)."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = int(payload.get("sub"))
    except (JWTError, ValueError, TypeError):
        return None
    user = db.query(User).filter(User.id == uid).first()
    if user is None or user.status == UserStatus.BANNED:
        return None
    return user


def safe_equals(a, b) -> bool:
    """Vaqt bo'yicha hujumga chidamli taqqoslash (parol/kalit uchun)."""
    return hmac.compare_digest(str(a or "").encode("utf-8"), str(b or "").encode("utf-8"))


def require_bot_key(x_bot_key: str = Header(default="")):
    """Faqat Telegram bot uchun: X-Bot-Key sarlavhasi BOT_API_KEY ga teng bo'lishi shart."""
    if not BOT_API_KEY or not safe_equals(x_bot_key, BOT_API_KEY):
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")


def get_client_ip(request: Request) -> str:
    """
    Proksi (Railway) ortida haqiqiy IP. TRUSTED_PROXY_HOPS = ishonchli proksilar soni (standart 1).
    X-Forwarded-For ning chap tomonini mijoz soxtalashtirishi mumkin, shuning uchun
    o'ng tomondan hisoblaymiz.
    """
    hops = int(os.getenv("TRUSTED_PROXY_HOPS", "1"))
    xff = request.headers.get("x-forwarded-for", "")
    parts = [p.strip() for p in xff.split(",") if p.strip()]
    if parts and hops > 0:
        return parts[-hops] if len(parts) >= hops else parts[0]
    return request.client.host if request.client else "127.0.0.1"


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
            raise HTTPException(status_code=403, detail="Sizda bu amalni bajarish uchun ruxsat yo'q!")
            
        return current_user
    return role_checker


# ==============================================================
# 1. BROKEN ACCESS CONTROL & IDOR HIMOYASI (OWNERSHIP CHECK)
# ==============================================================
def check_ownership(resource_owner_id: int, current_user: User, resource_name: str = "resurs"):
    """
    IDOR (Insecure Direct Object Reference) va Broken Access Control himoyasi:
    Foydalanuvchi faqat O'ZIGA tegishli resursni o'zgartira yoki o'chira oladi.
    Admin uchun to'liq ruxsat beriladi.
    """
    if current_user.role != UserRole.ADMIN and current_user.id != resource_owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Ruxsat yo'q! Siz boshqa foydalanuvchining {resource_name} ma'lumotlarini o'zgartira olmaysiz."
        )


# ==============================================================
# 2. TELEGRAM HMAC-SHA256 KRIPTOGRAFIK IMZO TEKSHIRUVI
# ==============================================================
def verify_telegram_init_data(init_data: str, bot_token: str = None) -> bool:
    """
    Telegram Mini App rasmiy HMAC-SHA256 tekshiruvi.
    Foydalanuvchi so'rovni bot orqali yuborganini va Telegram ID soxtalashtirilmaganini kafolatlaydi.
    """
    if not init_data:
        return False
        
    token = bot_token or BOT_TOKEN
    if not token or ":" not in token or token.startswith("1234567890"):
        # Faqat lokal ishlab chiqishda ruxsat; productionda HECH QACHON
        if IS_PRODUCTION:
            logger.error("BOT_TOKEN sozlanmagan: Telegram autentifikatsiyasi rad etildi.")
            return False
        logger.warning("Telegram Bot Token test rejimida, HMAC tekshiruvi bypass qilindi (faqat dev).")
        return True

    try:
        parsed_data = dict(urllib.parse.parse_qsl(init_data))
        if "hash" not in parsed_data:
            return False

        received_hash = parsed_data.pop("hash")

        # auth_date tekshiruvi (Replay attack oldini olish: 48 soat)
        auth_date = int(parsed_data.get("auth_date", 0))
        current_ts = int(time.time())
        if current_ts - auth_date > 86400 * 2:
            return False

        # Alfavit tartibida data_check_string hosil qilish
        data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed_data.items()))

        # Telegram spec: secret_key = HMAC_SHA256("WebAppData", bot_token)
        secret_key = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()

        # calculated_hash = HMAC_SHA256(secret_key, data_check_string)
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        return hmac.compare_digest(calculated_hash, received_hash)
    except Exception as e:
        logger.error(f"Telegram HMAC tekshirishda xatolik: {e}")
        return False


# ==============================================================
# 3. RATE LIMITER & BRUTE-FORCE ANTI-DDOS QALQONI
# ==============================================================
class InMemoryRateLimiter:
    """
    IP manzil bo'yicha daqiqalik so'rovlarni cheklovchi xotira qalqoni.
    - Auth (login/register): daqiqasiga ko'pi bilan 10 urinish
    - General API: daqiqasiga ko'pi bilan 120 so'rov
    - Ketma-ket 5 ta xatodan keyin IP vaqtincha muzlatiladi
    """
    def __init__(self):
        # ip -> list of timestamps
        self.requests = defaultdict(list)
        # ip -> int failed attempts
        self.failed_logins = defaultdict(int)
        # ip -> unban timestamp
        self.blocked_ips = {}

    def is_blocked(self, ip: str) -> bool:
        unban_time = self.blocked_ips.get(ip)
        if unban_time:
            if time.time() < unban_time:
                return True
            else:
                del self.blocked_ips[ip]
                self.failed_logins[ip] = 0
        return False

    def block_ip(self, ip: str, duration_seconds: int = 600):
        self.blocked_ips[ip] = time.time() + duration_seconds
        logger.warning(f"🚨 IP {ip} {duration_seconds} soniyaga bloklandi (Brute-force / Shubhali faoliyat).")

    def check(self, ip: str, is_auth: bool = False) -> tuple[bool, str]:
        if self.is_blocked(ip):
            remaining = int(self.blocked_ips[ip] - time.time())
            return False, f"Xavfsizlik tizimi: IP manzilingiz vaqtincha bloklangan. Qayta urinish: {remaining} soniya."

        now = time.time()
        window = 60.0 # 1 daqiqa
        max_requests = 10 if is_auth else 120

        # Eski so'rovlarni tozalash
        self.requests[ip] = [t for t in self.requests[ip] if now - t < window]

        if len(self.requests[ip]) >= max_requests:
            return False, f"Juda ko'p so'rov yuborildi! Iltimos, 1 daqiqadan keyin qayta urining (Rate limit: {max_requests}/min)."

        self.requests[ip].append(now)
        return True, "OK"

    def record_failed_auth(self, ip: str):
        self.failed_logins[ip] += 1
        if self.failed_logins[ip] >= 5:
            # 10 daqiqa (600 sek) blok
            self.block_ip(ip, 600)

    def record_success_auth(self, ip: str):
        self.failed_logins.pop(ip, None)


rate_limiter = InMemoryRateLimiter()


# ==============================================================
# 4. INTRUSION DETECTION & SHUBHALI FAOLIYAT KUZATUVCHISI
# ==============================================================
SUSPICIOUS_PATTERNS = [
    "../", "..\\", "etc/passwd", "win.ini",
    "union select", "select * from", "or 1=1", "-- ", ";--",
    "<script", "javascript:", "eval(", "base64_"
]

def detect_malicious_payload(query_string: str, body_str: str = "") -> bool:
    combined = (query_string + " " + body_str).lower()
    for pat in SUSPICIOUS_PATTERNS:
        if pat in combined:
            return True
    return False


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return {}

