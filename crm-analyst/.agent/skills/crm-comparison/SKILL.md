# CRM Feature Comparison Analyst

## Description
Compares Zazmic CRM features against Zoho CRM and generates
a gap analysis report as a Markdown artifact.

## Trigger
When asked to run a CRM comparison, feature analysis, gap report,
or daily analysis.

## Instructions
1. Browse Zoho CRM documentation at https://www.zoho.com/crm/help/
   and catalog features across these categories:
   - Contacts & Leads Management
   - Deals & Pipeline
   - Activities & Tasks
   - Automation & Workflows
   - Reporting & Analytics
   - Email Integration
   - Customization & Settings
   - Mobile Access
   - Integrations (third-party)
   - Security & Permissions

2. Review the Zazmic CRM codebase in sibling directories:
   - ../crm-backend/ for API endpoints and backend logic
   - ../crm-frontend/ for UI features and pages
   - ../crm-database/ for data models and schema

3. Generate a Markdown report saved to reports/ directory
   with filename: gap-analysis-YYYY-MM-DD.md

4. Report must include these sections:
   - Executive Summary (2-3 sentences)
   - Feature Parity (what we already have)
   - Missing Features table (feature, category, priority, effort, description)
   - Quick Wins (high priority + low effort)
   - Summary Stats (total compared, match %, gap %)
   - Recommendations

5. After generating, present missing features as a numbered list
   and ask: "Which features would you like to build next?"

## Priority Criteria
- High: Core CRM functionality most users expect
- Medium: Competitive differentiator but not essential
- Low: Nice-to-have or niche feature

## Effort Criteria
- Small: 1-2 days, single agent can handle
- Medium: 3-5 days, may need backend + frontend
- Large: 1-2 weeks, significant architecture changes
