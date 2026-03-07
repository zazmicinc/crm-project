# Zazmic CRM - Reusable Patterns

## REFERENCE PATTERNS

### Backend: Database Connection
```python
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}
```

## LEARNING LOG
*Agents add entries here*
