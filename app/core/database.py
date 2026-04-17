from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ✅ SQLite database (no setup needed)
DATABASE_URL = "sqlite:///./test.db"

# ✅ Engine (SQLite ke liye special setting)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# ✅ Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Base class
Base = declarative_base()

# ✅ DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()