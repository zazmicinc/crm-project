# Zazmic CRM - Multi-Agent Project

A simple CRM system built using Google Antigravity's multi-agent architecture.

## Agent Team

| Agent | Workspace | Role |
|-------|-----------|------|
| Agent 1 | `crm-backend/` | FastAPI REST API |
| Agent 2 | `crm-frontend/` | React TypeScript UI |
| Agent 3 | `crm-database/` | Schema, migrations, seeds |
| Agent 5 | `crm-analyst/` | Zoho CRM gap analysis & feature planning |

## Getting Started

1. Open Google Antigravity
2. In Agent Manager, add each subfolder as a workspace
3. Open `docs/agent-prompts.md` for the prompts to use
4. Start conversations in Plan mode for each workspace
5. Review implementation plans, then let agents build

## Daily Workflow

1. Open the `crm-analyst` agent conversation
2. Type: "Run today's gap analysis"
3. Review the report in `crm-analyst/reports/`
4. Select features to build
5. Copy handoff prompts to backend/frontend agents
6. Review and merge the code

## Project Structure

```
crm-project/
├── crm-backend/          → Agent 1: FastAPI API
│   └── .agent/skills/
├── crm-frontend/         → Agent 2: React UI
│   └── .agent/skills/
├── crm-database/         → Agent 3: DB layer
│   └── .agent/skills/
├── crm-analyst/          → Agent 5: Product analysis
│   ├── .agent/skills/
│   ├── reports/          → Daily gap analysis reports
│   └── handoffs/         → Implementation briefs
├── docs/
│   └── agent-prompts.md  → All agent prompts
└── README.md
```
