# Zazmic CRM - Agent Prompts

Copy and paste these prompts when starting conversations in each workspace.
Use **Plan mode** for all agents.

---

## Agent 1 — Backend API (workspace: crm-backend)

```
Build a REST API for the Zazmic CRM system using Python FastAPI. 
Include endpoints for:

1. Contacts CRUD: name, email, phone, company, notes
2. Deals CRUD: title, value, stage (Lead/Qualified/Proposal/Negotiation/Won/Lost), associated contact
3. Activities: type (call/email/meeting/note), description, linked to contacts and optionally to deals

Requirements:
- Use SQLAlchemy with SQLite for development
- Pydantic v2 models for all request/response schemas
- Proper error handling with appropriate HTTP status codes
- Full OpenAPI documentation
- Service layer for business logic (don't put logic in route handlers)
- Unit tests with pytest for all endpoints
- Include a requirements.txt
- Add a README with setup and run instructions

Follow the project structure defined in the backend-api skill.
```

---

## Agent 2 — Frontend (workspace: crm-frontend)

```
Build a React TypeScript frontend for the Zazmic CRM system.

Pages needed:
1. Dashboard: summary cards (total contacts, active deals, recent activities)
2. Contacts: searchable/filterable list view + detail page showing associated deals and activities
3. Deals: kanban-style pipeline board with drag-and-drop between stages
4. Activities: timeline view filtered by contact or deal
5. Forms: add/edit forms for contacts, deals, and activities

Requirements:
- React 18 with TypeScript strict mode
- Tailwind CSS for all styling
- React Router v6 for navigation
- Centralized API service layer calling http://localhost:8000/api
- Responsive design (works on mobile and desktop)
- Loading skeletons and empty states for all views
- Error boundaries
- Vite for build tooling
- Include package.json and README with setup instructions

Follow the project structure defined in the frontend-ui skill.
```

---

## Agent 3 — Database (workspace: crm-database)

```
Create the database layer for the Zazmic CRM system.

1. SQLAlchemy models for: Contacts, Deals, Activities
   - All tables: id (UUID primary key), created_at, updated_at
   - Contacts: name, email (unique), phone, company, notes
   - Deals: title, value (decimal), stage (enum), contact_id (FK)
   - Activities: type (enum), description, contact_id (FK), deal_id (FK nullable), timestamp

2. Alembic migration setup with initial migration

3. Seed data script:
   - 20 realistic contacts (diverse companies and names)
   - 15 deals spread across all pipeline stages
   - 30 activities of mixed types linked to contacts/deals

4. docker-compose.yml with:
   - PostgreSQL 16 container
   - Volume for data persistence
   - Environment variables for connection

5. README with setup and migration instructions

Follow the project structure defined in the database-design skill.
```

---

## Agent 5 — CRM Analyst (workspace: crm-analyst)

```
You are a CRM product analyst for Zazmic. Do the following:

1. Browse Zoho CRM's documentation at https://www.zoho.com/crm/help/ 
   and catalog their features across these categories: 
   Contacts & Leads, Deals & Pipeline, Activities & Tasks, 
   Automation & Workflows, Reporting & Analytics, Email Integration, 
   Customization, and Security & Permissions

2. Read our CRM codebase in the sibling directories 
   (../crm-backend, ../crm-frontend, ../crm-database) 
   and catalog what we've built so far

3. Create a Markdown report at reports/gap-analysis-[today's date].md 
   with these sections:
   - Executive Summary
   - Feature Parity (what we already have)
   - Missing Features (table: feature, category, priority, effort, description)
   - Quick Wins (high priority + low effort)
   - Summary Stats (total compared, match %, gap %)
   - Recommendations

4. After saving the report, present me with the missing features 
   as a numbered list and ask: 
   "Which features would you like to build next?"

When I select features, generate implementation briefs in the 
handoffs/ directory following the feature-handoff skill instructions.
```

---

## Daily Prompt (for the Analyst agent)

```
Run today's gap analysis. Check for any changes in our codebase 
since the last report and update the comparison. Highlight any 
new features we've implemented since the previous report.
```
