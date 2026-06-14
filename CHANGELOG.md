# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-06-13

First tagged release, hardening the repo to the Ehukai OSS standard.

### Added
- Opt-in analytics consent: a consent banner and a single source of truth for
  consent (`src/lib/consent.ts`); analytics now loads lazily only after the user
  agrees.
- A declared data-egress allowlist (`src/constants/egress.ts`) and a
  Content-Security-Policy (`public/_headers`) that restricts outbound origins.
- Test suite (Vitest): consent-gate tests, the Dexie v17 migration gate, and the
  export/import backup round-trip.
- Continuous integration (GitHub Actions): lint + test + build on every push/PR.
- Repo-health docs: `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and
  issue / pull-request templates.

### Changed
- Google Tag Manager is now loaded from the `VITE_GTM_ID` build env instead of a
  hardcoded container, and only after consent.
- Privacy page, README, and PRD now describe the actual data-egress boundary
  precisely (records stay on-device; opt-in analytics and address lookups are the
  only outbound calls).
- Version set to `1.0.0` (was `0.0.0`).
- `android/` and `ios/` (Capacitor native projects) are now correctly tracked —
  they were committed but mistakenly git-ignored. Only the separate Expo app
  (`mobile/`) is ignored.

### Removed
- The unimplemented QR check-in/handoff workflow and its unused dependencies
  (`html5-qrcode`, `qrcode.react`, `pako`) plus dead code (`compression.ts`); the
  QR handoff is tracked as a future feature.
- The public CORS proxy (`googleMaps.ts` / allorigins.win) — dead code that was a
  third-party-in-the-path risk.
- Device geolocation (GPS) from address search; only the typed query is sent to
  Photon now.
- The unused `react-signature-canvas` dependency.
- `scripts/setup_chirocard_tags.js` — operational tooling that imported a
  hardcoded absolute path and could not run on a clean clone.

### Security
- Removed an always-on, hardcoded third-party tag-manager surface from pages
  rendering health data; analytics is consent-gated and payloads are minimized
  (no practitioner names, routine titles, or record ids are sent).
- Added a CSP, security headers, and `Permissions-Policy: geolocation=()`.
- Reduced `npm audit` findings from 15 (12 high) to 4 by updating vulnerable
  build/runtime deps (vite, rollup→4.61.0, esbuild, postcss, tar, @capacitor/cli,
  react-router-dom, @xmldom/xmldom, …). The 4 remaining are dev/build-time only
  (the esbuild dev-server advisory and its chain) and require breaking major
  bumps; they are tracked via Dependabot and do not affect the production build.
- Added Dependabot for npm + GitHub Actions updates.
