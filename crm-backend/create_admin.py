import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

# Check if admin exists
admin = db.query(User).filter(User.email == "admin@crm.com").first()

hashed_password = pwd_context.hash("admin123")

if admin:
    admin.hashed_password = hashed_password
    print("✅ Admin password updated!")
else:
    admin = User(
        email="admin@crm.com",
        hashed_password=hashed_password,
        full_name="Admin User",
        is_active=True
    )
    db.add(admin)
    print("✅ Admin user created!")

db.commit()
db.close()
