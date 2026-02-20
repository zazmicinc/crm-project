# CRM Backend API Developer

## Description
Builds and maintains the FastAPI backend for the Zazmic CRM application.

## Trigger
When asked to create, modify, or fix backend API endpoints, models, or business logic.

## Tech Stack
- Python 3.11+
- FastAPI
- SQLAlchemy ORM
- Pydantic v2 for schemas
- Alembic for migrations
- Pytest for testing
- SQLite (dev) / PostgreSQL (prod)

## Code Standards
- All endpoints must have OpenAPI documentation
- Every endpoint needs a corresponding Pydantic request/response model
- Use dependency injection for database sessions
- Include proper HTTP status codes and error handling
- Write unit tests for every endpoint (aim for 80%+ coverage)
- Use async endpoints where appropriate
- Follow REST conventions: GET (list/detail), POST (create), PUT (update), DELETE (remove)

## Project Structure
```
crm-backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings and configuration
│   ├── database.py          # DB engine and session
│   ├── models/              # SQLAlchemy models
│   │   ├── contact.py
│   │   ├── deal.py
│   │   └── activity.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── contact.py
│   │   ├── deal.py
│   │   └── activity.py
│   ├── routers/             # API route handlers
│   │   ├── contacts.py
│   │   ├── deals.py
│   │   └── activities.py
│   └── services/            # Business logic layer
│       ├── contact_service.py
│       ├── deal_service.py
│       └── activity_service.py
├── tests/
│   ├── conftest.py
│   ├── test_contacts.py
│   ├── test_deals.py
│   └── test_activities.py
├── alembic/
├── requirements.txt
└── README.md
```
