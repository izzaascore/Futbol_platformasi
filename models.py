from enum import Enum as PyEnum
from datetime import datetime
from sqlalchemy import String, Integer, BigInteger, ForeignKey, Enum, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class VerificationStatus(str, PyEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class UserRole(str, PyEnum):
    PLAYER = "player"
    SCOUT = "scout"
    ADMIN = "admin"

class UserStatus(str, PyEnum):
    PENDING = "pending"
    ACTIVE = "active"
    BANNED = "banned"


class Tournament(Base):
    __tablename__ = "tournaments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, default="")
    prize = Column(String, default="")
    status = Column(String, default="Aktiv")
    image = Column(String, default="")
    teams_count = Column(Integer, default=16)
    start_date = Column(String, default="")
    location = Column(String, default="")
    is_active = Column(Boolean, default=True)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.PLAYER, nullable=False)
    status: Mapped[UserStatus] = mapped_column(Enum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
    
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False) # Changed from plain password
    profile_image: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Skaut KYC
    kyc_document_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Yagona sessiya (Singleton Admin) nazorati
    is_logged_in: Mapped[bool] = mapped_column(Integer, default=False)

    # Intizom va Kundalik mashg'ulotlar (FootballRise Daily)
    discipline_score: Mapped[int] = mapped_column(Integer, default=100)
    streak: Mapped[int] = mapped_column(Integer, default=0)
    hardcore_mode: Mapped[bool] = mapped_column(Integer, default=False)
    last_training_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    videos: Mapped[list["UserVideo"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    target_entity: Mapped[str] = mapped_column(String(100), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    admin: Mapped["User"] = relationship()

class UserVideo(Base):
    __tablename__ = "user_videos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    video_url: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[VerificationStatus] = mapped_column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    
    # AI Auto-Clipping (Avtomatik Highlights)
    is_ai_processed: Mapped[bool] = mapped_column(Integer, default=False)
    highlight_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="videos")



class Player(Base):
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    # Telegram ID katta son bo'lgani uchun BigInteger
    telegram_id: Mapped[int | None] = mapped_column(BigInteger, unique=True, nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    position: Mapped[str | None] = mapped_column(String(50), nullable=True)
    preferred_foot: Mapped[str | None] = mapped_column(String(20), nullable=True)
    team: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Statistika
    goals_claimed: Mapped[int] = mapped_column(Integer, default=0)
    goals_verified: Mapped[int] = mapped_column(Integer, default=0)

    # Yangi kiritilgan ma'lumotlar (Scout PRO filtrlar uchun)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pass_accuracy: Mapped[int | None] = mapped_column(Integer, nullable=True) # % (0-100)
    sprint_speed: Mapped[float | None] = mapped_column(Integer, nullable=True) # km/h
    stamina: Mapped[int | None] = mapped_column(Integer, nullable=True) # % (0-100)
    
    # Psixologik va Mental Testlar (Mental Toughness)
    mental_score: Mapped[int] = mapped_column(Integer, default=50) # 0-100
    
    # Oziqlanish va Jismoniy intizom (Nutrition & Recovery)
    physical_discipline_score: Mapped[int] = mapped_column(Integer, default=50) # 0-100

    # Advanced Analytics & Wearables (Jahon standarti)
    xg_total: Mapped[float] = mapped_column(Integer, default=0.0) # Expected Goals
    xa_total: Mapped[float] = mapped_column(Integer, default=0.0) # Expected Assists
    top_speed_kmh: Mapped[float] = mapped_column(Integer, default=0.0) # Smart qurilmalardan (GPS)
    distance_covered_km: Mapped[float] = mapped_column(Integer, default=0.0)

    # Karyera Jamg'armasi va Web3 Fan Tokens
    fund_goal: Mapped[int] = mapped_column(Integer, default=0)
    fund_raised: Mapped[int] = mapped_column(Integer, default=0)
    fund_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # B2B SaaS: Qaysi akademiyaga tegishli
    academy_id: Mapped[int | None] = mapped_column(ForeignKey("academies.id"), nullable=True)

    # Karyera Tarixi (Transfermarkt uslubida)
    career_history: Mapped[list["CareerHistory"]] = relationship(back_populates="player", cascade="all, delete-orphan")

    # Bog'lanish: bitta futbolchining ko'plab video yuboruvlari bo'ladi
    submissions: Mapped[list["GoalSubmission"]] = relationship(back_populates="player", cascade="all, delete-orphan")
    
    # Web3 / Sarmoyalar
    investments: Mapped[list["FanTokenInvestment"]] = relationship(back_populates="player", cascade="all, delete-orphan")
    academy: Mapped["Academy"] = relationship(back_populates="players")

    # Gamification (Nishonlar va Yutuqlar)
    badges: Mapped[list["PlayerBadge"]] = relationship(back_populates="player", cascade="all, delete-orphan")
    
    # Recovery Logs (Oziqlanish va Kutish)
    recovery_logs: Mapped[list["RecoveryLog"]] = relationship(back_populates="player", cascade="all, delete-orphan")
    
    # Psixologik Testlar
    mental_tests: Mapped[list["MentalTestResult"]] = relationship(back_populates="player", cascade="all, delete-orphan")

class CareerHistory(Base):
    __tablename__ = "career_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    team_name: Mapped[str] = mapped_column(String(100), nullable=False)
    start_year: Mapped[int] = mapped_column(Integer, nullable=False)
    end_year: Mapped[int | None] = mapped_column(Integer, nullable=True) # None = Present
    matches_played: Mapped[int] = mapped_column(Integer, default=0)
    goals: Mapped[int] = mapped_column(Integer, default=0)
    assists: Mapped[int] = mapped_column(Integer, default=0)
    trophies: Mapped[str | None] = mapped_column(String(255), nullable=True)

    player: Mapped["Player"] = relationship(back_populates="career_history")


class GoalSubmission(Base):
    __tablename__ = "goal_submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    
    # Video manzili (Telegram file_id yoki web video URL)
    video_url: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Holati: pending (kutishda), approved (tasdiqlangan), rejected (rad etilgan)
    status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus), 
        default=VerificationStatus.PENDING
    )
    
    # AI Auto-Clipping
    is_ai_processed: Mapped[bool] = mapped_column(Integer, default=False)
    highlight_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    player: Mapped["Player"] = relationship(back_populates="submissions")

class Scout(Base):
    __tablename__ = "scouts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    organization: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contact_info: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_pro: Mapped[bool] = mapped_column(Integer, default=False) # Scout PRO subscription
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class ScoutReport(Base):
    __tablename__ = "scout_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    scout_id: Mapped[int] = mapped_column(ForeignKey("scouts.id"), nullable=False)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    report_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_hidden: Mapped[bool] = mapped_column(Integer, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False, default=0) # Narxi (ball yoki tangada)
    image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

class Tournament(Base):
    __tablename__ = "tournaments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    prize: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="upcoming") # upcoming, ongoing, completed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class TournamentParticipant(Base):
    __tablename__ = "tournament_participants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id"), nullable=False)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tournament: Mapped["Tournament"] = relationship()
    player: Mapped["Player"] = relationship()

class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tournament_id: Mapped[int | None] = mapped_column(ForeignKey("tournaments.id"), nullable=True)
    home_team: Mapped[str] = mapped_column(String(100), nullable=False)
    away_team: Mapped[str] = mapped_column(String(100), nullable=False)
    home_score: Mapped[int] = mapped_column(Integer, default=0)
    away_score: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="scheduled") # scheduled, live, completed
    current_minute: Mapped[str | None] = mapped_column(String(10), nullable=True) # e.g. "45'", "90+2'"
    start_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    # Tactics
    home_formation: Mapped[str | None] = mapped_column(String(20), default="4-3-3")
    away_formation: Mapped[str | None] = mapped_column(String(20), default="4-3-3")
    
    # Stats
    possession_home: Mapped[int] = mapped_column(Integer, default=50)
    possession_away: Mapped[int] = mapped_column(Integer, default=50)
    shots_on_target_home: Mapped[int] = mapped_column(Integer, default=0)
    shots_on_target_away: Mapped[int] = mapped_column(Integer, default=0)
    corners_home: Mapped[int] = mapped_column(Integer, default=0)
    corners_away: Mapped[int] = mapped_column(Integer, default=0)
    fouls_home: Mapped[int] = mapped_column(Integer, default=0)
    fouls_away: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    events: Mapped[list["MatchEvent"]] = relationship(back_populates="match", cascade="all, delete-orphan")
    player_stats: Mapped[list["PlayerMatchStat"]] = relationship(back_populates="match", cascade="all, delete-orphan")

class MatchEvent(Base):
    __tablename__ = "match_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"), nullable=False)
    minute: Mapped[str] = mapped_column(String(10), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False) # goal, yellow_card, red_card, sub_in, sub_out, chance, save
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    team: Mapped[str] = mapped_column(String(50), nullable=False) # home or away
    
    player_id: Mapped[int | None] = mapped_column(ForeignKey("players.id"), nullable=True)
    related_player_id: Mapped[int | None] = mapped_column(ForeignKey("players.id"), nullable=True) # e.g. assisted by, or subbed for

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    match: Mapped["Match"] = relationship(back_populates="events")
    player: Mapped["Player"] = relationship(foreign_keys=[player_id])
    related_player: Mapped["Player"] = relationship(foreign_keys=[related_player_id])


class PlayerMatchStat(Base):
    __tablename__ = "player_match_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"), nullable=False)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    
    rating: Mapped[float] = mapped_column(Integer, default=6.0) # Base rating
    passes: Mapped[int] = mapped_column(Integer, default=0)
    saves: Mapped[int] = mapped_column(Integer, default=0)
    tackles: Mapped[int] = mapped_column(Integer, default=0)
    goals: Mapped[int] = mapped_column(Integer, default=0)
    assists: Mapped[int] = mapped_column(Integer, default=0)
    
    match: Mapped["Match"] = relationship(back_populates="player_stats")
    player: Mapped["Player"] = relationship()

class DailyDrill(Base):
    __tablename__ = "daily_drills"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    duration: Mapped[str] = mapped_column(String(50), nullable=True)
    animation_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    dos: Mapped[str | None] = mapped_column(Text, nullable=True)
    donts: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ShowcaseEvent(Base):
    __tablename__ = "showcase_events"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(100), nullable=False)
    event_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    stream_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class VideoBattle(Base):
    __tablename__ = "video_battles"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Integer, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class VideoBattleEntry(Base):
    __tablename__ = "video_battle_entries"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    battle_id: Mapped[int] = mapped_column(ForeignKey("video_battles.id"), nullable=False)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    video_url: Mapped[str] = mapped_column(String(255), nullable=False)
    votes: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    player: Mapped["Player"] = relationship()

class Referee(Base):
    __tablename__ = "referees"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    rating: Mapped[float] = mapped_column(Integer, default=0.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)

class Academy(Base):
    __tablename__ = "academies"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    subdomain: Mapped[str | None] = mapped_column(String(50), unique=True, index=True, nullable=True) # B2B SaaS uchun masalan: realmadrid
    location: Mapped[str] = mapped_column(String(100), nullable=False)
    rating: Mapped[float] = mapped_column(Integer, default=0.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)

    players: Mapped[list["Player"]] = relationship(back_populates="academy")

class FanTokenInvestment(Base):
    __tablename__ = "fan_token_investments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    investor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    amount_invested: Mapped[float] = mapped_column(Integer, nullable=False)
    equity_percentage: Mapped[float] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    investor: Mapped["User"] = relationship()
    player: Mapped["Player"] = relationship(back_populates="investments")

# --- GAMIFICATION (NISHONLAR) ---
class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    icon_url: Mapped[str] = mapped_column(String(255), nullable=False)
    
class PlayerBadge(Base):
    __tablename__ = "player_badges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    badge_id: Mapped[int] = mapped_column(ForeignKey("badges.id"), nullable=False)
    earned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    player: Mapped["Player"] = relationship(back_populates="badges")
    badge: Mapped["Badge"] = relationship()

# --- AI NUTRITION & RECOVERY ---
class RecoveryLog(Base):
    __tablename__ = "recovery_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    log_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    sleep_hours: Mapped[float] = mapped_column(Integer, default=0.0)
    water_liters: Mapped[float] = mapped_column(Integer, default=0.0)
    ai_feedback: Mapped[str | None] = mapped_column(Text, nullable=True) # ChatGPT advice
    
    player: Mapped["Player"] = relationship(back_populates="recovery_logs")

# --- MENTAL TOUGHNESS TESTS ---
class MentalTestResult(Base):
    __tablename__ = "mental_test_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    test_name: Mapped[str] = mapped_column(String(100), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False) # 0-100
    ai_analysis: Mapped[str | None] = mapped_column(Text, nullable=True)
    taken_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    player: Mapped["Player"] = relationship(back_populates="mental_tests")
