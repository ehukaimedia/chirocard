import { useEffect, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type BodyworkRoutine } from '../db/db';
import { useAppStore } from '../store/useAppStore';

export function useNotifications() {
    const { notificationSettings } = useAppStore();
    const routinesQuery = useLiveQuery(() => db.routines.where('status').equals('active').toArray());
    const routines = useMemo(() => routinesQuery || [], [routinesQuery]);
    const journalEntriesQuery = useLiveQuery(async () => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return db.journal.where('date').aboveOrEqual(todayStart.getTime()).toArray();
    });
    const journalEntries = useMemo(() => journalEntriesQuery || [], [journalEntriesQuery]);

    // Use refs to prevent interval closure staleness and duplicate notifications
    const lastCheckRef = useRef<number>(new Date().getTime());

    // Reset journal notification state at midnight (or just rely on date check)
    // Simple way: Track the date string of the last journal notification
    const lastJournalDateRef = useRef<string>("");

    useEffect(() => {
        // Master switch
        if (!notificationSettings.enabled) return;

        // Check if Notification API is supported
        if (!('Notification' in window)) {
            /* Browser doesn't support notifications */
            return;
        }

        // Request permission on mount if default
        if (Notification.permission === 'default') {
            Notification.requestPermission().catch(() => { /* Silently ignore */ });
        }

        const checkReminders = () => {
            if (Notification.permission !== 'granted') return;

            const now = new Date();
            const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const todayStr = now.toDateString();

            // Throttle checks (every ~1 minute logic gate)
            // But we actually run this interval every 10s.
            // Let's ensure we don't spam.
            if (Date.now() - lastCheckRef.current < 50000) return;
            lastCheckRef.current = Date.now();

            // 1. Routine Reminders
            if (notificationSettings.routineRemindersEnabled) {
                routines?.forEach((routine: BodyworkRoutine) => {
                    // Check if routine is scheduled for today
                    const dayOfWeek = now.getDay();
                    const isScheduledForToday = routine.daysOfWeek?.length === 0 || routine.daysOfWeek?.includes(dayOfWeek);

                    if (isScheduledForToday && routine.reminderTimes?.includes(currentTime) && !routine.isCompletedToday) {
                        try {
                            new Notification(`Time for ${routine.title}`, {
                                body: routine.description || `It's time for your ${routine.category} routine.`,
                                icon: '/icon-192x192.png',
                                tag: `routine-${routine.id}-${todayStr}` // Prevent duplicate notifications for same event
                            });
                        } catch {
                            /* Silently ignore notification errors */
                        }
                    }
                });
            }

            // 2. Journal Reminder
            if (notificationSettings.journalReminderEnabled) {
                // Check if time matches preference
                if (currentTime === notificationSettings.journalReminderTime) {
                    // Check if we already notified today
                    if (lastJournalDateRef.current === todayStr) return;

                    // Check if journal entry exists for today
                    const hasJournalEntry = journalEntries.length > 0;

                    if (!hasJournalEntry) {
                        try {
                            new Notification("How are you feeling today?", {
                                body: "Take a moment to log your bodywork journal.",
                                icon: '/icon-192x192.png',
                                tag: `journal-${todayStr}`
                            });
                            lastJournalDateRef.current = todayStr;
                        } catch {
                            /* Silently ignore notification errors */
                        }
                    }
                }
            }
        };

        const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [routines, journalEntries, notificationSettings]);
}
