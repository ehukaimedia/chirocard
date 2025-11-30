import type { BodyStatus } from "../BodyMap/BodyRegionSelector";
import { Card } from "../ui/Card";
import { cn } from "../../lib/utils";
import { Check, Eye, X, MessageSquare, User } from "lucide-react";

interface BodyAreaCardProps {
    regionId: string;
    regionLabel: string;
    patientStatus?: BodyStatus;
    patientNote?: string;
    practitionerStatus: BodyStatus;
    practitionerNote: string;
    practitionerLevel?: number;
    practitionerBadges?: string[];
    patientLevel?: number;
    patientBadges?: string[];
    onStatusChange: (status: BodyStatus) => void;
    onNoteChange: (note: string) => void;
    onLevelChange: (level: number) => void;
    onBadgesChange: (badges: string[]) => void;
}

export function BodyAreaCard({
    regionLabel,
    patientStatus,
    patientNote,
    practitionerStatus,
    practitionerNote,
    practitionerLevel,
    practitionerBadges,
    patientLevel,
    patientBadges,
    onStatusChange,
    onNoteChange,
    onLevelChange,
    onBadgesChange
}: BodyAreaCardProps) {

    // Helper to determine card border color based on status
    const getBorderColor = () => {
        if (practitionerStatus === 'addressed') return "border-emerald-500/50";
        if (practitionerStatus === 'watch') return "border-blue-500/50";
        if (patientStatus === 'issue') return "border-red-500/50";

        return "border-zinc-200 dark:border-zinc-800";
    };

    return (
        <Card className={cn("p-4 transition-all duration-300 bg-white dark:bg-zinc-900/50 shadow-sm", getBorderColor())}>
            <div className="flex flex-col gap-4">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{regionLabel}</h3>
                        {patientStatus === 'issue' && (
                            <div className="mt-1 space-y-1">
                                <span className="text-xs font-medium text-red-400 flex items-center gap-1">
                                    <User className="w-3 h-3" /> Patient Flagged
                                </span>
                                {(patientLevel !== undefined || (patientBadges && patientBadges.length > 0)) && (
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {patientLevel !== undefined && (
                                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                                Pain Level: {patientLevel}/10
                                            </span>
                                        )}
                                        {patientBadges?.map(badge => (
                                            <span key={badge} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Status Toggles */}
                    <div className="flex bg-zinc-50 dark:bg-zinc-950 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => onStatusChange('addressed')}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                                practitionerStatus === 'addressed'
                                    ? "bg-emerald-500 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900"
                            )}
                            title="Mark as Treated"
                        >
                            <Check className="w-3.5 h-3.5" /> Treated
                        </button>
                        <button
                            onClick={() => onStatusChange('watch')}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                                practitionerStatus === 'watch'
                                    ? "bg-blue-500 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900"
                            )}
                            title="Mark to Watch"
                        >
                            <Eye className="w-3.5 h-3.5" /> Monitor
                        </button>
                        <button
                            onClick={() => onStatusChange('normal')}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                                practitionerStatus === 'normal'
                                    ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-200 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900"
                            )}
                            title="Dismiss / Normal"
                        >
                            <X className="w-3.5 h-3.5" /> Dismiss
                        </button>
                    </div>
                </div>

                {/* Patient Note (if exists) */}
                {patientNote && (
                    <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-sm">
                        <span className="text-red-500 dark:text-red-400 font-medium text-xs uppercase tracking-wider mb-1 block">Patient Note</span>
                        <p className="text-zinc-700 dark:text-zinc-300 italic">"{patientNote}"</p>
                    </div>
                )}

                {/* Practitioner Note Input */}
                <div className="space-y-3">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" /> Clinical Assessment
                    </label>

                    {/* Practitioner Assessment Controls (Visible when Treated or Watch) */}
                    {(practitionerStatus === 'addressed' || practitionerStatus === 'watch') && (
                        <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800 space-y-3">
                            {/* Level Slider */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-zinc-500">Assessment Level</span>
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{practitionerLevel || 0}/10</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="1"
                                    value={practitionerLevel || 0}
                                    onChange={(e) => onLevelChange(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800 accent-emerald-500"
                                />
                            </div>

                            {/* Clinical Badges */}
                            <div>
                                <span className="text-xs text-zinc-500 block mb-2">Findings</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {["High Tension", "Misalignment", "Inflammation", "Muscle Knot", "Muscle Spasm", "Limited Mobility", "Weakness", "Stable"].map(badge => {
                                        const isSelected = (practitionerBadges || []).includes(badge);
                                        return (
                                            <button
                                                key={badge}
                                                onClick={() => {
                                                    const current = practitionerBadges || [];
                                                    onBadgesChange(isSelected ? current.filter(b => b !== badge) : [...current, badge]);
                                                }}
                                                className={cn(
                                                    "text-[10px] px-2 py-1 rounded-full border transition-all",
                                                    isSelected
                                                        ? "bg-emerald-500 text-white border-emerald-600"
                                                        : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50"
                                                )}
                                            >
                                                {badge}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    <textarea
                        value={practitionerNote}
                        onChange={(e) => onNoteChange(e.target.value)}
                        placeholder={`Describe treatment for ${regionLabel}...`}
                        className="w-full min-h-[80px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-y"
                    />
                </div>
            </div>
        </Card>
    );
}
