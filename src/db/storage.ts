
import { Capacitor } from '@capacitor/core';
import { WebDB } from './WebDB';
import { NativeDB } from './NativeDB';
import type { IDatabase } from './interfaces';

let dbInstance: IDatabase | null = null;

export const database = {
    get: (): IDatabase => {
        if (!dbInstance) {
            if (Capacitor.isNativePlatform()) {
                dbInstance = new NativeDB();
            } else {
                dbInstance = new WebDB();
            }
        }
        return dbInstance;
    },
    init: async () => {
        const db = database.get();
        await db.init();
    }
};
