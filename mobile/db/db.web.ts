// Mock DB for Web Verification
// basic in-memory store to allow UI testing

class MockTable<T extends { id: string }> {
    private data: Record<string, T> = {};
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    async get(id: string): Promise<T | null> {
        return this.data[id] || null;
    }

    async add(item: T): Promise<void> {
        this.data[item.id] = item;
    }

    async save(item: T): Promise<void> {
        this.data[item.id] = { ...this.data[item.id], ...item };
    }

    async count(): Promise<number> {
        return Object.keys(this.data).length;
    }

    async toArray(): Promise<T[]> {
        return Object.values(this.data);
    }
}

class MockDB {
    users = new MockTable<any>('users');
    practitioners = new MockTable<any>('practitioners');
    sessions = new MockTable<any>('sessions');

    constructor() {
        // Pre-fill user for testing
        this.users.add({ id: 'me', name: 'Test User' });
    }
}

export const db = new MockDB();

export function useLiveQuery(queryFn: () => Promise<any>, deps: any[] = []) {
    // Simple mock hook that just runs once
    const [data, setData] = React.useState<any>(null);
    React.useEffect(() => {
        queryFn().then(setData);
    }, deps);
    return data;
}

import React from 'react';

// Re-export constants
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

// Types needed for compilation if referenced directly
export type Practitioner = {
    id: string;
    name: string;
    role: string;
    clinicName?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    order: number;
};
