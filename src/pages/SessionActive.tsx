import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/Button";
import { BodyRegionSelector } from "../components/BodyMap/BodyRegionSelector";
import { ArrowLeft, CheckCircle, Plus, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "../components/ui/Toast";
import { db } from "../db/db";

const COMMON_INTERVENTIONS = [
    "Adjustment - Cervical",
    "Adjustment - Thoracic",
    "Adjustment - Lumbar",
    "Soft Tissue - Neck",
    "Soft Tissue - Back",
    "Electrical Stimulation",
    "Ultrasound",
    "Exercise Therapy",
    "Traction"
];

export default function SessionActive() {
    const navigate = useNavigate();
    const { currentSession, updateSession, endSession } = useAppStore();
    const { toast } = useToast();
    const [showInterventionInput, setShowInterventionInput] = useState(false);
    const [customIntervention, setCustomIntervention] = useState("");

    if (!currentSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-4">No Active Session</h2>
                    <Button onClick={() => navigate("/")}>Return Home</Button>
                </div>
            </div>
        );
    }

    const handleAddIntervention = (intervention: string) => {
        if (!currentSession.interventions.includes(intervention)) {
            updateSession({
                interventions: [...currentSession.interventions, intervention]
            });
        }
    };

    const handleRemoveIntervention = (intervention: string) => {
        updateSession({
            interventions: currentSession.interventions.filter(i => i !== intervention)
        });
    };

    const handleAddCustomIntervention = () => {
        if (customIntervention.trim()) {
            handleAddIntervention(customIntervention.trim());
            setCustomIntervention("");
            setShowInterventionInput(false);
        }
    };

    const handleFinishSession = async () => {
        // Save session to DB
        try {
            await db.sessions.add({
                id: currentSession.id,
                date: currentSession.startTime, // Use start time as session date
                practitionerId: currentSession.practitionerId || "me",
                practitionerName: "Dr. Chiro", // Placeholder, ideally fetch from profile
                practitionerClass: "Chiropractor", // Placeholder
                notes: currentSession.practitionerNotes, // Main notes
                signatureBase64: null,
                bodyMap: currentSession.bodyMap as any, // Cast to match specific string union if needed, or update DB type
                bodyNotes: currentSession.bodyNotes,
                bodyLevels: currentSession.bodyLevels,
                bodyBadges: currentSession.bodyBadges,
                // clientNotes mapped to bodyNotes or stored separately? 
                // DB Session doesn't have clientNotes field, maybe append to notes or add field?
                // For now, let's append to notes if not empty
                treatmentNotes: {}, // We don't have per-body-part treatment notes in this simplified flow yet
                interventions: currentSession.interventions,
                isLocked: true,
                createdAt: Date.now()
            });

            toast("Session saved successfully!", "success");
            endSession();
            navigate("/");
        } catch (error) {
            console.error("Failed to save session:", error);
            toast("Failed to save session.", "error");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-zinc-400 hover:text-zinc-100">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Active Session</h1>
                        <p className="text-xs text-zinc-400">Practitioner View</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                        LIVE
                    </span>
                </div>
            </header>

            <main className="flex-1 p-4 space-y-8 max-w-3xl mx-auto w-full">
                {/* Client Input Review */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-400 uppercase tracking-wider text-xs">Client Report</h2>
                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-4">
                        {/* Body Map Read-Only */}
                        <div className="pointer-events-none opacity-90 scale-95 origin-top-left">
                            <BodyRegionSelector
                                value={currentSession.bodyMap}
                                onChange={() => { }}
                                mode="simple"
                            />
                        </div>

                        {/* Client Notes */}
                        {currentSession.clientNotes && (
                            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                <p className="text-sm text-zinc-400 italic">" {currentSession.clientNotes} "</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Practitioner Input */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-400 uppercase tracking-wider text-xs">Treatment</h2>

                    {/* Interventions */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300">Interventions</label>
                        <div className="flex flex-wrap gap-2">
                            {currentSession.interventions.map(item => (
                                <span key={item} className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                                    {item}
                                    <button onClick={() => handleRemoveIntervention(item)} className="hover:text-emerald-200">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <button
                                onClick={() => setShowInterventionInput(true)}
                                className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-sm border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                            >
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>

                        {/* Quick Add Common */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {COMMON_INTERVENTIONS.filter(i => !currentSession.interventions.includes(i)).slice(0, 5).map(item => (
                                <button
                                    key={item}
                                    onClick={() => handleAddIntervention(item)}
                                    className="text-xs bg-zinc-900 text-zinc-500 px-2 py-1 rounded border border-zinc-800 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
                                >
                                    + {item}
                                </button>
                            ))}
                        </div>

                        {/* Custom Input Modal/Area */}
                        {showInterventionInput && (
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={customIntervention}
                                    onChange={(e) => setCustomIntervention(e.target.value)}
                                    placeholder="Type intervention..."
                                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-emerald-500"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomIntervention()}
                                />
                                <Button size="sm" onClick={handleAddCustomIntervention}>Add</Button>
                                <Button size="sm" variant="ghost" onClick={() => setShowInterventionInput(false)}>Cancel</Button>
                            </div>
                        )}
                    </div>

                    {/* Practitioner Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">SOAP / Session Notes</label>
                        <textarea
                            value={currentSession.practitionerNotes}
                            onChange={(e) => updateSession({ practitionerNotes: e.target.value })}
                            placeholder="Objective findings, assessment, plan..."
                            className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                        />
                    </div>
                </section>
            </main>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-10 border-t border-zinc-800/50">
                <Button
                    variant="primary"
                    size="lg"
                    className="w-full max-w-3xl mx-auto shadow-xl shadow-emerald-500/20 text-lg h-14 bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={handleFinishSession}
                >
                    Finish & Save Session <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
