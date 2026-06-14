# ChiroCard — OSS-Standard Remediation Plan

- **Date:** 2026-06-13
- **Author:** claude (agent)
- **Driven by:** [OSS-standard audit](../code-reviews/claude-oss-standard-audit-2026-06-13.md) (14 findings)
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
| 1 Privacy claims not enforced (Critical) | **A** |
| 2 No CI/CD (Critical) | **B** |
| 4 Lint fails on src (High) · 10 ESLint no ignores (Medium) | **B** |
| 3 No tests / QR wire format ungated (High) | **C** |
| 5 Missing repo-health files (High) · 7 GitHub metadata + branch protection (Medium) | **D** |
| 6 Machine-path script (High) | **E** |
| 11 gitignore↔native contradiction (Medium) | **E** |
| 9 Dependency vulns (Medium) | **E** |
| 12 No versioning/CHANGELOG (Low) | **D** (CHANGELOG) + **E** (version) |
| 8 Stale/inaccurate docs (Medium) | **F** |
| 13 Debug logging (Low) · 14 Bundle weight (Low) | **F** |

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
3. **Gate `trackEvent`.** `src/utils/analytics.ts` becomes a no-op unless consent is granted.
4. **Egress allowlist + CSP.** Add an `EGRESS_ALLOWLIST` constant; emit a Content-Security-Policy
   (via `public/_headers` for Cloudflare Pages and a `<meta>` fallback) restricting
   `script-src`/`connect-src` to exactly: GTM/GA4, `photon.komoot.io`, and (only if kept) the maps
   resolver. This same constant drives the Privacy-page copy in Phase F (no doc/enforcement drift).
5. **Resolve `allorigins.win` (decision required).** Default: **remove** the public-proxy path in
   `src/utils/googleMaps.ts:42-107`; keep local-only long-link parsing (`extractPlaceFromGoogleLink`,
   no network) + manual entry. Alternative (needs sign-off): replace with an owned resolver and
   disclose. Do **not** keep the public proxy.

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
1. **ESLint ignores (Finding 10).** Add `ignores: ["dist", "mobile", "android", "ios", ".claude", "node_modules"]`
   to `eslint.config.js` so `npm run lint` scans only source. This drops the count from 54 → 11.
2. **Fix the 11 src errors (Finding 4):** type the 8 `any` in `src/store/useDataStore.ts:104,115`,
   `src/db/NativeDB.ts`, `src/components/Dashboard/NotificationCenter.tsx:18`,
   `src/components/Session/GuardModal.tsx`; fix the `react-hooks/preserve-manual-memoization` +
   `purity` in `src/pages/SessionActive.tsx:24`. Target: `npx eslint src` → 0 errors.
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

## Phase C — QR/`pako` wire-format contract tests (Finding 3) · High

**Goal:** the patient↔practitioner QR payload is a real contract; gate it with golden +
negative/corruption tests (§3.3). Distinct from Phase A — this is the *wire format*, not egress.

**Tasks**
1. **Golden round-trip:** encode a representative session payload → decode → re-encode is
   byte-identical (`src/utils/compression.ts`).
2. **Negative/corruption:** truncated payload, flipped bytes, wrong magic/version, and an
   empty/oversized input all fail *cleanly* (structured error, no crash) when scanned.
3. **Cross-version:** a payload from an older schema version decodes or is rejected with a clear
   message — never silently mis-parsed. Tie to the Dexie version (`src/db/db.ts:153`).

**Verify**
- `npm run test` includes the new suite; golden test fails on any drift; each corruption case
  asserts a clean failure (proves the gate isn't a happy-path no-op).

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
   native dirs (Capacitor config legitimately lives there) — keep them tracked; remove those
   `.gitignore` lines (added in `12abd7f`). Document the decision in CONTRIBUTING.
3. **Dependency vulns (Finding 9):** `npm audit` = 15 (12 high) via `@capacitor/cli` → `tar`
   (dev-only). Apply `npm audit fix` / bump `@capacitor/cli` — but only to a version **public ≥7
   days** (verify the registry timestamp), then re-lock. Add Dependabot.
4. **Versioning (Finding 12):** bump `package.json` from `0.0.0` to a real SemVer (`1.0.0` given it's
   live), tag the release, and start the CHANGELOG `Unreleased`→`1.0.0` entry.

**Verify**
- `npm audit` → 0 high (or documented residual); `node scripts/...` no longer references an absolute
  path (or the file is gone); `git check-ignore android ios` consistent with the chosen decision;
  `npm run build` still green.

---

## Phase F — Documentation truth pass (Findings 8, 13, 14) · Medium/Low

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
3. **AGENTS.md:** "React 18" → "React 19" (line 3); confirm commands still accurate (add `npm test`).
4. **copilot-instructions.md:** drop or qualify the unsubstantiated "HIPAA/GDPR compliance" claim
   (line 4).
5. **Debug logging (Finding 13):** remove/guard the 8 `console.*` calls (`db/WebDB.ts:11`,
   `db/NativeDB.ts:36,38`, `store/useDataStore.ts:103,105,116`, `utils/googleMaps.ts:33,104`).
6. **Bundle (Finding 14, optional):** route-level `React.lazy` to split the 850 kB chunk; run
   `npx update-browserslist-db@latest`.

**Verify**
- `grep -rn "Vercel Analytics" src` → empty; `grep -rn "React 18" AGENTS.md` → empty;
  `grep -rn "HIPAA" .github` → empty or qualified; `grep -rnE "console\.(log|error|warn)" src`
  → empty/guarded; `npm run build` shows reduced main-chunk size if F-6 done.

---

## Sequencing, risk & rollback

- **Order:** A → B → C → D → E → F. A delivers the wedge; B makes regressions visible before the
  rest lands; C/D/E/F are independently shippable PRs once B's CI is green.
- **Risk:** Phase A changes runtime behavior (analytics now opt-in) — verify the live site still
  functions with consent denied. Phase E item 3 must honor the 7-day quarantine; do not fast-track a
  capacitor bump.
- **Rollback:** each phase is one PR; revert the PR. Phase A keeps GA4 reachable (just gated), so
  re-enabling is a consent default change, not a rebuild.

## Definition of Done for the whole effort (§10 release gate)
- [ ] Privacy boundary enforced; GATE-1…5 pass (Phase A).
- [ ] `npx eslint src` clean; CI green on `main`; tests cover stores, transforms, consent gate, and
      the QR wire format (Phases B, C).
- [ ] All §3.1 repo-health files present + accurate; metadata, topics, homepage, branch protection
      set (Phase D).
- [ ] No machine-path script; native-dir decision consistent; `npm audit` clean (quarantine-aware);
      real SemVer + CHANGELOG (Phase E).
- [ ] Every doc claim true and verifiable; no debug logging (Phase F).
- [ ] Playground refreshed/superseded once the boundary ships and a `docs/specs/` spec takes over.
