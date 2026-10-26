import os
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, RequireRole
from app.models import (
    ShowcaseEvent, VideoBattle, VideoBattleEntry, VideoBattleVote, Referee,
    Academy, Player, Stadium, User, UserRole, Feedback
)
from app.schemas import (
    ShowcaseEventCreate, ShowcaseEventOut,
    VideoBattleCreate, VideoBattleOut,
    VideoBattleEntryCreate, VideoBattleEntryOut,
    RefereeCreate, RefereeOut,
    AcademyCreate, AcademyOut,
    StadiumCreate, StadiumOut,
    FeedbackCreate, FeedbackOut, FeedbackStatusUpdate
)

router = APIRouter(tags=["Community and Stadiums"])

# --- NEW FEATURES ENDPOINTS ---

from app.models import ShowcaseEvent, VideoBattle, VideoBattleEntry, Referee, Academy
from app.schemas import (
    ShowcaseEventCreate, ShowcaseEventOut,
    VideoBattleCreate, VideoBattleOut,
    VideoBattleEntryCreate, VideoBattleEntryOut,
    RefereeCreate, RefereeOut,
    AcademyCreate, AcademyOut
)

# Showcase Events
@router.post("/showcase-events", response_model=ShowcaseEventOut, dependencies=[Depends(RequireRole(["admin"]))])
def create_showcase_event(event_data: ShowcaseEventCreate, db: Session = Depends(get_db)):
    event = ShowcaseEvent(**event_data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/showcase-events", response_model=list[ShowcaseEventOut])
def get_showcase_events(db: Session = Depends(get_db)):
    return db.query(ShowcaseEvent).all()

# Video Battles
@router.post("/video-battles", response_model=VideoBattleOut, dependencies=[Depends(RequireRole(["admin"]))])
def create_video_battle(battle_data: VideoBattleCreate, db: Session = Depends(get_db)):
    battle = VideoBattle(**battle_data.model_dump())
    db.add(battle)
    db.commit()
    db.refresh(battle)
    return battle

@router.get("/video-battles", response_model=list[VideoBattleOut])
def get_video_battles(db: Session = Depends(get_db)):
    return db.query(VideoBattle).all()

@router.post("/video-battles/entries", response_model=VideoBattleEntryOut)
def add_video_battle_entry(
    entry_data: VideoBattleEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = VideoBattleEntry(**entry_data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/video-battles/{battle_id}/entries", response_model=list[VideoBattleEntryOut])
def get_video_battle_entries(battle_id: int, db: Session = Depends(get_db)):
    return db.query(VideoBattleEntry).filter(VideoBattleEntry.battle_id == battle_id).order_by(VideoBattleEntry.votes.desc()).all()

@router.post("/video-battles/entries/{entry_id}/vote")
def vote_video_battle_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(VideoBattleEntry).filter(VideoBattleEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Bellashuv ishtirokchisi topilmadi")
    
    # Xavfsizlik: Har bir foydalanuvchi faqat 1 marta ovoz berishi mumkin
    existing_vote = db.query(VideoBattleVote).filter(
        VideoBattleVote.battle_id == entry.battle_id,
        VideoBattleVote.user_id == current_user.id
    ).first()
    if existing_vote:
        raise HTTPException(
            status_code=400,
            detail="Siz ushbu bellashuvda allaqachon ovoz bergansiz! Har bir foydalanuvchiga bitta ovoz berish imkoni beriladi."
        )

    vote_record = VideoBattleVote(
        battle_id=entry.battle_id,
        entry_id=entry.id,
        user_id=current_user.id
    )
    db.add(vote_record)
    entry.votes += 1
    db.commit()
    return {"message": "Ovozingiz muvaffaqiyatli qabul qilindi!", "votes": entry.votes}

# Referees
@router.post("/referees", response_model=RefereeOut, dependencies=[Depends(RequireRole(["admin"]))])
def create_referee(ref_data: RefereeCreate, db: Session = Depends(get_db)):
    ref = Referee(**ref_data.model_dump())
    db.add(ref)
    db.commit()
    db.refresh(ref)
    return ref

@router.get("/referees", response_model=list[RefereeOut])
def get_referees(db: Session = Depends(get_db)):
    return db.query(Referee).all()

@router.post("/referees/{ref_id}/rate")
def rate_referee(ref_id: int, rating: float, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ref = db.query(Referee).filter(Referee.id == ref_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Hakam topilmadi")
    # Simple average calculation
    total = ref.rating * ref.rating_count + rating
    ref.rating_count += 1
    ref.rating = total / ref.rating_count
    db.commit()
    return {"message": "Baholandi", "new_rating": ref.rating}

# Academies
@router.post("/academies", response_model=AcademyOut, dependencies=[Depends(RequireRole(["admin"]))])
def create_academy(acad_data: AcademyCreate, db: Session = Depends(get_db)):
    acad = Academy(**acad_data.model_dump())
    db.add(acad)
    db.commit()
    db.refresh(acad)
    return acad

@router.get("/academies", response_model=list[AcademyOut])
def get_academies(db: Session = Depends(get_db)):
    return db.query(Academy).all()

@router.post("/academies/{acad_id}/rate")
def rate_academy(acad_id: int, rating: float, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    acad = db.query(Academy).filter(Academy.id == acad_id).first()
    if not acad:
        raise HTTPException(status_code=404, detail="Akademiya topilmadi")
    total = acad.rating * acad.rating_count + rating
    acad.rating_count += 1
    acad.rating = total / acad.rating_count
    db.commit()
    return {"message": "Baholandi", "new_rating": acad.rating}

# AI Scouting Comparison Endpoint
from pydantic import BaseModel
class AICompareRequest(BaseModel):
    player1_id: int
    player2_id: int

@router.post("/ai-compare")
def ai_compare_players(req: AICompareRequest, db: Session = Depends(get_db)):
    p1 = db.query(Player).filter(Player.id == req.player1_id).first()
    p2 = db.query(Player).filter(Player.id == req.player2_id).first()
    if not p1 or not p2:
        raise HTTPException(status_code=404, detail="O'yinchilar topilmadi")
    
    # Mock AI logic for comparison matrix and summary
    summary = (
        f"{p1.full_name} tezlik va chidamlilik bo'yicha kuchli, ammo pas aniqligida ozgina ustida ishlashi kerak. "
        f"{p2.full_name} texnik o'yinchi, maydonni yaxshi ko'radi, biroq jismoniy kurashlarda oqsaydi."
    )
    matrix = {
        "sprint_speed": {p1.full_name: p1.sprint_speed or 0, p2.full_name: p2.sprint_speed or 0},
        "pass_accuracy": {p1.full_name: p1.pass_accuracy or 0, p2.full_name: p2.pass_accuracy or 0},
        "stamina": {p1.full_name: p1.stamina or 0, p2.full_name: p2.stamina or 0}
    }
    
    return {
        "summary": summary,
        "matrix": matrix
    }

# Crowdfunding Support


# --- STADIUMS & UZBEKISTAN MAP EXPLORER API ---
from app.models import Stadium
from app.schemas import StadiumCreate, StadiumOut

DEFAULT_STADIUMS = [
    {
        "name": "Istiqlol Arena (Farg'ona Markaziy)",
        "region": "Farg'ona",
        "district": "Farg'ona sh.",
        "address": "Al-Farg'oniy ko'chasi 45",
        "latitude": 40.3864,
        "longitude": 71.7843,
        "price_per_hour": 200000,
        "turf_type": "FIFA 2-Star Sun'iy maysa",
        "has_lights": True,
        "is_indoor": False,
        "phone_number": "+998901234567",
        "image_url": "/images/stadiums/stadiums_1522778119026-d647f0.jpg",
        "rating": 4.9,
        "features": "Dush, Kiyinish xonasi, Pro-yoritgichlar, Avtoturargoh"
    },
    {
        "name": "Neftchi Mashg'ulot Maydoni",
        "region": "Farg'ona",
        "district": "Farg'ona sh.",
        "address": "Mustaqillik shoh ko'chasi",
        "latitude": 40.3721,
        "longitude": 71.7955,
        "price_per_hour": 150000,
        "turf_type": "Tabiiy maysa",
        "has_lights": True,
        "is_indoor": False,
        "phone_number": "+998912345678",
        "image_url": "/images/stadiums/stadiums_1574629810360-7efbbe.jpg",
        "rating": 4.8,
        "features": "Kiyinish xonasi, Tribuna, Kafe"
    },
    {
        "name": "Qo'qon 1912 Arena",
        "region": "Farg'ona",
        "district": "Qo'qon sh.",
        "address": "Turkiston ko'chasi 12",
        "latitude": 40.5283,
        "longitude": 70.9426,
        "price_per_hour": 180000,
        "turf_type": "FIFA Quality Sun'iy",
        "has_lights": True,
        "is_indoor": False,
        "phone_number": "+998933456789",
        "image_url": "/images/stadiums/stadiums_1508098682722-e99c43.jpg",
        "rating": 4.9,
        "features": "Avtoturargoh, Dush, LED hisoblagich"
    },
    {
        "name": "Marg'ilon Yopiq Sport Majmuasi",
        "region": "Farg'ona",
        "district": "Marg'ilon sh.",
        "address": "Buyuk Ipak Yo'li",
        "latitude": 40.4722,
        "longitude": 71.7144,
        "price_per_hour": 140000,
        "turf_type": "Sun'iy maysa",
        "has_lights": True,
        "is_indoor": True,
        "phone_number": "+998974567890",
        "image_url": "/images/stadiums/stadiums_1459865264687-595d65.jpg",
        "rating": 4.7,
        "features": "Yopiq arena (qishda issiq), Dush"
    },
    {
        "name": "Bunyodkor Milliy Arena",
        "region": "Toshkent",
        "district": "Chilonzor",
        "address": "Bunyodkor shoh ko'chasi 47",
        "latitude": 41.2789,
        "longitude": 69.2148,
        "price_per_hour": 350000,
        "turf_type": "Gibrid tabiiy maysa",
        "has_lights": True,
        "is_indoor": False,
        "phone_number": "+998712000011",
        "image_url": "/images/stadiums/stadiums_1518091043644-c1d445.jpg",
        "rating": 5.0,
        "features": "FIFA Elite, VIP tribuna, Fitnes markaz, Dush"
    },
    {
        "name": "Jar Sport Majmuasi",
        "region": "Toshkent",
        "district": "Shayxontohur",
        "address": "Navoiy ko'chasi 30",
        "latitude": 41.3267,
        "longitude": 69.2289,
        "price_per_hour": 250000,
        "turf_type": "FIFA Quality Sun'iy",
        "has_lights": True,
        "is_indoor": False,
        "phone_number": "+998712411223",
        "image_url": "/images/stadiums/stadiums_1529900748604-07564a.jpg",
        "rating": 4.8,
        "features": "Dush, Kiyinish xonasi, Kafe, Yoritgichlar"
    },
    {
        "name": "Bobur Arena",
        "region": "Andijon",
        "district": "Andijon sh.",
        "address": "Bobur shoh ko'chasi",
        "latitude": 40.7821,
        "longitude": 72.3442,
        "price_per_hour": 160000,
        "turf_type": "Sun'iy maysa",
        "has_lights": True,
        "is_indoor": False,
        "phone_number": "+998742233445",
        "image_url": "/images/stadiums/stadiums_1577223625816-7546f1.jpg",
        "rating": 4.8,
        "features": "Pro-yoritish, Dush, Kiyinish xonasi"
    },
    {
        "name": "Navbahor Markaziy Stadioni",
        "region": "Namangan",
        "district": "Namangan sh.",
        "address": "Amir Temur ko'chasi",
        "latitude": 41.0058,
        "longitude": 71.6436,
        "price_per_hour": 180000,
        "turf_type": "FIFA Quality",
        "has_lights": True,
        "is_indoor": False,
        "phone_number": "+998692271122",
        "image_url": "/images/stadiums/stadiums_1508098682722-e99c43.jpg",
        "rating": 4.9,
        "features": "22 000 muxlis, Pro-maysa, Kafe"
    },
    {
        "name": "Dinamo Samarqand Stadioni",
        "region": "Samarqand",
        "district": "Samarqand sh.",
        "address": "Mirzo Ulug'bek ko'chasi 7",
        "latitude": 39.6542,
        "longitude": 66.9597,
        "price_per_hour": 190000,
        "turf_type": "Tabiiy maysa",
        "has_lights": True,
        "is_indoor": False,
        "phone_number": "+998662310099",
        "image_url": "/images/stadiums/stadiums_1522778119026-d647f0.jpg",
        "rating": 4.8,
        "features": "Tarixiy maydon, Dush, Kiyinish xonasi"
    }
]

def seed_stadiums_if_empty(db: Session):
    count = db.query(Stadium).count()
    if count == 0:
        for s_data in DEFAULT_STADIUMS:
            db.add(Stadium(**s_data))
        db.commit()

@router.get("/api/stadiums", response_model=list[StadiumOut])
def get_stadiums(
    region: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db)
):
    seed_stadiums_if_empty(db)
    query = db.query(Stadium)
    if region and region.lower() != "barchasi":
        query = query.filter(Stadium.region.ilike(f"%{region}%"))
    if search:
        query = query.filter(
            (Stadium.name.ilike(f"%{search}%")) |
            (Stadium.district.ilike(f"%{search}%")) |
            (Stadium.address.ilike(f"%{search}%"))
        )
    return query.order_by(Stadium.rating.desc(), Stadium.name.asc()).all()

@router.post("/api/stadiums", response_model=StadiumOut, dependencies=[Depends(RequireRole(["admin"]))])
def create_stadium(
    data: StadiumCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Faqat administrator stadion qo'sha oladi")
    stadium = Stadium(**data.model_dump())
    db.add(stadium)
    db.commit()
    db.refresh(stadium)
    return stadium

# --- FOYDALANUVCHILAR FIKRI VA TAKLIFLARI (FEEDBACK API) ---

@router.post("/api/feedback", response_model=FeedbackOut)
def submit_feedback(
    fb_data: FeedbackCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    msg = fb_data.message.strip()
    if not msg or len(msg) < 3:
        raise HTTPException(status_code=400, detail="Fikr matni kamida 3 belgidan iborat bo'lishi kerak!")

    user_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            from app.core.security import decode_access_token
            payload = decode_access_token(token)
            user_id = int(payload.get("sub"))
        except Exception:
            pass

    feedback = Feedback(
        user_id=user_id,
        author_name=fb_data.author_name,
        contact=fb_data.contact,
        category=fb_data.category or "taklif",
        page_url=fb_data.page_url,
        message=msg,
        status="yangi"
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    # Admin telegram botiga xabar yuborish
    try:
        from app.api.auth import notify_admin_bot
        notify_admin_bot(
            f"📢 <b>Yangi platforma fikri / taklifi!</b>\n\n"
            f"<b>Tur:</b> {feedback.category.upper()}\n"
            f"<b>Muallif:</b> {feedback.author_name or 'Anonim'}\n"
            f"<b>Aloqa:</b> {feedback.contact or 'Kiritilmagan'}\n"
            f"<b>Sahifa:</b> {feedback.page_url or '-'}\n"
            f"<b>Matn:</b> {feedback.message}"
        )
    except Exception:
        pass

    return feedback

@router.get("/api/admin/feedback", response_model=list[FeedbackOut], dependencies=[Depends(RequireRole(["admin"]))])
def get_admin_feedbacks(
    status: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Feedback)
    if status and status != "all":
        query = query.filter(Feedback.status == status)
    if category and category != "all":
        query = query.filter(Feedback.category == category)
    return query.order_by(Feedback.created_at.desc()).all()

@router.patch("/api/admin/feedback/{feedback_id}", response_model=FeedbackOut, dependencies=[Depends(RequireRole(["admin"]))])
def update_feedback_status(
    feedback_id: int,
    update_data: FeedbackStatusUpdate,
    db: Session = Depends(get_db)
):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Fikr topilmadi")
    if update_data.status:
        feedback.status = update_data.status
    if update_data.admin_notes is not None:
        feedback.admin_notes = update_data.admin_notes
    db.commit()
    db.refresh(feedback)
    return feedback

