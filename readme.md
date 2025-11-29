# ChiroCard: The Digital Body Work Passport

**ChiroCard** is a privacy-first, local-first Progressive Web App (PWA) designed to be the definitive "Digital Passport" for your holistic health. It bridges the gap between you and your bodywork practitioners (Chiropractors, Massage Therapists, PTs) by giving you ownership of your own body history.

## 🚀 Core Concept

Unlike traditional medical records held by clinics, **ChiroCard is user-owned**. It lives on your device, encrypts your data locally, and serves as a "Passport" you present to any practitioner to give them instant, accurate context about your body.

### Key Features

*   **🪪 Digital Passport Profile:** A professional-grade, read-only view for practitioners. Instantly communicates:
    *   **Biometrics:** Height, Weight, Age, Activity Level, Occupation.
    *   **Clinical Data:** Medical History, Medications, Allergies, Mobility/ROM limitations.
    *   **Critical Alerts:** Contraindications (Red) and Focus Areas (Amber).
*   **📊 Gen Z Dashboard:** A modern, high-contrast "Bioluminescent" dark mode interface with a Bento Grid layout for intuitive insights.
*   **🔒 Local-First Privacy:** All data is stored locally on your device using IndexedDB (Dexie.js). No cloud servers, no tracking.
*   **🌍 Global Compliance:** Designed for HIPAA, GDPR, and CCPA adherence. Your data never leaves your device unless *you* export it.
*   **🤝 Practitioner Mode (Guest View):** A zero-friction flow where you hand your unlocked device to a practitioner to log a session without them needing an account or app.
*   **📅 Smart Scheduling:** Track appointments and assigned "Homework" (stretches, exercises).

## 🛠 Tech Stack

*   **Frontend:** React 18 + Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Dark Mode enforced)
*   **Database:** Dexie.js (IndexedDB wrapper)
*   **Icons:** Lucide React
*   **Routing:** React Router DOM

## 🏃‍♂️ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/chirocard.git
    cd chirocard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in Browser:**
    Navigate to `http://localhost:5173`

## 📱 Mobile-First Design

ChiroCard is designed as a PWA. For the best experience, use Chrome or Safari on mobile and "Add to Home Screen" to install it as a native-feeling app.

## 📄 License

MIT
