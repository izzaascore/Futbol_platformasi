import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Loyiha ildizidagi .env faylini yuklash
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

DATA_DIR = ROOT_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DEFAULT_DB_PATH = (DATA_DIR / "football.db").as_posix()

DATABASE_URL = os.getenv("DATABASE_URL")

# Agar DATABASE_URL ko'rsatilmagan bo'lsa yoki eski ./football.db ko'rinishida bo'lsa, data/football.db ga yo'naltiramiz
if not DATABASE_URL or DATABASE_URL.strip() in ("sqlite:///./football.db", "sqlite:///football.db"):
    DATABASE_URL = f"sqlite:///{DEFAULT_DB_PATH}"
elif DATABASE_URL.startswith("sqlite:///./data/"):
    # Nisbiy yo'lni to'g'ri absolut yo'lga aylantiramiz
    rel_path = DATABASE_URL.replace("sqlite:///./", "")
    DATABASE_URL = f"sqlite:///{(ROOT_DIR / rel_path).as_posix()}"

# Bulut provayderlari (Render, Railway, Supabase) beradigan 'postgres://' yoki 'postgresql://' prefiksini
# SQLAlchemy 2.0+ talabiga binoan psycopg2 drayveriga to'g'ri moslaymiz (ModuleNotFoundError: 'psycopg' oldini olish)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# SQLite uchun maxsus parametr, PostgreSQL uchun shart emas
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

