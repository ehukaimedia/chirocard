# ChiroCard

**Your Personalized Bodywork Journal.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live](https://img.shields.io/badge/Live-chirocard.com-blue)](https://chirocard.com)

"Chiro" means "hand". ChiroCard is your personalized journal for holistic body care — keeping track of all hands-on bodywork and serving as a bridge between patients and holistic practitioners (Chiropractors, Massage Therapists, Physical Therapists, Acupuncturists, and more) without centralized servers or accounts.

---

## Core Philosophy

- **Patient is the Database** — All health records, history, and preferences live on the patient's device. No cloud, no accounts, no lock-in.
- **Zero-Knowledge Privacy** — We do not store user data. Your health information never leaves your device.
- **Frictionless Practitioner Experience** — Practitioners use a stateless "Kiosk Mode" to view and chart sessions. No accounts, no login, no installation required.
- **Installable App (PWA)** — Works offline and installs to the home screen of any device (iOS, Android, Desktop) without an app store.

---

## Features

- **Bodywork Passport** — Carry your body history, session notes, and preferences on your own device
- **Smart Charting** — Interactive body map for logging complaints, adjustments, and treatment notes
- **Session History** — Permanent, local record of every adjustment, massage, and therapy session
- **Care Team** — Keep a list of your trusted practitioners and clinics
- **Clinic Search** — Address autofill powered by OpenStreetMap (no API key required)
- **Session Reports** — Print / PDF-ready summaries of any session
- **Calendar** — Track appointments and wellness habits with device calendar export
- **Journal** — Personal wellness notes and reflections
- **Own Your Data** — Export your full record to JSON anytime; nothing is stored on a server

---

## Workflow

1. Start a session and enter your current complaints (intake)
2. Chart the session on the interactive body map
3. Save it to your permanent, on-device history
4. Export a PDF-ready report — or your complete data — whenever you want

---

## Roadmap

- **Practitioner QR handoff** *(planned, not yet implemented)* — a stateless "kiosk" flow
  letting a walk-in practitioner view a patient's check-in and chart a session by scanning a
  QR code, with the record handed back to the patient's device. The local-first record,
  charting, and export above ship today; this cross-device handoff is the next milestone.

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 19, TypeScript, Vite 7 |
| **Styling** | Tailwind CSS, Framer Motion |
| **State** | Zustand |
| **Database** | Dexie.js (IndexedDB) · Capacitor SQLite (mobile) |
| **Routing** | React Router v7 |
| **Mobile** | Capacitor 8 (iOS / Android) |
| **Place Search** | Photon / OpenStreetMap (no API key required) |
| **Analytics** | Google Tag Manager / GA4 — opt-in only, off by default |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm start
```

---

## Environment Variables

No environment variables are required to run the app. Copy `.env.example` to `.env` and fill in as needed:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `VITE_GTM_ID` | **App only.** Google Tag Manager container for opt-in analytics. If unset, analytics is off. Loaded lazily and only after the user consents. |
| `GA4_PROPERTY_ID`, `GA4_MID`, `GSC_SITE` | **Tooling only** (Google Webmaster MCP CLI). Not read by the app build. |

---

## Mobile Development

Requires [Xcode](https://developer.apple.com/xcode/) (iOS) or [Android Studio](https://developer.android.com/studio) (Android).

```bash
# Build web app and sync to native projects
npm run mobile:build

# Open in Xcode
npm run mobile:open:ios

# Open in Android Studio
npm run mobile:open:android
```

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

---

## License

MIT — see [LICENSE](LICENSE)
