import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { type BodyStatus } from "../components/BodyMap/BodyRegionSelector";
import { type Session, type BodyworkRoutine, type PostSessionEntry } from "../db/db";

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
    recommendations: BodyworkRoutine[];
    postSessionLog: PostSessionEntry[];
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
    routineBadges: Record<string, string[]>;
    setRoutineBadges: (badges: Record<string, string[]>) => void;

    // Notification Settings
    notificationSettings: {
        enabled: boolean;
        journalReminderEnabled: boolean;
        journalReminderTime: string;
        routineRemindersEnabled: boolean;
    };
    updateNotificationSettings: (settings: Partial<AppState['notificationSettings']>) => void;
}

function createDebouncedLocalStorage(delay = 400) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: { name: string; value: string } | null = null;

    const flush = () => {
        if (!pending) return;
        localStorage.setItem(pending.name, pending.value);
        pending = null;
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('pagehide', flush);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') flush();
        });
    }

    return {
        getItem: (name: string) => localStorage.getItem(name),
        setItem: (name: string, value: string) => {
            pending = { name, value };
            clearTimeout(timer);
            timer = setTimeout(flush, delay);
        },
        removeItem: (name: string) => {
            pending = null;
            clearTimeout(timer);
            localStorage.removeItem(name);
        },
    };
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            viewMode: 'personal',
            currentSession: null,
            calendarViewSpan: 30,
            defaultRoutineTime: "07:00",
            routineTimeInterval: 15,
            routineBadges: {
                relief: ["Ice Bath", "Sauna", "Red Light", "Heat", "Stretch", "Foam Roll"],
                movement: ["Walk", "Run", "Yoga", "Mobility", "Swim", "Gym"],
                lifestyle: ["Breathwork", "Meditate", "Journal", "Hydrate", "Sleep", "Nature"],
                custom: ["Surfing", "Golfing", "Bowling", "Tennis", "Hiking", "Cycling", "Swimming", "Workout", "Pilates", "Dance"]
            },
            notificationSettings: {
                enabled: true,
                journalReminderEnabled: true,
                journalReminderTime: "20:00",
                routineRemindersEnabled: true
            },

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
            setRoutineBadges: (badges) => set({ routineBadges: badges }),
            updateNotificationSettings: (settings) => set((state) => ({
                notificationSettings: { ...state.notificationSettings, ...settings }
            })),

            reset: () => set({
                viewMode: 'personal',
                currentSession: null,
                calendarViewSpan: 30,
                defaultRoutineTime: "07:00",
                routineTimeInterval: 15,
                routineBadges: {
                    relief: ["Ice Bath", "Sauna", "Red Light", "Heat", "Stretch", "Foam Roll"],
                    movement: ["Walk", "Run", "Yoga", "Mobility", "Swim", "Gym"],
                    lifestyle: ["Breathwork", "Meditate", "Journal", "Hydrate", "Sleep", "Nature"],
                    custom: ["Surfing", "Golfing", "Bowling", "Tennis", "Hiking", "Cycling", "Swimming", "Workout", "Pilates", "Dance"]
                },
                notificationSettings: {
                    enabled: true,
                    journalReminderEnabled: true,
                    journalReminderTime: "20:00",
                    routineRemindersEnabled: true
                }
            })
        }),
        {
            name: 'chirocard-storage',
            storage: createJSONStorage(() => createDebouncedLocalStorage()),
            partialize: (state) => ({
                viewMode: state.viewMode,
                currentSession: state.currentSession,
                calendarViewSpan: state.calendarViewSpan,
                defaultRoutineTime: state.defaultRoutineTime,
                routineTimeInterval: state.routineTimeInterval,
                routineBadges: state.routineBadges,
                notificationSettings: state.notificationSettings
            })
        }
    )
);

