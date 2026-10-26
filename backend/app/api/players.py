import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, RequireRole, check_ownership
from app.models import (
    Player, CareerHistory, GoalSubmission, VerificationStatus,
    DailyDrill, User, UserRole, UserStatus
)
from app.schemas import (
    PlayerCreate, PlayerOut, CareerHistoryCreate, CareerHistoryOut,
    GoalSubmissionCreate, GoalSubmissionOut, DailyDrillOut
)

router = APIRouter(tags=["Players"])

# --- O'YINCHILAR ---

@router.post("/players", response_model=PlayerOut, dependencies=[Depends(RequireRole(["admin"]))])
def create_player(player_data: PlayerCreate, db: Session = Depends(get_db)):
    player = Player(**player_data.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player

@router.get("/players", response_model=list[PlayerOut])
@router.get("/api/players", response_model=list[PlayerOut])
def get_all_players(
    city: str | None = None,
    position: str | None = None,
    telegram_id: int | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Player)
    if telegram_id:
        query = query.filter(Player.telegram_id == telegram_id)
    if city:
        query = query.filter(Player.city.ilike(f"%{city}%"))
    if position:
        query = query.filter(Player.position.ilike(f"%{position}%"))
    return query.all()


@router.get("/api/scout/players", response_model=list[PlayerOut], dependencies=[Depends(RequireRole(["scout", "admin"]))])
def get_players(
    city: str | None = None,
    position: str | None = None,
    min_height: int | None = None,
    min_weight: int | None = None,
    min_pass_accuracy: int | None = None,
    min_sprint_speed: float | None = None,
    min_stamina: int | None = None,
    db: Session = Depends(get_db)
):
    # Skautlar uchun filtr
    query = db.query(Player)
    if city:
        query = query.filter(Player.city.ilike(f"%{city}%"))
    if position:
        query = query.filter(Player.position.ilike(f"%{position}%"))
    if min_height is not None:
        query = query.filter(Player.height >= min_height)
    if min_weight is not None:
        query = query.filter(Player.weight >= min_weight)
    if min_pass_accuracy is not None:
        query = query.filter(Player.pass_accuracy >= min_pass_accuracy)
    if min_sprint_speed is not None:
        query = query.filter(Player.sprint_speed >= min_sprint_speed)
    if min_stamina is not None:
        query = query.filter(Player.stamina >= min_stamina)
    
    return query.all()


@router.get("/players/{player_id}", response_model=PlayerOut)
def get_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Futbolchi topilmadi")
    return player

@router.post("/players/{player_id}/career", response_model=CareerHistoryOut)
def add_career_history(
    player_id: int,
    career_data: CareerHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Futbolchi topilmadi")
    
    # Broken Access Control (IDOR) himoyasi: Faqat o'yinchi egasi yoki admin qo'sha oladi
    check_ownership(player.user_id, current_user, "o'yinchi karyerasi")
    
    career = CareerHistory(player_id=player_id, **career_data.model_dump())
    db.add(career)
    db.commit()
    db.refresh(career)
    return career



# --- VIDEO YUKLASH VA TASDIQLASH (HAQQONIYLIK) ---

@router.post("/players/{player_id}/submit-goal", response_model=GoalSubmissionOut)
def submit_goal_direct(
    player_id: int,
    submission_data: GoalSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Futbolchi topilmadi")

    check_ownership(player.user_id, current_user, "gol/video ma'lumotlari")

    submission = GoalSubmission(
        player_id=player_id,
        video_url=submission_data.video_url,
        description=submission_data.description
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

@router.post("/api/player/{player_id}/submit-goal", response_model=GoalSubmissionOut, dependencies=[Depends(RequireRole(["player", "admin"]))])
def submit_goal(
    player_id: int,
    submission_data: GoalSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Adminlar boshqa futbolchilar nomidan xabar/video yubora olmaydi (Impersonation taqiqlangan)!")

    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Futbolchi topilmadi")

    check_ownership(player.user_id, current_user, "gol/video")

    submission = GoalSubmission(
        player_id=player_id,
        video_url=submission_data.video_url,
        description=submission_data.description
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


# Admin yoki moderator tomonidan golni tasdiqlash endpointi
@router.patch("/submissions/{submission_id}/verify", response_model=GoalSubmissionOut, dependencies=[Depends(RequireRole(["admin"]))])
def verify_goal(
    submission_id: int,
    status: VerificationStatus,
    db: Session = Depends(get_db)
):
    submission = db.query(GoalSubmission).filter(GoalSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Video arizasi topilmadi")

    # Agar oldin tasdiqlanmagan bo'lsa va hozir tasdiqlansa, verifikatsiya sonini oshiramiz
    if submission.status != VerificationStatus.APPROVED and status == VerificationStatus.APPROVED:
        submission.player.goals_verified += 1
    
    # Agar oldin tasdiqlangan bo'lib, endi rad etilsa, sonini kamaytiramiz
    elif submission.status == VerificationStatus.APPROVED and status != VerificationStatus.APPROVED:
        submission.player.goals_verified = max(0, submission.player.goals_verified - 1)

    submission.status = status
    db.commit()
    db.refresh(submission)
    return submission



# --- DAILY DRILLS & MOTIVATION ENDPOINTS ---
from app.models import DailyDrill
from app.schemas import DailyDrillOut
from datetime import datetime, timedelta

@router.get("/drills", response_model=list[DailyDrillOut])
def get_drills(db: Session = Depends(get_db)):
    drills = db.query(DailyDrill).all()
    if not drills:
        # Prepopulate for demo
        d1 = DailyDrill(
            title="Devor bilan 50 ta pas",
            description="To'pni devorga uzatib, birinchi urinishdayoq o'zingizga qaytarib oling. Ikki oyoqdan ham foydalaning.",
            duration="15 daqiqa",
            animation_url="/assets/animations/wall_pass.gif",
            dos="Oyoqning ichki qismi bilan zarba bering. Tana vaznini to'g'ri taqsimlang.",
            donts="Oyoqni qattiq tutmang. Gavdani orqaga tashlamang."
        )
        d2 = DailyDrill(
            title="Oyoq tezligini oshirish (Chiziq ustida)",
            description="Yerdagi xayoliy yoki haqiqiy chiziq ustidan ikki oyoq bilan sakrab tezlikni oshiring.",
            duration="5 daqiqa",
            animation_url="/assets/animations/foot_speed.gif",
            dos="Faqat oyoq uchida harakatlaning. Tizzalarni biroz bukib turing.",
            donts="Tovonni yerga tekkizmang."
        )
        d3 = DailyDrill(
            title="To'pni boshqarish (Juggling)",
            description="To'pni yerga tushirmasdan 3 daqiqa davomida o'ng va chap oyoqda boshqaring.",
            duration="10 daqiqa",
            animation_url="/assets/animations/juggling.gif",
            dos="To'pga pastdan o'rtacha kuch bilan zarba bering. Konsentratsiyani yo'qotmang.",
            donts="To'pni balandga tepib yubormang."
        )
        db.add_all([d1, d2, d3])
        db.commit()
        drills = [d1, d2, d3]
    return drills


@router.post("/users/{user_id}/drills/complete")
def complete_drill(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_ownership(user_id, current_user, "mashg'ulotlar")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    now = datetime.utcnow()
    
    # Calculate difference in days since last training
    if user.last_training_date:
        delta_days = (now.date() - user.last_training_date.date()).days
    else:
        delta_days = 0

    message = ""
    if delta_days == 1 or delta_days == 0:
        user.streak += 1
        user.discipline_score += 5
        message = "Barakalla! Sen yana bir qadam oldindasan."
    elif delta_days > 1:
        user.streak = 1
        # Penalty for missing days
        user.discipline_score -= (delta_days * 5)
        
        # Tough love messages based on hardcore mode
        if user.hardcore_mode:
            message = f"Qattiqqo'l rejim: Sen {delta_days - 1} kun dangasalik qilding! Butun jamoang sening zaifligingni bilib oldi. Uyaltirmoqchi emasmiz, lekin bu senga dars bo'lsin!"
            # Simulated notification to coach/team could happen here.
        else:
            message = "Bugun yana dam olmoqchimisan? Ertaga katta o'yinda senga o'xshaganlar zaxirada o'tiradi. Maqsading kuchli bo'lish ediku, o'zingni aldashni to'xtat!"
            
    # Cap score
    if user.discipline_score > 100:
        user.discipline_score = 100
    if user.discipline_score < 0:
        user.discipline_score = 0
        
    user.last_training_date = now
    db.commit()
    db.refresh(user)
    
    return {
        "message": message,
        "streak": user.streak,
        "discipline_score": user.discipline_score
    }


@router.patch("/users/{user_id}/hardcore")
def toggle_hardcore_mode(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_ownership(user_id, current_user, "hardcore rejim")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    user.hardcore_mode = not user.hardcore_mode
    db.commit()
    db.refresh(user)
    
    return {"message": "Hardcore rejim o'zgartirildi", "hardcore_mode": user.hardcore_mode}



@router.post("/players/{player_id}/donate", dependencies=[Depends(RequireRole(["admin"]))])
def donate_to_player(player_id: int, amount: int, db: Session = Depends(get_db)):
    # To'lov provayderi integratsiyasigacha faqat admin orqali xavfsiz tasdiqlanadi
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Summa 0 dan katta bo'lishi shart!")
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="O'yinchi topilmadi")
    
    player.fund_raised += amount
    db.commit()
    return {"message": "Mablag' muvaffaqiyatli qayd etildi", "fund_raised": player.fund_raised}

