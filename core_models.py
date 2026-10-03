from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional, List

from sqlalchemy import (
    String, Integer, BigInteger, ForeignKey, Enum, DateTime, Text, Boolean, Float, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

class AntiFraudStatus(str, PyEnum):
    PENDING = "pending"
    PASSED = "passed"
    REJECTED_METADATA = "rejected_metadata"
    REJECTED_AI_FLAG = "rejected_ai_flag"
    VERIFIED = "verified"

class User(Base):
    __tablename__ = "core_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True, nullable=False)
    
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    role_level: Mapped[int] = mapped_column(Integer, default=2) # 1 = Admin, 2 = Player, 3 = Scout
    
    # Biometric & Hardware Metadata
    biometric_status: Mapped[bool] = mapped_column(Boolean, default=False)
    geolocation_metadata: Mapped[Optional[str]] = mapped_column(String(255), nullable=True) # Last known region/city
    device_signature: Mapped[Optional[str]] = mapped_column(String(255), nullable=True) # Hardware tracking
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    workouts: Mapped[List["Workout"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    verifications: Mapped[List["Verification"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    tournament_teams: Mapped[List["TournamentTeamRoster"]] = relationship(back_populates="player", cascade="all, delete-orphan")

class Workout(Base):
    __tablename__ = "core_workouts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("core_users.id"), nullable=False)
    
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    daily_discipline_metrics: Mapped[int] = mapped_column(Integer, default=0) # e.g. Score given for hardcore compliance
    task_completions: Mapped[int] = mapped_column(Integer, default=0) # Number of drills completed in this session
    training_logs: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON or text logging the exact exercises
    
    hardcore_mode_active: Mapped[bool] = mapped_column(Boolean, default=True) # Whether it was done under Kiosk/Lockdown
    ai_motion_score: Mapped[float] = mapped_column(Float, default=0.0) # Evaluated by TensorFlow.js

    user: Mapped["User"] = relationship(back_populates="workouts")

class Tournament(Base):
    __tablename__ = "core_tournaments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="upcoming")
    
    # New Strict Requirements
    bracket_structures: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    live_score_states: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    teams: Mapped[List["TournamentTeam"]] = relationship(back_populates="tournament", cascade="all, delete-orphan")

class TournamentTeam(Base):
    __tablename__ = "core_tournament_teams"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tournament_id: Mapped[int] = mapped_column(ForeignKey("core_tournaments.id"), nullable=False)
    team_name: Mapped[str] = mapped_column(String(100), nullable=False)

    tournament: Mapped["Tournament"] = relationship(back_populates="teams")
    roster: Mapped[List["TournamentTeamRoster"]] = relationship(back_populates="team", cascade="all, delete-orphan")

class TournamentTeamRoster(Base):
    __tablename__ = "core_tournament_team_rosters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("core_tournament_teams.id"), nullable=False)
    player_id: Mapped[int] = mapped_column(ForeignKey("core_users.id"), nullable=False)
    is_captain: Mapped[bool] = mapped_column(Boolean, default=False)

    team: Mapped["TournamentTeam"] = relationship(back_populates="roster")
    player: Mapped["User"] = relationship(back_populates="tournament_teams")

class Verification(Base):
    __tablename__ = "core_verifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("core_users.id"), nullable=False)
    
    media_url: Mapped[str] = mapped_column(String(255), nullable=False) # Cloud Storage URL
    media_type: Mapped[str] = mapped_column(String(50), default="video")
    
    exif_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    anti_fraud_status: Mapped[AntiFraudStatus] = mapped_column(Enum(AntiFraudStatus), default=AntiFraudStatus.PENDING)
    
    moderation_queue_status: Mapped[str] = mapped_column(String(50), default="queued") # queued, processing, reviewed
    admin_reviewer_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="verifications")

class AdminLog(Base):
    __tablename__ = "core_admin_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    admin_id: Mapped[int] = mapped_column(Integer, nullable=False) # References Admin User ID
    action_type: Mapped[str] = mapped_column(String(100), nullable=False) # BAN, APPROVE_VIDEO, EDIT_TOURNAMENT
    target_id: Mapped[int] = mapped_column(Integer, nullable=True) # Affected User/Video ID
    
    ip_address: Mapped[str] = mapped_column(String(50), nullable=False)
    mac_signature: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
