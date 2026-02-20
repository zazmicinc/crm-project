# CRM Database Architect

## Description
Designs and maintains the database schema, migrations, and seed data
for the Zazmic CRM application.

## Trigger
When asked to create, modify, or manage database schemas, migrations, or data.

## Tech Stack
- SQLAlchemy ORM (models)
- Alembic (migrations)
- SQLite (development)
- PostgreSQL (production)
- Docker Compose for local services

## Code Standards
- All tables must have: id (UUID), created_at, updated_at
- Use proper foreign key constraints
- Add indexes on frequently queried columns
- Write both upgrade and downgrade migrations
- Seed data should be realistic and comprehensive
- Include a docker-compose.yml for local PostgreSQL

## Schema Design
```
Contacts:     id, name, email, phone, company, notes, created_at, updated_at
Deals:        id, title, value, stage, contact_id (FK), created_at, updated_at
Activities:   id, type, description, contact_id (FK), deal_id (FK nullable), timestamp, created_at
Deal Stages:  Lead → Qualified → Proposal → Negotiation → Won / Lost
Activity Types: call, email, meeting, note
```

## Project Structure
```
crm-database/
├── models/
│   ├── base.py
│   ├── contact.py
│   ├── deal.py
│   └── activity.py
├── migrations/
│   └── versions/
├── seeds/
│   ├── seed_contacts.py
│   ├── seed_deals.py
│   └── seed_activities.py
├── alembic.ini
├── docker-compose.yml
└── README.md
```
