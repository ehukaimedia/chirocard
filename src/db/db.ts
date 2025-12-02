import Dexie, { type Table } from 'dexie';

// Define Types
export type UserProfile = {
    id: string; // 'me'
    name: string;
    pin: string | null;
    biometricEnabled: boolean;
    theme: 'dark' | 'light';
    photo?: string; // Base64 encoded image
    // Contact Info
    email?: string;
    phone?: string;
    address?: string;
    insurance?: string[];
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
    physicalActivities?: string[]; // e.g. "Yoga", "Running"
    diet?: string[]; // e.g. "Vegan", "Gluten-Free"
    hydration?: string; // e.g. "2L/day"
    supplements?: string[]; // e.g. "Vitamin D", "Magnesium"
    // Body History & Safety
    bodyHistory?: string[]; // Surgeries, accidents
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
    userSignature?: string; // Client signature
    recommendations?: BodyworkRoutine[]; // Snapshot of assigned homework
    bodyMap?: Record<string, 'normal' | 'issue' | 'addressed' | 'watch'>; // Snapshot of body status
    bodyNotes?: Record<string, string>; // User notes per body part
    bodyLevels?: Record<string, number>; // User pain/discomfort level (0-10)
    bodyBadges?: Record<string, string[]>; // User selected badges (e.g. "Pain", "Stiffness")
    treatmentNotes?: Record<string, string>; // Practitioner notes per body part
    practitionerLevels?: Record<string, number>; // Practitioner findings level (0-10)
    practitionerBadges?: Record<string, string[]>; // Practitioner findings (e.g. "Hypertonic", "Subluxation")
    interventions?: string[]; // List of performed interventions
    isLocked: boolean;
    appointmentId?: string; // Link to source appointment
    createdAt: number;
    // Post-Session Data
    postSessionLog?: PostSessionEntry[];
};

export type PostSessionEntry = {
    id: string;
    timestamp: number;
    author: 'user' | 'practitioner';
    type: 'journal' | 'correction' | 'addendum' | 'update_log';
    content: string;
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
    status?: 'scheduled' | 'completed' | 'cancelled';
};

export type BodyworkRoutine = {
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

export type RoutineCompletion = {
    id: string;
    routineId: string;
    routineTitle: string;
    completedAt: number; // Timestamp
    date: string; // "YYYY-MM-DD" for easy grouping
};

export type JournalEntry = {
    id: string;
    date: number; // Timestamp
    content: string;
    mood?: 'Great' | 'Good' | 'Okay' | 'Bad' | 'Awful';
    tags?: string[];
    createdAt: number;
};

export type Homework = BodyworkRoutine; // Alias for backward compatibility

// Database Class
export class ChiroCardDB extends Dexie {
    users!: Table<UserProfile>;
    practitioners!: Table<Practitioner>;
    sessions!: Table<Session>;
    bodyLogs!: Table<BodyLog>;
    appointments!: Table<Appointment>;
    routines!: Table<BodyworkRoutine>;
    routineCompletions!: Table<RoutineCompletion>;
    journal!: Table<JournalEntry>;
    homework!: Table<BodyworkRoutine>; // Alias for backward compatibility

    constructor() {
        super('ChiroCardDB');
        this.version(16).stores({
            users: 'id', // Simple key-value for user settings
            practitioners: 'id, name, role, order', // UUIDs, not auto-increment
            sessions: 'id, date, practitionerId', // UUIDs, not auto-increment
            bodyLogs: '++id, timestamp, status', // Keep auto-increment for logs if they don’t use UUIDs (check usage)
            appointments: '++id, date, practitionerId, status',
            routines: '++id, isCompletedToday, status',
            routineCompletions: 'id, routineId, date, completedAt',
            journal: 'id, date'
        });
        this.homework = this.routines; // Alias
    }
}

export const db = new ChiroCardDB();
