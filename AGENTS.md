# Repository Guidelines

ChiroCard is a **Bodywork Journal & Digital Passport** built as a Vite + React 19 + TypeScript PWA that keeps all data local through Dexie/IndexedDB. Use this guide to stay consistent and ship safely.

## Project Structure & Module Organization
- `src/main.tsx` mounts `App.tsx` and the router: Dashboard, Intake, Profile, Team, Calendar, Journal, Settings, Session (active / details / report), Privacy, and Terms.
- UI primitives live in `src/components/ui`; feature pieces sit in `src/components/*`; screens in `src/pages/*`.
- State sits in `src/store` (Zustand). Dexie schema is in `src/db/db.ts`—bump versions and add migrations when tables change.
- Reusable hooks go in `src/hooks`; `src/utils`/`src/lib` are pure helpers; `src/assets` and `public` hold static files; `dist` is build output.

## Build, Test, and Development Commands
- `npm install` — install deps.
- `npm run dev` — Vite dev server (http://localhost:5173).
- `npm run build` — type-check via `tsc -b`, then create production assets in `dist/`.
- `npm run preview` — serve the production bundle for smoke tests.
- `npm run lint` — ESLint (TS + React Hooks + Vite Refresh). Must be 0 errors before a PR.
- `npm test` — Vitest (jsdom). `npm run test:watch` for watch mode.

## Coding Style & Naming Conventions
- Functional React components with TypeScript types; keep hook calls at the top level.
- Formatting: 2-space indent, trailing commas where ESLint suggests, double quotes in TSX. No auto-formatter—mirror nearby code.
- Tailwind-first styling; favor theme tokens from `tailwind.config.js` (`primary`, `secondary`, `dark.bg`, `light.bg`) and combine classes with `clsx`/`tailwind-merge`.
- Naming: PascalCase for components/files, `use*` for hooks, camelCase for utilities and Zustand selectors.

## Testing Guidelines
- Tests run on Vitest (jsdom). Existing suites cover the consent/data-egress gate (`src/utils/analytics.test.ts`, `src/lib/consent.test.ts`), the Dexie v17 migration (`src/db/db.migration.test.ts`), and the export/import round-trip (`src/utils/exportImport.test.ts`). Name new files `*.test.ts(x)`; cover store actions, data transforms, migrations, and critical flows. `npm test` must pass before a PR.
- Manual QA: run `npm run dev`, create/update an Intake, move through the Dashboard and an active session, and export a report to confirm Dexie persistence.

## Commit & Pull Request Guidelines
- Use short, imperative commits; conventional prefixes (`feat:`, `fix:`, `chore:`) match history.
- PRs should include a summary, screenshots/GIFs for UI changes, affected routes, and migration notes if Dexie schema changed.
- Run `npm run lint` and, when relevant, `npm run build` before review. Link issues and update `readme.md`/`PRD.md` when behavior shifts.

## Security & Data Hygiene
- Local-first app: avoid introducing remote calls or secrets. Do not commit real patient data.
- When changing IndexedDB structure, add migrations and confirm existing installs still open via `npm run preview`.
