# Implementation Brief: Fix ESLint Errors & Warnings
**Target Agent**: Frontend Agent
**Branch**: `fix/eslint-errors-2026-03-08`
**Source**: `product/analysis/ERROR_REPORT_2026-03-08.md`
**Priority**: High — 2 issues are runtime-breaking

---

## Overview
Fix 11 ESLint errors and 5 warnings in the frontend. These pre-existed before the P1 sprint. Two of them (`Timeline.jsx` lines 188/190) will cause a `ReferenceError` at runtime and must be fixed first.

---

## Fixes — In Priority Order

### 🔴 CRITICAL — Fix first (runtime crash)

**1. `src/components/Timeline.jsx` — Missing imports (lines 188, 190)**
`leadsApi` and `accountsApi` are used but never imported. This crashes at runtime.
```js
// Add to imports at top of file:
import { leadsApi, accountsApi } from '../api';
```

---

### 🟡 MEDIUM — Fix second

**2. `src/context/AuthContext.jsx` line 25 — setState in useEffect**
`initAuth()` calls setState synchronously inside `useEffect`. Wrap in a proper async pattern:
```js
// Replace synchronous call:
useEffect(() => {
  initAuth(); // ❌
}, []);

// With:
useEffect(() => {
  const run = async () => await initAuth();
  run();
}, []);
```

**3. `src/components/ContactForm.jsx` line 15 — setState in useEffect**
Same pattern. Replace the synchronous `setForm()` call inside `useEffect` with either:
- An async wrapper, or
- Move the initial value directly into `useState(initialValue)` and use a `key` prop on the component to reset it

**4. `src/components/DealForm.jsx` line 35 — setState in useEffect**
Same fix as ContactForm above.

**5. `src/context/AuthContext.jsx` line 77 — react-refresh/only-export-components**
File exports both components and non-component values (e.g. `useAuth`). Move the `useAuth` hook and any non-component exports to a separate file:
```
src/context/AuthContext.jsx     ← keep only the Provider component
src/context/useAuth.js          ← move useAuth hook here
```
Update all imports across the codebase accordingly.

---

### 🟢 LOW — Fix last (code quality)

**6. `src/context/AuthContext.jsx` line 46 — unused `e` in catch**
```js
} catch (e) {  // ❌
} catch {      // ✅ omit if unused, or use _e
```

**7. `src/pages/LoginPage.jsx` lines 26, 39 — unused `err` in catch**
Same fix — replace `err` with `_err` or omit entirely if not used.

**8. `src/pages/OAuthCallbackPage.jsx` line 1 — unused `useState` import**
Remove `useState` from the import if it's not used in this file.

**9. `src/components/Layout.jsx` line 5 — unused `motion` import**
Remove `motion` from the `framer-motion` import.

---

### Warnings — Fix after errors

**10. `src/components/Timeline.jsx` line 204 — missing `fetchTimeline` in useEffect deps**
```js
useEffect(() => {
  fetchTimeline();
}, [fetchTimeline]); // add fetchTimeline
```
Wrap `fetchTimeline` in `useCallback` if needed to avoid infinite loops.

**11. `src/pages/AccountDetailPage.jsx` line 36 — missing `fetchData` in deps**
```js
useEffect(() => {
  fetchData();
}, [fetchData]); // add fetchData
```

**12. `src/pages/ContactDetailPage.jsx` line 36 — same as above**

**13. `src/pages/DealDetailPage.jsx` lines 56, 61 — missing deps**
```js
// line 56:
useEffect(() => { fetchData(); }, [fetchData]);

// line 61:
useEffect(() => {
  fetchContacts();
  fetchLineItems();
}, [fetchContacts, fetchLineItems]);
```
Wrap each fetch function in `useCallback` to stabilize the reference.

---

## Acceptance Criteria
- [ ] `npm run lint` returns 0 errors
- [ ] `npm run lint` returns 0 warnings
- [ ] Timeline renders without ReferenceError in browser console
- [ ] Auth flow still works after AuthContext refactor
- [ ] No regressions on Login, OAuth, Contact, Deal, Account, Deal detail pages

---

## Files to Modify
| File | Changes |
|------|---------|
| `src/components/Timeline.jsx` | Add missing imports, fix useEffect deps |
| `src/components/ContactForm.jsx` | Fix setState in useEffect |
| `src/components/DealForm.jsx` | Fix setState in useEffect |
| `src/components/Layout.jsx` | Remove unused `motion` import |
| `src/context/AuthContext.jsx` | Fix useEffect, remove unused var, split exports |
| `src/context/useAuth.js` | **Create new file** — move useAuth hook here |
| `src/pages/LoginPage.jsx` | Remove unused `err` catch variables |
| `src/pages/OAuthCallbackPage.jsx` | Remove unused `useState` import |
| `src/pages/AccountDetailPage.jsx` | Fix useEffect deps |
| `src/pages/ContactDetailPage.jsx` | Fix useEffect deps |
| `src/pages/DealDetailPage.jsx` | Fix useEffect deps |

## What NOT to Do
- Do not refactor component logic beyond what's listed — fix only the listed issues
- Do not change any UI or styling
- Do not modify backend files
- Do not merge to `main` — open a PR
