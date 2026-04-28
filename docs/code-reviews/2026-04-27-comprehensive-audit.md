# ChiroCard Codebase Audit Report

**Date:** 2026-04-27  
**Scope:** `src/`, `mobile/`, `public/`, config files  
**Method:** Pattern-based grep scans + deep-read of ~40 high-risk modules  

---

## Executive Summary

The ChiroCard project is a well-architected local-first PWA (Vite + React 19 + TypeScript + Dexie + Zustand) with a parallel Expo mobile build. The codebase is organized cleanly, but several categories of issues were identified:

| Severity | Count |
|----------|-------|
| 🔴 Critical | 6 |
| 🟠 High | 8 |
| 🟡 Medium | 9 |
| 🟢 Low | 8 |
| **Total** | **31** |

The most urgent risks are a **Dexie schema mismatch that can corrupt routine data**, **state updates during React render that risk infinite loops**, and **destructive database operations without rollback**.

---

## 🔴 Critical

### 1. Dexie Schema Mismatch: `routines` Uses `++id` but Code Inserts String UUIDs
- **File:** `src/db/db.ts` (line 159)
- **Issue:** The `routines` table is declared with `++id` (auto-incrementing number primary key). However, `SessionReport.tsx:109`, `RoutineVerificationModal.tsx:53`, and `GuardModal.tsx:52` all call `db.routines.add({ id: crypto.randomUUID(), ... })`. Dexie will reject string keys against an auto-increment store or produce silent data corruption.
- **Fix:** Change the schema to `routines: 'id, isCompletedToday, status'` (string primary key). Bump the DB version and add a Dexie `upgrade` function that rewrites existing numeric IDs to string UUIDs.

### 2. State Update During Render (RoutineVerificationModal)
- **File:** `src/components/Dashboard/RoutineVerificationModal.tsx` (lines 27–31)
- **Issue:** `if (!isOpen && currentIndex !== 0) { setCurrentIndex(0); ... }` runs directly in the render body, not inside `useEffect`. This violates React rules and can trigger infinite re-render loops or "Cannot update during render" warnings.
- **Fix:** Wrap the logic in `useEffect(() => { if (!isOpen && currentIndex !== 0) { setCurrentIndex(0); setShowTimeEdit(false); setNotes(""); } }, [isOpen]);`

### 3. State Update During Render (WelcomeModal)
- **File:** `src/components/Onboarding/WelcomeModal.tsx` (lines 24–26)
- **Issue:** `setTimeout(() => setShowForm(false), 300)` is scheduled directly during render. If the component unmounts before the timeout fires, React will warn about setting state on an unmounted component.
- **Fix:** Move the timer into `useEffect(() => { if (!isOpen && showForm) { const t = setTimeout(...); return () => clearTimeout(t); } }, [isOpen, showForm]);`

### 4. Data Import Wipes Database Before Validating Backup
- **File:** `src/components/Profile/DataManagement.tsx` (lines 57–78)
- **Issue:** `handleImport` calls `db.delete()` before `importDB()`. If the import file is corrupt, `importDB()` throws and the user is left with a completely empty database. No rollback or recovery path exists.
- **Fix:** Validate the JSON structure first, or perform the import inside a try/catch that re-initializes a blank DB if import fails. Better yet, export the current DB to a memory blob before deleting so you can restore on failure.

### 5. Settings "Fresh Start" Destroys DB Without Rollback
- **File:** `src/pages/Settings.tsx` (lines 34–52)
- **Issue:** `handleFreshStart` calls `db.delete()` then `db.open()`. If `db.open()` throws (e.g., browser storage is full or corrupted), the app is left in a broken state with no data and no recovery UI.
- **Fix:** Wrap `db.open()` in a try/catch. On failure, show an error toast and do not reload the page. Consider backing up to `localStorage` or a blob first.

### 6. Mobile Finalize Screen Overwrites User Profile with Empty Data
- **File:** `mobile/app/session/finalize.tsx` (line 23)
- **Issue:** `await db.users.save({ id: 'me' } as any)` writes a dummy object. The mobile SQLite adapter uses `INSERT OR REPLACE`, so the user's existing `name` and JSON blob are overwritten with `undefined` and `{}`, effectively wiping their profile.
- **Fix:** Remove the dummy save. If a save is truly needed, fetch the full user object first and pass it through, or remove the line entirely since the comment indicates it was placeholder code.

---

## 🟠 High

### 7. Async `setTimeout` Without Cleanup or Error Handling
- **File:** `src/components/Dashboard/RoutineVerificationModal.tsx` (line 39)
- **Issue:** `setTimeout(async () => { ... }, 300)` performs DB writes and state updates after a delay. If the user dismisses the modal during the 300ms animation, the timeout still fires and calls `setCurrentIndex`, `onClose()`, and Dexie operations on an unmounted component. There is also no try/catch around the DB calls inside the timeout.
- **Fix:** Store the timer ID in a `useRef`, clear it in cleanup, and guard all state updates with an `isMounted` flag. Wrap DB calls in try/catch.

### 8. Address Autocomplete Race Condition
- **File:** `src/components/ui/AddressAutocomplete.tsx` (lines 51–61)
- **Issue:** Each keystroke schedules a `setTimeout` that fires `searchPlaces()`. If the user types quickly, multiple requests run concurrently. A slow earlier request can resolve after a fast later request, overwriting the dropdown with stale results.
- **Fix:** Maintain a request counter or timestamp ref. In the `setTimeout` callback, discard results if a newer request has already been sent. Alternatively, use an `AbortController` and pass its signal to `fetch`.

### 9. Geolocation Callback Can Set State on Unmounted Component
- **File:** `src/components/ui/AddressAutocomplete.tsx` (lines 26–38)
- **Issue:** `navigator.geolocation.getCurrentPosition` is fire-and-forget. If the component unmounts before the browser returns the position, `setUserLocation` is called on an unmounted component.
- **Fix:** Add an `isMounted` boolean flag inside the effect and check it before calling `setUserLocation`.

### 10. Mobile SQLite Dynamic Query Construction
- **File:** `mobile/db/db.ts` (lines 95–105)
- **Issue:** The `update` method builds SQL dynamically: ``UPDATE practitioners SET ${setClause} WHERE id = ?``. While `setClause` is derived from `Object.keys()`, the pattern is fragile. The cast `(updates as any)[k]` bypasses type safety.
- **Fix:** Maintain a whitelist of updatable columns and map them explicitly, or use an ORM/query builder. Avoid dynamic template strings in SQL.

### 11. SPA Anti-Pattern: Full Page Reloads for Navigation
- **File:** `src/pages/SessionReport.tsx` (lines 167, 175)
- **Issue:** `window.location.href = "/"` and `window.location.href = "/journal"` trigger full browser reloads, destroying React state and forcing the PWA to rehydrate from scratch.
- **Fix:** Use `const navigate = useNavigate()` from `react-router-dom` and call `navigate("/")` instead.

### 12. Missing Feature-Level Error Boundaries
- **File:** `src/App.tsx` and `src/main.tsx`
- **Issue:** Only a single root `ErrorBoundary` exists in `main.tsx`. A runtime crash in Dashboard, SessionActive, or Profile will unmount the entire application. Users lose their navigation context and any unsaved form data.
- **Fix:** Wrap major route branches (e.g., `<MainLayout>`) or heavy feature components (Dashboard, SessionActive) with additional error boundaries that show a localized fallback UI.

### 13. Unreliable Age Calculation
- **File:** `src/pages/Profile.tsx` (lines 271–276)
- **Issue:** `const ageDate = new Date(ageDifMs); return Math.abs(ageDate.getUTCFullYear() - 1970);` is a well-known anti-pattern that produces incorrect ages near leap years, daylight saving transitions, and timezone boundaries.
- **Fix:** Use a robust utility such as `date-fns/differenceInYears` or manual calculation: `Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))`.

### 14. Zustand Store Initializes Dead Fields Removed from Interface
- **File:** `src/store/useAppStore.ts` (lines 83–88)
- **Issue:** `scannedPatientData`, `activePractitioner`, `intakeData`, etc. are commented out of the `AppState` interface (lines 42–45) but still initialized in the state object. They are excluded from `partialize`, but they waste runtime memory and confuse future developers.
- **Fix:** Remove the dead keys from the state object entirely.

---

## 🟡 Medium

### 15. Input Label Lacks `htmlFor`, Breaking Click-to-Focus
- **File:** `src/components/ui/Input.tsx` (lines 15–22)
- **Issue:** The `<label>` is a sibling of the `<input>`, not a wrapper, and it does not have an `htmlFor` attribute. Clicking the label does not focus the field, violating accessibility expectations.
- **Fix:** Add `htmlFor={props.id}` to the `<label>` element.

### 16. Modal Body Scroll Lock Conflict
- **File:** `src/components/ui/Modal.tsx` (lines 45–52)
- **Issue:** `document.body.style.overflow = "hidden"` is set when a modal opens, but the cleanup resets it to `"unset"`. If two modals are open simultaneously and one closes, the remaining modal loses its scroll lock.
- **Fix:** Implement a counter (e.g., `let openModalCount = 0`) or use a dedicated library like `body-scroll-lock` to track nested modals.

### 17. Duplicate `a.click()` in Export Handlers
- **File:** `src/components/Profile/DataManagement.tsx` (lines 26, 44)
- **Issue:** Both `handleExport` and `handleAIExport` call `a.click()` twice in succession. This can trigger duplicate downloads in some browsers.
- **Fix:** Remove the duplicate `a.click()` line in both handlers.

### 18. Service Worker Registered Without Update Handling
- **File:** `src/main.tsx` (lines 52–59)
- **Issue:** The SW is registered on load, but there is no `registration.update()` polling or `updatefound` listener. In a PWA, users may continue running a stale cached build indefinitely without knowing an update is available.
- **Fix:** Add an interval-based `registration.update()` check (e.g., every 60 minutes) and/or listen for `registration.installing` state changes to prompt the user to refresh.

### 19. `@ts-expect-error` Suppresses Type Safety Without Explanation
- **File:** `src/pages/Intake.tsx` (line 42)
- **Issue:** `// @ts-expect-error` is used to bypass a type error for dynamic property access (`user[field]`). There is no comment explaining why the type system is being overridden.
- **Fix:** Replace with a properly typed key lookup (e.g., `user[field as keyof UserProfile]`) or add an explicit runtime check with a comment justifying the suppression.

### 20. Hardcoded Hex/RGB Colors in Global CSS
- **File:** `src/index.css`, `src/App.css`
- **Issue:** Multiple raw hex values (`#242424`, `#888`, `#646cffaa`, etc.) and RGB functions are used instead of Tailwind theme tokens or CSS custom properties. This contradicts the project's AGENTS.md Tailwind-first guidance and makes dark-mode theming harder to maintain.
- **Fix:** Refactor base styles to use Tailwind `@layer base` with `theme()` functions or CSS variables defined in `tailwind.config.js`.

### 21. Mobile Mock DB Has Misplaced Import and `any` Types
- **File:** `mobile/db/db.web.ts` (lines 34–36, 46, 48, 55)
- **Issue:** `import React from 'react'` is placed at line 55, after `React.useState` is used on line 48. While ESM hoists imports, this indicates file maintenance issues. Additionally, `MockTable<any>` and `useLiveQuery(...)` use `any`, removing type safety from the web verification build.
- **Fix:** Move the import to the top of the file and replace `any` with generic types.

### 22. Inline Print Styles in JSX Return
- **File:** `src/pages/Profile.tsx` (lines 179–186)
- **Issue:** A `<style>` tag with `@media print` is embedded directly in the component's JSX return. This can clash with Tailwind's own print modifiers and is harder to tree-shake or override.
- **Fix:** Move print styles to a dedicated CSS file or use Tailwind's `print:` utility classes exclusively.

### 23. Optimistic Reorder Not Rolled Back on Transaction Failure
- **File:** `src/components/Practitioner/PractitionerManager.tsx` (line 35)
- **Issue:** `handleReorder` updates local state immediately (`setItems(newOrder)`), then fires a Dexie transaction. If the transaction fails (caught via `.catch(console.error)`), the UI remains out of sync with the database until the next re-render/live query update.
- **Fix:** Make `handleReorder` async, await the transaction, and roll back `setItems` to the previous `practitioners` array on error.

---

## 🟢 Low

### 24. Console Logs and Errors in Production Code
- **Files:** `src/pages/Intake.tsx:46`, `src/pages/Profile.tsx:100,234`, `src/pages/SessionReport.tsx:159`, `src/pages/SessionActive.tsx:188`, `src/main.tsx:23,55,57`, `src/utils/compression.ts:19,40`, `src/hooks/useNotifications.ts:29,35,66,91`, `src/hooks/usePersistence.ts:17,19,22`, and others.
- **Issue:** Dozens of `console.log`, `console.error`, and `console.warn` statements are scattered throughout the production bundle. They clutter the console and may leak internal state or user data.
- **Fix:** Remove debug logs before build, or replace them with a conditional logger utility that strips output in production.

### 25. Missing 404 / Not Found Route
- **File:** `src/App.tsx` (line 42)
- **Issue:** `<Route path="*" element={<Navigate to="/" replace />} />` silently redirects unknown URLs to the dashboard. Users hitting a bad link get no feedback.
- **Fix:** Render a `<NotFound />` page component instead of redirecting.

### 26. Icon-Only Buttons Missing Accessible Labels
- **Files:** `src/pages/Dashboard.tsx:119`, `src/pages/Dashboard.tsx:203`, `src/components/Practitioner/PractitionerManager.tsx:235`, `src/components/Practitioner/PractitionerManager.tsx:242`, `src/components/ui/Modal.tsx:70`, `src/components/Dashboard/NotificationCenter.tsx:57`
- **Issue:** Buttons containing only SVG icons have no `aria-label`. Screen readers announce them as unlabeled buttons.
- **Fix:** Add descriptive `aria-label` attributes (e.g., `aria-label="Delete session"`, `aria-label="Close modal"`).

### 27. Toast Auto-Dismiss Timer Leak
- **File:** `src/components/ui/Toast.tsx` (line 33)
- **Issue:** `setTimeout(() => setToasts(...), 3000)` is never cleared if the user manually dismisses the toast before it expires. Although the callback filters by ID and is therefore harmless, the timer still occupies the event loop.
- **Fix:** Store timeout IDs in a ref map and clear them inside `removeToast`.

### 28. Root Error Boundary Lacks Recovery UI
- **File:** `src/main.tsx` (lines 12–39)
- **Issue:** The `ErrorBoundary` renders a static red error page with no action buttons. A PWA user who encounters a fatal error has no way to recover without manually clearing site data.
- **Fix:** Add a "Reload Application" button and, optionally, a "Reset Local Data" button that calls `localStorage.clear()` and `indexedDB.deleteDatabase()` before reloading.

### 29. Mobile GuardModal Uses Mock Zustand Store
- **File:** `mobile/components/Session/GuardModal.tsx` (lines 18–20)
- **Issue:** A local mock store `const useAppStore = () => ({ updateSession: (data: any) => console.log(...) })` shadows the real store. The modal cannot actually update the session state in the mobile app.
- **Fix:** Import and use the real `useAppStore` from `@/store/useAppStore` (or `../../store/useAppStore`) and remove the mock.

### 30. `analytics.ts` Uses `any` for Event Parameters
- **File:** `src/utils/analytics.ts` (line 4)
- **Issue:** `params?: Record<string, any>` defeats type safety for Google Tag Manager event parameters.
- **Fix:** Narrow to `Record<string, string | number | boolean | undefined>`.

### 31. ESLint Rule Disabled for Entire File
- **File:** `src/hooks/useNotifications.ts` (line 1)
- **Issue:** `/* eslint-disable react-hooks/exhaustive-deps */` is applied to the entire file. The effect on line 23 actually lists all necessary dependencies, so the disable is likely a leftover from refactoring. It masks future legitimate dependency warnings.
- **Fix:** Remove the file-level disable. If a specific dependency must be omitted, add a targeted `// eslint-disable-next-line` with a comment explaining why.

---

## Recommendations by Priority

| Priority | Action | Finding # |
|----------|--------|-----------|
| **P0** | Fix Dexie `routines` schema mismatch (`++id` → string `id`) | 1 |
| **P0** | Move render-phase state updates into `useEffect` (RoutineVerificationModal, WelcomeModal) | 2, 3 |
| **P0** | Add rollback/validation to destructive DB operations (import, fresh start) | 4, 5 |
| **P1** | Add `AbortController` or request-id gate to address autocomplete | 8 |
| **P1** | Replace `window.location` reloads with `useNavigate` | 11 |
| **P1** | Clean up async timers in RoutineVerificationModal | 7 |
| **P1** | Remove production `console.log` statements | 24 |
| **P2** | Add feature-level error boundaries | 12 |
| **P2** | Add SW update detection | 18 |
| **P2** | Fix accessibility gaps (`aria-label`, `htmlFor`) | 15, 26 |
| **P3** | Remove dead Zustand state keys | 14 |
| **P3** | Consolidate hardcoded CSS into Tailwind theme | 20 |

---

*Audit generated by automated code review against `src/` and `mobile/` trees.*
