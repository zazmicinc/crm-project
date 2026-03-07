#!/bin/bash

# Zazmic CRM - Code Factory Setup Script
# Deploys all CLAUDE.md files and self-learning documentation

set -e  # Exit on error

echo "🚀 Zazmic CRM Code Factory Setup"
echo "=================================="
echo ""

# Configuration
PROJECT_ROOT="/Users/zazmicinc/Projects/crm-project"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_info() {
    echo -e "${YELLOW}→${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if [ ! -d "$PROJECT_ROOT" ]; then
        log_error "Project directory not found: $PROJECT_ROOT"
        exit 1
    fi
    
    if ! command -v claude &> /dev/null; then
        log_error "Claude Code not installed. Run: curl -fsSL https://claude.ai/install.sh | bash"
        exit 1
    fi
    
    log_success "Prerequisites checked"
}

# Create self-learning documentation
create_self_learning_docs() {
    log_info "Creating self-learning documentation..."
    
    cd "$PROJECT_ROOT"
    
    # PATTERNS.md
    cat > PATTERNS.md << 'EOF'
# Zazmic CRM - Reusable Patterns

> **Agents**: Update this file when you discover or use a pattern that works well.

---

## REFERENCE PATTERNS (Curated)

### Backend: Database Connection Handling

**Problem**: SQLite requires `check_same_thread=False`, PostgreSQL doesn't support it.

**Solution**:
```python
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
```

**Why**: Prevents production deployment failures.

---

## LEARNING LOG (Auto-Updated by Agents)

*Agents will add entries here as they work*

---
EOF

    # MISTAKES.md
    cat > MISTAKES.md << 'EOF'
# Zazmic CRM - Mistakes & Fixes

> **Agents**: Log every error you encounter and how you fixed it.

---

## REFERENCE MISTAKES (Known Issues)

### Backend: PostgreSQL Password Special Characters

**Fix**: Always use single quotes or URL-encode passwords in shell commands.

---

## LEARNING LOG (Auto-Updated by Agents)

*Agents will add entries here as they encounter errors*

---
EOF

    # DECISIONS.md
    cat > DECISIONS.md << 'EOF'
# Zazmic CRM - Architecture Decision Records

> **Agents**: Document major architectural decisions here.

---

## REFERENCE DECISIONS

### ADR-001: Database Strategy - Dual-Mode Support

**Date**: 2026-02-15  
**Decision**: Use SQLAlchemy with SQLite (local) and PostgreSQL (production)

**Consequences**:
✅ Fast local development  
✅ Production-grade reliability  
❌ Must test migrations on both databases  

---

## LEARNING LOG (Auto-Updated by Agents)

*Agents will add new ADRs here*

---
EOF

    log_success "Self-learning documentation created"
}

# Create CLAUDE.md for Backend Agent
create_backend_claude_md() {
    log_info "Creating Backend Agent CLAUDE.md..."
    
    cat > "$PROJECT_ROOT/crm-backend/CLAUDE.md" << 'EOF'
# Zazmic CRM - Backend Agent

## Role
FastAPI backend development for Zazmic CRM.

## Tech Stack
- Framework: FastAPI 0.104+
- Database: SQLAlchemy (SQLite local, PostgreSQL prod)
- Auth: JWT tokens, Google OAuth
- Deployment: Google Cloud Run

## Critical Rules

### Database Configuration
```python
# ALWAYS use conditional connect_args
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}
```

**NEVER apply check_same_thread to PostgreSQL**.

## Self-Learning Protocol
After each task:
1. Success? → Add pattern to ../PATTERNS.md
2. Error? → Log in ../MISTAKES.md
3. Decision? → Document in ../DECISIONS.md

## Links
- Design system: ../crm-frontend/docs/DESIGN_SYSTEM.md
- Deployment: ../DEPLOYMENT_GUIDE.md
- Git workflow: ../GIT_WORKFLOW_REFERENCE.md
EOF

    log_success "Backend CLAUDE.md created"
}

# Create CLAUDE.md for Frontend Agent
create_frontend_claude_md() {
    log_info "Creating Frontend Agent CLAUDE.md..."
    
    cat > "$PROJECT_ROOT/crm-frontend/CLAUDE.md" << 'EOF'
# Zazmic CRM - Frontend Agent

## Role
React TypeScript UI development. Apple.com-inspired aesthetic.

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6

## Design System
**Colors**: Black (#000), Red (#FF0000), White (#FFF)
**Spacing**: 8px grid system
**Components**: Functional components only

## Self-Learning Protocol
1. New pattern? → ../PATTERNS.md
2. Bug fixed? → ../MISTAKES.md
3. Design decision? → ../DECISIONS.md

## Links
- Design system: docs/DESIGN_SYSTEM.md
- Backend API: ../crm-backend/
EOF

    log_success "Frontend CLAUDE.md created"
}

# Create CLAUDE.md for Database Agent
create_database_claude_md() {
    log_info "Creating Database Agent CLAUDE.md..."
    
    mkdir -p "$PROJECT_ROOT/database"
    
    cat > "$PROJECT_ROOT/database/CLAUDE.md" << 'EOF'
# Zazmic CRM - Database Agent

## Role
PostgreSQL schema design, SQLAlchemy models, query optimization.

## Tech Stack
- Local: SQLite
- Production: PostgreSQL 15 (Cloud SQL)
- ORM: SQLAlchemy 2.0
- Migrations: Alembic

## Schema Conventions
- snake_case naming
- Foreign keys always indexed
- Timestamps: created_at, updated_at

## Self-Learning Protocol
1. Optimized query? → ../PATTERNS.md
2. Migration issue? → ../MISTAKES.md
3. Schema decision? → ../DECISIONS.md
EOF

    log_success "Database CLAUDE.md created"
}

# Create CLAUDE.md for Testing Agent
create_testing_claude_md() {
    log_info "Creating Testing Agent CLAUDE.md..."
    
    cat > "$PROJECT_ROOT/tests/CLAUDE.md" << 'EOF'
# Zazmic CRM - Integration & QA Agent

## Role
End-to-end testing, API testing, quality assurance.

## Tech Stack
- Backend: pytest, pytest-asyncio
- Frontend: Jest, React Testing Library
- E2E: Playwright
- Coverage: 80% minimum

## Testing Strategy
- 70% Unit tests
- 20% Integration tests
- 10% E2E tests

## Self-Learning Protocol
1. Found bug? → ../MISTAKES.md with test
2. New test pattern? → ../PATTERNS.md
3. Quality threshold changed? → ../DECISIONS.md
EOF

    log_success "Testing CLAUDE.md created"
}

# Create CLAUDE.md for Product Analyst
create_product_claude_md() {
    log_info "Creating Product Analyst CLAUDE.md..."
    
    mkdir -p "$PROJECT_ROOT/product/analysis"
    mkdir -p "$PROJECT_ROOT/product/briefs"
    
    cat > "$PROJECT_ROOT/product/CLAUDE.md" << 'EOF'
# Zazmic CRM - Product Analyst Agent

## Role
Daily competitive analysis vs Zoho CRM. Create implementation briefs.

## Deliverables
- Daily: analysis/GAP_ANALYSIS_YYYY-MM-DD.md
- Weekly: briefs/[FEATURE]_BRIEF.md

## Research Sources
- Zoho CRM documentation
- Competitor reviews
- Industry reports

## Self-Learning Protocol
1. Effective brief? → ../PATTERNS.md
2. Scope estimation off? → ../MISTAKES.md
3. Prioritization changed? → ../DECISIONS.md
EOF

    log_success "Product Analyst CLAUDE.md created"
}

# Create CLAUDE.md for Git Management
create_git_claude_md() {
    log_info "Creating Git Management CLAUDE.md..."
    
    mkdir -p "$PROJECT_ROOT/.git-workflows"
    
    cat > "$PROJECT_ROOT/.git-workflows/CLAUDE.md" << 'EOF'
# Zazmic CRM - Git Management Agent

## Role
Automate Git workflows, enforce branching strategy.

## Branch Naming
- feature/[description]
- fix/[description]
- refactor/[description]

## Commit Convention
type(scope): description

Types: feat, fix, refactor, test, docs, chore

## Self-Learning Protocol
1. Git issue resolved? → ../MISTAKES.md
2. New workflow pattern? → ../PATTERNS.md
3. Branching strategy changed? → ../DECISIONS.md
EOF

    log_success "Git Management CLAUDE.md created"
}

# Create CLAUDE.md for DevOps
create_devops_claude_md() {
    log_info "Creating DevOps Agent CLAUDE.md..."
    
    mkdir -p "$PROJECT_ROOT/infrastructure"
    
    cat > "$PROJECT_ROOT/infrastructure/CLAUDE.md" << 'EOF'
# Zazmic CRM - DevOps Agent

## Role
Cloud infrastructure, deployment, production operations.

## Infrastructure
- Compute: Cloud Run
- Database: Cloud SQL (PostgreSQL)
- Secrets: Secret Manager
- IaC: Terraform

## Deployment
**Manual only via deploy.sh**

## Critical Rules
- Never mix secret references and literals in env vars
- Use shell variable expansion for PORT in Dockerfile
- Always test deployment changes locally first

## Self-Learning Protocol
1. Deployment issue? → ../MISTAKES.md
2. New IaC pattern? → ../PATTERNS.md
3. Architecture decision? → ../DECISIONS.md
EOF

    log_success "DevOps CLAUDE.md created"
}

# Create .claudeignore
create_claudeignore() {
    log_info "Creating .claudeignore files..."
    
    cat > "$PROJECT_ROOT/.claudeignore" << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/
env/

# Build outputs
dist/
build/
*.egg-info/

# Logs
*.log
logs/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Database
*.db
*.sqlite
*.sqlite3

# Git
.git/
EOF

    log_success ".claudeignore created"
}

# Commit to Git
commit_to_git() {
    log_info "Committing to Git..."
    
    cd "$PROJECT_ROOT"
    
    git add \
        PATTERNS.md \
        MISTAKES.md \
        DECISIONS.md \
        crm-backend/CLAUDE.md \
        crm-frontend/CLAUDE.md \
        database/CLAUDE.md \
        tests/CLAUDE.md \
        product/CLAUDE.md \
        .git-workflows/CLAUDE.md \
        infrastructure/CLAUDE.md \
        .claudeignore 2>/dev/null || true
    
    if git diff --cached --quiet; then
        log_info "No changes to commit (files may already exist)"
    else
        git commit -m "feat: add Claude Code workspace configurations

- Add CLAUDE.md for each of 7 agent workspaces
- Add self-learning documentation (PATTERNS, MISTAKES, DECISIONS)
- Add .claudeignore for better context management
- Enable code factory automation"
        
        log_success "Changes committed to Git"
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "=================================="
    echo "✅ Setup Complete!"
    echo "=================================="
    echo ""
    echo "Next Steps:"
    echo ""
    echo "1. Test in one workspace:"
    echo "   cd /Users/zazmicinc/Projects/crm-project/crm-backend"
    echo "   claude"
    echo ""
    echo "2. Try a test task:"
    echo "   > What is my role?"
    echo "   > Analyze the current codebase structure"
    echo ""
    echo "3. Test self-learning:"
    echo "   > Add a pagination pattern to PATTERNS.md"
    echo ""
    echo "4. Review generated files:"
    echo "   cat /Users/zazmicinc/Projects/crm-project/PATTERNS.md"
    echo ""
    echo "5. Configure MCP servers (optional):"
    echo "   claude mcp add github --scope user"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    create_self_learning_docs
    create_backend_claude_md
    create_frontend_claude_md
    create_database_claude_md
    create_testing_claude_md
    create_product_claude_md
    create_git_claude_md
    create_devops_claude_md
    create_claudeignore
    commit_to_git
    show_next_steps
}

# Run main function
main
