# Zazmic CRM — Project Guide

## Overview

Full-stack CRM application with multi-agent architecture. Manages contacts, deals, accounts, leads, activities, and pipelines with role-based access control and Google OAuth SSO.

## Tech Stack

| Layer       | Technology                                                  |
| ----------- | ----------------------------------------------------------- |
| Backend     | FastAPI (Python 3.11+), SQLAlchemy 2.0+, Pydantic v2        |
| Frontend    | React 19, Vite 7, Tailwind CSS 4, React Router v7           |
| Database    | SQLite (dev), PostgreSQL 16 (prod via Cloud SQL)             |
| Migrations  | Alembic                                                      |
| Auth        | JWT (python-jose), bcrypt, Google OAuth 2.0                  |
| Testing     | Pytest (backend), ESLint (frontend)                          |
| Deployment  | Docker, GCP Cloud Run, Terraform                             |

## Project Structure

```
crm-backend/     # FastAPI REST API (app/main.py entrypoint)
crm-frontend/    # React + Vite UI (src/main.jsx entrypoint)
crm-database/    # Shared models, Alembic migrations, docker-compose
crm-devops/      # Terraform IaC, Dockerfiles, deployment scripts
crm-analyst/     # Product analysis, gap reports, feature handoffs
docs/            # Multi-agent prompts and documentation
```

## Common Commands

### Backend

```bash
cd crm-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload              # Dev server on :8000
python -m pytest tests/ -v                 # Run all tests
python seed.py                             # Seed database
```

### Frontend

```bash
cd crm-frontend
npm install
npm run dev        # Dev server on :5173 (proxies /api to :8000)
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Docker (full stack)

```bash
cd crm-database
docker-compose up --build    # Backend :8000, Frontend :5173
```

### Database Migrations

```bash
cd crm-database
alembic upgrade head         # Apply migrations
alembic revision --autogenerate -m "description"  # Create migration
```

## Architecture Notes

### Backend (`crm-backend/app/`)

- **`main.py`** — FastAPI app init, CORS config, route registration
- **`models.py`** — SQLAlchemy ORM models (User, Contact, Deal, Account, Lead, Activity, Pipeline, Stage, Note, StageChange, Role)
- **`schemas.py`** — Pydantic schemas following `{Model}Create`, `{Model}Update`, `{Model}Response` naming
- **`auth.py`** — JWT token generation/validation, OAuth utilities
- **`database.py`** — Engine and session factory
- **`routers/`** — One file per resource, all prefixed `/api/{resource}`

### Frontend (`crm-frontend/src/`)

- **`api.js`** — Centralized API service layer (all backend calls go through here)
- **`context/AuthContext.jsx`** — Auth state management via React Context
- **`components/`** — Reusable UI components (PascalCase `.jsx`)
- **`pages/`** — Route pages (PascalCase ending in `Page.jsx`)
- **Design system** — Apple-inspired styling with Tailwind CSS utilities
- **Key libraries** — `framer-motion` (animations), `recharts` (charts), `@hello-pangea/dnd` (Kanban drag-and-drop)

### Database Models

All models have `created_at` and `updated_at` UTC timestamps. Key relationships:
- User owns Contacts, Deals, Accounts, Leads (via `owner_id`)
- Deal belongs to Contact and Account, has StageChanges
- Activity links to Contact, optionally to Deal and Account
- Pipeline has ordered Stages with probabilities

## Coding Conventions

- **Python**: PEP 8, type hints on function signatures, docstrings on public functions/classes
- **JavaScript/JSX**: ESLint enforced, React hooks rules, camelCase for functions/variables
- **Components**: PascalCase filenames, pages end with `Page.jsx`
- **API routes**: `/api/{resource}` prefix, RESTful conventions
- **Git commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`)

## Testing

- Backend tests use in-memory SQLite via fixtures in `tests/conftest.py`
- Fixtures provide: test DB session, authenticated HTTP client, sample data factories
- Run single test: `python -m pytest tests/test_contacts.py -v`
- No frontend unit tests yet — ESLint only

## Environment

- **`.env`** in `crm-backend/` holds OAuth credentials (not committed)
- Vite dev server proxies `/api` requests to `http://localhost:8000`
- Frontend default port: 5173, Backend default port: 8000

## Dev Workflow

1. Start backend: `cd crm-backend && uvicorn app.main:app --reload`
2. Start frontend: `cd crm-frontend && npm run dev`
3. API docs available at `http://localhost:8000/docs` (Swagger) or `/redoc`
4. Run backend tests before committing: `python -m pytest tests/ -v`
5. Run frontend lint before committing: `cd crm-frontend && npm run lint`
