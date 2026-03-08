# Implementation Brief: Fix Auth Test Failure
**Target Agent**: Backend Agent
**Branch**: `fix/auth-test-2026-03-08`
**Source**: `product/analysis/ERROR_REPORT_2026-03-08.md`
**Priority**: High — potential auth bypass risk

---

## Overview
One pytest failure: `test_login_failure` in `tests/test_auth.py:21` expects `POST /api/auth/login` with a wrong password to return `401`, but it returns `200`. This means the test environment is accepting any password — which may indicate a real auth bypass depending on how the test database is configured.

---

## The Failing Test

**File**: `tests/test_auth.py` line 21
**Test**: `test_login_failure`
**Expected**: `401 Unauthorized`
**Actual**: `200 OK`

---

## Investigation Steps (do these first)

1. **Check the test fixture** — look at how the test user is created in the test DB. The hashed password stored may not match what the login endpoint verifies against.

2. **Check the login endpoint** (`app/routers/auth.py` or `app/services/auth.py`) — verify it's actually calling `pwd_context.verify(plain_password, hashed_password)` and not accidentally returning success on any input.

3. **Check if test DB uses a different user fixture** — the test may be creating a user with a plaintext password instead of a bcrypt hash, causing `verify()` to always return `True` or skip verification entirely.

---

## Likely Fix

The most common cause is the test fixture storing a plaintext password instead of a hashed one:

```python
# ❌ Wrong — stores plaintext, verify() will fail or behave unexpectedly
test_user = User(email="test@test.com", hashed_password="password123")

# ✅ Correct — hash it the same way the real app does
from app.auth.utils import get_password_hash
test_user = User(email="test@test.com", hashed_password=get_password_hash("password123"))
```

---

## Acceptance Criteria
- [ ] `pytest tests/test_auth.py` passes all tests including `test_login_failure`
- [ ] `POST /api/auth/login` with wrong password returns `401`
- [ ] `POST /api/auth/login` with correct password still returns `200` with a valid JWT
- [ ] All 80 previously passing tests still pass
- [ ] If a real auth bypass is found in the login logic (not just the test fixture), fix that too and document it

---

## Files to Modify
| File | Changes |
|------|---------|
| `tests/test_auth.py` | Fix test fixture — ensure password is properly hashed |
| `app/routers/auth.py` or `app/services/auth.py` | Fix only if a real auth bypass is found |

## What NOT to Do
- Do not change the login endpoint behavior unless a real bypass is confirmed
- Do not skip or comment out the failing test
- Do not modify frontend files
- Do not merge to `main` — open a PR
