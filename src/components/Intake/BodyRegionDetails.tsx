
export type BodyDetails = {
    level: number;
    // badges removed
    notes: string;
};

interface BodyRegionDetailsProps {
    bodyPart: string;
    data: BodyDetails;
    onChange: (data: BodyDetails) => void;
    mode?: 'client' | 'practitioner';
}

export function BodyRegionDetails({ bodyPart, data, onChange, mode = 'client' }: BodyRegionDetailsProps) {

    const getPainColor = (level: number) => {
        if (level === 0) return "#e4e4e7"; // zinc-200

        // Interpolate between Sky-100 (224, 242, 254) and Red-500 (239, 68, 68)
        const ratio = level / 10;
        const r = Math.round(224 + (239 - 224) * ratio);
        const g = Math.round(242 + (68 - 242) * ratio);
        const b = Math.round(254 + (68 - 254) * ratio);

        return `rgb(${r}, ${g}, ${b})`;
    };

    const painColor = getPainColor(data.level);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: painColor }}
                    />
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                        {bodyPart.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                </div>
                <div className="text-sm font-medium text-zinc-500">
                    {mode === 'client' ? 'Pain Level' : 'Severity'}: <span style={{ color: painColor }}>{data.level}/10</span>
                </div>
            </div>

            {/* Level Slider */}
            <div className="space-y-2">
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={data.level}
                    onChange={(e) => onChange({ ...data, level: parseInt(e.target.value) })}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer transition-all"
                    style={{ accentColor: painColor }}
                />
                <div className="flex justify-between text-xs text-zinc-400">
                    <span>None</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                </div>
            </div>

            {/* Notes Input */}
            <div>
                <input
                    type="text"
                    value={data.notes}
                    onChange={(e) => onChange({ ...data, notes: e.target.value })}
                    placeholder={mode === 'client' ? `Specifics for ${bodyPart}...` : `Findings for ${bodyPart}...`}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
            </div>
        </div>
    );
}
