#!/bin/bash
# stop-crm.sh — Stops the Zazmic CRM backend and frontend

LOG_DIR="/Users/zazmicinc/Projects/crm-project/scripts/logs"

stop_process() {
    local name="$1"
    local pidfile="$LOG_DIR/$name.pid"
    if [ -f "$pidfile" ]; then
        local pid
        pid=$(cat "$pidfile")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            echo "Stopped $name (PID $pid)"
        else
            echo "$name (PID $pid) is not running"
        fi
        rm -f "$pidfile"
    else
        echo "No PID file for $name"
    fi
}

stop_process "backend"
stop_process "frontend"

echo "[$(date)] CRM stopped" >> "$LOG_DIR/startup.log"
