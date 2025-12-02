# ChiroCard Lite

**Your Digital Body Work Passport.**

ChiroCard is a privacy-first, local-first web application that empowers patients to own their health data. It serves as a bridge between patients and holistic practitioners (Chiropractors, Massage Therapists, PTs, etc.), enabling seamless data sharing without centralized servers or accounts.

## Core Philosophy

*   **Patient is the Database**: All health records, history, and preferences live on the patient's device (indexedDB).
*   **Zero-Knowledge Cloud**: We do not store user data. Syncing is optional and user-controlled.
*   **Frictionless Practitioner Experience**: Practitioners use a stateless "Kiosk Mode" to view and chart sessions. No accounts, no login, no installation required.

## Key Features

### For Patients
*   **Digital Passport**: Carry your MRI results, body history, and preferences in your pocket.
*   **One-Tap Check-In**: Start a session and generate a QR code to instantly share your status with your practitioner.
*   **Session History**: Keep a permanent record of every adjustment, massage, and therapy session.
*   **Care Team**: Automatically build a list of your trusted practitioners just by scanning their session records.

### For Practitioners
*   **Kiosk Mode**: A dedicated interface for tablets and phones to chart sessions.
*   **Instant Intake**: Scan a patient's QR code to instantly load their profile and current complaints.
*   **Smart Charting**: Interactive body map for logging adjustments and notes.
*   **Auto-Add**: Your contact info (Name, Clinic) is automatically saved to the patient's phone when they scan your session record.
*   **Google Places Integration**: Accurate clinic address auto-fill.
*   **Web Share**: Easily text or email session records to patients who can't scan immediately.

## Workflow

1.  **Patient** starts a session on their phone and enters current complaints.
2.  **Patient** shows the "Check-In" QR code to the Practitioner.
3.  **Practitioner** scans the code with the **Kiosk** (Tablet/Phone).
4.  **Practitioner** performs the treatment and charts it in the Kiosk.
5.  **Practitioner** hits "Finish" to generate a session QR code.
6.  **Patient** scans the session QR code to save the record and automatically add the practitioner to their team.

## Tech Stack

*   **Frontend**: React, TypeScript, Vite, Tailwind CSS
*   **Database**: Dexie.js (IndexedDB wrapper) for local storage.
*   **State Management**: Zustand
*   **QR/Scanning**: `html5-qrcode`, `qrcode.react`
*   **Compression**: `pako` (zlib) for efficient QR data transfer.

## Development

### Install Dependencies
```bash
npm install
```

### Run Local Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## License

Proprietary. All rights reserved.
