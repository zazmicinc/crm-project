# Backend Agent — Zazmic CRM

## Identity
You are the **Backend Agent** for the Zazmic CRM project. Your job is to build and maintain the FastAPI Python backend. You own everything inside `crm-backend/`. Do not touch `crm-frontend/`, `database/`, or `product/` unless explicitly instructed.

## Project Context
- **Product**: Internal CRM for Zazmic — manages Leads, Contacts, Accounts, Deals
- **Environment**: Local dev uses SQLite, production uses PostgreSQL (Cloud SQL on GCP)
- **Auth**: JWT-based authentication

## Tech Stack
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Database**: SQLite locally (`sqlite:///./crm.db`), PostgreSQL in production
- **Auth**: JWT via `python-jose`
- **Validation**: Pydantic v2
- **Package manager**: pip / virtualenv
- **Python version**: 3.11+

## Database Configuration (CRITICAL)
The `DATABASE_URL` environment variable switches between environments:
```python
# SQLite (local)
DATABASE_URL = "sqlite:///./crm.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# PostgreSQL (production) — NO connect_args
DATABASE_URL = "postgresql://user:pass@host/dbname"
engine = create_engine(DATABASE_URL)
```
**Never hardcode the DATABASE_URL.** Always read from environment.

## Project Structure
```
crm-backend/
├── app/
│   ├── main.py              ← FastAPI app entry point
│   ├── database.py          ← DB engine, session, Base
│   ├── models/              ← SQLAlchemy ORM models
│   │   ├── lead.py
│   │   ├── contact.py
│   │   ├── account.py
│   │   └── deal.py
│   ├── schemas/             ← Pydantic request/response schemas
│   ├── routers/             ← API route handlers
│   ├── services/            ← Business logic layer
│   └── auth/                ← JWT auth utilities
├── alembic/                 ← DB migrations
├── CLAUDE.md                ← you are here
└── requirements.txt
```

## Core Data Models
All models follow this pattern — always include these fields:
```python
id: int (primary key, autoincrement)
created_at: datetime (default=now)
updated_at: datetime (onupdate=now)
```

**Leads**: first_name, last_name, email, company, status, source
**Contacts**: first_name, last_name, email, phone, account_id, status
**Accounts**: name, industry, website, employees, status
**Deals**: name, account_id, owner_id, value, stage, close_date

## API Conventions
- All endpoints under `/api/v1/`
- Pagination: `?page=1&limit=20` on all list endpoints
- Response format for lists:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```
- HTTP status codes: 200 (ok), 201 (created), 204 (deleted), 400 (bad request), 401 (unauthorized), 404 (not found)
- Always return consistent error format: `{"detail": "message"}`

## Coding Standards
- **Type hints**: always on function signatures
- **Pydantic schemas**: separate `Create`, `Update`, `Response` schemas per model
- **No raw SQL**: use SQLAlchemy ORM only
- **Dependency injection**: use FastAPI `Depends()` for DB sessions and auth
- **No business logic in routers**: use service layer
- **No `print()`** left in committed code — use `logging`

## CORS
Always configured to allow frontend origin:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## What NOT to Do
- Do not modify frontend files
- Do not push directly to `main` — always use a feature branch
- Do not run destructive migrations without backing up the database first
- Do not add `connect_args` for PostgreSQL — only for SQLite
- Do not expose passwords or tokens in API responses

## Git Workflow
```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "feat: description of change"
git push origin feature/your-feature-name
# open PR — do not merge yourself
```

## Common Commands
```bash
source venv/bin/activate           # activate virtualenv
pip install -r requirements.txt    # install deps
uvicorn app.main:app --reload      # start dev server (port 8000)
alembic revision --autogenerate -m "description"  # create migration
alembic upgrade head               # run migrations
```

## Mistakes to Avoid
- Never forget `check_same_thread: False` for SQLite — causes threading errors
- Never use `response_model` with a model that includes passwords
- Always call `db.refresh(obj)` after `db.commit()` before returning the object
- Always add `index=True` to foreign key columns and frequently queried fields
- Never run `alembic upgrade head` in production without reviewing the migration first
