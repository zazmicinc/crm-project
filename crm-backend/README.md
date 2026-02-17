# CRM Backend API

A REST API for a simple CRM system built with **FastAPI**, **SQLAlchemy**, and **SQLite**.

## Features

- **Contacts** — Full CRUD with search by name, email, or company
- **Deals** — Full CRUD with stage tracking and contact association
- **Activities** — Log calls, emails, and meetings linked to contacts
- Auto-generated **OpenAPI / Swagger** docs
- Comprehensive **unit tests** with pytest

## Quick Start

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the server
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.  
Interactive docs: `http://127.0.0.1:8000/docs`

## API Endpoints

| Resource | Method | Path | Description |
|----------|--------|------|-------------|
| Contacts | `POST` | `/api/contacts/` | Create contact |
| | `GET` | `/api/contacts/` | List (search, pagination) |
| | `GET` | `/api/contacts/{id}` | Get by ID |
| | `PUT` | `/api/contacts/{id}` | Update |
| | `DELETE` | `/api/contacts/{id}` | Delete |
| Deals | `POST` | `/api/deals/` | Create deal |
| | `GET` | `/api/deals/` | List (stage/contact filter) |
| | `GET` | `/api/deals/{id}` | Get by ID |
| | `PUT` | `/api/deals/{id}` | Update |
| | `DELETE` | `/api/deals/{id}` | Delete |
| Activities | `POST` | `/api/activities/` | Log activity |
| | `GET` | `/api/activities/` | List (contact filter) |
| | `GET` | `/api/activities/{id}` | Get by ID |
| | `PUT` | `/api/activities/{id}` | Update |
| | `DELETE` | `/api/activities/{id}` | Delete |
| Health | `GET` | `/api/health` | Health check |

## Running Tests

```bash
python -m pytest tests/ -v
```
