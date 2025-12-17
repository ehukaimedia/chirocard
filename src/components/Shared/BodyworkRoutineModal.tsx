import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Clock, Trash2 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

interface BodyworkRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: BodyworkRoutineData) => void;
    initialValues?: BodyworkRoutineData;
    title?: string;
    description?: string;
    confirmLabel?: string;
}

export interface BodyworkRoutineData {
    title: string;
    description: string;
    reminderTimes: string[];
    daysOfWeek: number[];
    category?: 'relief' | 'movement' | 'lifestyle' | 'custom';
}

export function BodyworkRoutineModal({
    isOpen,
    onClose,
    onConfirm,
    initialValues,
    title = "New Bodywork Routine",
    description = "Add a routine activity.",
    confirmLabel = "Add Routine"
}: BodyworkRoutineModalProps) {
    const { routineTimeInterval, routineBadges } = useAppStore();

    const [routineTitle, setRoutineTitle] = useState("");
    const [routineDesc, setRoutineDesc] = useState("");
    const [routineTimes, setRoutineTimes] = useState<string[]>([]);
    const [routineDays, setRoutineDays] = useState<number[]>([]);
    const [routineCategory, setRoutineCategory] = useState<'relief' | 'movement' | 'lifestyle' | 'custom'>('custom');

    const [timeInput, setTimeInput] = useState("07:00");

    useEffect(() => {
        if (isOpen) {
            if (initialValues) {
                setRoutineTitle(initialValues.title);
                setRoutineDesc(initialValues.description);
                setRoutineTimes(initialValues.reminderTimes || []);
                setRoutineDays(initialValues.daysOfWeek || []);
                setRoutineCategory(initialValues.category || 'custom');
            } else {
                setRoutineTitle("");
                setRoutineDesc("");
                setRoutineTimes([]);
                setRoutineDays([]);
                setRoutineCategory('custom');
                setTimeInput("07:00");
            }
        }
    }, [isOpen, initialValues]);

    const handleConfirm = () => {
        // If user has a time in input but didn't add it, and no times are added, add it?
        // Or just submit what's there.
        // Matching Calendar.tsx logic:
        let finalTimes = [...routineTimes];
        if (finalTimes.length === 0 && timeInput) {
            finalTimes = [timeInput];
        } else if (timeInput && !finalTimes.includes(timeInput)) {
            // Optional: auto-add if not present? 
            // Calendar.tsx logic: if (routineTime && !finalTimes.includes(routineTime)) finalTimes.push(routineTime);
            finalTimes.push(timeInput);
            finalTimes.sort();
        }

        onConfirm({
            title: routineTitle,
            description: routineDesc,
            reminderTimes: finalTimes,
            daysOfWeek: routineDays,
            category: routineCategory
        });
        onClose();
    };



    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            confirmLabel={confirmLabel}
            cancelLabel="Cancel"
            onConfirm={handleConfirm}
        >
            <div className="space-y-5 py-2">
                <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider block">Category</label>
                    <select
                        value={routineCategory}
                        onChange={(e) => setRoutineCategory(e.target.value as 'relief' | 'movement' | 'lifestyle' | 'custom')}
                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-base font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm appearance-none"
                    >
                        <option value="relief">Relief & Recovery</option>
                        <option value="movement">Movement & Mobility</option>
                        <option value="lifestyle">Lifestyle & Wellness</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Input
                        placeholder="Title"
                        value={routineTitle}
                        onChange={e => setRoutineTitle(e.target.value)}
                        className="h-12 bg-zinc-50 dark:bg-zinc-900 text-base font-medium border border-zinc-200 dark:border-zinc-800 focus:ring-2 rounded-xl shadow-sm"
                    />
                    <div>
                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider block">Quick Select</label>
                        <div className="flex flex-wrap gap-2">
                            {routineBadges[routineCategory]?.map(suggestion => (
                                <button
                                    key={suggestion}
                                    onClick={() => setRoutineTitle(suggestion)}
                                    className="text-sm font-medium px-4 py-2 rounded-full bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-zinc-200 dark:border-zinc-700 active:scale-95 shadow-sm"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider block">Reminder Times</label>
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            {routineTimes.map((time, i) => (
                                <div key={i} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg text-base border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                    <span className="text-emerald-900 dark:text-emerald-100 font-medium">{time}</span>
                                    <button
                                        onClick={() => setRoutineTimes(routineTimes.filter((_, idx) => idx !== i))}
                                        className="text-emerald-400 hover:text-red-500 ml-1 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Input
                                type="time"
                                value={timeInput}
                                onChange={e => setTimeInput(e.target.value)}
                                step={routineTimeInterval === 1 ? "60" : "900"}
                                className="flex-1 h-12 bg-zinc-50 dark:bg-zinc-900 text-lg font-medium border border-zinc-200 dark:border-zinc-800 focus:ring-2 rounded-xl shadow-sm"
                            />
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 w-12 p-0 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 rounded-xl shadow-sm"
                                onClick={() => {
                                    if (timeInput && !routineTimes.includes(timeInput)) {
                                        setRoutineTimes([...routineTimes, timeInput].sort());
                                    }
                                }}
                            >
                                <span className="text-2xl font-light mb-1">+</span>
                            </Button>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">
                            Add multiple reminders. Defaults to {routineTimeInterval || 15}-minute intervals.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider block">Days of Week</label>
                    <div className="flex justify-between gap-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                            const isSelected = routineDays.length === 0 || routineDays.includes(i);
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (routineDays.length === 0) {
                                            setRoutineDays([i]);
                                        } else {
                                            if (isSelected) {
                                                const newDays = routineDays.filter(d => d !== i);
                                                if (newDays.length === 0) {
                                                    setRoutineDays([]);
                                                } else {
                                                    setRoutineDays(newDays);
                                                }
                                            } else {
                                                setRoutineDays([...routineDays, i].sort());
                                            }
                                        }
                                    }}
                                    className={`
                                        w-10 h-10 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center
                                        ${isSelected
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/20 scale-105 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950'
                                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800'}
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-2 text-center">
                        {routineDays.length === 0 || routineDays.length === 7 ? "Repeats Daily" : "Repeats on selected days"}
                    </p>
                </div>

                <div className="pt-2">
                    <Input
                        placeholder="Notes (Optional)"
                        value={routineDesc}
                        onChange={e => setRoutineDesc(e.target.value)}
                        className="h-12 bg-zinc-50 dark:bg-zinc-900 text-base font-medium border border-zinc-200 dark:border-zinc-800 focus:ring-2 rounded-xl shadow-sm"
                    />
                </div>
            </div>
        </Modal>
    );
}
