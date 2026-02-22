#!/bin/bash
# start-crm.sh — Starts Zazmic CRM backend and frontend
# Used by the macOS Launch Agent for auto-start on login.

set -e

PROJECT_DIR="/Users/zazmicinc/Projects/crm-project"
LOG_DIR="$PROJECT_DIR/scripts/logs"
mkdir -p "$LOG_DIR"

# Load nvm so `npm` is available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Load pyenv so the correct Python is available
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/shims:$PATH"

# ── Backend ──────────────────────────────────────────────────
echo "[$(date)] Starting backend..." >> "$LOG_DIR/backend.log"
cd "$PROJECT_DIR/crm-backend"
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 >> "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > "$LOG_DIR/backend.pid"

# ── Frontend ─────────────────────────────────────────────────
echo "[$(date)] Starting frontend..." >> "$LOG_DIR/frontend.log"
cd "$PROJECT_DIR/crm-frontend"
npm run dev >> "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > "$LOG_DIR/frontend.pid"

echo "[$(date)] CRM started — backend PID=$BACKEND_PID, frontend PID=$FRONTEND_PID" >> "$LOG_DIR/startup.log"

# Wait for both processes so launchd keeps the agent alive
wait
