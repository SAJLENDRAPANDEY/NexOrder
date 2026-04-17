from app.core.database import SessionLocal
from app.core import models

db = SessionLocal()

username = "testuser"  # 👈 apna username

user = db.query(models.User).filter(models.User.username == username).first()

if user:
    user.is_admin = True
    db.commit()
    print(f"✅ {username} is now ADMIN")
else:
    print("❌ User not found")

db.close()