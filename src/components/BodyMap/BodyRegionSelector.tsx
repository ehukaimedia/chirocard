import { cn } from "../../lib/utils";
import { REGIONS } from "../../constants/bodyRegions";

export type BodyStatus = "normal" | "issue" | "addressed" | "watch";

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

    const getBackgroundColor = (level: number) => {
        // Icy Blue (Sky-100) to Red (Red-500)
        // Sky-100: 224, 242, 254
        // Red-500: 239, 68, 68

        if (level === 0) return "bg-sky-100 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300";

        // Simple interpolation for levels 1-10
        // We'll use classes for a few distinct steps or just dynamic style if we want smooth gradient
        // For simplicity and Tailwind compatibility, let's map ranges or use style.

        // Let's use dynamic style for the background to get the smooth transition
        const ratio = level / 10;
        const r = Math.round(224 + (239 - 224) * ratio);
        const g = Math.round(242 + (68 - 242) * ratio);
        const b = Math.round(254 + (68 - 254) * ratio);

        return {
            backgroundColor: `rgb(${r}, ${g}, ${b})`,
            borderColor: `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`,
            color: level > 5 ? 'white' : 'black'
        };
    };

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
        onSave?.(partId, { status: next, level: levels[partId] || 0, note: notes[partId] || '' });

        // Reset level to 0 if deselected
        if (next === 'normal' && onLevelChange) {
            onLevelChange(partId, 0);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {REGIONS.map((region) => {
                const level = levels[region.id] || 0;
                const style = getBackgroundColor(level);
                const isCustomStyle = typeof style === 'object';

                return (
                    <button
                        key={region.id}
                        onClick={() => handleToggle(region.id)}
                        disabled={readOnly}
                        className={cn(
                            "h-14 rounded-xl border-2 font-medium transition-all active:scale-95 flex items-center justify-center",
                            !isCustomStyle && style, // Apply class if string
                            readOnly && "cursor-default active:scale-100"
                        )}
                        style={isCustomStyle ? style : undefined}
                    >
                        {region.label}
                    </button>
                );
            })}
        </div>
    );
}
