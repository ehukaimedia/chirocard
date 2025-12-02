import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/Button";
import { BodyRegionSelector } from "../components/BodyMap/BodyRegionSelector";
import { ArrowLeft, CheckCircle, Plus, Wand2, Copy, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "../components/ui/Toast";
import { db } from "../db/db";
import { BodyRegionDetails } from "../components/Intake/BodyRegionDetails";
import { SignaturePad } from "../components/Shared/SignaturePad";

const INTERVENTION_CATEGORIES = {
    "Adjustments": [
        "Cervical Adj", "Thoracic Adj", "Lumbar Adj", "Sacral Adj", "Pelvic Adj", "Extremity Adj"
    ],
    "Soft Tissue": [
        "Myofascial Release", "Trigger Point", "Deep Tissue", "Stretching", "IASTM", "Cupping"
    ],
    "Modalities": [
        "E-Stim", "Ultrasound", "Heat", "Ice", "Laser", "Traction"
    ],
    "Rehab": [
        "Exercise", "Posture", "Gait Training", "Ergonomics"
    ]
};

export default function SessionActive() {
    const navigate = useNavigate();
    const { currentSession, updateSession, endSession } = useAppStore();
    const { toast } = useToast();
    const [showInterventionInput, setShowInterventionInput] = useState(false);
    const [customIntervention, setCustomIntervention] = useState("");
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    const [showReview, setShowReview] = useState(false);
    const [practitionerSignature, setPractitionerSignature] = useState<string | null>(null);

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

    const toggleCard = (part: string) => {
        setExpandedCards(prev => ({ ...prev, [part]: !prev[part] }));
    };

    const handleAddIntervention = (intervention: string) => {
        if (!currentSession.interventions.includes(intervention)) {
            updateSession({
                interventions: [...currentSession.interventions, intervention]
            });
            setCustomIntervention("");
            setShowInterventionInput(false);
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

    const handleSmartCopy = (part: string) => {
        const clientLevel = currentSession.bodyLevels[part] || 0;

        updateSession({
            practitionerLevels: { ...currentSession.practitionerLevels, [part]: clientLevel },
            // practitionerBadges: { ...currentSession.practitionerBadges, [part]: clientBadges } // Removed
        });
        toast("Copied client findings", "success");
    };

    const generateSmartSOAP = () => {
        const parts = Object.keys(currentSession.bodyMap).filter(p =>
            currentSession.bodyMap[p] === 'issue' || currentSession.bodyMap[p] === 'addressed'
        );

        let soap = "";

        // Subjective
        soap += "S: Client presents with ";
        if (parts.length > 0) {
            soap += parts.map(p => {
                const level = currentSession.bodyLevels[p];
                // const badges = currentSession.bodyBadges[p]?.join(", ");
                return `${p} pain (${level}/10)`;
            }).join("; ");
        } else {
            soap += "no specific complaints";
        }
        if (currentSession.clientNotes) soap += `. Client notes: "${currentSession.clientNotes}"`;
        soap += ".\n\n";

        // Objective
        soap += "O: ";
        if (parts.length > 0) {
            soap += parts.map(p => {
                const level = currentSession.practitionerLevels?.[p];
                // const badges = currentSession.practitionerBadges?.[p]?.join(", ");
                const notes = currentSession.treatmentNotes?.[p];
                let text = `${p}`;
                if (level) text += ` tenderness (${level}/10)`;
                // if (badges) text += ` - ${badges}`;
                if (notes) text += ` (${notes})`;
                return text;
            }).join("; ");
        } else {
            soap += "Standard evaluation performed.";
        }
        soap += ".\n\n";

        // Assessment
        soap += "A: Improving. Tolerated treatment well.\n\n";

        // Plan
        soap += "P: ";
        if (currentSession.interventions.length > 0) {
            soap += "Performed: " + currentSession.interventions.join(", ") + ". ";
        }
        soap += "Continue current care plan.";

        updateSession({ practitionerNotes: soap });
        toast("SOAP note generated!", "success");
    };

    const handleFinishSession = async () => {
        if (!practitionerSignature) {
            toast("Please sign to finalize the session.", "error");
            return;
        }

        try {
            await db.sessions.add({
                id: currentSession.id,
                date: currentSession.startTime, // Use start time as session date
                practitionerId: currentSession.practitionerId || "me",
                practitionerName: "Dr. Chiro", // Placeholder, ideally fetch from profile
                practitionerClass: "Chiropractor", // Placeholder
                notes: currentSession.practitionerNotes, // Main notes
                signatureBase64: practitionerSignature, // Save practitioner signature
                userSignature: currentSession.userSignature || undefined,
                bodyMap: currentSession.bodyMap as any,
                bodyNotes: currentSession.bodyNotes,
                bodyLevels: currentSession.bodyLevels,
                bodyBadges: currentSession.bodyBadges,
                treatmentNotes: currentSession.treatmentNotes,
                practitionerLevels: currentSession.practitionerLevels,
                practitionerBadges: currentSession.practitionerBadges,
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

    const activeBodyParts = useMemo(() => Object.entries(currentSession.bodyMap)
        .filter(([_, status]) => status === 'issue' || status === 'addressed' || status === 'watch')
        .map(([part]) => part), [currentSession.bodyMap]);

    // --- Review Screen ---
    if (showReview) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col pb-24">
                <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setShowReview(false)} className="text-zinc-400 hover:text-zinc-100">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Review & Sign</h1>
                        <p className="text-xs text-zinc-400">Finalize Session</p>
                    </div>
                </header>

                <main className="flex-1 p-4 space-y-6 max-w-3xl mx-auto w-full">
                    {/* Summary Card */}
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <FileText className="w-5 h-5" />
                            <h3 className="font-semibold">Session Summary</h3>
                        </div>

                        <div className="space-y-4 text-sm text-zinc-300">
                            <div>
                                <span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">Interventions</span>
                                <div className="flex flex-wrap gap-2">
                                    {currentSession.interventions.length > 0 ? (
                                        currentSession.interventions.map(i => (
                                            <span key={i} className="bg-zinc-800 px-2 py-1 rounded text-zinc-200">{i}</span>
                                        ))
                                    ) : (
                                        <span className="text-zinc-500 italic">None recorded</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">SOAP Notes</span>
                                <div className="bg-zinc-950 p-3 rounded border border-zinc-800 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                    {currentSession.practitionerNotes || "No notes recorded."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Client Authorization</h3>
                            <div className="bg-zinc-950 p-4 rounded border border-zinc-800 h-24 flex items-center justify-center">
                                {currentSession.userSignature ? (
                                    <img src={currentSession.userSignature} alt="Client Signature" className="max-h-full max-w-full object-contain invert" />
                                ) : (
                                    <span className="text-zinc-600 text-xs italic">No signature recorded</span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500">Signed by Client</p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Practitioner Signature</h3>
                            <div className="bg-white rounded h-24 overflow-hidden">
                                <SignaturePad onChange={setPractitionerSignature} />
                            </div>
                            <p className="text-xs text-zinc-500">Sign above to certify</p>
                        </div>
                    </div>
                </main>

                <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-10 border-t border-zinc-800/50">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full max-w-3xl mx-auto shadow-xl shadow-emerald-500/20 text-lg h-14 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleFinishSession}
                        disabled={!practitionerSignature}
                    >
                        Finalize Session <CheckCircle className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        );
    }

    // --- Main Active Session Screen ---
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

                {/* 1. Unified Findings Cards */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-zinc-400 uppercase tracking-wider text-xs">Findings & Treatment</h2>
                        <div className="text-xs text-zinc-500">
                            {activeBodyParts.length} Areas Active
                        </div>
                    </div>

                    {/* Add Area Widget */}
                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                        <p className="text-sm text-zinc-400 mb-2">Tap body map to add/remove areas:</p>
                        <div className="scale-95 origin-top-left">
                            <BodyRegionSelector
                                value={currentSession.bodyMap}
                                levels={currentSession.bodyLevels}
                                onChange={(part, status) => updateSession({
                                    bodyMap: { ...currentSession.bodyMap, [part]: status }
                                })}
                                onLevelChange={(part, level) => updateSession({
                                    bodyLevels: { ...currentSession.bodyLevels, [part]: level }
                                })}
                                mode="simple"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {activeBodyParts.map(part => {
                            const hasClientData = currentSession.bodyLevels[part] !== undefined || currentSession.bodyNotes[part];
                            const isExpanded = expandedCards[part] ?? true; // Default expanded

                            return (
                                <div key={part} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden transition-all">
                                    {/* Card Header */}
                                    <div
                                        className="p-4 flex items-center justify-between cursor-pointer bg-zinc-900 hover:bg-zinc-800/50"
                                        onClick={() => toggleCard(part)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${hasClientData ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                            <h3 className="font-bold text-zinc-100 capitalize text-lg">
                                                {part.replace(/([A-Z])/g, ' $1').trim()}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasClientData && (
                                                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded">
                                                    Reported: {currentSession.bodyLevels[part]}/10
                                                </span>
                                            )}
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    {isExpanded && (
                                        <div className="p-4 pt-0 space-y-4 border-t border-zinc-800/50">
                                            {/* Client Context */}
                                            {hasClientData && (
                                                <div className="mt-4 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-bold uppercase text-zinc-500">Client Report</div>
                                                        <div className="text-sm text-zinc-300">
                                                            <span className="font-medium">Pain: {currentSession.bodyLevels[part]}/10</span>
                                                            {/* Badges removed */}
                                                        </div>
                                                        {currentSession.bodyNotes[part] && (
                                                            <div className="text-sm text-zinc-400 italic">"{currentSession.bodyNotes[part]}"</div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                                        onClick={(e) => { e.stopPropagation(); handleSmartCopy(part); }}
                                                    >
                                                        <Copy className="w-3 h-3 mr-1" /> Copy to Findings
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Practitioner Input */}
                                            <div className="mt-4">
                                                <div className="text-xs font-bold uppercase text-zinc-500 mb-2">My Findings</div>
                                                <BodyRegionDetails
                                                    bodyPart={part}
                                                    mode="practitioner"
                                                    data={{
                                                        level: currentSession.practitionerLevels?.[part] ?? currentSession.bodyLevels[part] ?? 0,
                                                        notes: currentSession.treatmentNotes?.[part] || ""
                                                    }}
                                                    onChange={(data) => updateSession({
                                                        practitionerLevels: { ...currentSession.practitionerLevels, [part]: data.level },
                                                        treatmentNotes: { ...currentSession.treatmentNotes, [part]: data.notes }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 2. Categorized Interventions */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-400 uppercase tracking-wider text-xs">Interventions</h2>

                    <div className="space-y-6">
                        {Object.entries(INTERVENTION_CATEGORIES).map(([category, items]) => (
                            <div key={category} className="space-y-2">
                                <h3 className="text-sm font-medium text-zinc-500">{category}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {items.map(item => {
                                        const isSelected = currentSession.interventions.includes(item);
                                        return (
                                            <button
                                                key={item}
                                                onClick={() => isSelected ? handleRemoveIntervention(item) : handleAddIntervention(item)}
                                                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${isSelected
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                                                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Custom Add */}
                        <div className="pt-2">
                            {!showInterventionInput ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowInterventionInput(true)}
                                    className="text-zinc-400 border-zinc-800 hover:bg-zinc-900"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Custom
                                </Button>
                            ) : (
                                <div className="flex gap-2">
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
                    </div>
                </section>

                {/* 3. Smart SOAP Notes */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-zinc-400 uppercase tracking-wider text-xs">Session Notes</h2>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={generateSmartSOAP}
                            className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                            <Wand2 className="w-3 h-3 mr-2" /> Auto-Generate SOAP
                        </Button>
                    </div>
                    <textarea
                        value={currentSession.practitionerNotes}
                        onChange={(e) => updateSession({ practitionerNotes: e.target.value })}
                        placeholder="Notes will appear here..."
                        className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none font-mono text-sm leading-relaxed"
                    />
                </section>
            </main>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-10 border-t border-zinc-800/50">
                <Button
                    variant="primary"
                    size="lg"
                    className="w-full max-w-3xl mx-auto shadow-xl shadow-emerald-500/20 text-lg h-14 bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => setShowReview(true)}
                >
                    Review & Sign <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
