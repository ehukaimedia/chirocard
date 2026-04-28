import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { type BodyworkRoutine, db } from "../../db/db";
import { useState, useEffect, useRef } from "react";
import { trackEvent } from "../../utils/analytics";

interface RoutineVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    routines: BodyworkRoutine[];
}

export function RoutineVerificationModal({ isOpen, onClose, routines }: RoutineVerificationModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Date/Time Inputs
    const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0]);
    const [completedTime, setCompletedTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    const [showTimeEdit, setShowTimeEdit] = useState(false);
    const [notes, setNotes] = useState("");

    const currentRoutine = routines[currentIndex];

    // Reset index when modal opens/closes or routines change
    useEffect(() => {
        if (!isOpen && currentIndex !== 0) {
            queueMicrotask(() => {
                setCurrentIndex(0);
                setShowTimeEdit(false);
                setNotes("");
            });
        }
    }, [isOpen, currentIndex]);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    const handleAction = async (completed: boolean) => {
        if (!currentRoutine) return;

        setIsAnimating(true);

        // Wait for animation
        timerRef.current = setTimeout(async () => {
            if (completed) {
                // Construct timestamp from inputs
                const timestamp = new Date(`${completedDate}T${completedTime}`).getTime();

                await db.routines.update(currentRoutine.id, {
                    isCompletedToday: true,
                    lastCompletedAt: timestamp
                });
                if (currentIndex === 0) {
                    trackEvent('complete_routine', { routine_id: currentRoutine.id, title: currentRoutine.title });
                }

                // Log completion
                await db.routineCompletions.add({
                    id: crypto.randomUUID(),
                    routineId: currentRoutine.id,
                    routineTitle: currentRoutine.title,
                    completedAt: timestamp,
                    date: completedDate
                });

                // Add to Journal
                const journalContent = notes
                    ? `Completed routine: ${currentRoutine.title}\n\nNotes: ${notes}`
                    : `Completed routine: ${currentRoutine.title}`;

                await db.journal.add({
                    id: crypto.randomUUID(),
                    date: timestamp,
                    content: journalContent,
                    mood: 'Good',
                    tags: ['Routine', 'Wellness', currentRoutine.category],
                    createdAt: Date.now()
                });
            }

            // Move to next or close
            if (currentIndex < routines.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setIsAnimating(false);
                // Reset time for next item
                setCompletedDate(new Date().toISOString().split('T')[0]);
                setCompletedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
                setShowTimeEdit(false);
                setNotes("");
            } else {
                if (isMountedRef.current) {
                    onClose();
                    setIsAnimating(false);
                    setCurrentIndex(0);
                    setShowTimeEdit(false);
                    setNotes("");
                }
            }
        }, 300);
    };

    if (!currentRoutine) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Routine Check-In"
            description={`You have ${routines.length - currentIndex} pending items.`}
            confirmLabel=""
            cancelLabel="Close"
            onConfirm={() => { }}
            hideFooter={true}
        >
            <div className={`py-4 space-y-6 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>

                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-8 h-8" />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                            {currentRoutine.title}
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            {currentRoutine.description || "No description provided."}
                        </p>
                    </div>

                    {/* Time Verification */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 uppercase tracking-wider">
                            <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                {currentRoutine.category}
                            </span>
                            {currentRoutine.reminderTimes && currentRoutine.reminderTimes.length > 0 && (
                                <span>• {currentRoutine.reminderTimes[0]}</span>
                            )}
                        </div>

                        {!showTimeEdit ? (
                            <button
                                onClick={() => setShowTimeEdit(true)}
                                className="text-xs text-emerald-600 dark:text-emerald-500 font-medium hover:underline mt-1"
                            >
                                Edit Completion Time
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 mt-2 bg-white dark:bg-zinc-800 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 animate-in fade-in slide-in-from-top-1">
                                <input
                                    type="date"
                                    value={completedDate}
                                    onChange={(e) => setCompletedDate(e.target.value)}
                                    className="bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                />
                                <input
                                    type="time"
                                    value={completedTime}
                                    onChange={(e) => setCompletedTime(e.target.value)}
                                    className="bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Did you complete this routine?
                    </p>

                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes (optional)..."
                        className="w-full text-sm p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none min-h-[80px]"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="h-14 flex flex-col items-center justify-center gap-1 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => handleAction(false)}
                        >
                            <XCircle className="w-5 h-5 text-zinc-400" />
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Skip for now</span>
                        </Button>

                        <Button
                            className="h-14 flex flex-col items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                            onClick={() => handleAction(true)}
                        >
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-xs font-medium">Yes, Completed!</span>
                        </Button>
                    </div>
                </div>

                <div className="flex justify-center gap-1.5">
                    {routines.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                                ? 'w-6 bg-emerald-500'
                                : idx < currentIndex
                                    ? 'w-1.5 bg-emerald-200 dark:bg-emerald-900'
                                    : 'w-1.5 bg-zinc-200 dark:bg-zinc-800'
                                }`}
                        />
                    ))}
                </div>

            </div>
        </Modal>
    );
}
