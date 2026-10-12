from pydantic import BaseModel
from datetime import datetime
from models import VerificationStatus, UserRole, UserStatus

class UserBase(BaseModel):
    first_name: str
    last_name: str
    telegram_id: int | None = None
    age: int | None = None
    address: str | None = None
    email: str | None = None

class TelegramAuthRequest(BaseModel):
    id: int
    first_name: str
    last_name: str | None = None
    username: str | None = None
    photo_url: str | None = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.PLAYER
    kyc_document_url: str | None = None
    # Player fields
    position: str | None = None
    height: int | None = None
    weight: int | None = None
    preferred_foot: str | None = None
    team: str | None = None
    video_link: str | None = None
    # Scout fields
    organization: str | None = None
    license_url: str | None = None

class UserLogin(BaseModel):
    firstName: str
    lastName: str
    password: str

class UserOut(UserBase):
    id: int
    role: UserRole
    status: UserStatus
    kyc_document_url: str | None = None
    profile_image: str | None = None
    discipline_score: int = 100
    streak: int = 0
    hardcore_mode: bool = False
    last_training_date: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileImageUpdate(BaseModel):
    profile_image: str

class UserVideoBase(BaseModel):
    video_url: str
    is_ai_processed: bool = False
    highlight_url: str | None = None

class UserVideoOut(UserVideoBase):
    id: int
    user_id: int
    status: VerificationStatus
    created_at: datetime

    class Config:
        from_attributes = True

class PlayerBase(BaseModel):
    telegram_id: int | None = None
    full_name: str
    age: int | None = None
    city: str | None = None
    position: str | None = None
    preferred_foot: str | None = None
    team: str | None = None
    goals_claimed: int = 0
    height: int | None = None
    weight: int | None = None
    pass_accuracy: int | None = None
    sprint_speed: float | None = None
    stamina: int | None = None
    
    # Psixologik va Jismoniy baholar
    mental_score: int = 50
    physical_discipline_score: int = 50
    # Karyera Jamg'armasi
    fund_goal: int = 0
    fund_raised: int = 0
    fund_description: str | None = None
    
    # B2B & Analytics
    academy_id: int | None = None
    xg_total: float = 0.0
    xa_total: float = 0.0
    top_speed_kmh: float = 0.0
    distance_covered_km: float = 0.0

class CareerHistoryBase(BaseModel):
    team_name: str
    start_year: int
    end_year: int | None = None
    matches_played: int = 0
    goals: int = 0
    assists: int = 0
    trophies: str | None = None

class CareerHistoryCreate(CareerHistoryBase):
    pass

class CareerHistoryOut(CareerHistoryBase):
    id: int
    player_id: int

    class Config:
        from_attributes = True

class PlayerCreate(PlayerBase):
    pass

class BadgeBase(BaseModel):
    name: str
    description: str
    icon_url: str

class BadgeOut(BadgeBase):
    id: int
    class Config:
        from_attributes = True

class PlayerBadgeOut(BaseModel):
    id: int
    badge: BadgeOut
    earned_at: datetime
    class Config:
        from_attributes = True

class RecoveryLogOut(BaseModel):
    id: int
    log_date: datetime
    sleep_hours: float
    water_liters: float
    ai_feedback: str | None = None
    class Config:
        from_attributes = True

class MentalTestResultOut(BaseModel):
    id: int
    test_name: str
    score: int
    ai_analysis: str | None = None
    taken_at: datetime
    class Config:
        from_attributes = True

class PlayerOut(PlayerBase):
    id: int
    goals_verified: int
    career_history: list[CareerHistoryOut] = []
    badges: list[PlayerBadgeOut] = []
    recovery_logs: list[RecoveryLogOut] = []
    mental_tests: list[MentalTestResultOut] = []

    class Config:
        from_attributes = True


class GoalSubmissionCreate(BaseModel):
    video_url: str
    description: str | None = None
    is_ai_processed: bool = False
    highlight_url: str | None = None


class GoalSubmissionOut(GoalSubmissionCreate):
    id: int
    player_id: int
    status: VerificationStatus
    created_at: datetime

    class Config:
        from_attributes = True

# --- SCOUT SCHEMAS ---
class ScoutBase(BaseModel):
    full_name: str
    organization: str | None = None
    contact_info: str | None = None
    is_pro: bool = False

class ScoutCreate(ScoutBase):
    pass

class ScoutOut(ScoutBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- PRODUCT SCHEMAS ---
class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: int = 0
    image_url: str | None = None

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int

    class Config:
        from_attributes = True

# --- TOURNAMENT SCHEMAS ---
class TournamentBase(BaseModel):
    name: str
    description: str | None = None
    prize: str | None = None
    status: str = "upcoming"

class TournamentCreate(TournamentBase):
    pass

class TournamentOut(TournamentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TournamentParticipantCreate(BaseModel):
    player_id: int

class TournamentParticipantOut(BaseModel):
    id: int
    tournament_id: int
    player_id: int
    joined_at: datetime

    class Config:
        from_attributes = True

# --- MATCH SCHEMAS ---
class MatchEventBase(BaseModel):
    minute: str
    event_type: str
    description: str | None = None
    team: str
    player_id: int | None = None
    related_player_id: int | None = None

class MatchEventCreate(MatchEventBase):
    pass

class MatchEventOut(MatchEventBase):
    id: int
    match_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PlayerMatchStatBase(BaseModel):
    player_id: int
    rating: float = 6.0
    passes: int = 0
    saves: int = 0
    tackles: int = 0
    goals: int = 0
    assists: int = 0

class PlayerMatchStatOut(PlayerMatchStatBase):
    id: int
    match_id: int

    class Config:
        from_attributes = True


class MatchBase(BaseModel):
    tournament_id: int | None = None
    home_team: str
    away_team: str
    home_score: int = 0
    away_score: int = 0
    status: str = "scheduled"
    current_minute: str | None = None
    start_time: datetime | None = None
    home_formation: str | None = "4-3-3"
    away_formation: str | None = "4-3-3"
    possession_home: int = 50
    possession_away: int = 50
    shots_on_target_home: int = 0
    shots_on_target_away: int = 0
    corners_home: int = 0
    corners_away: int = 0
    fouls_home: int = 0
    fouls_away: int = 0

class MatchCreate(MatchBase):
    pass

class MatchOut(MatchBase):
    id: int
    created_at: datetime
    events: list[MatchEventOut] = []
    player_stats: list[PlayerMatchStatOut] = []

    class Config:
        from_attributes = True

# --- DAILY DRILLS SCHEMAS ---
class DailyDrillBase(BaseModel):
    title: str
    description: str
    duration: str | None = None
    animation_url: str | None = None
    dos: str | None = None
    donts: str | None = None

class DailyDrillOut(DailyDrillBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- NEW SCHEMAS FOR ADDED FEATURES ---

class ScoutReportBase(BaseModel):
    player_id: int
    report_text: str
    is_hidden: bool = True

class ScoutReportCreate(ScoutReportBase):
    pass

class ScoutReportOut(ScoutReportBase):
    id: int
    scout_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ShowcaseEventBase(BaseModel):
    title: str
    description: str
    location: str
    event_date: datetime
    stream_url: str | None = None

class ShowcaseEventCreate(ShowcaseEventBase):
    pass

class ShowcaseEventOut(ShowcaseEventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class VideoBattleBase(BaseModel):
    title: str
    description: str
    is_active: bool = True

class VideoBattleCreate(VideoBattleBase):
    pass

class VideoBattleOut(VideoBattleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class VideoBattleEntryBase(BaseModel):
    battle_id: int
    player_id: int
    video_url: str

class VideoBattleEntryCreate(VideoBattleEntryBase):
    pass

class VideoBattleEntryOut(VideoBattleEntryBase):
    id: int
    votes: int
    created_at: datetime
    player: PlayerOut | None = None

    class Config:
        from_attributes = True

class RefereeBase(BaseModel):
    name: str
    rating: float = 0.0
    rating_count: int = 0

class RefereeCreate(RefereeBase):
    pass

class RefereeOut(RefereeBase):
    id: int

    class Config:
        from_attributes = True

class AcademyBase(BaseModel):
    name: str
    subdomain: str | None = None
    location: str
    rating: float = 0.0
    rating_count: int = 0

class AcademyCreate(AcademyBase):
    pass

class AcademyOut(AcademyBase):
    id: int

    class Config:
        from_attributes = True

class FanTokenInvestmentBase(BaseModel):
    player_id: int
    amount_invested: float
    equity_percentage: float

class FanTokenInvestmentCreate(FanTokenInvestmentBase):
    pass

class FanTokenInvestmentOut(FanTokenInvestmentBase):
    id: int
    investor_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TournamentCreate(BaseModel):
    name: str
    description: str | None = None
    prize: str | None = None
    status: str | None = "Aktiv"
    image: str | None = None
    teams_count: int = 16
    start_date: str | None = None
    location: str | None = None
    
class TournamentOut(TournamentCreate):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
