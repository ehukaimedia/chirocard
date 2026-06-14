# ChiroCard — Ehukai OSS-Standard Audit

- **Date:** 2026-06-13
- **Auditor:** claude (agent)
- **Standard:** Ehukai Media Premium Open-Source Standard
- **Repo:** `ehukaimedia/chirocard` (PUBLIC) · default branch `main` · live at https://chirocard.com (verified HTTP 200)
- **Method:** cold-read of the tracked tree, ran `npm run build`, `npm run lint`, `npm audit`, `gh repo view`, secret scan, and source inspection of every egress point. Every claim below cites the command or `file:line` it came from.

> The one test: *would this survive a skeptical reviewer who clones cold, reads the claims, runs the commands, and tries to break it?* Today: **no** — not because the product is weak, but because several headline claims are not enforced and the release-readiness scaffolding (CI, tests, repo-health files) is absent.

---

## 0. Durability gate (§2) — answered, not stamped

**Verdict: PASS. The wedge is durable; proceed with the remediation plan.**

**Six-month thesis.** *Even if Apple Health, Google, Epic/MyChart, or a Cursor-style platform ships a better health tracker over the next six months, ChiroCard still matters because its value is the opposite of theirs: no account, no server, no cloud copy of your health record, and a stateless QR handoff a walk-in practitioner can use with zero onboarding.* Platform health products get more centralized and more account-bound over time; that movement increases — not decreases — demand for a local-first, no-account passport that a patient physically controls and hands to a practitioner who never installs anything.

**Durable-wedge checks (§2.1):**
- **Specific painful workflow.** A patient who sees multiple hands-on practitioners (chiro + massage + PT + acupuncture) has no single record they own; each clinic keeps its own silo. A walk-in practitioner has no fast, accountless way to see prior bodywork. ChiroCard's QR check-in/check-out closes both, recurring every visit.
- **Compounding layer.** Local-first ownership, an open export format, and a portable QR wire format are exactly the "local-first state / open contracts / reproducible handoff" categories the standard names as platform-churn-resistant.
- **Adapter-first.** It rides existing rails (PWA, device calendar export, OSM/Photon for address lookup) rather than fighting a platform.
- **Dogfoodable slice.** The check-in → chart → check-out loop already runs end-to-end and is live.

**No-go signals (§2.2):** none are true. It is not a generic AI wrapper; no obvious vendor feature erases it; the README does not need future tense to sound useful; the first demo needs no unbuilt systems.

**Caveat that the plan must resolve:** the wedge is "you own your data, it doesn't leave your device." That thesis is currently **contradicted by the code** (see Finding 1). The durability case is real *only if the privacy claims are made true*. That is why the remediation centers on the data-egress boundary, not on cosmetics.

---

## 1. Severity summary

| # | Finding | Standard | Severity |
|---|---------|----------|----------|
| 1 | Privacy claims contradicted by actual data egress (GTM/GA4 always-on, hardcoded container, public CORS proxy, "HIPAA/GDPR compliance" claim) | §1, §9 | **Critical** |
| 2 | No CI/CD at all — nothing runs tests/build/lint on push or PR | §3.2 | **Critical** |
| 3 | No tests, including no gate on the QR/`pako` session wire format (a real contract) | §3.3 | **High** |
| 4 | `npm run lint` fails: 11 errors in shipped `src/` (54 total incl. scanned non-source) | §3.3, §6 | **High** |
| 5 | Missing repo-health files: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CHANGELOG, issue/PR templates | §3.1 | **High** |
| 6 | `scripts/setup_chirocard_tags.js` hardcodes an absolute path to the author's machine — cannot run on a clean clone | §3.4, §9 | **High** |
| 7 | GitHub metadata empty: no description, no topics, no homepage link, no branch protection | §3.1, §3.2 | **Medium** |
| 8 | Stale/incorrect docs: AGENTS.md says "React 18" (is 19.2); README `GTM_ID` env table is misleading; Privacy page cites unused "Vercel Analytics" | §1, §3.4 | **Medium** |
| 9 | Dependency vulnerabilities: `npm audit` = 15 (12 high) via `@capacitor/cli` → `tar` | §3.5 | **Medium** |
| 10 | `eslint.config.js` has no `ignores`; lints `.claude/`, `mobile/`, `dist/` — config defect masking signal | §3.3 | **Medium** |
| 11 | `.gitignore` ↔ tracked-tree contradiction: `android/` (53 files) & `ios/` (21) are committed but now git-ignored | §6 | **Medium** |
| 12 | `version: "0.0.0"` + no CHANGELOG → no SemVer/release discipline for a public, live product | §3.1, §3.5 | **Low** |
| 13 | `console.log`/`console.error` debugging left in `src` (8 occurrences) | §6, §9 | **Low** |
| 14 | 850 kB single JS chunk (249 kB gz); browserslist data 6 months stale | §7 | **Low** |

**Good (do not regress):** real MIT LICENSE with correct holder/year; `.env` is **not** tracked and the secret scan is clean; Dexie schema is versioned to v17 with an `upgrade()` migration; the build passes; an `AGENTS.md` exists; the live site responds 200; the product loop is real and dogfoodable.

---

## 2. Findings in detail

### Finding 1 — Privacy claims are not enforced (Critical · §1, §9)

This is the load-bearing finding because the privacy promise *is* the product's wedge.

**What the repo claims:**
- `readme.md:15` — "**Zero-Knowledge Privacy** — We do not store user data. Your health information never leaves your device."
- `src/pages/Privacy.tsx:48` — "It literally does not leave your phone."
- `.github/copilot-instructions.md:4` — "Privacy-first design for **HIPAA/GDPR compliance**."

**What the code actually does:**
- `index.html:14` loads **Google Tag Manager with a hardcoded container `GTM-5RGKKRRX`** on every page, including pages that render health data. `src/utils/analytics.ts` pushes behavioral events (`begin_session`, `complete_session`, `add_practitioner`, …) into `dataLayer` → GTM → GA4. Telemetry leaves the device on normal use.
- `src/services/places.ts:65` sends the practitioner's typed address query to `photon.komoot.io` (third party).
- `src/utils/googleMaps.ts:46` sends Google Maps share links through `https://api.allorigins.win/get` — a **public CORS proxy** — to scrape a business name.

**Precise framing (honesty applied to this audit):** health *records* genuinely stay in IndexedDB; the secret scan is clean and there is no record exfiltration. The defect is the **absolute, enforced-nowhere copy** — "zero-knowledge," "never leaves your device," "HIPAA/GDPR compliance" — while behavioral telemetry, typed address queries, and Maps links *do* leave. A `safe: true`-style claim that is true regardless of the facts is a bug, not a feature (§9).

**Why the hardcoded GTM is worse than "just analytics":** a hardcoded third-party tag container on pages that render health data is an **arbitrary-script-injection surface** — whoever controls `GTM-5RGKKRRX` can inject any JavaScript into a health app, with no consent gate and no Content-Security-Policy. This is the architectural reason the data-egress boundary must be pinned as a contract (see the playground spec).

**Secondary inaccuracy:** `Privacy.tsx:75` lists "Google Analytics / **Vercel Analytics**" as the third-party services — Vercel Analytics is **not in the stack** (`package.json` has no such dep). The page omits Photon/komoot and allorigins.win, which *are* used.

### Finding 2 — No CI/CD (Critical · §3.2)

`.github/` contains only `copilot-instructions.md`; there is **no workflow** (`find .github -type f` → one file). Nothing runs tests, build, or lint on push or PR. This is why the 11 `src` lint errors (Finding 4) and the dependency vulnerabilities (Finding 9) shipped unnoticed. "Never merge red" cannot be enforced when there is no red to see.

### Finding 3 — No tests; the QR wire format is an untested contract (High · §3.3)

There are **zero** test files and no test runner (`package.json` has no `test` script; AGENTS.md admits "No automated tests yet"). The standard requires a verification gate + negative/corruption tests wherever the project has a *contract*. ChiroCard has a real one: the **patient↔practitioner QR session payload**, compressed with `pako` (`src/utils/compression.ts`) and exchanged via `html5-qrcode`/`qrcode.react`. The risky paths are entirely unguarded:
- a practitioner scanning a check-in QR produced by a **different app version**;
- a patient scanning a session QR with a corrupted/truncated payload;
- round-trip stability (encode → decode → encode is byte-identical).

A golden round-trip test plus negative/corruption tests belong here. (This is distinct from the privacy boundary — keep them separate.)

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
- `index.html:15-16` — duplicated `<!-- End Google Tag Manager -->` comment (cosmetic).

### Finding 9 — Dependency vulnerabilities (Medium · §3.5)

`npm audit` → **15 vulnerabilities (3 moderate, 12 high)**, all from `@capacitor/cli` → `tar` (path-traversal / hardlink-escape advisories). Dev/build-time only, but unaddressed. A fix is offered (`npm audit fix`); any upgrade must respect the standard's **7-day module quarantine** (§3.5) — verify the target version has been public ≥7 days before pinning.

### Finding 10 — ESLint config has no ignores (Medium · §3.3)

`eslint.config.js` defines no `ignores`, so `eslint .` walks `.claude/worktrees/.../mobile/`, `mobile/`, and `dist/`. That inflates the error count from 11 (real) to 54 and means the lint signal is noise. The config should ignore non-source dirs so the command is trustworthy.

### Finding 11 — `.gitignore` ↔ tracked-tree contradiction (Medium · §6)

`.gitignore:35-37` ignores `android/`, `ios/`, `mobile/`, but `git ls-files` shows **android = 53 tracked, ios = 21 tracked** (mobile is correctly untracked). This is a contradiction to *resolve as a decision*, not a blind deletion: Capacitor projects often commit `android/`/`ios/` on purpose because native config lives there. Decide one way and make `.gitignore` and the tree agree — most likely **un-ignore the native dirs** (keep them tracked) rather than delete committed native config. The `.gitignore` entry added in `12abd7f` is the likely defect.

### Finding 12 — No versioning/changelog (Low · §3.1, §3.5)

`package.json` pins `version: "0.0.0"` for a public, **live** product, with no CHANGELOG and no git tags. The standard wants SemVer + a Keep-a-Changelog `Unreleased` section updated with every user-facing change. (`private: true` is **correct** here — it prevents accidental `npm publish` for a web app — so it is *not* a defect; the defect is solely the placeholder `0.0.0` and the missing changelog/tags.)

### Finding 13 — Debug logging in src (Low · §6, §9)

8 `console.*` calls in `src` (`db/WebDB.ts:11`, `db/NativeDB.ts:36/38`, `store/useDataStore.ts:103/105/116`, `utils/googleMaps.ts:33/104`). Init logging and silent `catch`+`console.error` should go through a guarded logger or be removed.

### Finding 14 — Bundle weight (Low · §7)

`npm run build`: single `index-*.js` = **850 kB (249 kB gz)**, over Vite's 500 kB warning; browserslist data is 6 months stale. Route-level code-splitting (`React.lazy`) would help LCP/INP (§7).

---

## 3. What maps to what

- **Finding 1** is architectural and becomes the **playground spec** (`docs/playgrounds/specs/data-egress-boundary.html`) — it pins the one contract: *what is allowed to leave the device, who owns each egress point, and the consent model.*
- **All findings** are sequenced for remediation in the **implementation plan** (`docs/plans/oss-standard-remediation-2026-06-13.md`), gated so the durable, contract-defining work (privacy boundary, QR wire-format tests, CI) lands before cosmetic polish.

*Scope note: this audit and its companion spec/plan are documents only. No source, config, or CI was modified as part of this audit.*
