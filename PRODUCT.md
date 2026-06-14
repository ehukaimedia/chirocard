# Product

## Register

product

## Users

**Primary — Patients receiving hands-on bodywork.** People who see one or more
manual-therapy practitioners (chiropractors, massage therapists, physical
therapists, acupuncturists) and want to *own* a single, portable record of that
care. Their context: at home between visits (logging complaints, reviewing
history, tracking wellness routines) and in the waiting room or treatment room
(pulling up their record for a practitioner). They are not technical and may be
older; many are managing pain or recovery, so the emotional baseline is "tired
of repeating my history and tired of not owning my data."

**Secondary — Practitioners charting a session.** A walk-in or regular
practitioner who needs to view the patient's current complaints and record what
they did — with **zero onboarding** (no account, no install, stateless kiosk
use). Their context is time-pressured and in-clinic.

The job to be done: *"Keep one trustworthy record of my body's care that I
control, and let a practitioner see and add to it without either of us signing
up for anything."*

## Product Purpose

ChiroCard is a **local-first bodywork passport**. Every health record lives in
the patient's device (IndexedDB); there are no accounts and no central server.
It exists because manual-therapy care is fragmented across siloed clinics and
patients never own the through-line. Success looks like: a patient who, months
later, still has a complete, portable, trustworthy record they can read and hand
off — and a practitioner who can read and contribute to it in seconds without
friction. The product's credibility *is* its privacy posture: if the data
weren't genuinely the patient's and genuinely local, the product would have no
reason to exist.

## Brand Personality

**Calm, trustworthy, clinical-grade.** Quiet confidence — the feeling of a
well-kept medical record, not a consumer wellness toy and not an intimidating
hospital system. Voice: plain-spoken, reassuring, never alarmist or hypey;
explains rather than markets. Emotional goal: the user should feel *in control
and at ease* — their health history is handled, private, and theirs. Restraint
over decoration: the interface earns trust by being legible and predictable, not
by being flashy.

## Anti-references

- **Cold, dense clinical EHR** (Epic / MyChart-style enterprise medical
  software): cramped data tables, gray-on-gray forms, jargon, dropdown mazes,
  and an intimidating, institutional feel. ChiroCard must be clinical-grade in
  *trust* without being clinical in *coldness* — it is the patient's calm,
  legible record, not a hospital back-office tool.

## Design Principles

1. **Your data, visibly yours.** The local-first, no-account promise should be
   *felt* in the UI, not buried in a policy page — ownership, export, and "this
   never leaves your device" are first-class, legible affordances. Practice what
   you preach.
2. **Calm over clever.** Reduce anxiety for users who are often in pain or
   managing recovery. Prefer quiet hierarchy, generous space, and predictable
   patterns over visual noise, motion for its own sake, or attention-grabbing
   flourishes.
3. **Zero-onboarding handoff.** Any practitioner-facing flow must be usable cold
   — no account, no learning curve. Optimize the in-clinic moment for speed and
   obviousness.
4. **Trust through clarity, not coldness.** Earn clinical-grade credibility with
   legible typography, honest states, and accurate information — while staying
   warm and human, never an EHR.
5. **Always works, offline-first.** No dead ends when there's no network. The
   record opens, reads, and exports locally, every time.

## Accessibility & Inclusion

Target **WCAG 2.2 AA**. Concretely: sufficient color contrast (mind the
emerald-on-light palette for text), full keyboard navigation, meaningful labels
and focus states, and honoring `prefers-reduced-motion` (relevant given the
current glow/animation usage). Account for **older patients and users managing
pain or limited dexterity**: comfortable tap targets, readable default type
sizes, and forgiving interactions. Avoid conveying status by color alone
(important for the body-map / status indicators).
