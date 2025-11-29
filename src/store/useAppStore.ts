import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AppMode = 'user' | 'guest';

import { type BodyStatus } from "../components/BodyMap/BodyRegionSelector";

interface AppState {
    mode: AppMode;
    theme: 'dark' | 'light';
    activeSessionId: string | null;
    activePractitioner: { id: string; name: string; role: string } | null;
    intakeData: {
        bodyMap: Record<string, BodyStatus>;
        bodyNotes: Record<string, string>;
        notes: string;
    } | null;

    // Actions
    setMode: (mode: AppMode) => void;
    setTheme: (theme: 'dark' | 'light') => void;
    startSession: (sessionId: string, practitioner?: { id: string; name: string; role: string }, intakeData?: { bodyMap: Record<string, BodyStatus>; bodyNotes: Record<string, string>; notes: string }) => void;
    updateIntakeData: (data: { bodyMap: Record<string, BodyStatus>; bodyNotes: Record<string, string>; notes: string }) => void;
    endSession: () => void;
    toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            mode: 'user',
            theme: 'dark', // Default to "Bioluminescent"
            activeSessionId: null,
            activePractitioner: null,
            intakeData: null,

            setMode: (mode) => set({ mode }),
            setTheme: (theme) => set({ theme }),

            startSession: (sessionId, practitioner, intakeData) => set({
                activeSessionId: sessionId,
                mode: 'guest',
                activePractitioner: practitioner || null,
                intakeData: intakeData || null
            }),

            updateIntakeData: (data) => set((state) => ({
                intakeData: { ...state.intakeData, ...data }
            })),

            endSession: () => set({ activeSessionId: null, mode: 'user', activePractitioner: null, intakeData: null }),

            toggleTheme: () => set((state) => ({
                theme: state.theme === 'dark' ? 'light' : 'dark'
            })),
        }),
        {
            name: 'chirocard-storage',
            partialize: (state) => ({
                theme: state.theme,
                activeSessionId: state.activeSessionId,
                activePractitioner: state.activePractitioner,
                mode: state.mode,
                intakeData: state.intakeData
            }),
        }
    )
);
