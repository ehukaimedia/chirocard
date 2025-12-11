import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

// Initialize DB Promise ensuring tables exist
const dbPromise = (async () => {
    const db = await SQLite.openDatabaseAsync('chirocard.db');
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS practitioners (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            clinicName TEXT,
            phone TEXT,
            email TEXT,
            address TEXT,
            website TEXT,
            "order" INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT,
            data TEXT -- Storing the rest of the profile as a JSON blob for flexibility
        );
    `);
    return db;
})();

export type Practitioner = {
    id: string;
    name: string;
    role: 'Chiropractor' | 'Massage Therapist' | 'Physical Therapist' | 'Acupuncturist' | 'Other';
    clinicName?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    order: number;
};

import { UserProfile } from './types'; // Ensure types are imported

// Event Emitter for "Live" updates
const listeners: Set<() => void> = new Set();
const notifyListeners = () => listeners.forEach(l => l());

export const db = {
    users: {
        get: async (id: string): Promise<UserProfile | undefined> => {
            const database = await dbPromise;
            const result = await database.getFirstAsync<{ id: string, name: string, data: string }>('SELECT * FROM users WHERE id = ?', [id]);
            if (!result) return undefined;
            // Merge structured cols with JSON blob
            const data = result.data ? JSON.parse(result.data) : {};
            return { ...data, id: result.id, name: result.name };
        },
        save: async (user: UserProfile) => {
            const database = await dbPromise;
            const { id, name, ...rest } = user;
            const dataStr = JSON.stringify(rest);

            // Upsert (INSERT OR REPLACE)
            await database.runAsync(
                `INSERT OR REPLACE INTO users (id, name, data) VALUES (?, ?, ?)`,
                [id, name, dataStr]
            );
            notifyListeners();
        }
    },
    practitioners: {
        toArray: async (): Promise<Practitioner[]> => {
            const database = await dbPromise;
            return await database.getAllAsync<Practitioner>('SELECT * FROM practitioners ORDER BY "order" ASC');
        },
        add: async (practitioner: Practitioner) => {
            const database = await dbPromise;
            await database.runAsync(
                `INSERT INTO practitioners (id, name, role, clinicName, phone, email, address, website, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    practitioner.id,
                    practitioner.name,
                    practitioner.role,
                    practitioner.clinicName || null,
                    practitioner.phone || null,
                    practitioner.email || null,
                    practitioner.address || null,
                    practitioner.website || null,
                    practitioner.order
                ]
            );
            notifyListeners();
        },
        update: async (id: string, updates: Partial<Practitioner>) => {
            const database = await dbPromise;
            // Build dynamic query
            const keys = Object.keys(updates).filter(k => k !== 'id');
            if (keys.length === 0) return;

            const setClause = keys.map(k => `"${k}" = ?`).join(', ');
            const values = keys.map(k => (updates as any)[k]);

            await database.runAsync(
                `UPDATE practitioners SET ${setClause} WHERE id = ?`,
                [...values, id]
            );
            notifyListeners();
        },
        delete: async (id: string) => {
            const database = await dbPromise;
            await database.runAsync('DELETE FROM practitioners WHERE id = ?', [id]);
            notifyListeners();
        },
        count: async (): Promise<number> => {
            const database = await dbPromise;
            const result = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM practitioners');
            return result?.count ?? 0;
        }
    }
};

// React Hook to mimic useLiveQuery
export function useLiveQuery<T>(querier: () => Promise<T>, deps: any[] = []): T | undefined {
    const [data, setData] = useState<T>();

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const result = await querier();
                if (isMounted) setData(result);
            } catch (e) {
                console.error(e);
            }
        };

        // Initial fetch
        fetchData();

        // Subscribe to changes
        const listener = () => fetchData();
        listeners.add(listener);

        return () => {
            isMounted = false;
            listeners.delete(listener);
        };
    }, deps);

    return data;
}

// Standardized Service Tags
export const SERVICE_TAGS = {
    "Chiropractic": ["Spinal Adjustment", "Extremity Adjustment", "Mobilization", "Traction", "Activator", "Drop Table"],
    "Massage": ["Deep Tissue", "Swedish", "Myofascial Release", "Trigger Point", "Sports Massage", "Lymphatic Drainage"],
    "Physical Therapy": ["Therapeutic Exercise", "Manual Therapy", "Neuromuscular Re-ed", "Gait Training", "Balance Training"],
    "Acupuncture": ["Acupuncture", "Electro-Acupuncture", "Dry Needling", "Tui Na", "Shiatsu", "Ear Seeds"],
    "Cupping": ["Stationary Cupping", "Sliding Cupping", "Fire Cupping", "Flash Cupping"],
    "Modalities": ["E-Stim/TENS", "Ultrasound", "Laser Therapy", "Heat", "Cryotherapy", "Kinesio Taping", "Gua Sha"]
};

export const FINDING_TAGS = {
    "Tissue": ["Hypertonic", "Spasm", "Inflammation", "Trigger Points", "Scar Tissue"],
    "Joint": ["Restricted ROM", "Subluxation", "Hypermobile", "Fixation"],
    "Sensory": ["Tenderness", "Radiating Pain", "Numbness", "Tingling"]
};
