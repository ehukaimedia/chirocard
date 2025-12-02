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
    const { routineTimeInterval } = useAppStore();

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

    const SUGGESTIONS = {
        relief: ["Ice Bath", "Sauna", "Red Light", "Heat", "Stretch", "Foam Roll"],
        movement: ["Walk", "Run", "Yoga", "Mobility", "Swim", "Gym"],
        lifestyle: ["Breathwork", "Meditate", "Journal", "Hydrate", "Sleep", "Nature"],
        custom: ["Ice Bath", "Sauna", "Walk", "Journal", "Stretch", "Breathwork"]
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
                    <label className="text-xs font-medium text-zinc-500 mb-1 block">Category</label>
                    <select
                        value={routineCategory}
                        onChange={(e) => setRoutineCategory(e.target.value as any)}
                        className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    />
                    {/* Smart Autofill Chips */}
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS[routineCategory].map(suggestion => (
                            <button
                                key={suggestion}
                                onClick={() => setRoutineTitle(suggestion)}
                                className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-zinc-200 dark:border-zinc-700"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Reminder Times</label>
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            {routineTimes.map((time, i) => (
                                <div key={i} className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-sm border border-zinc-200 dark:border-zinc-700">
                                    <Clock className="w-3 h-3 text-zinc-400" />
                                    <span className="text-zinc-700 dark:text-zinc-300">{time}</span>
                                    <button
                                        onClick={() => setRoutineTimes(routineTimes.filter((_, idx) => idx !== i))}
                                        className="text-zinc-400 hover:text-red-500 ml-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                type="time"
                                value={timeInput}
                                onChange={e => setTimeInput(e.target.value)}
                                step={routineTimeInterval === 1 ? "60" : "900"}
                                className="flex-1"
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    if (timeInput && !routineTimes.includes(timeInput)) {
                                        setRoutineTimes([...routineTimes, timeInput].sort());
                                    }
                                }}
                            >
                                Add Time
                            </Button>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">
                            Add multiple reminders. Defaults to {routineTimeInterval || 15}-minute intervals.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-zinc-500 mb-2 block">Days of Week</label>
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
                                        w-9 h-9 rounded-xl text-xs font-medium transition-all
                                        ${isSelected
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105'
                                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-100 dark:border-zinc-700'}
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

                <Input
                    placeholder="Notes"
                    value={routineDesc}
                    onChange={e => setRoutineDesc(e.target.value)}
                />
            </div>
        </Modal>
    );
}
