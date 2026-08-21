import { cn } from "../../lib/utils";
import { REGIONS } from "../../constants/bodyRegions";
import { painLevelClass } from "../../constants/painLevels";

export type BodyStatus = "normal" | "issue" | "addressed" | "watch";

const STATUS_LABEL: Record<BodyStatus, string> = {
    normal: "Clear",
    issue: "Issue",
    watch: "Watch",
    addressed: "Addressed",
};

interface BodyRegionSelectorProps {
    value: Record<string, BodyStatus>;
    levels?: Record<string, number>;
    notes?: Record<string, string>;
    onChange?: (part: string, status: BodyStatus) => void;
    onSave?: (part: string, data: { status: BodyStatus; level: number; note: string }) => void;
    onLevelChange?: (part: string, level: number) => void;
    readOnly?: boolean;
    mode?: 'simple' | 'detailed';
}

export function BodyRegionSelector({
    value,
    levels = {},
    notes = {},
    onChange,
    onSave,
    onLevelChange,
    readOnly = false,
    mode = 'detailed'
}: BodyRegionSelectorProps) {
    const handleToggle = (partId: string) => {
        if (readOnly) return;

        const current = value[partId] || "normal";
        let next: BodyStatus = "normal";

        if (mode === 'simple') {
            next = current === 'issue' ? 'normal' : 'issue';
        } else {
            if (current === "normal") next = "issue";
            else if (current === "issue") next = "watch";
            else if (current === "watch") next = "addressed";
            else next = "normal";
        }

        onChange?.(partId, next);
        onSave?.(partId, {
            status: next,
            level: next === 'normal' ? 0 : (levels[partId] || 0),
            note: next === 'normal' ? '' : (notes[partId] || '')
        });

        if (next === 'normal' && onLevelChange) {
            onLevelChange(partId, 0);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {REGIONS.map((region) => {
                const level = levels[region.id] || 0;
                const status = value[region.id] || "normal";

                return (
                    <button
                        type="button"
                        key={region.id}
                        onClick={() => handleToggle(region.id)}
                        disabled={readOnly}
                        aria-pressed={status !== "normal"}
                        aria-label={`${region.label}, ${STATUS_LABEL[status]}${level > 0 ? `, pain ${level} of 10` : ""}`}
                        className={cn(
                            "min-h-14 px-3 py-2 rounded-xl border-2 font-medium transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5",
                            painLevelClass(level),
                            readOnly && "cursor-default active:scale-100"
                        )}
                    >
                        <span>{region.label}</span>
                        {(status !== "normal" || level > 0) && (
                            <span className="text-xs font-semibold opacity-90">
                                {STATUS_LABEL[status]}{level > 0 ? ` · ${level}/10` : ""}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
