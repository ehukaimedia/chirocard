import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AppMode = 'user' | 'guest';

import { type BodyStatus } from "../components/BodyMap/BodyRegionSelector";

// Full practitioner type for PDF generation
interface StoredPractitioner {
    id: string;
    name: string;
    role: string;
    clinicName?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
}

interface AppState {
    mode: AppMode;
    activeSessionId: string | null;
    activeAppointmentId?: string | null; // Track source appointment
    activePractitioner: StoredPractitioner | null;
    intakeData: {
        bodyMap: Record<string, BodyStatus>;
        bodyNotes: Record<string, string>;
        bodyLevels: Record<string, number>;
        bodyBadges: Record<string, string[]>;
        notes: string;
        userSignature?: string; // User's signature (DataURL or JSON string of paths)
        startTime?: number; // Timestamp when intake started
        isCheckInReady?: boolean; // Flag if user has reached the QR code stage
    } | null;
    resumedSessionData: any | null; // Data for resuming a session
    scannedPatientData: any | null; // Data from Patient QR Scan (Profile + Intake)

    // Actions
    setMode: (mode: AppMode) => void;
    setScannedPatientData: (data: any) => void;
    startSession: (sessionId: string, practitioner?: StoredPractitioner, intakeData?: { bodyMap: Record<string, BodyStatus>; bodyNotes: Record<string, string>; bodyLevels: Record<string, number>; bodyBadges: Record<string, string[]>; notes: string; userSignature?: string; startTime?: number; isCheckInReady?: boolean }, appointmentId?: string) => void;
    resumeSession: (session: any) => void;
    updateIntakeData: (data: { bodyMap?: Record<string, BodyStatus>; bodyNotes?: Record<string, string>; bodyLevels?: Record<string, number>; bodyBadges?: Record<string, string[]>; notes?: string; isCheckInReady?: boolean; userSignature?: string }) => void;
    clearIntakeData: () => void;
    endSession: () => void;

    // Settings
    calendarViewSpan: number;
    setCalendarViewSpan: (days: number) => void;

    // System
    reset: () => void;
}

export type { StoredPractitioner };

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            mode: 'user',
            activeSessionId: null,
            activeAppointmentId: null,
            activePractitioner: null,
            intakeData: null,
            resumedSessionData: null,

            setMode: (mode) => set({ mode }),
            setScannedPatientData: (data) => set({ scannedPatientData: data }),

            startSession: (sessionId, practitioner, intakeData, appointmentId) => set({
                activeSessionId: sessionId,
                activeAppointmentId: appointmentId || null,
                mode: 'guest',
                activePractitioner: practitioner || null,
                intakeData: intakeData || null,
                resumedSessionData: null
            }),

            resumeSession: (session) => set({
                activeSessionId: session.id,
                mode: 'guest',
                activePractitioner: {
                    id: session.practitionerId,
                    name: session.practitionerName,
                    role: session.practitionerClass
                },
                // Populate intake data from session snapshot
                intakeData: {
                    bodyMap: session.bodyMap || {},
                    bodyNotes: session.bodyNotes || {},
                    bodyLevels: session.bodyLevels || {},
                    bodyBadges: session.bodyBadges || {},
                    notes: "", // Intake notes might not be in session snapshot, or we could assume session.notes? No, session.notes are practitioner notes.
                    userSignature: session.userSignature,
                    isCheckInReady: false
                },
                // Store the full session to populate practitioner fields
                resumedSessionData: session
            }),

            updateIntakeData: (data) => set((state) => ({
                intakeData: {
                    bodyMap: {},
                    bodyNotes: {},
                    bodyLevels: {},
                    bodyBadges: {},
                    notes: "",
                    ...state.intakeData,
                    ...data,
                    startTime: state.intakeData?.startTime || Date.now()
                }
            })),

            clearIntakeData: () => set({ intakeData: null }),

            endSession: () => set({ activeSessionId: null, activeAppointmentId: null, mode: 'user', activePractitioner: null, intakeData: null, resumedSessionData: null, scannedPatientData: null }),

            calendarViewSpan: 30, // Default to 30 days
            setCalendarViewSpan: (days) => set({ calendarViewSpan: days }),

            reset: () => set({
                mode: 'user',
                activeSessionId: null,
                activeAppointmentId: null,
                activePractitioner: null,
                intakeData: null,
                resumedSessionData: null,
                scannedPatientData: null,
                calendarViewSpan: 30
            }),
        }),
        {
            name: 'chirocard-storage',
            partialize: (state) => ({
                activeSessionId: state.activeSessionId,
                activeAppointmentId: state.activeAppointmentId,
                activePractitioner: state.activePractitioner,
                mode: state.mode,
                intakeData: state.intakeData,
                resumedSessionData: state.resumedSessionData,
                scannedPatientData: state.scannedPatientData,
                calendarViewSpan: state.calendarViewSpan
            }),
        }
    )
);
