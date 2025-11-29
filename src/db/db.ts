import Dexie, { type Table } from 'dexie';

// Define Types
export type UserProfile = {
    id: string; // 'me'
    name: string;
    pin: string | null;
    biometricEnabled: boolean;
    theme: 'dark' | 'light';
    // Contact Info
    email?: string;
    phone?: string;
    address?: string;
    // Bodywork Profile
    primaryComplaints: string[]; // e.g. "Lower Back Pain"
    contraindications: string[]; // e.g. "No deep tissue on calves"
    preferences: string[]; // e.g. "Lighter pressure"
    // Biometrics & Lifestyle
    height?: string;
    weight?: string;
    dateOfBirth?: string;
    activityLevel?: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Athlete';
    occupation?: string;
    // Clinical & Safety
    medicalHistory?: string[]; // Surgeries, accidents
    medications?: string[]; // Blood thinners, etc.
    allergies?: string[]; // Oils, latex
    mobilityStatus?: string[]; // ROM limitations
};

export type Practitioner = {
    id: string;
    name: string;
    role: 'Chiropractor' | 'Massage Therapist' | 'Physical Therapist' | 'Acupuncturist' | 'Other';
    clinicName?: string;
    phone?: string;
    email?: string; // For auto-sending records
    address?: string;
    website?: string;
    order: number; // For drag-and-drop ordering
};

export type Session = {
    id: string;
    date: number;
    practitionerId: string; // Link to Practitioner
    practitionerName: string; // Snapshot in case deleted
    practitionerClass: string;
    notes: string;
    signatureBase64: string | null;
    recommendations?: Homework[]; // Snapshot of assigned homework
    bodyMap?: Record<string, 'normal' | 'issue' | 'addressed' | 'watch'>; // Snapshot of body status
    bodyNotes?: Record<string, string>; // User notes per body part
    treatmentNotes?: Record<string, string>; // Practitioner notes per body part
    isLocked: boolean;
    createdAt: number;
};

export type BodyLog = {
    id: string; // UUID
    sessionId: string;
    bodyPart: string;
    status: 'normal' | 'issue' | 'addressed' | 'watch';
    timestamp: number;
};

export type Appointment = {
    id: string;
    practitionerId: string;
    practitionerName: string;
    date: number; // Timestamp
    notes?: string;
};

export type Homework = {
    id: string;
    title: string; // e.g. "Ice Lower Back"
    description?: string; // "20 mins, 3x a day"
    frequency: string; // Flexible: 'daily', '2x daily', 'as needed', etc.
    category: 'relief' | 'movement' | 'lifestyle' | 'custom';
    reminderTimes?: string[]; // ["08:00", "20:00"]
    daysOfWeek?: number[]; // [0, 1, 2, 3, 4, 5, 6]
    isCompletedToday: boolean;
    lastCompletedAt?: number;
    status: 'active' | 'pending' | 'archived';
    sourceSessionId?: string;
    createdAt: number;
};

// Database Class
export class ChiroCardDB extends Dexie {
    users!: Table<UserProfile>;
    practitioners!: Table<Practitioner>;
    sessions!: Table<Session>;
    bodyLogs!: Table<BodyLog>;
    appointments!: Table<Appointment>;
    homework!: Table<Homework>;

    constructor() {
        super('ChiroCardDB');
        this.version(13).stores({
            users: 'id', // Simple key-value for user settings
            practitioners: 'id, name, role, order', // UUIDs, not auto-increment
            sessions: 'id, date, practitionerId', // UUIDs, not auto-increment
            bodyLogs: '++id, timestamp, status', // Keep auto-increment for logs if they don’t use UUIDs (check usage)
            appointments: '++id, date, practitionerId',
            homework: '++id, isCompletedToday, status'
        });
    }
}

export const db = new ChiroCardDB();
