import type { IDatabase } from './interfaces';
import { db as dexie } from './db';
import type { UserProfile, Session, Practitioner, Appointment, BodyworkRoutine, RoutineCompletion, JournalEntry } from './db';

export class WebDB implements IDatabase {
    async init(): Promise<void> {
        // Dexie opens lazily, but we can force it
        if (!dexie.isOpen()) {
            await dexie.open();
        }
        console.log("Web Dexie Database Initialized");
    }

    // --- User ---
    async getUser(): Promise<UserProfile | undefined> {
        return await dexie.users.get('me');
    }

    async saveUser(user: UserProfile): Promise<void> {
        await dexie.users.put({ ...user, id: 'me' });
    }

    // --- Practitioners ---
    async getPractitioners(): Promise<Practitioner[]> {
        return await dexie.practitioners.orderBy('order').toArray();
    }

    async savePractitioner(p: Practitioner): Promise<void> {
        await dexie.practitioners.put(p);
    }

    async deletePractitioner(id: string): Promise<void> {
        await dexie.practitioners.delete(id);
    }

    // --- Sessions ---
    async getSessions(): Promise<Session[]> {
        return await dexie.sessions.orderBy('date').reverse().toArray();
    }

    async getSession(id: string): Promise<Session | undefined> {
        return await dexie.sessions.get(id);
    }

    async saveSession(s: Session): Promise<void> {
        await dexie.sessions.put(s);
    }

    async deleteSession(id: string): Promise<void> {
        await dexie.sessions.delete(id);
    }

    // --- Appointments ---
    async getAppointments(): Promise<Appointment[]> {
        return await dexie.appointments.orderBy('date').toArray();
    }

    async saveAppointment(a: Appointment): Promise<void> {
        await dexie.appointments.put(a);
    }

    async deleteAppointment(id: string): Promise<void> {
        await dexie.appointments.delete(id);
    }

    // --- Routines ---
    async getRoutines(): Promise<BodyworkRoutine[]> {
        return await dexie.routines.toArray();
    }

    async saveRoutine(r: BodyworkRoutine): Promise<void> {
        await dexie.routines.put(r);
    }

    async deleteRoutine(id: string): Promise<void> {
        await dexie.routines.delete(id);
    }

    // --- Routine Completions ---
    async getRoutineCompletions(): Promise<RoutineCompletion[]> {
        return await dexie.routineCompletions.orderBy('completedAt').reverse().toArray();
    }

    async saveRoutineCompletion(c: RoutineCompletion): Promise<void> {
        await dexie.routineCompletions.put(c);
    }

    async deleteRoutineCompletion(id: string): Promise<void> {
        await dexie.routineCompletions.delete(id);
    }

    // --- Journal ---
    async getJournalEntries(): Promise<JournalEntry[]> {
        return await dexie.journal.orderBy('date').reverse().toArray();
    }

    async saveJournalEntry(j: JournalEntry): Promise<void> {
        await dexie.journal.put(j);
    }

    async deleteJournalEntry(id: string): Promise<void> {
        await dexie.journal.delete(id);
    }

    async clearDatabase(): Promise<void> {
        await dexie.delete();
        await dexie.open();
    }
}
