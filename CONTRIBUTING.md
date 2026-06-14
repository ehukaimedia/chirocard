# Contributing to ChiroCard

Thanks for your interest! ChiroCard is a **local-first bodywork passport** — all
health records live on the patient's device. That principle shapes every rule
below, so please read this before opening a PR.

## Setup

```bash
npm install      # install dependencies
npm run dev      # Vite dev server at http://localhost:5173
```

## Verify before every PR

CI runs these on every push/PR and **must be green** to merge:

```bash
npm run lint     # ESLint — 0 errors required
npm test         # Vitest — all tests pass
npm run build    # tsc + production build
```

Also do a manual smoke test for UI changes: create an intake, chart a session,
export a report, and confirm the data persists (`npm run preview`).

## Hard rules (non-negotiable)

1. **Local-first, no surprise egress.** Health records must never leave the
   device. The complete, allowed set of outbound calls is declared in
   [`src/constants/egress.ts`](src/constants/egress.ts) (`EGRESS_ALLOWLIST`) and
   enforced by the CSP in [`public/_headers`](public/_headers). **Any new
   network call requires:** adding the origin to `EGRESS_ALLOWLIST`, the CSP, and
   the [Privacy page](src/pages/Privacy.tsx) — together, in the same PR. No
   record content or record-derived identifiers (names, titles, ids) may be sent
   to analytics.
2. **No secrets, no real patient data** in commits, ever. Analytics is opt-in
   and configured via `VITE_GTM_ID` (see [`.env.example`](.env.example)).
3. **Dexie schema changes need migrations.** Bump `this.version(...)` in
   [`src/db/db.ts`](src/db/db.ts), add an `upgrade()` path, and add/extend the
   migration tests in `src/db/db.migration.test.ts`. Confirm existing installs
   still open (`npm run preview`).
4. **7-day dependency quarantine.** Don't add or upgrade a dependency (or a
   GitHub Action) until its exact version has been public for ≥7 days. Pin it
   (`--save-exact`) and lock it. Transitive deps count too — use `overrides` to
   pin offenders if needed.
5. **The human maintainer is the sole commit author.** Do **not** add
   `Co-Authored-By` / "Generated with…" trailers to commits or PRs.

## Commits & PRs

- Branch off `main`; never commit to `main` directly.
- Use conventional-commit prefixes (`feat:`, `fix:`, `docs:`, `test:`, `chore:`,
  `refactor:`) — match the existing history.
- Fill in the PR template: what changed, why, and how you verified it.
- The native `android/` and `ios/` directories are **intentionally committed**
  (Capacitor config lives there); don't delete or re-ignore them.

## Questions

Open an issue to discuss substantial changes before building. Thanks for helping
keep ChiroCard private by design.
