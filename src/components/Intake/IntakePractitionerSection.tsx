import { useDataStore } from "../../store/useDataStore";
import { Button } from "../ui/Button";
import { Plus, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { useMemo } from "react";

export function IntakePractitionerSection() {
    const { practitioners: allPractitioners } = useDataStore();
    const practitioners = useMemo(() => [...(allPractitioners || [])].sort((a, b) => (a.order || 0) - (b.order || 0)), [allPractitioners]);
    // const practitioners = useLiveQuery(() => db.practitioners.orderBy('order').toArray());
    const { currentSession, updateSession } = useAppStore();
    const navigate = useNavigate();

    const handleSelect = (id: string) => {
        updateSession({
            practitionerId: id,
            practitionerNotes: currentSession?.practitionerNotes || "" // Preserve notes
        });
    };

    if (!practitioners || practitioners.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                    <UserRound className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">No Practitioners Found</h3>
                    <p className="text-sm text-zinc-500">Add a practitioner to your team to get started.</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/team")}>
                    <Plus className="w-4 h-4 mr-2" /> Add Practitioner
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                    2. Select Practitioner
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/team")} className="text-xs">
                    Manage
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {practitioners.map(p => (
                    <button
                        key={p.id}
                        onClick={() => handleSelect(p.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${currentSession?.practitionerId === p.id
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 ring-1 ring-emerald-500'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${currentSession?.practitionerId === p.id ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-200 border-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'
                            }`}>
                            <span className="font-bold text-sm">{(p.clinicName || p.name || "S").charAt(0)}</span>
                        </div>
                        <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">
                                {p.clinicName || (p.name && p.name !== "Unknown Practitioner" ? p.name : "Staff")}
                            </div>
                            <div className="text-xs text-zinc-500 font-medium">
                                {p.clinicName ? (p.name && p.name !== "Unknown Practitioner" ? p.name : "Staff") : "Staff"} • {p.role}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
