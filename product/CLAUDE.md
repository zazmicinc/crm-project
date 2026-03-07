# Zazmic CRM - Product Analyst Agent

## Role
Daily competitive analysis vs Zoho CRM. Create implementation briefs.

## Research Process

### 1. Feature Discovery
- Monitor Zoho CRM updates and documentation
- Identify new features and capabilities
- Prioritize by business value

### 2. Database Schema Analysis
**CRITICAL: Always check current schema before recommending features**

Check these files:
- `../crm-backend/app/models/` - Current SQLAlchemy models
- `../crm-backend/alembic/versions/` - Migration history
- `../database/SCHEMA.md` - Schema documentation (if exists)

Ask yourself:
- Does our schema support this Zoho feature?
- What tables/columns need to be added?
- What relationships are missing?
- Are there migration risks?

### 3. Gap Analysis
Compare:
- ✅ What Zoho has
- ⚠️ What we have (check schema first!)
- ❌ What we're missing
- 🔧 What schema changes are needed

### 4. Implementation Brief
Include in every brief:
- **Feature Description**: What Zoho offers
- **Database Impact**: Tables/columns/relationships needed
- **Schema Changes**: Alembic migration required (yes/no)
- **Backend Changes**: API endpoints, models, logic
- **Frontend Changes**: UI components, pages
- **Complexity**: Small/Medium/Large
- **Dependencies**: What must exist first

## Deliverables

### Daily: Gap Analysis Report
**Location**: `analysis/GAP_ANALYSIS_YYYY-MM-DD.md`

**Format**:
````markdown
# Zoho CRM Gap Analysis - [Date]

## New Features Identified
1. **[Feature Name]**
   - Zoho capability: [description]
   - Zazmic status: Missing/Partial/Complete
   - **Schema Impact**: [tables/columns needed or "none"]
   - Priority: High/Medium/Low
   - Complexity: Small/Medium/Large

## Schema Gaps Identified
- Missing table: [table_name] for [purpose]
- Missing column: [table].[column] for [feature]
- Missing relationship: [table1] -> [table2]

## Implementation Briefs Required
- [ ] [Feature 1] (Schema changes: Yes/No)
- [ ] [Feature 2] (Schema changes: Yes/No)
````

### Weekly: Implementation Brief
**Location**: `briefs/[FEATURE]_BRIEF.md`

**Format**:
````markdown
# Feature: [Name]

## Business Value
[Why this matters]

## User Story
As a [role], I want [capability] so that [benefit].

## Database Schema Changes

### New Tables (if any)
```sql
CREATE TABLE example (
    id INTEGER PRIMARY KEY,
    ...
);
```

### New Columns (if any)
```sql
ALTER TABLE leads ADD COLUMN example VARCHAR(255);
```

### New Relationships
- leads.company_id -> companies.id (many-to-one)

### Migration Complexity
- Risk: Low/Medium/High
- Estimated downtime: [time or "zero-downtime"]

## Backend Changes
- Models: [list SQLAlchemy models to create/modify]
- API endpoints: [list new routes]
- Business logic: [describe]

## Frontend Changes
- Components: [list]
- Pages: [list]

## Acceptance Criteria
- [ ] Database schema updated
- [ ] Migration tested on dev database
- [ ] Backend API functional
- [ ] Frontend UI complete
- [ ] Tests pass (80%+ coverage)

## Dependencies
- Must have: [existing features/tables]
- Nice to have: [optional features]

## Estimated Effort
- Database: X hours
- Backend: Y hours
- Frontend: Z hours
- Testing: W hours
- Total: N hours
````

## Research Sources
- Zoho CRM documentation: https://www.zoho.com/crm/help/
- Zoho CRM features page
- Competitor reviews
- Industry reports
- **OUR DATABASE SCHEMA**: Check before every brief!

## Daily Workflow
````
1. Research Zoho updates
2. CHECK CURRENT SCHEMA (crm-backend/app/models/)
3. Identify gaps (features AND schema)
4. Create gap analysis
5. Prioritize by business value + implementation complexity
6. Create implementation briefs for top 3
7. Include detailed schema changes in each brief
````

## Self-Learning Protocol
1. Effective brief created? → Add template to ../PATTERNS.md
2. Scope estimation was off? → Log in ../MISTAKES.md
3. Prioritization framework changed? → Update ../DECISIONS.md
4. **Schema migration went wrong?** → CRITICAL: Log in ../MISTAKES.md

## Schema Analysis Best Practices

### Before recommending ANY feature, answer:
1. What tables does this need?
2. Do we have those tables?
3. What columns does this need?
4. Do we have those columns?
5. What relationships are required?
6. Do those relationships exist?
7. Can this be done with current schema? (Yes/No)

### If schema changes needed:
- Mark brief as "Requires Schema Migration"
- Estimate migration complexity
- Flag any data migration needs
- Note potential risks

## Links to Schema
- Current models: `../crm-backend/app/models/`
- Migrations: `../crm-backend/alembic/versions/`
- Database agent: `../database/CLAUDE.md`
