# Feature Handoff Generator

## Description
Generates ready-to-use implementation briefs for the backend and frontend
agents when the user selects features to build.

## Trigger
When the user selects features to build from a gap analysis report.

## Instructions
For each selected feature, generate three Markdown files in handoffs/:

### 1. handoffs/[feature-name]-backend.md
Contents:
- Feature summary (1 paragraph)
- API endpoints needed (method, path, request body, response, status codes)
- Database model changes (new tables, new columns, migrations)
- Business logic description
- Edge cases to handle
- Test cases to write (list specific scenarios)
- Ready-to-paste prompt for the backend agent at the bottom

### 2. handoffs/[feature-name]-frontend.md
Contents:
- Feature summary (1 paragraph)
- UI components to create or modify
- Pages/routes to add or modify
- API calls to integrate (reference the backend endpoints)
- User flow (step by step what the user does)
- Empty/loading/error states to handle
- Ready-to-paste prompt for the frontend agent at the bottom

### 3. handoffs/[feature-name]-overview.md
Contents:
- Feature name and description
- Why this feature matters (business value)
- Acceptance criteria (checkboxes)
- Dependencies on existing code
- Estimated effort
- Risk factors

## File Naming
Use kebab-case: email-templates, role-based-permissions, lead-scoring

## Prompt Format
Each backend/frontend file must end with a section:
```
## Agent Prompt (copy and paste this to the agent)
> [ready-to-use prompt that includes all context needed]
```
This lets the user copy the prompt directly into the other agent's conversation.
