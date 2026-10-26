import os
import sys
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Yo'llarni to'g'ri sozlash (sys.path)
BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent
for p in [str(BACKEND_DIR), str(ROOT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.database import Base, engine
from app.core.security import rate_limiter, detect_malicious_payload


# Ma'lumotlar bazasi jadvallarini avtomatik yaratish
Base.metadata.create_all(bind=engine)


def auto_migrate_db():
    """
    Self-healing database schema synchronizer.
    Ensures existing SQLite / Postgres tables contain newly added model columns.
    """
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        # 1. Products table columns
        if "products" in tables:
            product_cols = [c["name"] for c in inspector.get_columns("products")]
            with engine.begin() as conn:
                if "category" not in product_cols:
                    conn.execute(text("ALTER TABLE products ADD COLUMN category VARCHAR(50) DEFAULT 'smart'"))
                    print("[Auto-Migration] 'products' jadvaliga 'category' ustuni qo'shildi.")
                if "badge" not in product_cols:
                    conn.execute(text('ALTER TABLE products ADD COLUMN badge VARCHAR(50)'))
                    print("[Auto-Migration] 'products' jadvaliga 'badge' ustuni qo'shildi.")
                if "stock" not in product_cols:
                    conn.execute(text('ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 10'))
                    print("[Auto-Migration] 'products' jadvaliga 'stock' ustuni qo'shildi.")

        # 2. Scout invitations check
        if "scout_invitations" in tables:
            scout_cols = [c["name"] for c in inspector.get_columns("scout_invitations")]
            with engine.begin() as conn:
                if "status" not in scout_cols:
                    conn.execute(text("ALTER TABLE scout_invitations ADD COLUMN status VARCHAR(30) DEFAULT 'kutilmoqda'"))
                    print("[Auto-Migration] 'scout_invitations' jadvaliga 'status' ustuni qo'shildi.")

        # 3. Users table (unikal username va phone qo'shish)
        if "users" in tables:
            user_cols = [c["name"] for c in inspector.get_columns("users")]
            with engine.begin() as conn:
                if "username" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(50)"))
                    print("[Auto-Migration] 'users' jadvaliga 'username' ustuni qo'shildi.")
                if "phone" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(30)"))
                    print("[Auto-Migration] 'users' jadvaliga 'phone' ustuni qo'shildi.")

    except Exception as e:
        print(f"[Auto-Migration Notice] {e}")


auto_migrate_db()

def purge_stale_admin_accounts():
    """Ishga tushganda bazadagi eski backdoor admin hisoblarini tozalaydi."""
    try:
        from app.core.database import SessionLocal
        from app.models.models import User, UserRole
        from app.core.security import ADMIN_PASSKEY, verify_password
        db = SessionLocal()
        try:
            admin_users = db.query(User).filter(User.role == UserRole.ADMIN).all()
            stale = [u for u in admin_users if not verify_password(ADMIN_PASSKEY, u.password_hash)]
            if stale:
                for u in stale:
                    print('[Security] Eski backdoor admin hisobi ochrildi: id=%d %s %s' % (u.id, u.first_name, u.last_name))
                    db.delete(u)
                db.commit()
                print('[Security] %d ta eski admin hisob tozalandi.' % len(stale))
        finally:
            db.close()
    except Exception as exc:
        print('[Security Notice] Admin tozalash: %s' % str(exc))


purge_stale_admin_accounts()

IS_PRODUCTION = (
    os.getenv("ENVIRONMENT", "development").lower() == "production"
    or os.getenv("RAILWAY_ENVIRONMENT") is not None
    or os.getenv("RAILWAY_PROJECT_ID") is not None
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 24/7 Bulutli Bot: Agar BOT_TOKEN mavjud bo'lsa, botni bitta serverda fonda yurgizamiz
    bot_task = None
    bot_token = (os.getenv("BOT_TOKEN") or os.getenv("TELEGRAM_BOT_TOKEN") or "").strip()
    if bot_token and ":" in bot_token and not bot_token.startswith("1234567890") and bot_token != "your_bot_token_here":
        try:
            from bot.bot import bot, dp
            print("🚀 Bulutda 24/7 Telegram Bot avtomatik ishga tushirilmoqda...")
            bot_task = asyncio.create_task(dp.start_polling(bot))
        except Exception as e:
            print(f"⚠️ Telegram botni fonda ishga tushirishda ogohlantirish: {e}")

    yield

    if bot_task:
        bot_task.cancel()


app = FastAPI(
    title="Football Platform API",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
    lifespan=lifespan,
)

# CORS sozlamalari
ALLOWED_ORIGINS = [
    "https://futbol-platformasi-alpha.vercel.app",
    "https://web-production-dc0f4.up.railway.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
frontend_env = os.getenv("WEBAPP_URL")
if frontend_env and frontend_env not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(frontend_env)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Kiber-Himoya Middleware: Rate Limiting & Intrusion Detection
@app.middleware("http")
async def security_defense_middleware(request: Request, call_next):
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "127.0.0.1"

    # 1. Zararli so'rovlar / SQL Injection / Path Traversal tekshiruvi
    if detect_malicious_payload(str(request.url.query)):
        rate_limiter.block_ip(client_ip, 3600)
        return JSONResponse(
            status_code=403,
            content={"detail": "Xavfsizlik tizimi: Noqonuniy so'rov (Inyeksiya/Buzish) aniqlandi va IP bloklandi."},
        )

    # 2. Rate Limiting tekshiruvi (Brute-force / DoS spamdan himoya)
    path = request.url.path
    is_auth_route = any(p in path for p in ["/api/auth/", "/admin/login"])
    allowed, msg = rate_limiter.check(client_ip, is_auth=is_auth_route)
    if not allowed:
        return JSONResponse(status_code=429, content={"detail": msg})

    response = await call_next(request)

    if is_auth_route and response.status_code == 401:
        rate_limiter.record_failed_auth(client_ip)
    elif is_auth_route and response.status_code == 200:
        rate_limiter.record_success_auth(client_ip)

    # 3. Kiber-Xavfsizlik Sarlavhalari (Security Headers)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if IS_PRODUCTION or request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response


# Static fayllar (Uploads)
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / "videos").mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


@app.get("/")
def home():
    return {"message": "Football Platform API ishlayapti!"}


# Barcha API marshrutlarini ulash
from app.api import (
    auth_router,
    players_router,
    matches_router,
    tournaments_router,
    scouts_router,
    shop_router,
    community_router,
)

app.include_router(auth_router)
app.include_router(players_router)
app.include_router(matches_router)
app.include_router(tournaments_router)
app.include_router(scouts_router)
app.include_router(shop_router)
app.include_router(community_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
