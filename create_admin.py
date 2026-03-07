import psycopg2
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

conn = psycopg2.connect(
    host="10.1.0.3",
    port=5432,
    database="crm_production",
    user="crm_user",
    password="CrmPassword"
)

cur = conn.cursor()
cur.execute("SELECT id FROM users WHERE email = 'admin@crm.com'")
result = cur.fetchone()

hashed_password = pwd_context.hash("admin123")

if result:
    cur.execute("UPDATE users SET hashed_password = %s WHERE email = 'admin@crm.com'", (hashed_password,))
    print("✅ Admin password updated!")
else:
    cur.execute("INSERT INTO users (email, hashed_password, full_name, is_active) VALUES (%s, %s, %s, %s)",
                ("admin@crm.com", hashed_password, "Admin User", True))
    print("✅ Admin user created!")

conn.commit()
cur.close()
conn.close()
