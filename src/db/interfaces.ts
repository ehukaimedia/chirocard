
import type { UserProfile, Session, Practitioner, Appointment, BodyworkRoutine, RoutineCompletion, JournalEntry } from './db';

export interface IDatabase {
    // Lifecycle
    init(): Promise<void>;

    // User
    getUser(): Promise<UserProfile | undefined>;
    saveUser(user: UserProfile): Promise<void>;

    // Practitioners
    getPractitioners(): Promise<Practitioner[]>;
    savePractitioner(practitioner: Practitioner): Promise<void>;
    deletePractitioner(id: string): Promise<void>;

    // Sessions
    getSessions(): Promise<Session[]>;
    getSession(id: string): Promise<Session | undefined>;
    saveSession(session: Session): Promise<void>;
    deleteSession(id: string): Promise<void>;

    // Appointments
    getAppointments(): Promise<Appointment[]>;
    saveAppointment(appt: Appointment): Promise<void>;
    deleteAppointment(id: string): Promise<void>;

    // Routines
    getRoutines(): Promise<BodyworkRoutine[]>;
    saveRoutine(routine: BodyworkRoutine): Promise<void>;
    deleteRoutine(id: string): Promise<void>;

    // Completions
    getRoutineCompletions(): Promise<RoutineCompletion[]>;
    saveRoutineCompletion(completion: RoutineCompletion): Promise<void>;
    deleteRoutineCompletion(id: string): Promise<void>;

    // Journal
    getJournalEntries(): Promise<JournalEntry[]>;
    saveJournalEntry(entry: JournalEntry): Promise<void>;
    deleteJournalEntry(id: string): Promise<void>;

    // Reset
    clearDatabase(): Promise<void>;
}
