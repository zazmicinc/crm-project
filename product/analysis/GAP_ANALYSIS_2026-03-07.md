# Zoho CRM Gap Analysis - 2026-03-07

## Feature Analyzed: Lead Scoring

---

## Zoho CRM Lead Scoring — What It Offers

Zoho CRM's Lead Scoring (part of their "Zia" AI and manual scoring systems) allows sales teams to automatically rank leads by conversion likelihood. Key capabilities:

1. **Rule-based scoring** — Assign positive/negative points based on field values (e.g., +10 if source = "Website", -5 if status = "Contacted for 7+ days with no reply")
2. **Activity-based scoring** — Auto-adjust score when a lead opens an email (+5), clicks a link (+3), attends a webinar (+15), etc.
3. **Profile fit scoring** — Score based on demographic/firmographic match (job title, industry, company size)
4. **Decay/aging** — Score degrades over time if no engagement occurs
5. **Score thresholds** — Flag leads as "Hot / Warm / Cold" based on total score
6. **Scoring rules per module** — Separate rule sets for Leads vs. Contacts
7. **Score history/audit log** — Tracks which rules fired and when
8. **Sorting/filtering by score** — Lead list view can be sorted and filtered by score

---

## Schema Gap Assessment

### Current `leads` table columns:
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | PK |
| first_name | String | |
| last_name | String | |
| email | String | |
| phone | String | |
| company | String | |
| status | Enum | New/Contacted/Qualified/Converted/Dead |
| source | String | |
| owner_id | FK → users | |
| converted_at | DateTime | |
| converted_to_contact_id | FK | |
| converted_to_account_id | FK | |
| converted_to_deal_id | FK | |
| created_at | DateTime | |
| updated_at | DateTime | |

### What's Missing for Lead Scoring:

| Gap | Impact |
|-----|--------|
| No `score` column on `leads` | Cannot store current score |
| No `score_grade` column (Hot/Warm/Cold) | Cannot display lead temperature |
| No `lead_scoring_rules` table | Cannot define scoring criteria |
| No `lead_score_history` table | Cannot audit score changes |
| No `last_activity_at` on `leads` | Cannot implement score decay |
| No `job_title` / `industry` / `company_size` on `leads` | Cannot do profile-fit scoring |
| Activity model has no scoring weight | Cannot auto-score from activities |

---

## New Features Identified

### 1. Lead Score Field (Basic)
- **Zoho capability**: Each lead displays a numeric score (0–100) and grade (Hot/Warm/Cold)
- **Zazmic status**: Missing
- **Schema Impact**: Add `score INTEGER DEFAULT 0` and `score_grade VARCHAR(10)` to `leads` table
- **Priority**: High
- **Complexity**: Small

### 2. Rule-Based Scoring Engine
- **Zoho capability**: Admin defines field-value rules that add/subtract points when a lead matches criteria
- **Zazmic status**: Missing
- **Schema Impact**: New `lead_scoring_rules` table (rule_name, field_name, operator, value, points, is_active)
- **Priority**: High
- **Complexity**: Medium

### 3. Activity-Based Score Triggers
- **Zoho capability**: Score adjusts automatically when activities are logged (call +5, email +3, meeting +10)
- **Zazmic status**: Missing — Activity model has no score weight column
- **Schema Impact**: Add `score_delta INTEGER DEFAULT 0` to `activities` table; backend hook updates lead score on activity creation
- **Priority**: Medium
- **Complexity**: Medium

### 4. Score History / Audit Log
- **Zoho capability**: Full log of every score change: what rule fired, old score, new score, timestamp
- **Zazmic status**: Missing
- **Schema Impact**: New `lead_score_history` table (lead_id, rule_id, delta, score_before, score_after, reason, changed_at)
- **Priority**: Medium
- **Complexity**: Small

### 5. Score Decay (Aging)
- **Zoho capability**: Score decreases automatically if a lead has no activity for N days
- **Zazmic status**: Missing — no `last_activity_at` on leads, no scheduled job infrastructure
- **Schema Impact**: Add `last_activity_at DATETIME` to `leads`; requires background scheduler (APScheduler or Celery)
- **Priority**: Low
- **Complexity**: Large

### 6. Profile Fit Fields
- **Zoho capability**: Score based on job title, industry, company size — fields that must exist on the lead
- **Zazmic status**: Partial — `company` and `source` exist; `job_title`, `industry`, `company_size` are missing
- **Schema Impact**: Add `job_title VARCHAR(255)`, `industry VARCHAR(255)`, `company_size VARCHAR(50)` to `leads`
- **Priority**: Medium
- **Complexity**: Small

---

## Schema Gaps Identified

- Missing column: `leads.score` — stores computed lead score (integer 0–100)
- Missing column: `leads.score_grade` — categorical label ("Hot", "Warm", "Cold")
- Missing column: `leads.last_activity_at` — needed for decay calculation
- Missing column: `leads.job_title` — needed for profile-fit scoring
- Missing column: `leads.industry` — needed for profile-fit scoring
- Missing column: `leads.company_size` — needed for profile-fit scoring
- Missing column: `activities.score_delta` — weight of this activity type for scoring
- Missing table: `lead_scoring_rules` — defines scoring criteria
- Missing table: `lead_score_history` — audit log of score changes

---

## Summary: Can Current Schema Support Lead Scoring?

**No.** Zero lead scoring fields or tables exist. Both the `leads` table and a new rules/history table infrastructure must be built. This is a net-new feature requiring:
- 1 Alembic migration adding 6 columns to `leads`
- 1 Alembic migration adding 1 column to `activities`
- 2 new tables (`lead_scoring_rules`, `lead_score_history`)

---

## Implementation Briefs Required

- [ ] **Lead Score Field + Grade** — Add `score` and `score_grade` to `leads` (Schema changes: Yes — Small)
- [ ] **Rule-Based Scoring Engine** — New `lead_scoring_rules` table + scoring service (Schema changes: Yes — Medium)
- [ ] **Activity-Based Score Triggers** — Hook activity creation to recalculate lead score (Schema changes: Yes — Medium)
- [ ] **Score History Log** — New `lead_score_history` table (Schema changes: Yes — Small)
- [ ] **Profile Fit Fields** — Add `job_title`, `industry`, `company_size` to `leads` (Schema changes: Yes — Small)
- [ ] **Score Decay / Aging** — Scheduled score degradation (Schema changes: Yes — Large, deferred)

---

## Prioritization

| Priority | Feature | Effort | Value |
|----------|---------|--------|-------|
| 1 | Lead Score Field + Grade | Small | High — visible immediately in UI |
| 2 | Profile Fit Fields | Small | High — unblocks profile scoring |
| 3 | Rule-Based Scoring Engine | Medium | High — core of the feature |
| 4 | Activity-Based Score Triggers | Medium | Medium — automation win |
| 5 | Score History Log | Small | Medium — trust/transparency |
| 6 | Score Decay / Aging | Large | Low — advanced, needs scheduler infra |
