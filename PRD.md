# Product Requirements Document (PRD): ChiroCard
**Version:** 2.1 (Shipping Candidate)
**Status:** Web App Complete / Ready for Mobile Wrapping

## 1. Product Overview
**ChiroCard** is your **Bodywork Journal & Digital Passport** — a privacy-first, local-first application designed to be the ultimate companion for your holistic health journey. The core goal is to enable users to **journal all bodywork** and seamlessly **share this data with other practitioners** to ensure intelligent, continuity of care.

**Core Concept:**
*   **Bodywork Journal:** A comprehensive log of your body's history, mobility, and sessions. Owned by you ("My Journal").
*   **Bodywork Passport:** Your portable identity ("My Passport") containing your health context, which you "carry" to every practitioner to check in.

**Brand Identity:** The logo features stylized **Hawaiian Lomi Lomi Hands**, symbolizing the healing touch and connection between practitioner and user.
> [!IMPORTANT]
> **Asset Protection:** The existing logo file at `/public/icon.svg` is the definitive brand asset. **Do not redesign, alter, or replace this file.**

**Vision:** To facilitate **Intelligent Care** by empowering individuals to own their holistic wellness data and simplifying the communication loop between patients and providers.

**Key Differentiator:** "Local-First" architecture ensuring zero-knowledge privacy. This is a **User-Owned** journal, distinct from medical records held by clinics.

## 2. Market Analysis & Need
*   **The Gap:** Current market solutions are dominated by "Practice Management Software" (for clinics) or generic "Fitness Trackers" (steps/calories).
*   **The Need:** There is no dedicated "Personal Bodywork Record" for users to track their own progress across multiple modalities.
*   **Opportunity:** A user-centric tool that bridges the gap between different holistic practitioners, ensuring the user is the central repository of their own body history.

## 3. Goals & Objectives
*   **Build a Modern Bodywork Journal:** Create a beautiful, high-performance web application that makes tracking bodywork sessions as intuitive as a daily diary.
*   **Establish the Bodywork Passport:** Standardize the "Check-In" workflow so users can easily share their health context ("My Passport") with any practitioner via a simple QR scan.
*   **Visualize Wellness:** Move beyond text logs to intuitive button-style body maps and calendar views that show progress over time.
*   **Ship Native Apps:** Deploy to Apple App Store and Google Play Store using Capacitor to ensure the passport is always in the user's pocket.

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

### 6.6. Profile ("Bodywork Passport")
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
*   **Philosophy:** "Collaborative Journaling" — A simple, physical hand-off of the device from User to Practitioner. No complex syncing or QR codes required.

*   **User Journey (The Traveler):**
    1.  **Passport Creation:** User creates their profile ("Bodywork Passport") on first launch.
    2.  **Journal Entry (Intake):** Before a session, the user creates a "Draft Entry" in their journal, mapping current issues and notes.
    3.  **Hand-Off:** The user clicks "Start Session" and hands their unlocked device to the practitioner.

*   **Practitioner Journey (The Guide):**
    1.  **Review:** Practitioner reviews the user's journal entry on the user's device.
    2.  **Treat & Log:** Practitioner performs the bodywork session and logs SOAP notes directly on the device.
    3.  **Verify & Stamp:** Practitioner verifies the session ("Digitally Verified") and hands the device back to the user.
    4.  **Completion:** The session is saved locally.

*   **Compliance:** All data remains on the user's device. No external transmission occurs.

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
