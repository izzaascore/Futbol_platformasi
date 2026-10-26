import os
import pathlib
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from starlette.requests import Request

from app.core.database import get_db
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    RequireRole,
    check_ownership,
    verify_telegram_init_data,
    ADMIN_USERNAME,
    ADMIN_PASSKEY,
    decode_access_token
)
from app.models import User, UserVideo, Player, UserRole, UserStatus
from app.schemas import (
    TelegramAuthRequest, UserCreate, UserLogin, UserOut,
    UserProfileImageUpdate, UserVideoOut
)

router = APIRouter(tags=["Auth and Users"])

# --- AUTH & USERS ---

@router.post("/api/auth/telegram-webapp")
def telegram_webapp_auth(tg_data: TelegramAuthRequest, db: Session = Depends(get_db)):
    # 1. Telegram Kriptografik imzo (HMAC-SHA256) tekshiruvi — Soxtalashtirishdan himoya
    bot_token = (os.getenv("BOT_TOKEN") or os.getenv("TELEGRAM_BOT_TOKEN") or "").strip()
    if bot_token and ":" in bot_token and not bot_token.startswith("1234567890") and bot_token != "your_bot_token_here":
        if not tg_data.init_data or not verify_telegram_init_data(tg_data.init_data, bot_token):
            raise HTTPException(
                status_code=401,
                detail="Xavfsizlik xatosi: Telegram haqiqiylik imzosi (HMAC) tasdiqlanmadi yoki ma'lumotlar soxtalashtirilgan!"
            )

    # 2. Telegram foydalanuvchisi mavjudligini tekshirish
    user = db.query(User).filter(User.telegram_id == tg_data.id).first()
    if not user:
        # Yangi foydalanuvchi yaratish
        user = User(
            telegram_id=tg_data.id,
            first_name=tg_data.first_name,
            last_name=tg_data.last_name or "",
            profile_image=tg_data.photo_url,
            password_hash=get_password_hash(f"tg_{tg_data.id}_tma_secure"),
            role=UserRole.PLAYER,
            status=UserStatus.ACTIVE
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # O'yinchi profilini ham bog'lash
        player = db.query(Player).filter(Player.telegram_id == tg_data.id).first()
        if not player:
            player = Player(
                user_id=user.id,
                telegram_id=tg_data.id,
                full_name=f"{tg_data.first_name} {tg_data.last_name or ''}".strip(),
                goals_claimed=0,
                goals_verified=0
            )
            db.add(player)
            db.commit()
        else:
            player.user_id = user.id
            db.commit()
    else:
        # Mavjud o'yinchi bog'langanligini tekshirish
        player = db.query(Player).filter(Player.user_id == user.id).first()
        if not player:
            player = db.query(Player).filter(Player.telegram_id == tg_data.id).first()
            if player:
                player.user_id = user.id
                db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user": user
    }

@router.post("/api/auth/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email allaqachon ro'yxatdan o'tgan")
    
    user_dict = user_data.model_dump()
    password = user_dict.pop("password")
    
    player_fields = {k: user_dict.pop(k, None) for k in ["position", "height", "weight", "preferred_foot", "team", "video_link"]}
    scout_fields = {k: user_dict.pop(k, None) for k in ["organization", "license_url"]}
    
    user_dict["password_hash"] = get_password_hash(password)
    
    # XAVFSIZLIK: Ommaviy ro'yxatdan o'tish orqali Admin roliga ega bo'lish qat'iy taqiqlanadi
    requested_role = str(user_dict.get("role", "player")).lower()
    if requested_role == "scout":
        user_dict["role"] = UserRole.SCOUT
        user_dict["status"] = UserStatus.PENDING
    else:
        user_dict["role"] = UserRole.PLAYER
        user_dict["status"] = UserStatus.ACTIVE
    
    user = User(**user_dict)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    if user.role == UserRole.PLAYER:
        player = Player(
            user_id=user.id,
            full_name=f"{user.first_name} {user.last_name}",
            age=user.age,
            position=player_fields["position"],
            height=player_fields["height"],
            weight=player_fields["weight"],
            preferred_foot=player_fields["preferred_foot"],
            team=player_fields["team"]
        )
        db.add(player)
        db.commit()
        db.refresh(player)
        if player_fields["video_link"]:
            submission = GoalSubmission(
                player_id=player.id,
                video_url=player_fields["video_link"],
                description="Ro'yxatdan o'tishdagi video"
            )
            db.add(submission)
            db.commit()
            
    elif user.role == UserRole.SCOUT:
        scout = Scout(
            user_id=user.id,
            full_name=f"{user.first_name} {user.last_name}",
            organization=scout_fields["organization"]
        )
        if scout_fields["license_url"]:
            user.kyc_document_url = scout_fields["license_url"]
            db.commit()
        db.add(scout)
        db.commit()

    return user

import httpx
import asyncio

async def _send_admin_telegram_async(message: str):
    bot_token = (os.getenv("BOT_TOKEN") or os.getenv("TELEGRAM_BOT_TOKEN") or "").strip()
    admin_id = os.getenv("ADMIN_TELEGRAM_ID", "").strip()
    if bot_token and ":" in bot_token and not bot_token.startswith("1234567890") and admin_id:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                await client.post(url, json={"chat_id": admin_id, "text": message, "parse_mode": "HTML"})
        except Exception:
            pass

def notify_admin_bot(message: str):
    # Non-blocking background notification
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_send_admin_telegram_async(message))
    except Exception:
        pass

@router.post("/api/auth/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # Xavfsiz avtorizatsiya: Parol hashini qat'iy tekshirish
    query = db.query(User)
    
    # 1. Email orqali yoki Ism + Familiya orqali qidirish
    if login_data.email:
        user = query.filter(User.email == login_data.email.strip().lower()).first()
    elif login_data.firstName and login_data.lastName:
        user = query.filter(
            User.first_name.ilike(login_data.firstName.strip()),
            User.last_name.ilike(login_data.lastName.strip())
        ).first()
    else:
        raise HTTPException(status_code=400, detail="Ism va familiya yoki email kiritilishi shart!")

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Ism, familiya yoki parol noto'g'ri!")

    if user.status == UserStatus.BANNED:
        raise HTTPException(status_code=403, detail="Hisobingiz ma'muriyat tomonidan bloklangan!")

    user.is_logged_in = True
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user": user
    }

@router.post("/api/auth/logout")
def logout(request: Request, db: Session = Depends(get_db)):
    # Tizimdan chiqish tugmasi bosilganda is_logged_in = False bo'ladi
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            # decode_access_token imported from app.core.security
            payload = decode_access_token(token)
            user_id = int(payload.get("sub"))
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.is_logged_in = False
                db.commit()
        except Exception:
            pass
    return {"message": "Tizimdan muvaffaqiyatli chiqildi (Logged out)"}

@router.patch("/users/{user_id}/profile-image", response_model=UserOut)
def update_profile_image(
    user_id: int,
    image_data: UserProfileImageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Faqat o'z profilini yoki admin o'zgartira oladi
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Faqat o'z profilingizni o'zgartira olasiz!")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    user.profile_image = image_data.profile_image
    db.commit()
    db.refresh(user)
    return user

@router.post("/users/{user_id}/videos", response_model=UserVideoOut)
async def upload_user_video(
    user_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Faqat o'z videosini yuklaydi yoki admin
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Faqat o'z profilingizga video yuklay olasiz!")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    import pathlib
    allowed_extensions = {".mp4", ".webm", ".mov", ".avi", ".mkv"}
    suffix = pathlib.Path(file.filename or "video.mp4").suffix.lower()
    if suffix not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Faqat video fayllari ruxsat etilgan (.mp4, .webm, .mov, .avi)")
    
    # --- CLOUDINARY YUKLASH ---
    cloudinary_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    cloudinary_key = os.getenv("CLOUDINARY_API_KEY")
    cloudinary_secret = os.getenv("CLOUDINARY_API_SECRET")
    
    if cloudinary_name and cloudinary_key and cloudinary_secret and cloudinary_name != "your_cloud_name":
        # Haqiqiy Cloudinary yuklash
        try:
            import cloudinary
            import cloudinary.uploader
            cloudinary.config(
                cloud_name=cloudinary_name,
                api_key=cloudinary_key,
                api_secret=cloudinary_secret
            )
            file_bytes = await file.read()
            result = cloudinary.uploader.upload(
                file_bytes,
                resource_type="video",
                folder=f"football_rise/user_{user_id}",
                public_id=f"video_{user_id}_{int(__import__('time').time())}",
                overwrite=True
            )
            video_url = result.get("secure_url", "")
            cloudinary_public_id = result.get("public_id", "")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cloudinary yuklashda xatolik: {str(e)}")
    else:
        # Cloudinary sozlanmagan — lokal saqlash (ishlab chiqish uchun)
        import uuid
        os.makedirs("uploads/videos", exist_ok=True)
        safe_name = f"{user_id}_{uuid.uuid4().hex}{suffix}"
        file_path = f"uploads/videos/{safe_name}"
        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        video_url = f"http://localhost:8000/{file_path}"
        cloudinary_public_id = None
    
    user_video = UserVideo(user_id=user_id, video_url=video_url)
    db.add(user_video)
    db.commit()
    db.refresh(user_video)
    return user_video

@router.get("/users/{user_id}/videos", response_model=list[UserVideoOut])
def get_user_videos(user_id: int, db: Session = Depends(get_db)):
    return db.query(UserVideo).filter(UserVideo.user_id == user_id).all()

@router.delete("/videos/{video_id}")
def delete_user_video(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(UserVideo).filter(UserVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video topilmadi")
    
    # Faqat video egasi yoki admin o'chira oladi
    if video.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu videoni o'chirish uchun ruxsatingiz yo'q!")
    
    # Cloudinary dan ham o'chirish
    try:
        cloudinary_name = os.getenv("CLOUDINARY_CLOUD_NAME")
        if cloudinary_name and "cloudinary.com" in (video.video_url or ""):
            import cloudinary
            import cloudinary.uploader
            cloudinary.config(
                cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
                api_key=os.getenv("CLOUDINARY_API_KEY"),
                api_secret=os.getenv("CLOUDINARY_API_SECRET")
            )
            # URL dan public_id olish
            parts = video.video_url.split("/upload/")
            if len(parts) > 1:
                public_id = parts[1].rsplit(".", 1)[0]
                cloudinary.uploader.destroy(public_id, resource_type="video")
        elif "uploads/" in (video.video_url or ""):
            # Lokal fayl
            file_path = video.video_url.replace("http://localhost:8000/", "")
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception:
        pass  # O'chirishda xatolik bo'lsa DB dan o'chirishni to'xtatmaymiz

    db.delete(video)
    db.commit()
    return {"message": "Video muvaffaqiyatli o'chirildi"}




# --- ADMIN LOGIN & USERS ---
# --- ADMIN ENDPOINTS (Restricted by Middleware) ---

@router.post("/admin/login")
@router.post("/api/admin/login")
def admin_login(data: dict, db: Session = Depends(get_db)):
    # Xavfsiz .env kalitlari orqali tekshirish
    if data.get("username") == ADMIN_USERNAME and data.get("passkey") == ADMIN_PASSKEY:
        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if not admin_user:
            admin_user = User(
                first_name="Erkin",
                last_name="Master",
                password_hash=get_password_hash(ADMIN_PASSKEY),
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        admin_user.is_logged_in = True
        db.commit()
        access_token = create_access_token(data={"sub": str(admin_user.id)})
        return {"access_token": access_token, "token_type": "bearer", "role": admin_user.role, "user": admin_user}
    raise HTTPException(status_code=401, detail="Xato login yoki maxfiy kalit")

@router.get("/admin/users", dependencies=[Depends(RequireRole(["admin"]))])
@router.get("/api/admin/users", dependencies=[Depends(RequireRole(["admin"]))])
def admin_get_users(db: Session = Depends(get_db)):
    # Barcha foydalanuvchilar (Player sifatida misol)
    players = db.query(Player).all()
    return players

