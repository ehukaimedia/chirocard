import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";

export type BodyStatus = "normal" | "issue" | "addressed" | "watch";

interface BodyRegionSelectorProps {
    value: Record<string, BodyStatus>;
    levels?: Record<string, number>;
    notes?: Record<string, string>;
    onSave: (part: string, data: { status: BodyStatus; level: number; note: string }) => void;
    readOnly?: boolean;
}

export const REGIONS = [
    { id: "head", label: "Head" },
    { id: "neck", label: "Neck" },
    { id: "l-shoulder", label: "Left Shoulder" },
    { id: "r-shoulder", label: "Right Shoulder" },
    { id: "upper-back", label: "Upper Back" },
    { id: "lower-back", label: "Lower Back" },
    { id: "chest", label: "Chest" },
    { id: "abdominals", label: "Abdominals" },
    { id: "l-arm", label: "Left Arm" },
    { id: "r-arm", label: "Right Arm" },
    { id: "l-hip", label: "Left Hip" },
    { id: "r-hip", label: "Right Hip" },
    { id: "l-leg", label: "Left Leg" },
    { id: "r-leg", label: "Right Leg" },
    { id: "l-foot", label: "Left Foot" },
    { id: "r-foot", label: "Right Foot" },
];

export function BodyRegionSelector({
    value,
    levels = {},
    notes = {},
    onSave,
    readOnly = false
}: BodyRegionSelectorProps) {

    const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
    const [tempStatus, setTempStatus] = useState<BodyStatus>("normal");
    const [tempLevel, setTempLevel] = useState<number>(0);
    const [tempNote, setTempNote] = useState<string>("");

    const activeRegionLabel = activeRegionId ? REGIONS.find(r => r.id === activeRegionId)?.label : "";

    // Initialize modal state when opening
    useEffect(() => {
        if (activeRegionId) {
            setTempStatus(value[activeRegionId] || "normal");
            setTempLevel(levels[activeRegionId] || 0);
            setTempNote(notes[activeRegionId] || "");
        }
    }, [activeRegionId, value, levels, notes, readOnly]);

    const handleSave = () => {
        if (!activeRegionId) return;

        onSave(activeRegionId, {
            status: tempStatus,
            level: tempLevel,
            note: tempNote
        });

        setActiveRegionId(null);
    };

    const handleClear = () => {
        if (!activeRegionId) return;

        onSave(activeRegionId, {
            status: "normal",
            level: 0,
            note: ""
        });

        setActiveRegionId(null);
    };

    const getButtonStyle = (level: number, status: BodyStatus, hasNotes: boolean) => {
        const base = "h-14 rounded-xl border-2 font-bold transition-all active:scale-95 flex items-center justify-center relative shadow-sm";

        let colors = "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800";

        if (status === 'addressed') {
            colors = "bg-blue-100 dark:bg-blue-900/40 border-blue-500 text-blue-800 dark:text-blue-100 shadow-blue-500/10";
        } else if (status === 'watch') {
            colors = "bg-yellow-200 dark:bg-yellow-900/40 border-yellow-600 text-yellow-900 dark:text-yellow-100 shadow-yellow-500/10 font-bold";
        } else if (status === 'issue' || level > 0) {
            // Gradient based on pain level - Vibrant Reds
            if (level <= 3) colors = "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-100";
            else if (level <= 6) colors = "bg-red-100 dark:bg-red-900/50 border-red-600 text-red-900 dark:text-red-50";
            else colors = "bg-red-200 dark:bg-red-900/70 border-red-700 text-red-950 dark:text-white ring-2 ring-red-500/50";
        } else if (hasNotes) {
            // Normal status but has notes -> Show outline
            colors = "bg-zinc-50 dark:bg-zinc-900 border-indigo-500 text-zinc-900 dark:text-zinc-100 dashed ring-1 ring-indigo-500/30";
        }

        return cn(base, colors);
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                {REGIONS.map((region) => {
                    const status = value[region.id] || 'normal';
                    const level = levels[region.id] || 0;
                    const regionNotes = notes[region.id];
                    const hasNotes = !!regionNotes && regionNotes.length > 0;

                    return (
                        <button
                            key={region.id}
                            onClick={() => {
                                if (readOnly) return;
                                setActiveRegionId(region.id);
                            }}
                            disabled={readOnly}
                            className={getButtonStyle(level, status, hasNotes)}
                        >
                            {region.label}
                            {/* Badges for Level */}
                            {level > 0 && (
                                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow-sm border border-white dark:border-zinc-900">
                                    {level}
                                </span>
                            )}
                            {/* Badge for Notes (if no level shown, or distinct) */}
                            {hasNotes && level === 0 && (
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Smart Interaction Modal */}
            <Modal
                isOpen={!!activeRegionId}
                onClose={() => setActiveRegionId(null)}
                title={activeRegionLabel || "Body Region"}
                confirmLabel="Save Details"
                onConfirm={handleSave}
                cancelLabel="Reset & Clear"
                cancelButtonVariant="outline"
                onCancel={handleClear}
            >
                <div className="space-y-6 py-2">
                    {/* 1. Status Selection */}
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-xl grid grid-cols-4 gap-2">
                        {(['normal', 'watch', 'issue', 'addressed'] as BodyStatus[]).map((s) => {
                            const isSelected = tempStatus === s;
                            let activeClass = "";
                            if (s === 'normal') activeClass = "bg-emerald-600 text-white shadow-md shadow-emerald-500/20";
                            else if (s === 'watch') activeClass = "bg-yellow-500 text-black shadow-md shadow-yellow-500/20 ring-1 ring-yellow-600/20";
                            else if (s === 'issue') activeClass = "bg-red-600 text-white shadow-md shadow-red-500/20";
                            else if (s === 'addressed') activeClass = "bg-blue-600 text-white shadow-md shadow-blue-500/20";

                            return (
                                <button
                                    key={s}
                                    onClick={() => setTempStatus(s)}
                                    className={cn(
                                        "text-xs font-bold py-3 rounded-lg transition-all capitalize",
                                        isSelected
                                            ? activeClass
                                            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200"
                                    )}
                                >
                                    {s}
                                </button>
                            );
                        })}
                    </div>

                    {/* 2. Pain Level Slider (Always Visible) */}
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wide">
                                Pain Level
                            </label>
                            <span className={cn(
                                "text-2xl font-black w-12 h-12 flex items-center justify-center rounded-xl transition-colors",
                                tempLevel > 7 ? "bg-red-500 text-white shadow-lg shadow-red-500/20" :
                                    tempLevel > 4 ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" :
                                        tempLevel > 0 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                                            "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                            )}>
                                {tempLevel}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={tempLevel}
                            onChange={(e) => {
                                const newLevel = parseInt(e.target.value);
                                setTempLevel(newLevel);
                                // Auto-switch status from 'normal' to 'issue' if pain is increased
                                if (tempStatus === 'normal' && newLevel > 0) {
                                    setTempStatus('issue');
                                }
                            }}
                            className="w-full h-4 rounded-full appearance-none cursor-pointer touch-none big-thumb"
                            style={{
                                background: `linear-gradient(to right, #10b981 0%, #fbbf24 50%, #ef4444 100%)`
                            }}
                        />
                        <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                            <span>No Pain</span>
                            <span>Moderate</span>
                            <span>Severe</span>
                        </div>
                    </div>

                    {/* 3. Notes */}
                    <div className="space-y-3">
                        <label className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                            Notes
                        </label>
                        <textarea
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            placeholder="Describe sensation, restrictions, or specific location..."
                            className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-base text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none shadow-sm placeholder:text-zinc-400"
                        />
                        {/* Mobile Keyboard Spacer */}
                        <div className="h-72 sm:h-0 w-full" aria-hidden="true" />
                    </div>
                </div>
            </Modal>
        </>
    );
}
