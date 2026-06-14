<!-- Thanks for contributing to ChiroCard! -->

## What & why

<!-- What does this change and why? Link any related issue (e.g. Closes #12). -->

## How verified

<!-- Commands you ran + results, and a manual smoke test for UI changes. -->
- [ ] `npm run lint` (0 errors)
- [ ] `npm test` (all pass)
- [ ] `npm run build` (green)
- [ ] Manually smoke-tested affected screens

## Checklist

- [ ] Branched off `main`; focused on one concern.
- [ ] No new network egress — or, if added, the origin is in `EGRESS_ALLOWLIST`,
      the CSP (`public/_headers`), **and** the Privacy page (all in this PR).
- [ ] No record content / record-derived identifiers sent to analytics.
- [ ] Dexie schema change (if any) has a migration + migration test.
- [ ] No secrets, real patient data, debug logging, or dead code in the diff.
- [ ] New/upgraded deps respect the 7-day quarantine and are pinned.
- [ ] `CHANGELOG.md` updated for any user-facing change.
