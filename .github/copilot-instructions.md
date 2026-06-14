# ChiroCard — AI Agent Instructions

> The canonical, maintained guide is **[AGENTS.md](../AGENTS.md)** (build/test/run,
> structure, conventions); **[CONTRIBUTING.md](../CONTRIBUTING.md)** has the hard
> rules. This file is a short orientation; prefer those when they conflict.

## Project Overview

ChiroCard is a **local-first PWA** for tracking hands-on bodywork (chiropractic,
massage, PT, acupuncture). Health records are stored on-device via IndexedDB
(Dexie) — there is **no cloud backend**. Privacy is the product: records never
leave the device. Analytics (GTM/GA4) is **opt-in only** and loaded lazily after
consent; it is *not* a HIPAA/GDPR-certified system — don't claim compliance.

## Data-egress boundary (most important rule)

Anything that leaves the device must be in the allowlist and enforced by the CSP:

- `src/constants/egress.ts` (`EGRESS_ALLOWLIST`) + `public/_headers` (CSP).
- `src/lib/consent.ts` gates analytics; `src/utils/analytics.ts` loads GTM only
  after consent and sends **no record content or record-derived identifiers**
  (no names, titles, or ids).
- A new network call requires updating the allowlist, the CSP, and the Privacy
  page (`src/pages/Privacy.tsx`) together.

## Key files

| File | Purpose |
|------|---------|
| `src/db/db.ts` | Dexie schema (currently **v17**) and migrations — all data types |
| `src/store/useAppStore.ts` | Session/mode UI state (Zustand) |
| `src/store/useDataStore.ts` | Data-layer store over the Dexie/SQLite adapter |
| `src/db/WebDB.ts` / `src/db/NativeDB.ts` | Web (Dexie) and Capacitor SQLite adapters |
| `src/pages/SessionActive.tsx` | Active-session charting (body map + notes) |
| `src/pages/SessionReport.tsx` | Print/PDF-ready session report (`window.print`) |
| `src/components/Consent/ConsentBanner.tsx` | Opt-in analytics prompt |

## Conventions

- Function-declaration components; UI primitives in `src/components/ui/` using the
  `cn()` helper (`src/lib/utils.ts`).
- Tailwind tokens live in `tailwind.config.js` (emerald `primary` #059669 /
  `secondary` #10b981 on the `ecfdf5` "mint paper" surface).
- Reactive reads via `useLiveQuery` (dexie-react-hooks).

## Adding a database table / changing the schema

1. Add the type + table in `src/db/db.ts`; bump `this.version(...)` and add an
   `upgrade()` path.
2. Add/extend migration coverage in `src/db/db.migration.test.ts`.
3. Confirm existing installs still open (`npm run preview`).

## Commands

`npm run dev` · `npm run build` · `npm run lint` (0 errors) · `npm test`.

## Assets

⚠️ Do not modify `/public/icon.svg` (brand logo) or `/public/chirocard-icon.png`.
