"""P1 field enhancements migration — adds new columns to existing SQLite DB."""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "crm.db")


def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    cols = [row[1] for row in cursor.fetchall()]
    return column in cols


def run():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # ── Leads ──────────────────────────────────────────────────────────────────
    lead_cols = [
        ("lead_score", "INTEGER DEFAULT 0"),
        ("job_title",  "TEXT"),
        ("industry",   "TEXT"),
        ("company_size", "TEXT"),
    ]
    for col, typedef in lead_cols:
        if not column_exists(cur, "leads", col):
            cur.execute(f"ALTER TABLE leads ADD COLUMN {col} {typedef}")
            print(f"  + leads.{col}")
        else:
            print(f"  ~ leads.{col} already exists")

    # ── Accounts ───────────────────────────────────────────────────────────────
    account_cols = [
        ("account_type",   "TEXT DEFAULT 'Prospect'"),
        ("annual_revenue", "REAL"),
        ("employee_count", "INTEGER"),
    ]
    for col, typedef in account_cols:
        if not column_exists(cur, "accounts", col):
            cur.execute(f"ALTER TABLE accounts ADD COLUMN {col} {typedef}")
            print(f"  + accounts.{col}")
        else:
            print(f"  ~ accounts.{col} already exists")

    # ── Activities ─────────────────────────────────────────────────────────────
    activity_cols = [
        ("outcome",        "TEXT"),
        ("is_task",        "INTEGER NOT NULL DEFAULT 0"),
        ("due_date",       "TEXT"),
        ("completed_at",   "TEXT"),
        ("assigned_to_id", "INTEGER"),
    ]
    for col, typedef in activity_cols:
        if not column_exists(cur, "activities", col):
            cur.execute(f"ALTER TABLE activities ADD COLUMN {col} {typedef}")
            print(f"  + activities.{col}")
        else:
            print(f"  ~ activities.{col} already exists")

    conn.commit()
    conn.close()
    print("\nMigration complete.")


if __name__ == "__main__":
    run()
