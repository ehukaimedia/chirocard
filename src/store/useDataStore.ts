
import { create } from 'zustand';
import { database } from '../db/storage';
import type { Session, Appointment, BodyworkRoutine, RoutineCompletion, JournalEntry, Practitioner, UserProfile } from '../db/db';

interface DataState {
    initialized: boolean;
    user: UserProfile | null;
    sessions: Session[];
    appointments: Appointment[];
    routines: BodyworkRoutine[];
    routineCompletions: RoutineCompletion[];
    journalEntries: JournalEntry[];
    practitioners: Practitioner[];

    isLoading: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;

    // User
    saveUser: (user: UserProfile) => Promise<void>;

    // Practitioners
    savePractitioner: (p: Practitioner) => Promise<void>;
    deletePractitioner: (id: string) => Promise<void>;

    // Sessions
    saveSession: (s: Session) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;

    // Appointments
    saveAppointment: (a: Appointment) => Promise<void>;
    deleteAppointment: (id: string) => Promise<void>;

    // Routines
    saveRoutine: (r: BodyworkRoutine) => Promise<void>;
    deleteRoutine: (id: string) => Promise<void>;

    // Routine Completions
    saveRoutineCompletion: (c: RoutineCompletion) => Promise<void>;
    deleteRoutineCompletion: (id: string) => Promise<void>;

    // Journal
    saveJournalEntry: (j: JournalEntry) => Promise<void>;
    deleteJournalEntry: (id: string) => Promise<void>;

    // Reset
    clearData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
    initialized: false,
    user: null,
    sessions: [],
    appointments: [],
    routines: [],
    routineCompletions: [],
    journalEntries: [],
    practitioners: [],
    isLoading: true,
    error: null,

    initialize: async () => {
        try {
            set({ isLoading: true });

            // Init DB Connection
            await database.init();
            const db = database.get();

            // Fetch All Data Parallel
            const [
                user,
                sessions,
                appointments,
                routines,
                completions,
                journal,
                practitioners
            ] = await Promise.all([
                db.getUser(),
                db.getSessions(),
                db.getAppointments(),
                db.getRoutines(),
                db.getRoutineCompletions(),
                db.getJournalEntries(),
                db.getPractitioners()
            ]);

            set({
                initialized: true,
                isLoading: false,
                user: user || null,
                sessions,
                appointments,
                routines,
                routineCompletions: completions,
                journalEntries: journal,
                practitioners
            });
            console.log("DataStore Initialized");
        } catch (err) {
            console.error("Failed to initialize DataStore", err);
            set({ isLoading: false, error: err instanceof Error ? err.message : String(err) });
        }
    },

    saveUser: async (user: UserProfile) => {
        try {
            // Optimistic update
            set({ user }); // Optimistically update the user state
            await database.get().saveUser(user);
        } catch (err) {
            console.error("Failed to save user", err);
            // Revert optimistic update if save fails, or handle error
            // For simplicity, we'll just set an error here.
            set({ error: err instanceof Error ? err.message : String(err) });
            // A more robust solution might involve fetching the original user or reverting to a previous state.
        }
    },

    savePractitioner: async (p) => {
        await database.get().savePractitioner(p);
        set(state => ({
            practitioners: [...state.practitioners.filter(i => i.id !== p.id), p].sort((a, b) => a.order - b.order)
        }));
    },

    deletePractitioner: async (id) => {
        await database.get().deletePractitioner(id);
        set(state => ({ practitioners: state.practitioners.filter(i => i.id !== id) }));
    },

    saveSession: async (s) => {
        await database.get().saveSession(s);
        set(state => ({
            sessions: [...state.sessions.filter(i => i.id !== s.id), s].sort((a, b) => b.date - a.date)
        }));
    },

    deleteSession: async (id) => {
        await database.get().deleteSession(id);
        set(state => ({ sessions: state.sessions.filter(i => i.id !== id) }));
    },

    saveAppointment: async (a) => {
        await database.get().saveAppointment(a);
        set(state => ({
            appointments: [...state.appointments.filter(i => i.id !== a.id), a].sort((a, b) => a.date - b.date)
        }));
    },

    deleteAppointment: async (id) => {
        await database.get().deleteAppointment(id);
        set(state => ({ appointments: state.appointments.filter(i => i.id !== id) }));
    },

    saveRoutine: async (r) => {
        await database.get().saveRoutine(r);
        set(state => ({
            routines: [...state.routines.filter(i => i.id !== r.id), r]
        }));
    },

    deleteRoutine: async (id) => {
        await database.get().deleteRoutine(id);
        set(state => ({ routines: state.routines.filter(i => i.id !== id) }));
    },

    saveRoutineCompletion: async (c) => {
        await database.get().saveRoutineCompletion(c);
        set(state => ({
            routineCompletions: [...state.routineCompletions.filter(i => i.id !== c.id), c].sort((a, b) => b.completedAt - a.completedAt)
        }));
    },

    deleteRoutineCompletion: async (id) => {
        await database.get().deleteRoutineCompletion(id);
        set(state => ({ routineCompletions: state.routineCompletions.filter(i => i.id !== id) }));
    },

    saveJournalEntry: async (j) => {
        await database.get().saveJournalEntry(j);
        set(state => ({
            journalEntries: [...state.journalEntries.filter(i => i.id !== j.id), j].sort((a, b) => b.date - a.date)
        }));
    },

    deleteJournalEntry: async (id) => {
        await database.get().deleteJournalEntry(id);
        set(state => ({ journalEntries: state.journalEntries.filter(i => i.id !== id) }));
    },

    clearData: async () => {
        await database.get().clearDatabase();
        set({
            initialized: true,
            user: null,
            sessions: [],
            appointments: [],
            routines: [],
            routineCompletions: [],
            journalEntries: [],
            practitioners: [],
            error: null
        });
    }
}));
