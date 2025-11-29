import { cn } from "../../lib/utils";

export type BodyStatus = "normal" | "issue" | "addressed" | "watch";

interface BodyRegionSelectorProps {
    value: Record<string, BodyStatus>;
    onChange: (part: string, status: BodyStatus) => void;
    readOnly?: boolean;
    mode?: 'simple' | 'detailed';
}

const REGIONS = [
    { id: "head", label: "Head" },
    { id: "neck", label: "Neck" },
    { id: "l-shoulder", label: "L Shoulder" },
    { id: "r-shoulder", label: "R Shoulder" },
    { id: "upper-back", label: "Upper Back" },
    { id: "lower-back", label: "Lower Back" },
    { id: "chest", label: "Chest" },
    { id: "abdominals", label: "Abdominals" },
    { id: "l-arm", label: "L Arm" },
    { id: "r-arm", label: "R Arm" },
    { id: "l-hip", label: "L Hip" },
    { id: "r-hip", label: "R Hip" },
    { id: "l-leg", label: "L Leg" },
    { id: "r-leg", label: "R Leg" },
    { id: "l-foot", label: "L Foot" },
    { id: "r-foot", label: "R Foot" },
];

export function BodyRegionSelector({ value, onChange, readOnly = false, mode = 'detailed' }: BodyRegionSelectorProps) {
    const getStatusColor = (status: BodyStatus) => {
        switch (status) {
            case "issue": return "bg-red-500/20 text-red-500 border-red-500 hover:bg-red-500/30";
            case "addressed": return "bg-green-500/20 text-green-500 border-green-500 hover:bg-green-500/30";
            case "watch": return "bg-blue-500/20 text-blue-500 border-blue-500 hover:bg-blue-500/30";
            default: return "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700";
        }
    };

    const handleToggle = (partId: string) => {
        if (readOnly) return;

        const current = value[partId] || "normal";
        let next: BodyStatus = "normal";

        // Cycle: Normal -> Issue -> Watch -> Normal (User Mode)
        // Note: 'Addressed' is typically set by Practitioner, but we can allow cycling or specific logic
        if (mode === 'simple') {
            // Simple toggle: Normal <-> Issue
            next = current === 'issue' ? 'normal' : 'issue';
        } else {
            // Detailed cycle
            if (current === "normal") next = "issue";
            else if (current === "issue") next = "watch";
            else next = "normal";
        }

        onChange(partId, next);
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {REGIONS.map((region) => (
                <button
                    key={region.id}
                    onClick={() => handleToggle(region.id)}
                    disabled={readOnly}
                    className={cn(
                        "h-14 rounded-xl border-2 font-medium transition-all active:scale-95 flex items-center justify-center",
                        getStatusColor(value[region.id] || "normal"),
                        readOnly && "cursor-default active:scale-100"
                    )}
                >
                    {region.label}
                </button>
            ))}
        </div>
    );
}
