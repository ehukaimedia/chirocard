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

### For Patients
- **Bodywork Passport** — Carry your body history, session notes, and preferences in your pocket
- **One-Tap Check-In** — Start a session and generate a QR code to instantly share your status with your practitioner
- **Session History** — Permanent record of every adjustment, massage, and therapy session
- **Care Team** — Automatically build a list of trusted practitioners just by scanning their session records
- **Calendar** — Track appointments and wellness habits with device calendar export
- **Journal** — Personal wellness notes and reflections

### For Practitioners
- **Kiosk Mode** — Dedicated charting interface for tablets and phones
- **Instant Intake** — Scan a patient's QR code to instantly load their profile and current complaints
- **Smart Charting** — Interactive body map for logging adjustments and treatment notes
- **Auto-Add** — Your clinic info is automatically saved to the patient's phone when they scan your session record
- **Clinic Search** — Address autofill powered by OpenStreetMap (no API key required)
- **Session Reports** — Professional PDF-ready summaries to share with patients

---

## Workflow

1. **Patient** starts a session on their phone and enters current complaints
2. **Patient** shows the "Check-In" QR code to the Practitioner
3. **Practitioner** scans the code with the Kiosk (Tablet/Phone)
4. **Practitioner** performs the treatment and charts it in the Kiosk
5. **Practitioner** hits "Finish" to generate a session QR code
6. **Patient** scans the session QR code to save the record and auto-add the practitioner to their team

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
| **QR** | html5-qrcode · qrcode.react · pako compression |

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

No environment variables are required to run the app. The following are optional analytics integrations — copy `.env.example` to `.env` and fill in as needed:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `GTM_ID` | Google Tag Manager container ID |
| `GA4_PROPERTY_ID` | Google Analytics 4 property |
| `GA4_MID` | GA4 measurement ID |
| `GSC_SITE` | Google Search Console property (use `sc-domain:yourdomain.com`) |

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
