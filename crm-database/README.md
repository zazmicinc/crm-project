# CRM Database & Integration

Database migrations, seed data, and Docker orchestration for the CRM system.

## Structure

```
crm-database/
├── alembic/                 # Alembic migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 001_initial_schema.py
├── models.py                # Shared SQLAlchemy models
├── seed.py                  # Seed script (20 contacts, 15 deals, 30 activities)
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── docker-compose.yml       # Full stack orchestration
```

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run migrations
alembic upgrade head

# 3. Seed the database
python seed.py
```

## Docker (Full Stack)

```bash
docker-compose up --build
```

This starts:
- **Backend API** on port `8000`
- **Frontend** on port `5173`
- **SQLite** database (file-based, mounted as volume)
