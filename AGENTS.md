# Repository Guidelines

ChiroCard is a Vite + React 18 + TypeScript PWA that keeps all data local through Dexie/IndexedDB. Use this guide to stay consistent and ship safely.

## Project Structure & Module Organization
- `src/main.tsx` mounts `App.tsx` and the router for Dashboard, Intake, Profile, Team, Calendar, and Guest Session.
- UI primitives live in `src/components/ui`; feature pieces sit in `src/components/*`; screens in `src/pages/*`.
- State sits in `src/store` (Zustand). Dexie schema is in `src/db/db.ts`—bump versions and add migrations when tables change.
- Reusable hooks go in `src/hooks`; `src/utils`/`src/lib` are pure helpers; `src/assets` and `public` hold static files; `dist` is build output.

## Build, Test, and Development Commands
- `npm install` — install deps.
- `npm run dev` — Vite dev server (http://localhost:5173).
- `npm run build` — type-check via `tsc -b`, then create production assets in `dist/`.
- `npm run preview` — serve the production bundle for smoke tests.
- `npm run lint` — ESLint (TS + React Hooks + Vite Refresh). Fix findings before a PR.

## Coding Style & Naming Conventions
- Functional React components with TypeScript types; keep hook calls at the top level.
- Formatting: 2-space indent, trailing commas where ESLint suggests, double quotes in TSX. No auto-formatter—mirror nearby code.
- Tailwind-first styling; favor theme tokens from `tailwind.config.js` (`primary`, `secondary`, `dark.bg`, `light.bg`) and combine classes with `clsx`/`tailwind-merge`.
- Naming: PascalCase for components/files, `use*` for hooks, camelCase for utilities and Zustand selectors.

## Testing Guidelines
- No automated tests yet. When adding, prefer Vitest + React Testing Library; name files `*.test.tsx` and cover store actions, data transforms, and critical flows.
- Manual QA: run `npm run dev`, create/update an Intake, move through Dashboard and Guest Session, and export a PDF to confirm Dexie persistence.

## Commit & Pull Request Guidelines
- Use short, imperative commits; conventional prefixes (`feat:`, `fix:`, `chore:`) match history.
- PRs should include a summary, screenshots/GIFs for UI changes, affected routes, and migration notes if Dexie schema changed.
- Run `npm run lint` and, when relevant, `npm run build` before review. Link issues and update `readme.md`/`PRD.md` when behavior shifts.

## Security & Data Hygiene
- Local-first app: avoid introducing remote calls or secrets. Do not commit real patient data.
- When changing IndexedDB structure, add migrations and confirm existing installs still open via `npm run preview`.
