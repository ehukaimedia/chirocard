import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { type BodyworkRoutine, db } from "../../db/db";
import { useState } from "react";

interface RoutineVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    routines: BodyworkRoutine[];
}

export function RoutineVerificationModal({ isOpen, onClose, routines }: RoutineVerificationModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const currentRoutine = routines[currentIndex];

    // Reset index when modal opens/closes or routines change
    if (!isOpen && currentIndex !== 0) {
        setCurrentIndex(0);
    }

    const handleAction = async (completed: boolean) => {
        if (!currentRoutine) return;

        setIsAnimating(true);

        // Wait for animation
        setTimeout(async () => {
            if (completed) {
                const now = Date.now();
                await db.routines.update(currentRoutine.id, {
                    isCompletedToday: true,
                    lastCompletedAt: now
                });

                // Log completion
                const todayStr = new Date().toISOString().split('T')[0];
                await db.routineCompletions.add({
                    id: crypto.randomUUID(),
                    routineId: currentRoutine.id,
                    routineTitle: currentRoutine.title,
                    completedAt: now,
                    date: todayStr
                });
            }

            // Move to next or close
            if (currentIndex < routines.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setIsAnimating(false);
            } else {
                onClose();
                setIsAnimating(false);
                setCurrentIndex(0);
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

                    <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 uppercase tracking-wider">
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                            {currentRoutine.category}
                        </span>
                        {currentRoutine.reminderTimes && currentRoutine.reminderTimes.length > 0 && (
                            <span>• {currentRoutine.reminderTimes[0]}</span>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Did you complete this routine today?
                    </p>

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
