# Error Report — 2026-03-08
## Zazmic CRM — Pre-existing Issues (not introduced by P1 work)

All errors below existed before the P1 feature sprint. None were introduced by the P1 changes.

---

## Frontend — ESLint (11 errors, 5 warnings)

### Errors

| # | File | Line | Rule | Description |
|---|------|------|------|-------------|
| 1 | `src/components/ContactForm.jsx` | 15 | `react-hooks/set-state-in-effect` | `setForm()` called synchronously inside `useEffect` — can cause cascading renders |
| 2 | `src/components/DealForm.jsx` | 35 | `react-hooks/set-state-in-effect` | `setForm()` called synchronously inside `useEffect` — can cause cascading renders |
| 3 | `src/components/Layout.jsx` | 5 | `no-unused-vars` | `motion` imported from `framer-motion` but never used |
| 4 | `src/components/Timeline.jsx` | 188 | `no-undef` | `leadsApi` used but not imported |
| 5 | `src/components/Timeline.jsx` | 190 | `no-undef` | `accountsApi` used but not imported |
| 6 | `src/context/AuthContext.jsx` | 25 | `react-hooks/set-state-in-effect` | `initAuth()` (which calls setState) invoked synchronously inside `useEffect` |
| 7 | `src/context/AuthContext.jsx` | 46 | `no-unused-vars` | `e` (catch variable) declared but never used |
| 8 | `src/context/AuthContext.jsx` | 77 | `react-refresh/only-export-components` | File exports both components and non-component values — breaks Fast Refresh |
| 9 | `src/pages/LoginPage.jsx` | 26 | `no-unused-vars` | `err` declared but never used in catch block |
| 10 | `src/pages/LoginPage.jsx` | 39 | `no-unused-vars` | `err` declared but never used in catch block |
| 11 | `src/pages/OAuthCallbackPage.jsx` | 1 | `no-unused-vars` | `useState` imported but never used |

### Warnings

| # | File | Line | Rule | Description |
|---|------|------|------|-------------|
| 1 | `src/components/Timeline.jsx` | 204 | `react-hooks/exhaustive-deps` | `useEffect` missing `fetchTimeline` in dependency array |
| 2 | `src/pages/AccountDetailPage.jsx` | 36 | `react-hooks/exhaustive-deps` | `useEffect` missing `fetchData` in dependency array |
| 3 | `src/pages/ContactDetailPage.jsx` | 36 | `react-hooks/exhaustive-deps` | `useEffect` missing `fetchData` in dependency array |
| 4 | `src/pages/DealDetailPage.jsx` | 56 | `react-hooks/exhaustive-deps` | `useEffect` missing `fetchData` in dependency array |
| 5 | `src/pages/DealDetailPage.jsx` | 61 | `react-hooks/exhaustive-deps` | `useEffect` missing `fetchContacts` and `fetchLineItems` in dependency array |

---

## Backend — Pytest (1 failure, 80 passed)

| # | Test | File | Description |
|---|------|------|-------------|
| 1 | `test_login_failure` | `tests/test_auth.py:21` | Asserts `POST /api/auth/login` with wrong password returns `401`, but gets `200`. The login endpoint appears to accept any password in the test environment (likely the test database seeds a user whose password hash matches, or the test client bypasses auth). |

---

## Summary

| Category | Errors | Warnings |
|----------|--------|---------|
| Frontend ESLint | 11 | 5 |
| Backend Pytest | 1 | 0 |
| **Total** | **12** | **5** |

### Severity assessment

- **Critical (runtime breakage)**: `Timeline.jsx` lines 188/190 — `leadsApi` and `accountsApi` are referenced but not imported. This will cause a `ReferenceError` at runtime when the timeline tries to render lead or account-linked activities.
- **Medium (behavior bug)**: `test_login_failure` — wrong passwords are accepted in the test environment. May indicate a real auth bypass risk depending on how the test DB is configured.
- **Low (code quality)**: All `set-state-in-effect`, `no-unused-vars`, `react-refresh`, and `exhaustive-deps` issues — functional but not best practice.

### Recommended fixes (priority order)

1. **`Timeline.jsx`** — Add missing imports: `import { leadsApi, accountsApi } from '../api';`
2. **`test_auth.py`** — Investigate why wrong password returns 200 in test environment; fix the test fixture or the auth logic
3. **`ContactForm.jsx` / `DealForm.jsx`** — Replace `useEffect` + `setState` pattern with direct `useState` initializer using a `key` prop instead
4. **`AuthContext.jsx`** — Move `useContext` and `useAuth` export to a separate file to satisfy `react-refresh/only-export-components`
5. **Remaining `no-unused-vars`** — Remove unused imports/variables in `Layout.jsx`, `LoginPage.jsx`, `OAuthCallbackPage.jsx`, `AuthContext.jsx`
6. **`exhaustive-deps` warnings** — Wrap `fetchData` functions in `useCallback` (already done in some pages) and add them to dependency arrays
