import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type BodyStatus } from "../components/BodyMap/BodyRegionSelector";

export type ViewMode = 'personal' | 'session';

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
}

interface AppState {
    viewMode: ViewMode;
    currentSession: SessionData | null;

    // Actions
    setViewMode: (mode: ViewMode) => void;
    startSession: () => void;
    updateSession: (data: Partial<SessionData>) => void;
    endSession: () => void;
    reset: () => void;

    // Settings
    calendarViewSpan: number;
    setCalendarViewSpan: (days: number) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            viewMode: 'personal',
            currentSession: null,
            calendarViewSpan: 30,

            setViewMode: (mode) => set({ viewMode: mode }),

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
                    interventions: []
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

            reset: () => set({
                viewMode: 'personal',
                currentSession: null,
                calendarViewSpan: 30
            })
        }),
        {
            name: 'chirocard-storage',
            partialize: (state) => ({
                viewMode: state.viewMode,
                currentSession: state.currentSession,
                calendarViewSpan: state.calendarViewSpan
            })
        }
    )
);

