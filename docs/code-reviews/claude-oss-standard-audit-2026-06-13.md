# ChiroCard — Ehukai OSS-Standard Audit

- **Date:** 2026-06-13
- **Auditor:** claude (agent)
- **Standard:** Ehukai Media Premium Open-Source Standard (all `§N` citations below refer to that standard's sections §1–§10, not to any file in this repo)
- **Repo:** `ehukaimedia/chirocard` (PUBLIC) · default branch `main` · live at https://chirocard.com (`curl -sSI -L https://chirocard.com` → HTTP 200 on 2026-06-13 — external, time-sensitive evidence, not repo-sourced)
- **Method:** cold-read of the tracked tree, ran `npm run build`, `npm run lint`, `npm audit`, `gh repo view`, secret scan, and source inspection of every egress point. Every claim below cites the command or `file:line` it came from.

> The one test: *would this survive a skeptical reviewer who clones cold, reads the claims, runs the commands, and tries to break it?* Today: **no** — not because the product is weak, but because several headline claims are not enforced and the release-readiness scaffolding (CI, tests, repo-health files) is absent.

---

## 0. Durability gate (§2) — answered, not stamped

**Verdict: PASS, with two conditions.** The wedge is durable, but two things in the audit must be resolved before the durability case is real: the privacy claims must be made true (Finding 1), and the headline QR handoff must be **built or de-advertised** (Finding 15) — it is currently described in the README but not implemented.

**Six-month thesis.** *Even if Apple Health, Google, Epic/MyChart, or a Cursor-style platform ships a better health tracker over the next six months, ChiroCard still matters because its value is the opposite of theirs: no account, no server, no cloud copy of your health record — a passport the patient physically owns on-device.* Platform health products get more centralized and more account-bound over time; that movement increases — not decreases — demand for a local-first, no-account record a patient controls. The *intended* differentiator — a stateless QR handoff a walk-in practitioner uses with zero onboarding — is **not yet implemented** (Finding 15) and is what would complete the wedge.

**Durable-wedge checks (§2.1):**
- **Specific painful workflow.** A patient who sees multiple hands-on practitioners (chiro + massage + PT + acupuncture) has no single record they own; each clinic keeps its own silo. A walk-in practitioner has no fast, accountless way to see prior bodywork. ChiroCard's *intended* QR check-in/check-out is designed to close both — but it is not yet built (Finding 15); today the patient-owned record + export is the realized value.
- **Compounding layer.** Local-first ownership and an open export/import format (`dexie-export-import`, used in `src/components/Profile/DataManagement.tsx` and `src/pages/Settings.tsx`) are implemented and are exactly the "local-first state / open contracts" the standard names as platform-churn-resistant. The portable QR wire format is intended but unbuilt.
- **Adapter-first.** It rides existing rails (PWA, device calendar export, OSM/Photon for address lookup) rather than fighting a platform.
- **Dogfoodable slice.** The single-device intake → session → report → export loop runs and is live; the cross-device QR handoff is not yet built.

**No-go signals (§2.2):** none are disqualifying. It is not a generic AI wrapper and no obvious vendor feature erases it. But two cut against the standard and must be fixed: the README leans on a **future-tense capability presented as present** (the QR handoff), and that headline differentiator is **currently unbuilt** — it must be shipped or de-advertised.

**Caveat that the plan must resolve:** the wedge is "you own your data, it doesn't leave your device, and you hand it off by QR." That promise is currently **contradicted by the code** on two fronts — analytics/egress (Finding 1) and the missing QR handoff (Finding 15). The durability case is real *only if* the privacy claims are made true and the QR workflow is either built or removed from the marketing. That is why the remediation centers on the data-egress boundary and the build-or-remove decision, not on cosmetics.

---

## 1. Severity summary

| # | Finding | Standard | Severity |
|---|---------|----------|----------|
| 1 | Privacy claims contradicted by actual data egress (GTM/GA4 always-on, hardcoded container, public CORS proxy, "HIPAA/GDPR compliance" claim) | §1, §9 | **Critical** |
| 2 | No CI/CD at all — nothing runs tests/build/lint on push or PR | §3.2 | **Critical** |
| 3 | No tests and no test runner at all; the contracts that DO exist (Dexie schema/migrations, export/import) are ungated | §3.3 | **High** |
| 4 | `npm run lint` fails: 11 errors in shipped `src/` (full run: 54 errors / 60 problems incl. non-source dirs) | §3.3, §6 | **High** |
| 5 | Missing repo-health files: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CHANGELOG, issue/PR templates | §3.1 | **High** |
| 6 | `scripts/setup_chirocard_tags.js` hardcodes an absolute path to the author's machine — cannot run on a clean clone | §3.4, §9 | **High** |
| 7 | GitHub metadata empty: no description, no topics, no homepage link, no branch protection | §3.1, §3.2 | **Medium** |
| 8 | Stale/incorrect docs: AGENTS.md says "React 18" (is 19.2); README `GTM_ID` env table is misleading; Privacy page cites unused "Vercel Analytics" | §1, §3.4 | **Medium** |
| 9 | Dependency vulnerabilities: `npm audit` = 15 (12 high) across build **and** runtime deps (vite, esbuild, rollup, postcss, tar, @capacitor/cli, and the runtime `react-router-dom`) | §3.5 | **Medium** |
| 10 | `eslint.config.js` ignores only `dist`; not `.claude/`/`mobile/`/native dirs, so `npm run lint` scans non-source → 54 vs 11 real | §3.3 | **Medium** |
| 11 | `.gitignore` ↔ tracked-tree contradiction: `android/` (53 files) & `ios/` (21) are committed but now git-ignored | §6 | **Medium** |
| 12 | `version: "0.0.0"` + no CHANGELOG → no SemVer/release discipline for a public, live product | §3.1, §3.5 | **Low** |
| 13 | `console.log`/`console.error` debugging left in `src` (8 occurrences) | §6, §9 | **Low** |
| 14 | 850 kB single JS chunk (249 kB gz); browserslist data 6 months stale | §7 | **Low** |
| 15 | Core advertised **QR check-in/handoff workflow is not implemented**: README/PRD describe it but `src` has no QR usage; `compressData`/`decompressData` are dead code; `html5-qrcode`/`qrcode.react`/`pako` are unused deps | §1, §9 | **High** |

**Good (do not regress):** real MIT LICENSE with correct holder/year; `.env` is **not** tracked and the secret scan is clean; Dexie schema is versioned to v17 with an `upgrade()` migration; the build passes; an `AGENTS.md` exists; the live site responds 200; the implemented single-device intake → session → report → export loop runs.

---

## 2. Findings in detail

### Finding 1 — Privacy claims are not enforced (Critical · §1, §9)

This is the load-bearing finding because the privacy promise *is* the product's wedge.

**What the repo claims:**
- `readme.md:15` — "**Zero-Knowledge Privacy** — We do not store user data. Your health information never leaves your device."
- `src/pages/Privacy.tsx:48` — "It literally does not leave your phone."
- `.github/copilot-instructions.md:4` — "Privacy-first design for **HIPAA/GDPR compliance**."

**What the code actually does:**
- `index.html:14` loads **Google Tag Manager with a hardcoded container `GTM-5RGKKRRX`** on every page, including pages that render health data — unconditionally, with no consent gate. `src/utils/analytics.ts:5` pushes behavioral events (`begin_session`, `complete_session`, `add_practitioner`, …) into the GTM `dataLayer`. (What GTM then forwards is defined by the live container config, which is external to this repo; the repo-verifiable fact is that the data is handed to a third-party tag manager that is loaded on every page.)
- `src/services/places.ts:65` sends the typed address query to `photon.komoot.io` (third party) — **and, when the browser grants geolocation, the device's precise GPS coordinates**: `src/components/ui/AddressAutocomplete.tsx:29-43` calls `navigator.geolocation.getCurrentPosition` on mount and `places.ts:67-68` appends `&lat=…&lon=…` to the request. So a third party receives the user's device location. (Search is debounced 500ms / ≥3 chars, not per-keystroke.)
- `src/utils/googleMaps.ts:46` sends Google Maps share links through `https://api.allorigins.win/get` — a **public CORS proxy** — to scrape a business name.

**Precise framing (honesty applied to this audit — scoped to what the repo proves):** the *raw* clinical content — session notes, body metrics, DOB — stays in IndexedDB, and the secret scan is clean. But the analytics path is **not** content-free: `trackEvent` pushes **record-derived identifiers** into the GTM `dataLayer` — practitioner names + roles (`src/components/Practitioner/PractitionerManager.tsx:71`), routine titles (`src/components/Dashboard/RoutineVerificationModal.tsx:67`, `src/pages/SessionReport.tsx:123`), and the practitioner name + session id on session completion (`src/pages/SessionActive.tsx:112`). So the defect is twofold: **(a)** the **absolute, enforced-nowhere copy** — "zero-knowledge," "never leaves your device," "HIPAA/GDPR compliance"; and **(b)** **record-derived identifiers are handed to an unconditionally-loaded third-party tag manager** with no consent and no data-minimization (whether/where GTM forwards them is container-config-dependent and not provable from the repo — but the data being available to it is). A `safe: true`-style claim that is true regardless of the facts is a bug, not a feature (§9).

**Why the hardcoded GTM is worse than "just analytics":** a hardcoded third-party tag container on pages that render health data is an **arbitrary-script-injection surface** — whoever controls `GTM-5RGKKRRX` can inject any JavaScript into a health app, with no consent gate and no Content-Security-Policy. This is the architectural reason the data-egress boundary must be pinned as a contract (see the playground spec).

**Secondary inaccuracy:** `Privacy.tsx:75` lists "Google Analytics / **Vercel Analytics**" as the third-party services — Vercel Analytics is **not in the stack** (`package.json` has no such dep). The page omits Photon/komoot and allorigins.win, which *are* used.

### Finding 2 — No CI/CD (Critical · §3.2)

`.github/` contains only `copilot-instructions.md`; there is **no workflow** (`find .github -type f` → one file). Nothing runs tests, build, or lint on push or PR. This is why the 11 `src` lint errors (Finding 4) and the dependency vulnerabilities (Finding 9) shipped unnoticed. "Never merge red" cannot be enforced when there is no red to see.

### Finding 3 — No tests and no test runner (High · §3.3)

There are **zero** test files and no test runner (`package.json` has no `test` script; AGENTS.md admits "No automated tests yet"). The standard requires a verification gate + negative/corruption tests wherever the project has a *contract*. The contracts that **actually exist** in the code today and are ungated:
- **Dexie schema + migrations** — `src/db/db.ts:153` is at `version(17)` with an `upgrade()` that mutates data (`db.ts:167-175`). A migration bug silently corrupts a patient's only copy of their record; this is the highest-value thing to gate.
- **Export / import round-trip** — `dexie-export-import` (`exportDB`/`importDB`) in `src/components/Profile/DataManagement.tsx:20,97` and `src/pages/Settings.tsx:42,60` is the user's *only* backup path (the Privacy page tells users they are responsible for backups). A broken export = silent data loss. (`src/utils/exportUtils.ts` is a separate session **text-digest** generator — not the DB backup path.)
- **Store actions & data transforms** — `src/store/*`, `src/utils/compression.ts`.

Note: the **QR session wire format is not a live contract** — it is described in the README but **not implemented** (see Finding 15: `compressData`/`decompressData` have no callers; no QR scanner/renderer exists). A golden round-trip + corruption gate for the QR payload should be added **when/if** that feature is built, not before. Point the first tests at the migration and export/import paths, which are real and load-bearing today. (This is distinct from the privacy boundary — keep them separate.)

### Finding 4 — Lint fails on shipped source (High · §3.3, §6)

`npx eslint src` → **exit 1, 11 errors, 0 warnings**: 8× `@typescript-eslint/no-explicit-any`, 2× `react-hooks/preserve-manual-memoization`, 1× `react-hooks/purity`. Offending files: `src/store/useDataStore.ts` (104, 115), `src/db/NativeDB.ts`, `src/components/Dashboard/NotificationCenter.tsx:18`, `src/components/Session/GuardModal.tsx`, `src/pages/SessionActive.tsx:24`. AGENTS.md says "Fix findings before a PR" — the rule exists but is unenforced (no CI). Note the full `npm run lint` reports 54 errors because of Finding 10; the *real shipped-code* number is 11.

### Finding 5 — Missing repo-health files (High · §3.1)

Present: `readme.md`, `LICENSE`, `AGENTS.md`. **Absent:** `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`, and `.github/` issue + PR templates. For a public repo these are part of the Definition of Done. SECURITY.md is especially important here: a health app with **no private vulnerability-reporting path** forces disclosure into public issues.

### Finding 6 — Committed script can't run on a clean clone (High · §3.4, §9)

`scripts/setup_chirocard_tags.js:4`:
```js
import { GTMManager } from '/Volumes/Extreme SSD/AI-Applications/Google-Webmaster-MCP/dist/gtm/client.js';
```
A tracked file imports from a **hardcoded absolute path on the author's machine**. On any other clone it throws `ERR_MODULE_NOT_FOUND`. "Examples must run on a clean clone" (§3.4); a committed, unrunnable, machine-local script is a textbook AI-slop tell (§9). It is also operational tooling (GTM provisioning), not product code — it does not belong in the public product repo as-is.

### Finding 7 — GitHub metadata & branch protection (Medium · §3.1, §3.2)

`gh repo view`: **description `""`**, **homepageUrl `""`**, **topics `null`**. `gh api .../branches/main/protection` → **404 "Branch not protected."** §3.1 explicitly requires an accurate description + topics for discoverability; §3.2 requires branch protection on the default branch where the platform allows. The live URL exists but isn't linked from the repo.

### Finding 8 — Stale / inaccurate docs (Medium · §1, §3.4)

- `AGENTS.md:3` — "Vite + **React 18**"; `package.json` pins `react ^19.2.0`. Stale docs teach false facts.
- `readme.md:93-99` — the "Environment Variables" table implies `GTM_ID` configures the app's analytics. It does not: the container is **hardcoded** in `index.html:14`, and `.env.example` is actually consumed by the GTM-provisioning CLI script, not the Vite build. Misleading.
- `.github/copilot-instructions.md` references files/versions that don't match the code: it points at a `GuestSession.tsx` (no such file in `src/pages`) and states **Dexie v13** while `src/db/db.ts:153` is at **v17**. (Closely related to Finding 15 — the agent guide describes the unbuilt QR/guest-session flow as if present.)
- `index.html:15-16` — duplicated `<!-- End Google Tag Manager -->` comment (cosmetic).

### Finding 9 — Dependency vulnerabilities (Medium · §3.5)

`npm audit --json` → **15 vulnerabilities (3 moderate, 12 high)** spanning **build *and* runtime** dependencies — not a single source. The vulnerable set: `vite`, `esbuild`, `rollup`, `postcss`, `@capacitor/cli`, `tar`, `react-router` / `react-router-dom`, `minimatch`, `picomatch`, `flatted`, `@xmldom/xmldom`, `ajv`, `brace-expansion`, `@isaacs/brace-expansion`. Most are build/transitive, but **`react-router-dom` (high) is a runtime dependency**, so this is *not* purely dev-only. A fix is offered (`npm audit fix`); any upgrade must respect the standard's **7-day module quarantine** (§3.5) — verify each target version has been public ≥7 days before pinning. (The full `--json` output is authoritative here; a summary `npm audit` truncates to the largest advisory group and understates the spread.)

### Finding 10 — ESLint config has no ignores (Medium · §3.3)

`eslint.config.js:9` sets `globalIgnores(['dist'])` — so `dist/` *is* ignored — but nothing else is. `eslint .` therefore still walks `.claude/worktrees/.../mobile/`, `mobile/`, `android/`, and `ios/`, which is why the full `npm run lint` reports **54** errors versus the **11** real ones in `src` (`npx eslint src`). The fix is to extend `globalIgnores` to also cover `.claude`, `mobile`, `android`, `ios` so the lint signal is trustworthy.

### Finding 11 — `.gitignore` ↔ tracked-tree contradiction (Medium · §6)

`.gitignore:35-37` ignores `android/`, `ios/`, `mobile/`, but `git ls-files` shows **android = 53 tracked, ios = 21 tracked** (mobile is correctly untracked). This is a contradiction to *resolve as a decision*, not a blind deletion: Capacitor projects often commit `android/`/`ios/` on purpose because native config lives there. Decide one way and make `.gitignore` and the tree agree — most likely **un-ignore the native dirs** (keep them tracked) rather than delete committed native config. The `.gitignore` entry added in `12abd7f` is the likely defect.

### Finding 12 — No versioning/changelog (Low · §3.1, §3.5)

`package.json` pins `version: "0.0.0"` for a public, **live** product, with no CHANGELOG and no git tags. The standard wants SemVer + a Keep-a-Changelog `Unreleased` section updated with every user-facing change. (`private: true` is **correct** here — it prevents accidental `npm publish` for a web app — so it is *not* a defect; the defect is solely the placeholder `0.0.0` and the missing changelog/tags.)

### Finding 13 — Debug logging in src (Low · §6, §9)

8 `console.*` calls in `src` (`db/WebDB.ts:11`, `db/NativeDB.ts:36/38`, `store/useDataStore.ts:103/105/116`, `utils/googleMaps.ts:33/104`). Init logging and silent `catch`+`console.error` should go through a guarded logger or be removed.

### Finding 14 — Bundle weight (Low · §7)

`npm run build`: single `index-*.js` = **850 kB (249 kB gz)**, over Vite's 500 kB warning; browserslist data is 6 months stale. Route-level code-splitting (`React.lazy`) would help LCP/INP (§7).

### Finding 15 — The advertised QR check-in/handoff workflow is not implemented (High · §1, §9)

The README's headline workflow (`readme.md:41-49`) and feature list describe a QR-based exchange: the patient shows a "Check-In" QR, the practitioner scans it on a Kiosk, charts, then generates a session QR the patient scans to save the record and auto-add the practitioner. **None of this exists in the code:**
- No QR library is imported anywhere in `src` — `grep -rn "html5-qrcode\|qrcode.react\|Html5Qrcode\|QRCode" src` → **0 matches**. So `html5-qrcode`, `qrcode.react`, and `pako` are **declared but unused** dependencies (`package.json`).
- `src/utils/compression.ts` defines `compressData`/`decompressData` (the would-be wire-format codec) but they have **no callers** anywhere in `src` — dead code.
- There is **no `GuestSession.tsx`**, no scanner page, and no camera access in `src/pages`.

This is the most serious **honesty** finding (§1) and a named anti-pattern (§9: "a README that describes a different product than the code"). It also undercuts the durability thesis, which leaned on the QR handoff as the differentiator (now corrected in §0). **Decision required:** either **(a) build** the QR workflow so the README becomes true, or **(b) remove** the QR claims from README/PRD/`copilot-instructions.md` and delete the unused deps + dead `compression.ts`. Until one is chosen, the repo fails the "every claim is true and verifiable" bar.

---

## 3. What maps to what

- **Finding 1** is architectural and becomes the **playground spec** (`docs/playgrounds/specs/data-egress-boundary.html`) — it pins the one contract: *what is allowed to leave the device, who owns each egress point, and the consent model.*
- **Finding 15** is a product-truth fork (build the QR workflow vs. remove the claims) — the plan surfaces it as an explicit decision before the cosmetic phases.
- **All findings** are sequenced for remediation in the **implementation plan** (`docs/plans/oss-standard-remediation-2026-06-13.md`), gated so the durable, contract-defining work (privacy boundary, real-contract tests, CI) lands before cosmetic polish.

*Scope note: this audit and its companion spec/plan are documents only. No source, config, or CI was modified as part of this audit.*
