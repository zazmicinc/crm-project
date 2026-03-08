# Implementation Brief: P1 — High Value, Low Complexity Features
**Target Agents**: Backend, Database, Frontend
**Branch**: `feature/p1-field-enhancements`
**Date**: 2026-03-08

---

## Overview

Seven small-to-medium features that close the most important Zoho parity gaps with minimal effort. Six are simple field additions (model + schema + form + list column + migration). One (task management) requires a new Activity subtype with additional fields. All work is confined to existing modules — no new routes, no new pages.

Recommended execution order:
1. Database agent: all migrations in one pass
2. Backend agent: all model + schema + router changes in one pass
3. Frontend agent: all form + list view updates in one pass

---

## Feature 1 — Lead Score + Hot/Warm/Cold Grade

### What to build
Add a numeric score (0–100) and a derived temperature grade to the Lead model.

#### Backend (`crm-backend/`)

**`app/models.py`** — Lead model, add:
```python
lead_score = Column(Integer, nullable=True, default=0)  # 0–100
# lead_grade is a computed property — NOT a DB column
@property
def lead_grade(self) -> str:
    if self.lead_score is None or self.lead_score < 40:
        return "Cold"
    elif self.lead_score < 70:
        return "Warm"
    return "Hot"
```

**`app/schemas.py`** — LeadBase / LeadUpdate / LeadResponse, add:
```python
lead_score: Optional[int] = Field(None, ge=0, le=100)
lead_grade: Optional[str] = None  # read-only, computed
```

**`app/routers/leads.py`** — no route changes needed; `LeadResponse` picks up `lead_grade` via the model property.

#### Database (`crm-database/`)
New migration: `012_add_lead_score.py`
```python
op.add_column('leads', sa.Column('lead_score', sa.Integer(), nullable=True, server_default='0'))
```

#### Frontend (`crm-frontend/`)

**`src/components/LeadForm.jsx`** — add a numeric input (0–100) for `lead_score`. Display `lead_grade` as a read-only badge next to the score.

**`src/pages/LeadsPage.jsx`** — add a "Score" column to `ListTable`. Render grade as a colored badge:
- Hot → red (#e8192c)
- Warm → amber
- Cold → gray/slate

**Grade badge colors** follow the Zazmic design system (use existing `StatusBadge` component or extend it).

### Acceptance criteria
- [ ] `lead_score` stores 0–100 integer, defaults to 0
- [ ] `lead_grade` returns Cold/Warm/Hot based on thresholds, not stored in DB
- [ ] Score editable in lead create/edit form with input min=0 max=100
- [ ] Grade badge visible in lead list and detail views
- [ ] Migration runs without errors on existing data

---

## Feature 2 — Lead Job Title / Industry / Company Size

### What to build
Three new optional string/enum fields on the Lead model to capture lead profile data.

#### Backend (`crm-backend/`)

**`app/models.py`** — Lead model, add:
```python
job_title = Column(String, nullable=True)
industry = Column(String, nullable=True)
company_size = Column(String, nullable=True)  # e.g. "1-10", "11-50", "51-200", "201-500", "500+"
```

**`app/schemas.py`** — LeadBase / LeadUpdate / LeadResponse, add:
```python
job_title: Optional[str] = None
industry: Optional[str] = None
company_size: Optional[str] = None
```

#### Database (`crm-database/`)
Add to same migration `012_add_lead_score.py` (or separate `013_add_lead_profile_fields.py`):
```python
op.add_column('leads', sa.Column('job_title', sa.String(), nullable=True))
op.add_column('leads', sa.Column('industry', sa.String(), nullable=True))
op.add_column('leads', sa.Column('company_size', sa.String(), nullable=True))
```

#### Frontend (`crm-frontend/`)

**`src/components/LeadForm.jsx`** — add three fields:
- `job_title`: free text input
- `industry`: free text input (or dropdown matching Account industries if defined)
- `company_size`: dropdown with options: `1–10`, `11–50`, `51–200`, `201–500`, `500+`

**`src/pages/LeadsPage.jsx`** — add "Job Title" column to `ListTable` (industry + company size are detail-view only to avoid list clutter).

### Acceptance criteria
- [ ] All three fields optional on create and update
- [ ] `job_title` visible in lead list (new column)
- [ ] All three fields editable in lead create/edit form
- [ ] `company_size` renders as dropdown with predefined size bands
- [ ] Migration runs without errors on existing data

---

## Feature 3 — Account Type Field

### What to build
Add an `account_type` enum field (Prospect / Customer / Partner) to the Account model.

#### Backend (`crm-backend/`)

**`app/models.py`** — Account model, add:
```python
account_type = Column(
    Enum("Prospect", "Customer", "Partner", name="account_type_enum"),
    nullable=True,
    default="Prospect"
)
```

**`app/schemas.py`** — AccountBase / AccountUpdate / AccountResponse, add:
```python
account_type: Optional[str] = "Prospect"
```

#### Database (`crm-database/`)
New migration `013_add_account_fields.py`:
```python
account_type_enum = sa.Enum('Prospect', 'Customer', 'Partner', name='account_type_enum')
account_type_enum.create(op.get_bind(), checkfirst=True)
op.add_column('accounts', sa.Column('account_type', sa.Enum('Prospect', 'Customer', 'Partner', name='account_type_enum'), nullable=True, server_default='Prospect'))
```

#### Frontend (`crm-frontend/`)

**`src/components/AccountForm.jsx`** — add `account_type` as a dropdown (Prospect / Customer / Partner), defaulting to Prospect.

**`src/pages/AccountsPage.jsx`** — add "Type" column to `ListTable`. Render with `StatusBadge` or colored text:
- Customer → green
- Partner → blue
- Prospect → gray

### Acceptance criteria
- [ ] `account_type` defaults to "Prospect" on new accounts
- [ ] Editable in account create/edit form as a dropdown
- [ ] "Type" column visible in accounts list with colored badge
- [ ] Migration runs without errors on existing data

---

## Feature 4 — Account Annual Revenue + Employee Count

### What to build
Two new numeric fields on the Account model for company size signals.

#### Backend (`crm-backend/`)

**`app/models.py`** — Account model, add:
```python
annual_revenue = Column(Float, nullable=True)
employee_count = Column(Integer, nullable=True)
```

**`app/schemas.py`** — AccountBase / AccountUpdate / AccountResponse, add:
```python
annual_revenue: Optional[float] = None
employee_count: Optional[int] = None
```

#### Database (`crm-database/`)
Add to migration `013_add_account_fields.py`:
```python
op.add_column('accounts', sa.Column('annual_revenue', sa.Float(), nullable=True))
op.add_column('accounts', sa.Column('employee_count', sa.Integer(), nullable=True))
```

#### Frontend (`crm-frontend/`)

**`src/components/AccountForm.jsx`** — add:
- `annual_revenue`: number input, formatted as currency (prefix `$`)
- `employee_count`: number input, integer only

Both are detail-view fields (not shown in list to keep `AccountsPage` columns lean).

### Acceptance criteria
- [ ] Both fields optional on create and update
- [ ] Both editable in account create/edit form
- [ ] `annual_revenue` displays with `$` prefix in account detail view
- [ ] Migration runs without errors on existing data

---

## Feature 5 — Deal Expected Revenue (Computed Field)

### What to build
Add a read-only `expected_revenue` computed field to the Deal model: `value × (effective_probability / 100)`.

No migration needed — this is a Python property, not a database column.

#### Backend (`crm-backend/`)

**`app/models.py`** — Deal model, add alongside existing `effective_probability`:
```python
@property
def expected_revenue(self) -> Optional[float]:
    if self.value is None:
        return None
    prob = self.effective_probability
    if prob is None:
        return self.value
    return round(self.value * (prob / 100), 2)
```

**`app/schemas.py`** — DealResponse only (read-only computed), add:
```python
expected_revenue: Optional[float] = None
```

Ensure `DealResponse` is configured with `from_attributes = True` (already should be) so the property is picked up.

#### Frontend (`crm-frontend/`)

**`src/pages/DealsPage.jsx`** — add "Exp. Revenue" column to `ListTable`. Format as currency.

**`src/pages/DealDetailPage.jsx`** — display `expected_revenue` as a read-only field in the deal overview panel alongside `value` and `probability`.

### Acceptance criteria
- [ ] `expected_revenue` = `value × effective_probability / 100`, rounded to 2 decimal places
- [ ] Returns `null` if `value` is null
- [ ] Returns `value` unchanged if no probability is set
- [ ] Visible in deals list as "Exp. Revenue" column
- [ ] Visible in deal detail view (read-only)
- [ ] No database migration required

---

## Feature 6 — Activity Outcome / Result Field

### What to build
Add an optional `outcome` text field to the Activity model to record what happened after the activity.

#### Backend (`crm-backend/`)

**`app/models.py`** — Activity model, add:
```python
outcome = Column(Text, nullable=True)
```

**`app/schemas.py`** — ActivityBase / ActivityUpdate / ActivityResponse, add:
```python
outcome: Optional[str] = None
```

#### Database (`crm-database/`)
New migration `014_add_activity_outcome.py`:
```python
op.add_column('activities', sa.Column('outcome', sa.Text(), nullable=True))
```

#### Frontend (`crm-frontend/`)

**`src/components/ActivityForm.jsx`** (or wherever activities are created/edited in the Timeline) — add an `outcome` textarea field labeled "Outcome / Result". Show this field below the description.

### Acceptance criteria
- [ ] `outcome` is optional, defaults to null
- [ ] Editable when creating or editing an activity
- [ ] Displayed in the Timeline view alongside the activity description
- [ ] Migration runs without errors on existing data

---

## Feature 7 — Task Management (To-Do with Due Date + Owner)

### What to build
Extend the Activity model with task-specific fields: `is_task` boolean, `due_date`, `completed_at`, and `assigned_to_id`. Add a `task` activity type. Expose a simple task list UI (filterable by owner and due date).

This is the most complex P1 feature. It reuses the Activity model rather than creating a separate Task model, keeping the data model simple.

#### Backend (`crm-backend/`)

**`app/models.py`** — Activity model changes:
```python
# Extend the type Enum to include 'task'
type = Column(Enum("call", "email", "meeting", "task"), nullable=False)

# New task-specific columns
is_task = Column(Boolean, default=False, nullable=False)
due_date = Column(DateTime(timezone=True), nullable=True)
completed_at = Column(DateTime(timezone=True), nullable=True)
assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)

# New relationship
assigned_to = relationship("User", foreign_keys=[assigned_to_id])
```

**`app/schemas.py`** — ActivityBase / ActivityUpdate / ActivityResponse, add:
```python
is_task: bool = False
due_date: Optional[datetime] = None
completed_at: Optional[datetime] = None
assigned_to_id: Optional[int] = None
```

ActivityResponse also add:
```python
assigned_to_name: Optional[str] = None  # populated from relationship
```

**`app/routers/activities.py`** — add:
- `GET /api/activities/tasks` — list only activities where `is_task=True`, supports filters: `assigned_to_id`, `due_before`, `completed` (bool)
- `PUT /api/activities/{activity_id}/complete` — sets `completed_at = utcnow()`
- `PUT /api/activities/{activity_id}/reopen` — sets `completed_at = None`

#### Database (`crm-database/`)
New migration `015_add_task_fields.py`:
```python
# Recreate the enum to add 'task' type
# NOTE: SQLite does not enforce enums — for SQLite just alter; for PostgreSQL use ALTER TYPE
op.add_column('activities', sa.Column('is_task', sa.Boolean(), nullable=False, server_default='false'))
op.add_column('activities', sa.Column('due_date', sa.DateTime(timezone=True), nullable=True))
op.add_column('activities', sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True))
op.add_column('activities', sa.Column('assigned_to_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
# Enum alteration handled per-DB in migration body
```

#### Frontend (`crm-frontend/`)

**New page: `src/pages/TasksPage.jsx`**
- List of tasks (activities where `is_task=true`) with columns: Subject, Due Date, Owner, Status (Pending / Overdue / Complete), Linked Record
- Filter bar: by owner (dropdown), by status (all / pending / overdue / complete)
- "New Task" button opens `TaskForm` modal
- "Complete" action per row (single click, no confirmation needed)
- Register route in `src/main.jsx` or router: `/tasks`

**New component: `src/components/TaskForm.jsx`**
Fields:
- `subject` (text, required)
- `due_date` (date/time picker, required for tasks)
- `assigned_to_id` (user dropdown, defaults to current user)
- `description` (textarea, optional)
- `outcome` (textarea, optional — result after completion)
- Link to record: one of `contact_id`, `deal_id`, `lead_id`, `account_id` (optional)

**`src/api.js`** — add to `activitiesApi`:
```js
tasks: (params) => api.get('/activities/tasks', { params }),
complete: (id) => api.put(`/activities/${id}/complete`),
reopen: (id) => api.put(`/activities/${id}/reopen`),
```

**Navigation** — add "Tasks" to the sidebar nav (between Activities and any future Reports entry).

### Acceptance criteria
- [ ] Activities with `type="task"` are distinguished from calls/emails/meetings
- [ ] Tasks have `due_date` (required in form), `assigned_to_id`, `completed_at`
- [ ] `/api/activities/tasks` endpoint returns only tasks, supports owner + status filters
- [ ] Complete and Reopen endpoints work correctly
- [ ] `TasksPage` renders task list with correct columns and filters
- [ ] Overdue tasks (due_date < now, not completed) shown with visual indicator (red text or badge)
- [ ] "New Task" button opens `TaskForm` modal and refreshes list on save
- [ ] Tasks linked to a record (lead/contact/deal/account) appear in that record's Timeline
- [ ] Migration runs without errors on existing data

---

## Cross-Cutting Notes for All Agents

### Migration sequencing
Run all migrations in order. Suggested grouping:
- `012_add_lead_score_and_profile_fields.py` — features 1 + 2 together
- `013_add_account_fields.py` — features 3 + 4 together
- `014_add_activity_outcome.py` — feature 6
- `015_add_task_fields.py` — feature 7

Feature 5 (expected_revenue) requires **no migration**.

### SQLite vs PostgreSQL
For enum alterations (adding `task` to the Activity type enum), SQLite does not enforce enum constraints — the column alter is sufficient. For PostgreSQL, use `ALTER TYPE ... ADD VALUE`. The migration should handle both environments.

### Design system reminders
- Red `#e8192c` for destructive/urgent/hot states only
- All new badges use `StatusBadge` component or match its styling
- No new color introductions — use Tailwind classes already in use (slate, amber, green, blue)
- New form fields follow the existing label-above-input layout in all existing forms

### What NOT to build
- No rule-based score automation (roadmap item, not this sprint)
- No score decay / aging logic
- No CSV import/export
- No email integration for activities
- No recurring tasks
- No task templates
