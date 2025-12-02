import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useReminders() {
    const homework = useLiveQuery(() => db.homework.where('status').equals('active').toArray());
    const lastCheckRef = useRef<number>(Date.now());

    useEffect(() => {
        // Check if Notification API is supported
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return;
        }

        // Request permission on mount
        if (Notification.permission === 'default') {
            Notification.requestPermission().catch(err => console.error("Error requesting notification permission:", err));
        }

        const checkReminders = () => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

            // Check every minute
            if (Date.now() - lastCheckRef.current < 50000) return;
            lastCheckRef.current = Date.now();

            homework?.forEach((hw: any) => {
                if (hw.reminderTimes?.includes(currentTime) && !hw.isCompletedToday) {
                    if (Notification.permission === 'granted') {
                        try {
                            new Notification(`Time for ${hw.title}`, {
                                body: hw.description || `It's time for your ${hw.category} routine.`,
                                icon: '/icon-192x192.png'
                            });
                        } catch (e) {
                            console.error("Error creating notification:", e);
                        }
                    }
                }
            });
        };

        const interval = setInterval(checkReminders, 10000); // Check every 10 seconds to be safe, but logic gates to ~1 min
        return () => clearInterval(interval);
    }, [homework]);
}
