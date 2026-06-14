# Security Policy

ChiroCard stores personal health information locally on the user's device.
We take security and privacy seriously and appreciate responsible disclosure.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Report privately, via either:

- **Email:** [aloha@ehukaimedia.com](mailto:aloha@ehukaimedia.com) — put
  `SECURITY: ChiroCard` in the subject.
- **GitHub:** the repository's **Security → Report a vulnerability** (private
  vulnerability reporting), if enabled.

Please include:

- A description of the issue and its impact (especially any path by which health
  data could leave the device, or any unexpected network egress).
- Steps to reproduce, affected version/commit, and environment.
- A proof-of-concept if you have one.

## What to expect

- Acknowledgement within **5 business days**.
- A fix or mitigation plan for confirmed issues, and credit in the release notes
  if you'd like it.

Please give us reasonable time to remediate before any public disclosure.

## Scope

Most valuable reports concern: unexpected data egress (anything not in
[`src/constants/egress.ts`](src/constants/egress.ts) / the CSP in
[`public/_headers`](public/_headers)), CSP bypasses, the consent gate
([`src/lib/consent.ts`](src/lib/consent.ts)), data-loss in the Dexie migration
or export/import paths, and dependency/supply-chain issues.

## Supported versions

Security fixes are applied to the latest released version on `main`.
