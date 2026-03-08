# Product Decision Log — Zazmic CRM

---

## 2026-03-08 — P1 Feature Set: High Value / Low Complexity

**Decision**: Build the following 7 features as the next sprint:
1. Lead score (0–100) + Hot/Warm/Cold grade (computed from score)
2. Lead job title / industry / company size fields
3. Account type field (Prospect / Customer / Partner)
4. Account annual revenue + employee count fields
5. Deal expected revenue (computed: value × probability)
6. Activity outcome / result text field
7. Task management (Activity subtype with due_date, assigned_to, completed_at)

**Reason**: These are the highest-impact, lowest-complexity items from the Zoho parity gap analysis. All are additive field changes on existing models — no new routes required for features 1–6. Feature 7 (tasks) is the only one that adds new endpoints and a new page, but reuses the existing Activity model rather than creating a separate Task model to minimize schema complexity.

**Alternatives considered**:
- Creating a separate `Task` model — rejected to keep schema simple; tasks are a type of activity
- Adding lead_grade as a DB column — rejected; it's fully derivable from lead_score, no need to store it

**Impact**: Closes ~8 Zoho parity gaps. Affects Lead, Account, Deal, and Activity models, schemas, routers, and frontend forms/list views. One new page (TasksPage). Four new migrations.

---

## 2026-03-08 — Lead Grade Thresholds

**Decision**: Hot/Warm/Cold grade derived from lead_score using fixed thresholds: 0–39 = Cold, 40–69 = Warm, 70–100 = Hot.

**Reason**: Matches common industry convention. Simple to implement and understand. Rule-based scoring engine (dynamic thresholds) is out of scope for P1.

**Alternatives considered**: Configurable thresholds per user/org — deferred to P3 roadmap.

**Impact**: Computed in Python `@property` on Lead model, not stored in DB.

---

## 2026-03-08 — Tasks reuse Activity model (not a separate table)

**Decision**: Tasks are stored as Activities with `is_task=True` and `type="task"`. Not a separate DB table.

**Reason**: Minimizes schema complexity. Tasks share all Activity relationships (contact, deal, account, lead). Timeline views work without changes. Easy to query.

**Alternatives considered**: Separate `tasks` table — cleaner separation but doubles migration/schema effort for minimal gain at this stage.

**Impact**: Adds 4 columns to `activities` table. Adds `task` to the type enum.
