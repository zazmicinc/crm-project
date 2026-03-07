# Deals / Opportunities Enhancements — Feature Plan

**Branch:** `feature/deals-enhancements`
**Date:** 2026-03-07
**Status:** Planning

---

## Overview

Zazmic CRM's Deals module is missing several fields and capabilities that are standard in Zoho CRM and expected by sales teams. This plan covers five targeted enhancements to bring Deals up to competitive parity.

---

## Features

### 3.1 Close Date / Expected Close Date

**What:** Add a required `close_date` field on deals so reps can track when a deal is expected to close.

**Backend changes:**
- Add `close_date` (DateTime, nullable) column to `deals` table
- Add Alembic migration
- Expose in `DealCreate`, `DealUpdate`, `DealResponse` schemas
- Include in deal list/filter endpoints (filter by close date range)

**Frontend changes:**
- Add date picker field to Create Deal and Edit Deal forms
- Display close date in deal cards on Kanban board
- Add close date column to deal list view
- Add "Closing This Month / This Quarter" filter

---

### 3.2 Deal Probability Override

**What:** Allow reps to manually override the stage-default probability on individual deals.

**Backend changes:**
- Add `probability_override` (Integer, nullable, 0–100) column to `deals` table
- Add Alembic migration
- Update schemas
- Logic: use `probability_override` if set, else fall back to stage probability

**Frontend changes:**
- Add probability input (0–100%) on deal detail page
- Show effective probability on deal card
- Use effective probability in pipeline value calculations

---

### 3.3 Deal Loss Reason

**What:** When a deal is moved to `closed_lost`, capture a structured reason.

**Backend changes:**
- Add `loss_reason` (String 255, nullable) column to `deals` table
- Add `loss_reason_note` (Text, nullable) for free-form detail
- Add Alembic migration
- Update schemas
- Validate: `loss_reason` required when `stage = closed_lost`

**Frontend changes:**
- Trigger a modal when user moves deal to Closed Lost stage
- Dropdown of predefined loss reasons (e.g. Price, Competitor, No Budget, No Decision, Timing)
- Optional free-text note field
- Display loss reason on deal detail page

---

### 3.4 Multiple Contacts Per Deal

**What:** Associate more than one contact with a deal (e.g. champion + decision maker).

**Backend changes:**
- Create new `deal_contacts` association table (deal_id, contact_id, role)
- `role` field: optional label (e.g. "Decision Maker", "Champion", "Influencer")
- Add Alembic migration
- Keep existing `contact_id` as primary contact for backwards compatibility
- Add `/api/deals/{id}/contacts` sub-resource (GET, POST, DELETE)
- Update `DealResponse` to include `contacts` list

**Frontend changes:**
- Add "Related Contacts" section on deal detail page
- Inline search to add existing contacts
- Show contact role badge
- Primary contact still shown prominently

---

### 3.5 Products / Line Items on Deals

**What:** Allow reps to attach products with quantities and prices to a deal, auto-calculating deal value.

**Backend changes:**
- Create `Product` model: id, name, description, unit_price, currency, is_active
- Create `DealLineItem` model: deal_id, product_id, quantity, unit_price_override, discount_pct
- Add Alembic migrations for both tables
- Add `/api/products` CRUD endpoints
- Add `/api/deals/{id}/line-items` sub-resource (GET, POST, PUT, DELETE)
- Compute `deal.value` from sum of line items when line items exist

**Frontend changes:**
- New Products admin page (CRUD)
- Line items table on deal detail page (add product, set quantity, override price, set discount)
- Auto-update deal value from line items total
- Display per-line subtotal and grand total

---

## Implementation Order

| Step | Feature | Effort |
|------|---------|--------|
| 1 | 3.1 Close Date | Small (1–2 days) |
| 2 | 3.3 Loss Reason | Small (1–2 days) |
| 3 | 3.2 Probability Override | Small (1 day) |
| 4 | 3.4 Multiple Contacts | Medium (3–4 days) |
| 5 | 3.5 Products / Line Items | Large (5–7 days) |

---

## Acceptance Criteria

- [ ] All new fields appear in Swagger docs (`/api/docs`)
- [ ] Alembic migrations apply cleanly on fresh DB and existing DB
- [ ] Backend tests cover new fields, validation rules, and sub-resources
- [ ] Loss reason modal fires when and only when moving to `closed_lost`
- [ ] Deal value auto-updates when line items are added/edited
- [ ] No regression on existing deal CRUD or Kanban board
- [ ] ESLint passes on all frontend changes

---

## Out of Scope (This Branch)

- Quotes and invoicing (separate feature)
- Deal approval workflows
- Deal cloning
