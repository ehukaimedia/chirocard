import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type BodyStatus } from "../components/BodyMap/BodyRegionSelector";
import { type Session } from "../db/db";

export type ViewMode = 'personal' | 'session' | 'guest';

interface SessionData {
    id: string;
    startTime: number;
    bodyMap: Record<string, BodyStatus>;
    bodyNotes: Record<string, string>;
    bodyLevels: Record<string, number>;
    bodyBadges: Record<string, string[]>;
    clientNotes: string;
    practitionerNotes: string;
    interventions: string[];
    practitionerId?: string;
    userSignature?: string | null;
    practitionerLevels?: Record<string, number>;
    practitionerBadges?: Record<string, string[]>;
    treatmentNotes?: Record<string, string>;
    serviceTags: string[];
    modalityTags: string[];
    findingTags: string[];
    recommendations: any[];
    postSessionLog: any[];
    date?: number;
    practitionerName?: string;
    practitionerClass?: string;
    signatureBase64?: string | null;
    isLocked?: boolean;
    createdAt?: number;
    appointmentId?: string;
}

interface AppState {
    viewMode: ViewMode;
    currentSession: SessionData | null;

    // Kiosk/Guest Mode State - REMOVED
    // scannedPatientData: any | null;
    // activePractitioner: any | null;
    // intakeData: any | null;
    // resumedSessionData: any | null;
    // activeAppointmentId: string | null;
    // activeSessionId: string | null;

    // Actions
    setViewMode: (mode: ViewMode) => void;
    setMode: (mode: ViewMode) => void; // Alias
    startSession: () => void;
    resumeSession: (session: Session) => void;
    updateSession: (data: Partial<SessionData>) => void;
    endSession: () => void;
    reset: () => void;

    // Settings
    calendarViewSpan: number;
    setCalendarViewSpan: (days: number) => void;
    defaultRoutineTime: string;
    setDefaultRoutineTime: (time: string) => void;
    routineTimeInterval: number;
    setRoutineTimeInterval: (interval: number) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            viewMode: 'personal',
            currentSession: null,
            scannedPatientData: null,
            activePractitioner: null,
            intakeData: null,
            resumedSessionData: null,
            activeAppointmentId: null,
            activeSessionId: null,

            calendarViewSpan: 30,
            defaultRoutineTime: "07:00",
            routineTimeInterval: 15,

            setViewMode: (mode) => set({ viewMode: mode }),
            setMode: (mode) => set({ viewMode: mode }), // Alias

            startSession: () => set({
                viewMode: 'session',
                currentSession: {
                    id: crypto.randomUUID(),
                    startTime: Date.now(),
                    bodyMap: {},
                    bodyNotes: {},
                    bodyLevels: {},
                    bodyBadges: {},
                    clientNotes: "",
                    practitionerNotes: "",
                    interventions: [],
                    userSignature: null,
                    practitionerLevels: {},
                    practitionerBadges: {},
                    treatmentNotes: {},
                    serviceTags: [],
                    modalityTags: [],
                    findingTags: [],
                    recommendations: [],
                    postSessionLog: []
                }
            }),

            resumeSession: (session: Session) => set({
                viewMode: 'session',
                currentSession: {
                    id: session.id,
                    startTime: session.date,
                    bodyMap: session.bodyMap || {},
                    bodyNotes: session.bodyNotes || {},
                    bodyLevels: session.bodyLevels || {},
                    bodyBadges: session.bodyBadges || {},
                    clientNotes: "",
                    practitionerNotes: session.notes || "",
                    interventions: session.interventions || [],
                    practitionerId: session.practitionerId,
                    userSignature: session.userSignature,
                    practitionerLevels: session.practitionerLevels || {},
                    practitionerBadges: session.practitionerBadges || {},
                    treatmentNotes: session.treatmentNotes || {},
                    serviceTags: session.serviceTags || [],
                    modalityTags: session.modalityTags || [],
                    findingTags: session.findingTags || [],
                    recommendations: session.recommendations || [],
                    postSessionLog: session.postSessionLog || []
                }
            }),

            updateSession: (data) => set((state) => ({
                currentSession: state.currentSession ? { ...state.currentSession, ...data } : null
            })),

            endSession: () => set({
                viewMode: 'personal',
                currentSession: null
            }),

            setCalendarViewSpan: (days) => set({ calendarViewSpan: days }),
            setDefaultRoutineTime: (time) => set({ defaultRoutineTime: time }),
            setRoutineTimeInterval: (interval) => set({ routineTimeInterval: interval }),

            reset: () => set({
                viewMode: 'personal',
                currentSession: null,
                calendarViewSpan: 30,
                defaultRoutineTime: "07:00",
                routineTimeInterval: 15,
            })
        }),
        {
            name: 'chirocard-storage',
            partialize: (state) => ({
                viewMode: state.viewMode,
                currentSession: state.currentSession,
                calendarViewSpan: state.calendarViewSpan,
                defaultRoutineTime: state.defaultRoutineTime,
                routineTimeInterval: state.routineTimeInterval
            })
        }
    )
);

