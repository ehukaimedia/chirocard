# ChiroCard — OSS-Standard Remediation Plan

- **Date:** 2026-06-13
- **Author:** claude (agent)
- **Driven by:** [OSS-standard audit](../code-reviews/claude-oss-standard-audit-2026-06-13.md) (15 findings)
- **Contract:** [Data-Egress Boundary playground](../playgrounds/specs/data-egress-boundary.html) (Phase A builds to its Spec Seed)
- **Durability gate:** **PASS** (audit §0). The local-first, no-account, QR-handoff wedge survives platform churn — *provided the privacy claims are made true.* That is why Phase A is first and load-bearing.

## How to use this plan
Each phase is one reviewable PR, branched off `main` (never commit to `main` directly — Finding 7).
Phases are ordered by **durability value and dependency**, not by audit severity number. A phase is
done only when its **Verify** commands have been run and their output seen (evidence before
assertions). Respect the **7-day module quarantine** for any new/upgraded dependency (§3.5).

**This plan is a document.** No source, config, CI, or dependency was changed while producing the
audit/spec/plan. Execution happens in follow-up PRs per the phases below.

---

## Finding → phase map

| Finding (severity) | Phase |
|---|---|
| **15 QR workflow not implemented (High)** — build-or-remove fork | **A0 (decide first)** |
| 1 Privacy claims not enforced (Critical) | **A** |
| 2 No CI/CD (Critical) | **B** |
| 4 Lint fails on src (High) · 10 ESLint ignores only `dist` (Medium) | **B** |
| 3 No tests; real contracts (Dexie migrations, export/import) ungated (High) | **C** |
| 5 Missing repo-health files (High) · 7 GitHub metadata + branch protection (Medium) | **D** |
| 6 Machine-path script (High) | **E** |
| 11 gitignore↔native contradiction (Medium) | **E** |
| 9 Dependency vulns build+runtime (Medium) | **E** |
| 12 No versioning/CHANGELOG (Low) | **D** (CHANGELOG) + **E** (version) |
| 8 Stale/inaccurate docs incl. copilot-instructions (Medium) | **F** |
| 13 Debug logging (Low) · 14 Bundle weight (Low) | **F** |

---

## Phase A0 — Resolve the QR build-or-remove fork (Finding 15) · decide before anything else

**Goal:** the README's headline workflow (QR check-in/handoff) is **not implemented** — the QR libs
are unused deps and `compressData`/`decompressData` are dead code with no callers. Every downstream
phase depends on which way this resolves, so decide first. This is a **maintainer decision**, not an
autonomous one.

- **Option (a) — BUILD it.** Implement the QR scanner/renderer + guest-session flow so the README
  becomes true. This is a *feature*, not a fix: it adds a new cross-device wire-format contract that
  Phase C must then gate (golden round-trip + corruption tests). Largest scope.
- **Option (b) — REMOVE the claims.** Strip the QR workflow from README/PRD/`copilot-instructions.md`,
  delete the dead `src/utils/compression.ts`, and drop the unused `html5-qrcode`, `qrcode.react`,
  `pako` (and verify `react-signature-canvas`) deps. Smallest scope; makes the repo honest today.

**Default recommendation:** (b) remove now to pass the honesty bar, and track (a) as a real feature
with its own spec. **Do not proceed to Phase A until the maintainer picks a/b** — it changes Phase C,
Phase E (deps), and Phase F (docs).

---

## Phase A — Enforce the data-egress boundary (Finding 1) · Critical

**Goal:** make the privacy claim true by building to the playground's Spec Seed. This is the wedge;
it ships first. Implements playground gates GATE-1…GATE-5.

**Tasks**
1. **Consent module — single source of truth.** Add `src/lib/consent.ts` owning
   `"unset" | "granted" | "denied"`, persisted. Add a one-time consent prompt (reuse the existing
   modal/onboarding components).
2. **Defer & de-hardcode analytics.** Remove the inline GTM `<script>` from `index.html:7-16`.
   Add an idempotent `loadAnalytics()` that injects GTM **only when consent === "granted"**, reading
   the container id from `import.meta.env.VITE_GTM_ID` (absent ⇒ analytics simply off).
3. **Gate + minimize `trackEvent`.** `src/utils/analytics.ts` becomes a no-op unless consent is
   granted; **and** audit its call sites to stop sending **record-derived identifiers** —
   practitioner names/roles (`PractitionerManager.tsx:71`), routine titles
   (`RoutineVerificationModal.tsx:67`, `SessionReport.tsx:123`), and the practitioner name + session
   id on completion (`SessionActive.tsx:112`). Send only non-identifying counts/categories.
4. **Egress allowlist + CSP.** Add an `EGRESS_ALLOWLIST` constant; emit a Content-Security-Policy
   (via `public/_headers` for Cloudflare Pages and a `<meta>` fallback) restricting
   `script-src`/`connect-src` to exactly: GTM/GA4, `photon.komoot.io`, and (only if kept) the maps
   resolver. This same constant drives the Privacy-page copy in Phase F (no doc/enforcement drift).
5. **Resolve `allorigins.win` (decision required).** Default: **remove** the public-proxy path in
   `src/utils/googleMaps.ts:42-107`; keep local-only long-link parsing (`extractPlaceFromGoogleLink`,
   no network) + manual entry. Alternative (needs sign-off): replace with an owned resolver and
   disclose. Do **not** keep the public proxy.
6. **Minimize address-search geolocation.** `src/components/ui/AddressAutocomplete.tsx:29-43`
   requests browser GPS and `src/services/places.ts:67-68` appends the device's `lat`/`lon` to every
   Photon query. **Stop sending GPS by default** — drop the `&lat&lon` params, or send them only
   after an explicit location-consent opt-in. Disclose Photon (and any retained geolocation) in the
   Privacy page via `EGRESS_ALLOWLIST`.

**Verify (the gate)**
- GATE-1: with consent unset, network panel / a test shows **no** request to `googletagmanager.com`
  or `google-analytics.com`.
- GATE-2: `grep -rn "GTM-" index.html src` → empty; id comes from `VITE_GTM_ID`.
- GATE-4: a request to a non-allowlisted origin is blocked by CSP.
- GATE-5: no IndexedDB record content appears in any outbound request body across check-in → chart →
  check-out.
- `npm run build` passes.

**Decision needed from maintainer:** keep GA4 (consent-gated) vs. drop analytics entirely; and the
allorigins.win remove-vs-replace choice. Default in this plan: **consent-gated GA4 + remove proxy.**

---

## Phase B — Make the gates real: lint + tests + CI (Findings 4, 10, 2) · Critical/High

**Goal:** "never merge red" requires a red to exist. Fix lint so it's trustworthy, add a test
runner, then wire CI so every push/PR runs lint + build + test.

**Tasks**
1. **ESLint ignores (Finding 10).** Extend the existing `globalIgnores(['dist'])` at
   `eslint.config.js:9` to also ignore `mobile`, `android`, `ios`, `.claude` so `npm run lint` scans
   only tracked source. This drops the count from 54 → 11.
2. **Fix the 11 src errors (Finding 4):** type the **8 `@typescript-eslint/no-explicit-any`** in
   `src/store/useDataStore.ts:104,115`, `src/db/NativeDB.ts`, and `src/components/Session/GuardModal.tsx`;
   fix the **1 `react-hooks/purity`** in `src/components/Dashboard/NotificationCenter.tsx:18`; and the
   **2 `react-hooks/preserve-manual-memoization`** in `src/pages/SessionActive.tsx:24`. Target:
   `npx eslint src` → 0 errors.
3. **Test runner.** Add **Vitest + React Testing Library** (quarantine-checked versions); add
   `"test": "vitest run"` to `package.json`. Seed with store-action + data-transform tests
   (per AGENTS.md guidance) plus the Phase A consent-gate test (GATE-1).
4. **CI (Finding 2).** Add `.github/workflows/ci.yml` running `npm ci` → `lint` → `test` → `build`
   on push + PR to `main`, on a pinned Node version. Use least-privilege token; never interpolate
   untrusted event data into shell.

**Verify**
- `npx eslint src` → exit 0; `npm run test` → green; `npm run build` → green.
- CI run is green on the PR (confirmed in the Actions tab, not assumed).

---

## Phase C — Contract tests for the contracts that actually exist (Finding 3) · High

**Goal:** gate the contracts that are real and load-bearing **today** (§3.3). The QR/`pako` wire
format is *not* one of them — it is unimplemented (Finding 15); its golden + corruption gate is added
only under Phase A0 option (a), with that feature. Today's real, ungated contracts:

**Tasks**
1. **Dexie migration gate (highest value).** `src/db/db.ts:153` is `version(17)` with a data-mutating
   `upgrade()` (`db.ts:167-175`). Test that a database seeded at an older version upgrades to v17
   without data loss, and that the `upgrade()` transform is idempotent. A migration bug corrupts the
   patient's only copy of their record.
2. **Export/import round-trip.** `dexie-export-import` (`exportDB`/`importDB`) in
   `src/components/Profile/DataManagement.tsx:20,97` and `src/pages/Settings.tsx:42,60` is the user's
   only backup path. Test export → wipe → import restores byte-equivalent data; assert a
   truncated/garbled import fails *cleanly* (structured error, no silent partial restore).
3. **Store actions & transforms.** Cover `src/store/*` actions and `src/utils/compression.ts`
   (round-trip + corrupted-input clean failure) even though `compression.ts` is currently unused — if
   Phase A0 keeps it, it must be gated; if A0 removes it, this sub-task is dropped.
4. **(Conditional) QR wire format** — only if Phase A0 = build: golden round-trip + corruption +
   cross-version tests for the QR payload, tied to the Dexie version.

**Verify**
- `npm run test` includes the new suite; the migration test fails if `upgrade()` drops/garbles data;
  each corruption case asserts a clean failure (proves the gate isn't a happy-path no-op).

---

## Phase D — Repo-health files & GitHub metadata (Findings 5, 7, 12-CHANGELOG) · High/Medium

**Goal:** complete the §3.1 file set and make the public repo discoverable and protected.

**Tasks**
1. **Files:** `CONTRIBUTING.md` (setup/test/PR rules, incl. "no AI co-author trailers", local-first
   "no remote calls/secrets" rule from AGENTS.md), `CODE_OF_CONDUCT.md` (Contributor Covenant +
   real contact `aloha@ehukaimedia.com`), `SECURITY.md` (**private** reporting path — critical for a
   health app), `CHANGELOG.md` (Keep a Changelog + `Unreleased`), and `.github/ISSUE_TEMPLATE/` +
   `PULL_REQUEST_TEMPLATE.md`.
2. **GitHub metadata (Finding 7):** set repo **description**, **topics**
   (e.g. `local-first`, `pwa`, `health`, `react`, `indexeddb`, `capacitor`, `privacy`),
   and **homepageUrl = https://chirocard.com** via `gh repo edit`.
3. **Branch protection:** require the Phase B CI check + PR review on `main` (`gh api`/UI).

**Verify**
- `ls CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md CHANGELOG.md .github/PULL_REQUEST_TEMPLATE.md`
  all present; no dead links.
- `gh repo view --json description,repositoryTopics,homepageUrl` non-empty;
  `gh api repos/ehukaimedia/chirocard/branches/main/protection` returns a policy (not 404).

---

## Phase E — Hygiene & dependency safety (Findings 6, 11, 9, 12-version) · High/Medium

**Tasks**
1. **Machine-path script (Finding 6):** `scripts/setup_chirocard_tags.js:4` imports an absolute path
   on the author's machine. **Remove it from the product repo** (it's GTM-provisioning ops tooling,
   not product code). If retained, relocate to its own tool and import via a package name, never an
   absolute path. Verify nothing in `src`/build references it.
2. **gitignore↔native decision (Finding 11):** `android/` (53) & `ios/` (21) are tracked but
   `.gitignore:35-37` ignores them. Decide and make them agree. **Recommended:** un-ignore the
   native dirs (Capacitor config legitimately lives there) — keep them tracked; remove the
   `android/`+`ios/` `.gitignore` lines (added in `b30a350`). Document the decision in CONTRIBUTING.
3. **Dependency vulns (Finding 9):** `npm audit` = 15 (12 high) across **build + runtime** deps
   (`vite`, `esbuild`, `rollup`, `postcss`, `tar`, `@capacitor/cli`, and the **runtime**
   `react-router-dom`/`react-router`, plus transitives) — not dev-only. Apply `npm audit fix` and
   bump the direct deps (notably `react-router-dom` and `vite`) — each only to a version **public ≥7
   days** (verify the registry timestamp), then re-lock. Add Dependabot.
4. **Versioning (Finding 12):** bump `package.json` from `0.0.0` to a real SemVer (`1.0.0` given it's
   live), tag the release, and start the CHANGELOG `Unreleased`→`1.0.0` entry.
5. **Unused deps + dead code (Finding 15, if Phase A0 = remove):** delete the dead
   `src/utils/compression.ts` (no callers) and drop the unused `html5-qrcode`, `qrcode.react`, `pako`
   (and `@types/pako`) from `package.json`; verify `react-signature-canvas` usage and remove if also
   unused. Re-lock. (If A0 = build, these become *used* instead — skip this task.)

**Verify**
- `npm audit` → 0 high (or documented residual); `node scripts/...` no longer references an absolute
  path (or the file is gone); `git check-ignore -v --no-index android ios mobile` consistent with the
  chosen decision (plain `git check-ignore` won't report already-tracked ignored paths);
  `npx depcheck` (or grep) shows no unused QR deps remain (if A0 = remove); `npm run build` still green.

---

## Phase F — Documentation truth pass (Findings 8, 13, 14, 15-docs) · Medium/Low

**Goal:** every claim the repo makes is true and verifiable (§1). Do this last so docs describe the
*post-remediation* reality.

**Tasks**
1. **Privacy page (`src/pages/Privacy.tsx`):** rewrite §3 "Third-Party Services" to equal
   `EGRESS_ALLOWLIST` exactly — drop **"Vercel Analytics"** (not in stack, line 75), add Photon and
   (if kept) the maps resolver; soften "it literally does not leave your phone" to the precise
   boundary (records stay; consented telemetry + lookups may leave).
2. **README (`readme.md`):** fix the env-var table (lines 93-99) — `GTM_ID` does **not** configure
   the app; document `VITE_GTM_ID` as the real (optional, consent-gated) analytics toggle. Reconcile
   the "Zero-Knowledge / never leaves your device" copy (line 15) with the boundary.
3. **QR workflow claims (Finding 15, if Phase A0 = remove):** remove the QR check-in/handoff
   workflow from `readme.md:41-49` + the feature list, and from `docs/PRD.md`. (If A0 = build, instead
   make the README accurate to the shipped feature.)
3b. **PRD privacy/no-egress claims (`docs/PRD.md`):** correct the absolute claims that Finding 1
   contradicts — `docs/PRD.md:32` "No personal health information (PHI) is transmitted to cloud
   servers" and `docs/PRD.md:99` "All data remains on the user's device. No external transmission
   occurs" — to the precise boundary (records stay local; consented analytics, address/geolocation
   lookups may leave). Re-scope or qualify the HIPAA/GDPR/CCPA compliance bullets (`PRD.md:33-34`).
4. **AGENTS.md:** "React 18" → "React 19" (line 3); confirm commands still accurate (add `npm test`).
5. **copilot-instructions.md:** drop or qualify the unsubstantiated "HIPAA/GDPR compliance" claim
   (line 4); fix the stale `GuestSession.tsx` reference and `Dexie v13` → `v17` (`src/db/db.ts:153`);
   reconcile the QR/guest-session description with Phase A0's outcome.
6. **Debug logging (Finding 13):** remove/guard the 8 `console.*` calls (`db/WebDB.ts:11`,
   `db/NativeDB.ts:36,38`, `store/useDataStore.ts:103,105,116`, `utils/googleMaps.ts:33,104`).
7. **Bundle (Finding 14, optional):** route-level `React.lazy` to split the 850 kB chunk; run
   `npx update-browserslist-db@latest`.

**Verify**
- `grep -rn "Vercel Analytics" src` → empty; `grep -rn "React 18" AGENTS.md` → empty;
  `grep -rni "guestsession\|Dexie v13\|HIPAA" .github` → empty or corrected;
  `grep -rniE "QR|check-in" readme.md docs/PRD.md` consistent with A0's outcome;
  `grep -rni "no external transmission\|not transmitted\|no .* transmitted to cloud" docs/PRD.md` →
  empty or corrected to the precise boundary;
  `grep -rnE "console\.(log|error|warn)" src` → empty/guarded; `npm run build` shows reduced
  main-chunk size if F-7 done.

---

## Sequencing, risk & rollback

- **Order:** A0 → A → B → C → D → E → F. A0 is a maintainer decision (build vs. remove the QR
  workflow) that gates Phase C/E/F scope; A delivers the wedge; B makes regressions visible before the
  rest lands; C/D/E/F are independently shippable PRs once B's CI is green.
- **Risk:** Phase A changes runtime behavior (analytics now opt-in) — verify the live site still
  functions with consent denied. Phase E item 3 must honor the 7-day quarantine; do not fast-track a
  capacitor bump.
- **Rollback:** each phase is one PR; revert the PR. Phase A keeps GA4 reachable (just gated), so
  re-enabling is a consent default change, not a rebuild.

## Definition of Done for the whole effort (§10 release gate)
- [ ] QR build-or-remove fork resolved; README/PRD/copilot-instructions match the code (Phase A0, Finding 15).
- [ ] Privacy boundary enforced; GATE-1…5 pass (Phase A).
- [ ] `npx eslint src` clean; CI green on `main`; tests cover the Dexie migration, export/import
      round-trip, store actions, the consent gate (and the QR wire format only if A0 = build) (Phases B, C).
- [ ] All §3.1 repo-health files present + accurate; metadata, topics, homepage, branch protection
      set (Phase D).
- [ ] No machine-path script; native-dir decision consistent; `npm audit` clean (quarantine-aware);
      no unused QR deps/dead code (if A0 = remove); real SemVer + CHANGELOG (Phase E).
- [ ] Every doc claim true and verifiable; no debug logging (Phase F).
- [ ] Playground refreshed/superseded once the boundary ships and a `docs/specs/` spec takes over.
