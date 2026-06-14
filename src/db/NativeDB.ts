
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { IDatabase } from './interfaces';
import type { UserProfile, Session, Practitioner, Appointment, BodyworkRoutine, RoutineCompletion, JournalEntry } from './db';
import { SQL_SCHEMA } from './sqlite-schema';

export class NativeDB implements IDatabase {
    private sqlite: SQLiteConnection;
    private db: SQLiteDBConnection | null = null;
    private DB_NAME = 'chirocard_native_v1';

    constructor() {
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
    }

    async init(): Promise<void> {
        if (!Capacitor.isNativePlatform()) return;

        try {
            // Create connection
            this.db = await this.sqlite.createConnection(
                this.DB_NAME,
                false,
                'no-encryption',
                1,
                false
            );

            // Open
            await this.db.open();

            // Schema
            await this.db.execute(SQL_SCHEMA);

            console.log('Native SQLite Database Initialized');
        } catch (err) {
            console.error('Failed to init Native DB', err);
            throw err;
        }
    }

    // --- Helpers ---
    // Since we use JSON blobs for complex fields, we need to merge the top-level columns with the JSON data
    // when reading, and split them when writing.

    private unpack<T>(row: Record<string, unknown> | null | undefined): T {
        if (!row) return row as T;
        const { data, ...rest } = row;
        const parsed = data ? JSON.parse(data as string) : {};
        return { ...rest, ...parsed } as T;
    }

    private pack(obj: Record<string, unknown>, columns: string[]): { values: unknown[], params: string, keys: string } {
        const rowData: Record<string, unknown> = {};
        const jsonContent: Record<string, unknown> = { ...obj };

        // Extract top-level columns
        columns.forEach(col => {
            if (col in obj) {
                rowData[col] = obj[col];
                delete jsonContent[col]; // Remove from JSON blob if it's a column
            }
        });

        // Add blob
        rowData['data'] = JSON.stringify(jsonContent);

        // Prepare Query parts
        const keys = Object.keys(rowData);
        const values = Object.values(rowData);
        const params = keys.map(() => '?').join(',');

        return { values, params, keys: keys.join(',') };
    }

    // --- User ---
    async getUser(): Promise<UserProfile | undefined> {
        if (!this.db) return undefined;
        const res = await this.db.query('SELECT * FROM users WHERE id = ?', ['me']);
        if (res.values && res.values.length > 0) {
            return this.unpack<UserProfile>(res.values[0]);
        }
        return undefined;
    }

    async saveUser(user: UserProfile): Promise<void> {
        if (!this.db) return;
        user.id = 'me'; // Force ID
        const { values, params, keys } = this.pack(user, ['id', 'name']);
        await this.db.run(`INSERT OR REPLACE INTO users (${keys}) VALUES (${params})`, values);
    }

    // --- Practitioners ---
    async getPractitioners(): Promise<Practitioner[]> {
        if (!this.db) return [];
        const res = await this.db.query('SELECT * FROM practitioners ORDER BY "order" ASC');
        return (res.values || []).map(r => this.unpack<Practitioner>(r));
    }

    async savePractitioner(p: Practitioner): Promise<void> {
        if (!this.db) return;
        const { values, params, keys } = this.pack(p, ['id', 'name', 'role', 'clinicName', 'order']);
        await this.db.run(`INSERT OR REPLACE INTO practitioners (${keys}) VALUES (${params})`, values);
    }

    async deletePractitioner(id: string): Promise<void> {
        if (!this.db) return;
        await this.db.run('DELETE FROM practitioners WHERE id = ?', [id]);
    }

    // --- Sessions ---
    async getSessions(): Promise<Session[]> {
        if (!this.db) return [];
        const res = await this.db.query('SELECT * FROM sessions ORDER BY date DESC');
        return (res.values || []).map(r => this.unpack<Session>(r));
    }

    async getSession(id: string): Promise<Session | undefined> {
        if (!this.db) return undefined;
        const res = await this.db.query('SELECT * FROM sessions WHERE id = ?', [id]);
        if (res.values && res.values.length > 0) return this.unpack<Session>(res.values[0]);
        return undefined;
    }

    async saveSession(s: Session): Promise<void> {
        if (!this.db) return;
        const { values, params, keys } = this.pack(s, ['id', 'date', 'practitionerId']);
        await this.db.run(`INSERT OR REPLACE INTO sessions (${keys}) VALUES (${params})`, values);
    }

    async deleteSession(id: string): Promise<void> {
        if (!this.db) return;
        await this.db.run('DELETE FROM sessions WHERE id = ?', [id]);
    }

    // --- Appointments ---
    async getAppointments(): Promise<Appointment[]> {
        if (!this.db) return [];
        const res = await this.db.query('SELECT * FROM appointments ORDER BY date ASC');
        return (res.values || []).map(r => this.unpack<Appointment>(r));
    }

    async saveAppointment(a: Appointment): Promise<void> {
        if (!this.db) return;
        const { values, params, keys } = this.pack(a, ['id', 'date', 'practitionerId', 'status']);
        await this.db.run(`INSERT OR REPLACE INTO appointments (${keys}) VALUES (${params})`, values);
    }

    async deleteAppointment(id: string): Promise<void> {
        if (!this.db) return;
        await this.db.run('DELETE FROM appointments WHERE id = ?', [id]);
    }

    // --- Routines ---
    async getRoutines(): Promise<BodyworkRoutine[]> {
        if (!this.db) return [];
        const res = await this.db.query('SELECT * FROM routines');
        return (res.values || []).map(r => this.unpack<BodyworkRoutine>(r));
    }

    async saveRoutine(r: BodyworkRoutine): Promise<void> {
        if (!this.db) return;
        // Fix boolean to number for SQLite
        const ready = { ...r, isCompletedToday: r.isCompletedToday ? 1 : 0 };
        const { values, params, keys } = this.pack(ready, ['id', 'status', 'isCompletedToday']);
        await this.db.run(`INSERT OR REPLACE INTO routines (${keys}) VALUES (${params})`, values);
    }

    async deleteRoutine(id: string): Promise<void> {
        if (!this.db) return;
        await this.db.run('DELETE FROM routines WHERE id = ?', [id]);
    }

    // --- Routine Completions ---
    async getRoutineCompletions(): Promise<RoutineCompletion[]> {
        if (!this.db) return [];
        const res = await this.db.query('SELECT * FROM routine_completions ORDER BY completedAt DESC');
        return (res.values || []).map(r => this.unpack<RoutineCompletion>(r));
    }

    async saveRoutineCompletion(c: RoutineCompletion): Promise<void> {
        if (!this.db) return;
        const { values, params, keys } = this.pack(c, ['id', 'routineId', 'date', 'completedAt']);
        await this.db.run(`INSERT OR REPLACE INTO routine_completions (${keys}) VALUES (${params})`, values);
    }

    async deleteRoutineCompletion(id: string): Promise<void> {
        if (!this.db) return;
        await this.db.run('DELETE FROM routine_completions WHERE id = ?', [id]);
    }

    // --- Journal ---
    async getJournalEntries(): Promise<JournalEntry[]> {
        if (!this.db) return [];
        const res = await this.db.query('SELECT * FROM journal ORDER BY date DESC');
        return (res.values || []).map(r => this.unpack<JournalEntry>(r));
    }

    async saveJournalEntry(j: JournalEntry): Promise<void> {
        if (!this.db) return;
        const { values, params, keys } = this.pack(j, ['id', 'date']);
        await this.db.run(`INSERT OR REPLACE INTO journal (${keys}) VALUES (${params})`, values);
    }

    async deleteJournalEntry(id: string): Promise<void> {
        if (!this.db) return;
        await this.db.run('DELETE FROM journal WHERE id = ?', [id]);
    }

    async clearDatabase(): Promise<void> {
        if (!this.db) return;
        await this.db.run('DELETE FROM users');
        await this.db.run('DELETE FROM practitioners');
        await this.db.run('DELETE FROM sessions');
        await this.db.run('DELETE FROM appointments');
        await this.db.run('DELETE FROM routines');
        await this.db.run('DELETE FROM routine_completions');
        await this.db.run('DELETE FROM journal');
    }
}
