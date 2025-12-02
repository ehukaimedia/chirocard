# Product Requirements Document (PRD): ChiroCard
**Version:** 2.1 (Shipping Candidate)
**Status:** Web App Complete / Ready for Mobile Wrapping

## 1. Product Overview
**ChiroCard** is a "Universal Body Record" — a privacy-first, local-first application that serves as a collaborative holistic health wallet between users and their bodywork practitioners (Chiropractors, Massage Therapists, PTs, Osteopaths).

**Meaning of "Chiro":** The prefix "Chiro-" comes from the Greek word *cheir*, meaning **"Hand"**. ChiroCard is for anyone who receives care from practitioners who use their hands to improve holistic body wellness.

**Brand Identity:** The logo features stylized **Hawaiian Lomi Lomi Hands**, symbolizing the healing touch and connection between practitioner and user.
> [!IMPORTANT]
> **Asset Protection:** The existing logo file at `/public/icon.svg` is the definitive brand asset. **Do not redesign, alter, or replace this file.**

**Vision:** To empower individuals to own their holistic wellness data and facilitate seamless, data-driven communication with their care providers, without compromising privacy.

**Key Differentiator:** "Local-First" architecture ensuring zero-knowledge privacy. This is a **User-Owned** record, distinct from medical records held by clinics.

## 2. Market Analysis & Need
*   **The Gap:** Current market solutions are dominated by "Practice Management Software" (for clinics) or generic "Fitness Trackers" (steps/calories).
*   **The Need:** There is no dedicated "Personal Bodywork Record" for users to track their own progress across multiple modalities.
*   **Opportunity:** A user-centric tool that bridges the gap between different holistic practitioners, ensuring the user is the central repository of their own body history.

## 3. Goals & Objectives
*   **Build a Robust PWA:** Create a high-performance, offline-capable web application that feels native.
*   **Enhance Collaboration:** Streamline the "hand-off" experience between user (intake) and practitioner (session log).
*   **Visualize Wellness:** Move beyond text logs to intuitive button-style body maps and calendar views.
*   **Ship Native Apps:** Deploy to Apple App Store and Google Play Store using Capacitor.

## 4. Global Compliance & Privacy (Security by Design)
*   **Local-First Architecture:** Data is stored exclusively on the user's device (IndexedDB via Dexie.js). No personal health information (PHI) is transmitted to cloud servers.
*   **HIPAA (USA):** As a user-owned Personal Health Record (PHR), ChiroCard empowers users to share their own data.
*   **GDPR (Europe) & CCPA (California):** Users have full control, access, and erasure rights over their local data.
*   **Encryption:** Data is stored locally; future cloud sync will use E2EE.

## 5. Target Audience
*   **Primary:** Individuals ("Users") who regularly see bodywork practitioners.
*   **Secondary:** Independent holistic practitioners who want to encourage clients to take ownership of their wellness journey.

## 6. Core Features (Implemented)

### 6.1. Dashboard
*   **"Bento Grid" Layout:** High-contrast, dark mode aesthetic ("Bioluminescent Nature").
*   **Status Indicators:** "Active Care Plan" status, next appointment, daily habits count.
*   **Quick Actions:** Start Session, View History, View Calendar.
*   **Persistent Check-In QR:** Prominent "Show Check-In QR" button appears if a session is ready for check-in but hasn't been scanned, ensuring easy access.
*   **Recent Activity:** List of recent sessions.

### 6.2. Calendar & Scheduling
*   **Visual Month View:** Interactive calendar showing appointments (blue dots) and completed habits (green dots).
*   **Appointment Management:** Add, edit, and delete appointments.
*   **Device Integration:** "Add to Calendar" button exports appointments as `.ics` files for native device calendar integration.
*   **Habit Tracking:** Track and check off daily holistic habits (stretches, icing, etc.).

### 6.3. User Mode (Intake)
*   **Body Region Selector:** Simple toggle interface (Normal vs. Issue) for body parts.
*   **Notes:** Add specific notes for the practitioner.
*   **Hand-off Mode:** Securely transition to Practitioner Mode.

### 6.4. Practitioner Mode ("Guest Session")
*   **Zero-Friction Workflow:** Designed for the practitioner to use on the user's device.
*   **Read-Only Intake:** View user's reported issues and notes.
*   **Treatment Log:** Practitioner adds their own notes and marks treated areas.
*   **Sign-off:** "Sign" button locks the session and generates a report.

### 6.5. Session History & Reports
*   **Timeline:** Chronological list of all past sessions.
*   **Search & Filter:** Find sessions by practitioner name or notes.
*   **Session Report:** Detailed view of a completed session.
*   **PDF Export:** Generate professional PDF reports for insurance or personal records.

### 6.6. Profile ("The Passport")
*   **Inline Creation:** Profile creation is integrated directly into the onboarding "Welcome Modal". Users must complete their profile before accessing the app.
*   **Validation:** Critical fields (Name, DOB, Height, Weight, Phone) are strictly enforced with visual cues (red highlights, asterisks) to ensure data validity.
*   **User Details:** Name, biometrics, and preferences. Address auto-fill via Google Places.
*   **Practitioner List:** Manage saved practitioners. Add new practitioners instantly using Google Places search.

### 6.7. Settings & Data Management
*   **Dedicated Settings Page:** Central location for app configuration.
*   **ChiroCard Brain:** "Smart AI Export" feature that processes raw data into a clean, human-readable, and AI-contextualized JSON format for intelligent insights.
*   **Data Backup & Restore:** Export full database to JSON and restore from backup.
*   **Persistent Storage Request:** Automatically requests browser persistence to prevent data eviction.

## 7. Workflow & Data Exchange (The "Blueprint")
*   **Philosophy:** "The Handshake" — A seamless, offline-capable context transfer between User and Practitioner via QR codes.
*   **User Journey:**
    1.  **Passport Creation:** Validated profile setup on first launch.
    2.  **Intake:** User maps body issues and subjective data.
    3.  **Check-In:** Session locks, generating a secure QR code.
*   **Practitioner Journey (Kiosk Mode):**
    1.  **Scan:** Practitioner scans User's QR code.
    2.  **Ingest:** Data is instantly imported to Practitioner's device (creating a Guest Profile if needed).
    3.  **Treat & Log:** Practitioner adds SOAP notes and signs off.
*   **Compliance:** All exchanges happen locally (camera scan) or via user-initiated export, ensuring HIPAA/GDPR compliance by design.

## 7. Mobile Deployment Strategy
**Framework:** [Capacitor](https://capacitorjs.com/) (Installed & Configured)
**Goal:** Wrap the existing React web application into native iOS and Android apps.
**Current Status:**
*   Capacitor Core, CLI, iOS, and Android platforms installed.
*   Essential plugins (App, Haptics, Keyboard, Status Bar) installed.
*   App icons and splash screens generated for both platforms.

### 7.1. Platform Targets
*   **iOS (Apple App Store):**
    *   Requires Xcode (macOS).
    *   Target: iPhone (primary).
*   **Android (Google Play Store):**
    *   Requires Android Studio.
    *   Target: Android Phones.

### 7.2. Development Workflow
*   **"Mac-Only" Approach:** The solo developer will use a Mac to build and sign apps for both platforms.
*   **Build Process:**
    1.  `npm run build` (Vite build)
    2.  `npx cap sync` (Copy web assets to native projects)
    3.  `npx cap open ios` / `npx cap open android` (Build & Run)

## 8. Technical Stack
*   **Frontend:** React 18, Vite, TypeScript.
*   **Styling:** Tailwind CSS, Framer Motion.
*   **State/Data:** Dexie.js (IndexedDB).
*   **Icons:** Lucide React.
*   ***New* Mobile Wrapper:** Capacitor (Core, iOS, Android).

## 10. Future Roadmap
*   **Cloud Sync (Optional):** Encrypted backup and multi-device sync.
*   **Practitioner Portal:** Dedicated web portal for practitioners to view client data (if shared).
*   **AI Body Architect:** Advanced integration of "ChiroCard Brain" for personalized stretching/recovery protocols and predictive health insights.
