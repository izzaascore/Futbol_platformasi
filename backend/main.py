import os
import sys
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Yo'llarni to'g'ri sozlash (sys.path)
BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"
for p in [str(BACKEND_DIR), str(ROOT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from starlette.responses import JSONResponse, RedirectResponse, FileResponse
from sqlalchemy.orm import Session

from app.core.database import Base, engine, get_db
from app.core.security import rate_limiter, detect_malicious_payload, get_client_ip


# Ma'lumotlar bazasi jadvallarini avtomatik yaratish
Base.metadata.create_all(bind=engine)


def auto_migrate_db():
    """
    Self-healing database schema synchronizer.
    Ensures existing SQLite / Postgres tables contain newly added model columns.
    Uses PostgreSQL-compliant single quotes for DEFAULT string literals.
    """
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        # 1. User videos columns (title, duration)
        if "user_videos" in tables:
            uv_cols = [c["name"] for c in inspector.get_columns("user_videos")]
            if "title" not in uv_cols:
                try:
                    with engine.begin() as conn:
                        conn.execute(text("ALTER TABLE user_videos ADD COLUMN title VARCHAR(255)"))
                        print("[Auto-Migration] 'user_videos' jadvaliga 'title' ustuni qo'shildi.")
                except Exception as e:
                    print(f"[Auto-Migration Notice title] {e}")

            if "duration" not in uv_cols:
                try:
                    with engine.begin() as conn:
                        conn.execute(text("ALTER TABLE user_videos ADD COLUMN duration VARCHAR(50) DEFAULT '00:00'"))
                        print("[Auto-Migration] 'user_videos' jadvaliga 'duration' ustuni qo'shildi.")
                except Exception as e:
                    print(f"[Auto-Migration Notice duration] {e}")

            if "telegram_file_id" not in uv_cols:
                try:
                    with engine.begin() as conn:
                        conn.execute(text("ALTER TABLE user_videos ADD COLUMN telegram_file_id VARCHAR(255)"))
                        print("[Auto-Migration] 'user_videos' jadvaliga 'telegram_file_id' ustuni qo'shildi.")
                except Exception as e:
                    print(f"[Auto-Migration Notice telegram_file_id] {e}")

        # 2. Players table photo_url column
        if "players" in tables:
            player_cols = [c["name"] for c in inspector.get_columns("players")]
            if "photo_url" not in player_cols:
                try:
                    with engine.begin() as conn:
                        conn.execute(text("ALTER TABLE players ADD COLUMN photo_url VARCHAR(255)"))
                        print("[Auto-Migration] 'players' jadvaliga 'photo_url' ustuni qo'shildi.")
                except Exception as e:
                    print(f"[Auto-Migration Notice photo_url] {e}")

        # 3. Scout invitations check
        if "scout_invitations" in tables:
            scout_cols = [c["name"] for c in inspector.get_columns("scout_invitations")]
            if "status" not in scout_cols:
                try:
                    with engine.begin() as conn:
                        conn.execute(text("ALTER TABLE scout_invitations ADD COLUMN status VARCHAR(30) DEFAULT 'kutilmoqda'"))
                        print("[Auto-Migration] 'scout_invitations' jadvaliga 'status' ustuni qo'shildi.")
                except Exception as e:
                    print(f"[Auto-Migration Notice status] {e}")

    except Exception as e:
        print(f"[Auto-Migration Notice] {e}")


auto_migrate_db()

IS_PRODUCTION = (
    os.getenv("ENVIRONMENT", "development").lower() == "production"
    or os.getenv("RAILWAY_ENVIRONMENT") is not None
    or os.getenv("RAILWAY_PROJECT_ID") is not None
    or os.getenv("RENDER") is not None
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 24/7 Bulutli Bot: Agar BOT_TOKEN mavjud bo'lsa, botni bitta serverda fonda yurgizamiz
    bot_task = None
    bot_token = (os.getenv("BOT_TOKEN") or os.getenv("TELEGRAM_BOT_TOKEN") or "").strip()
    if bot_token and ":" in bot_token and not bot_token.startswith("1234567890") and bot_token != "your_bot_token_here":
        async def run_bot_polling():
            try:
                from bot.bot import bot, dp
                print("🚀 Bulutda 24/7 Telegram Bot tekshirilmoqda va ishga tushirilmoqda...")
                await bot.delete_webhook(drop_pending_updates=False)
                await dp.start_polling(bot, handle_signals=False)
            except asyncio.CancelledError:
                print("🛑 Telegram bot polling to'xtatildi.")
            except Exception as e:
                print(f"⚠️ Telegram bot polling xatosi: {e}")

        bot_task = asyncio.create_task(run_bot_polling())

    # Render diskidan o'chib ketgan videolarni Telegramdan avtomatik tiklash (Self-Healing Storage)
    async def auto_restore_all_videos():
        await asyncio.sleep(4)
        try:
            from app.core.database import SessionLocal
            from app.models.models import UserVideo
            from app.services.telegram_storage import restore_video_from_telegram
            with SessionLocal() as db:
                videos_with_tg = db.query(UserVideo).filter(UserVideo.telegram_file_id.isnot(None)).all()
                for v in videos_with_tg:
                    if v.video_url and not v.video_url.startswith("http"):
                        clean_fname = os.path.basename(v.video_url)
                        target_disk_path = ROOT_DIR / "uploads" / "videos" / clean_fname
                        if not target_disk_path.exists() or target_disk_path.stat().st_size == 0:
                            print(f"🔄 [Self-Healing] Render diskidan o'chgan video Telegramdan tiklanmoqda: {clean_fname}")
                            await restore_video_from_telegram(v.telegram_file_id, str(target_disk_path))
        except Exception as e:
            print(f"[Self-Healing Startup Notice]: {e}")

    restore_task = asyncio.create_task(auto_restore_all_videos())

    yield

    if bot_task:
        bot_task.cancel()
    if restore_task:
        restore_task.cancel()


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
    "https://futbol-platform.onrender.com",
    "https://web-production-dc0f4.up.railway.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
frontend_env = os.getenv("WEBAPP_URL")
if frontend_env and frontend_env not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(frontend_env)

cors_env = os.getenv("CORS_ORIGINS", "")
if cors_env:
    for origin in cors_env.split(","):
        o = origin.strip()
        if o and o not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(o)

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
    client_ip = get_client_ip(request)

    # 1. Zararli so'rovlar / SQL Injection / Path Traversal tekshiruvi
    if detect_malicious_payload(str(request.url.query)):
        rate_limiter.block_ip(client_ip, 3600)
        return JSONResponse(
            status_code=403,
            content={"detail": "Xavfsizlik tizimi: Noqonuniy so'rov (Inyeksiya/Buzish) aniqlandi va IP bloklandi."},
        )

    # 2. Agar brauzer sahifani ochayotgan bo'lsa (SPA marshrutlari: /players, /live, /stadiums, etc.)
    path = request.url.path
    if request.method == "GET" and "text/html" in request.headers.get("accept", ""):
        if not path.startswith(("/api/", "/uploads/", "/assets/", "/images/", "/docs", "/openapi.json", "/health", "/ws/")):
            index_file = FRONTEND_DIST / "index.html"
            if index_file.exists():
                return FileResponse(str(index_file))

    # 3. Rate Limiting tekshiruvi (Brute-force / DoS spamdan himoya)
    is_auth_route = any(p in path for p in ["/api/auth/", "/admin/login", "/api/feedback", "/api/shop/notify"])
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
    if IS_PRODUCTION:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response


# Static fayllar (Uploads)
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / "videos").mkdir(exist_ok=True)
(UPLOADS_DIR / "feedback").mkdir(exist_ok=True)
(UPLOADS_DIR / "avatars").mkdir(exist_ok=True)

# Self-Healing On-Demand Video Restore (Render disk tozalanganda avtomatik qaytarish)
@app.get("/uploads/videos/{filename}")
async def serve_or_restore_video(filename: str, db: Session = Depends(get_db)):
    local_path = UPLOADS_DIR / "videos" / filename
    if local_path.exists() and local_path.stat().st_size > 0:
        return FileResponse(local_path)

    # Agar Render qayta yuklanib lokal fayl o'chgan bo'lsa, Telegram bulutidan on-the-fly qayta yuklaymiz
    try:
        from app.models.models import UserVideo
        from app.services.telegram_storage import restore_video_from_telegram
        video_rec = db.query(UserVideo).filter(UserVideo.video_url.like(f"%{filename}%")).first()
        if video_rec and video_rec.telegram_file_id:
            restored = await restore_video_from_telegram(video_rec.telegram_file_id, str(local_path))
            if restored and local_path.exists():
                return FileResponse(local_path)
    except Exception as e:
        print(f"[On-Demand Restore Notice]: {e}")

    if local_path.exists():
        return FileResponse(local_path)
    raise HTTPException(status_code=404, detail="Video topilmadi")

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Football Platform API"}


# Barcha API marshrutlarini ulash
from app.api import (
    auth_router,
    players_router,
    matches_router,
    tournaments_router,
    scouts_router,
    community_router,
)

app.include_router(auth_router)
app.include_router(players_router)
app.include_router(matches_router)
app.include_router(tournaments_router)
app.include_router(scouts_router)
app.include_router(community_router)


# Frontend statik fayllari va SPA integratsiyasi
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"
if FRONTEND_DIST.exists():
    if (FRONTEND_DIST / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="frontend-assets")
    if (FRONTEND_DIST / "images").exists():
        app.mount("/images", StaticFiles(directory=str(FRONTEND_DIST / "images")), name="frontend-images")

    @app.get("/")
    def serve_frontend_root():
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return {"message": "Football Platform API ishlayapti!"}

    @app.get("/{full_path:path}")
    async def serve_spa_fallback(full_path: str):
        # API marshrutlari, uploads, health va adminkaga tegmaymiz
        excluded_prefixes = ("api/", "admin/", "uploads/", "health", "docs", "openapi.json")
        if any(full_path.startswith(p) for p in excluded_prefixes):
            raise HTTPException(status_code=404, detail="Not Found")
        
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        raise HTTPException(status_code=404, detail="Frontend build topilmadi")
else:
    @app.get("/")
    def home(request: Request):
        accept = request.headers.get("accept", "")
        if "text/html" in accept:
            return RedirectResponse(url="https://futbol-platformasi-alpha.vercel.app", status_code=307)
        return {"message": "Football Platform API ishlayapti!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
