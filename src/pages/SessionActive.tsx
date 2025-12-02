import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/Button";
import { BodyRegionSelector } from "../components/BodyMap/BodyRegionSelector";
import { ArrowLeft, CheckCircle, Copy, ChevronDown, ChevronUp, FileText, Wand2, Plus, Trash2 } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { useState, useMemo } from "react";
import { useToast } from "../components/ui/Toast";
import { db } from "../db/db";
import { BodyRegionDetails } from "../components/Intake/BodyRegionDetails";
import { SignaturePad } from "../components/Shared/SignaturePad";
import { SERVICE_TAGS, FINDING_TAGS } from "../db/db";
import { useLiveQuery } from "dexie-react-hooks";



export default function SessionActive() {
    const navigate = useNavigate();
    const { currentSession, updateSession, endSession } = useAppStore();
    const { toast } = useToast();
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    const [showReview, setShowReview] = useState(false);
    const [practitionerSignature, setPractitionerSignature] = useState<string | null>(null);

    const user = useLiveQuery(() => db.users.get("me"));
    const practitioner = useLiveQuery(
        async () => {
            if (currentSession?.practitionerId) {
                return await db.practitioners.get(currentSession.practitionerId);
            }
            return undefined;
        },
        [currentSession?.practitionerId]
    );

    // Recommendations State
    const [newRecTitle, setNewRecTitle] = useState("");
    const [newRecDesc, setNewRecDesc] = useState("");
    const [newRecFreq, setNewRecFreq] = useState<string>("Daily");
    const [newRecCategory, setNewRecCategory] = useState<'relief' | 'movement' | 'lifestyle' | 'custom'>('custom');

    const activeBodyParts = useMemo(() => {
        if (!currentSession?.bodyMap) return [];
        return Object.entries(currentSession.bodyMap)
            .filter(([, status]) => status === 'issue' || status === 'addressed' || status === 'watch')
            .map(([part]) => part);
    }, [currentSession]);

    const handleAddRec = () => {
        if (!newRecTitle || !currentSession) return;
        updateSession({
            recommendations: [...(currentSession.recommendations || []), {
                id: crypto.randomUUID(),
                title: newRecTitle,
                description: newRecDesc,
                frequency: newRecFreq,
                category: newRecCategory,
                reminderTimes: [],
                isCompletedToday: false,
                status: 'pending',
                createdAt: Date.now()
            }]
        });
        setNewRecTitle("");
        setNewRecDesc("");
        setNewRecFreq("Daily");
        setNewRecCategory('custom');
    };

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
                practitionerName: currentSession.practitionerName || "Dr. Chiro",
                practitionerClass: currentSession.practitionerClass || "Chiropractor",
                notes: currentSession.practitionerNotes, // Main notes
                signatureBase64: practitionerSignature, // Save practitioner signature
                userSignature: currentSession.userSignature || undefined,
                bodyMap: currentSession.bodyMap,
                bodyNotes: currentSession.bodyNotes,
                bodyLevels: currentSession.bodyLevels,
                bodyBadges: currentSession.bodyBadges,
                treatmentNotes: currentSession.treatmentNotes,
                practitionerLevels: currentSession.practitionerLevels,
                practitionerBadges: currentSession.practitionerBadges,
                interventions: currentSession.interventions,
                recommendations: currentSession.recommendations,
                serviceTags: currentSession.serviceTags,
                modalityTags: currentSession.modalityTags,
                findingTags: currentSession.findingTags,
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

                    {/* 1. Intake Overview (Client Data) */}
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
                        <div className="flex items-center gap-3 text-zinc-400 mb-2">
                            <FileText className="w-5 h-5" />
                            <h3 className="font-semibold uppercase tracking-wider text-xs">Intake Overview</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Client Notes */}
                            <div>
                                <span className="text-zinc-500 block text-xs font-medium mb-1">Client Notes</span>
                                <p className="text-zinc-300 text-sm bg-zinc-950/50 p-3 rounded border border-zinc-800/50 italic">
                                    "{currentSession.clientNotes || "No notes provided."}"
                                </p>
                            </div>

                            {/* Reported Issues */}
                            <div>
                                <span className="text-zinc-500 block text-xs font-medium mb-2">Reported Issues</span>
                                {activeBodyParts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {activeBodyParts.map(part => {
                                            const level = currentSession.bodyLevels[part];
                                            const note = currentSession.bodyNotes[part];
                                            if (!level && !note) return null; // Skip if no client data for this active part

                                            return (
                                                <div key={part} className="bg-zinc-950 p-3 rounded border border-zinc-800 flex flex-col gap-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-zinc-200 font-medium capitalize text-sm">
                                                            {part.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        {level && (
                                                            <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                                                                Pain: {level}/10
                                                            </span>
                                                        )}
                                                    </div>
                                                    {note && (
                                                        <p className="text-zinc-500 text-xs italic">"{note}"</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-zinc-500 text-sm italic">No specific areas reported.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Examination & Treatment (Practitioner Data) */}
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <div className="flex flex-col">
                                <h3 className="font-semibold uppercase tracking-wider text-xs">Examination & Treatment</h3>
                                <span className="text-xs text-emerald-500 font-medium">
                                    Practitioner: {currentSession.practitionerName || "Unknown"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Findings & Notes per Area */}
                            <div>
                                <span className="text-zinc-500 block text-xs font-medium mb-2">Findings & Treatment Notes</span>
                                {activeBodyParts.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {activeBodyParts.map(part => {
                                            const level = currentSession.practitionerLevels?.[part];
                                            const note = currentSession.treatmentNotes?.[part];

                                            return (
                                                <div key={part} className="bg-zinc-950 p-3 rounded border border-zinc-800 flex flex-col gap-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-zinc-200 font-medium capitalize text-sm">
                                                            {part.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        {level !== undefined && (
                                                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                                                                Tenderness: {level}/10
                                                            </span>
                                                        )}
                                                    </div>
                                                    {note ? (
                                                        <p className="text-zinc-400 text-sm mt-1">{note}</p>
                                                    ) : (
                                                        <p className="text-zinc-600 text-xs italic mt-1">No specific treatment notes.</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-zinc-500 text-sm italic">No areas treated.</p>
                                )}
                            </div>

                            {/* Interventions Summary */}
                            <div>
                                <span className="text-zinc-500 block text-xs font-medium mb-2">Interventions Performed</span>
                                <div className="flex flex-wrap gap-2">
                                    {currentSession.interventions.length > 0 ? (
                                        currentSession.interventions.map(i => (
                                            <span key={i} className="bg-zinc-800 px-2 py-1 rounded text-zinc-200 text-sm border border-zinc-700">{i}</span>
                                        ))
                                    ) : (
                                        <span className="text-zinc-500 italic text-sm">None recorded</span>
                                    )}
                                </div>
                            </div>

                            {/* Services & Modalities */}
                            <div>
                                <span className="text-zinc-500 block text-xs font-medium mb-2">Services & Modalities</span>
                                <div className="space-y-2">
                                    {/* Services */}
                                    {currentSession.serviceTags && currentSession.serviceTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {currentSession.serviceTags.map(tag => (
                                                <span key={tag} className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs border border-emerald-500/20">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    {/* Modalities */}
                                    {currentSession.modalityTags && currentSession.modalityTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {currentSession.modalityTags.map(tag => (
                                                <span key={tag} className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/20">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    {(!currentSession.serviceTags?.length && !currentSession.modalityTags?.length) && (
                                        <span className="text-zinc-500 italic text-sm">None recorded</span>
                                    )}
                                </div>
                            </div>

                            {/* Findings Tags */}
                            <div>
                                <span className="text-zinc-500 block text-xs font-medium mb-2">Clinical Findings</span>
                                <div className="flex flex-wrap gap-2">
                                    {currentSession.findingTags && currentSession.findingTags.length > 0 ? (
                                        currentSession.findingTags.map(tag => (
                                            <span key={tag} className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded text-xs border border-amber-500/20">{tag}</span>
                                        ))
                                    ) : (
                                        <span className="text-zinc-500 italic text-sm">None recorded</span>
                                    )}
                                </div>
                            </div>

                            {/* SOAP Notes */}
                            <div>
                                <span className="text-zinc-500 block text-xs font-medium mb-2">Final SOAP Notes</span>
                                <div className="bg-zinc-950 p-3 rounded border border-zinc-800 font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-300">
                                    {currentSession.practitionerNotes || "No notes recorded."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Recommendations */}
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
                        <div className="flex items-center gap-3 text-blue-400 mb-2">
                            <Wand2 className="w-5 h-5" />
                            <h3 className="font-semibold uppercase tracking-wider text-xs">Plan & Recommendations</h3>
                        </div>

                        <div className="space-y-4">
                            {currentSession.recommendations && currentSession.recommendations.length > 0 ? (
                                <div className="space-y-2">
                                    {currentSession.recommendations.map((rec) => (
                                        <div key={rec.id} className="bg-zinc-950 p-3 rounded border border-zinc-800 flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${rec.category === 'relief' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                                                        rec.category === 'movement' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                                                            rec.category === 'lifestyle' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                                                                'bg-zinc-500/10 text-zinc-300 border-zinc-500/20'
                                                        }`}>
                                                        {rec.category}
                                                    </span>
                                                    <span className="text-zinc-200 font-medium text-sm">{rec.title}</span>
                                                </div>
                                                <p className="text-zinc-500 text-xs mt-1">
                                                    {rec.frequency} • {rec.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-500 text-sm italic">No specific recommendations.</p>
                            )}
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Client Authorization</h3>
                            <div className="bg-zinc-950 p-4 rounded border border-zinc-800 h-24 flex items-center justify-center">
                                {currentSession.userSignature ? (
                                    <img src={currentSession.userSignature} alt="Client Signature" className="max-h-full max-w-full object-contain invert" />
                                ) : (
                                    <span className="text-zinc-600 text-xs italic">No signature recorded</span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500">
                                Signed by: <span className="font-medium text-zinc-300">{user?.name || "Guest"}</span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                                Practitioner Signature ({currentSession.practitionerName || "Practitioner"})
                            </h3>
                            <div className="bg-white rounded h-24 overflow-hidden">
                                <SignaturePad onChange={setPractitionerSignature} />
                            </div>
                            <p className="text-xs text-zinc-500">
                                Signed by: <span className="font-medium text-zinc-300">{practitioner?.name || currentSession.practitionerName || "Practitioner"}</span>
                                {practitioner?.clinicName && (
                                    <span className="block text-zinc-500 mt-0.5">{practitioner.clinicName}</span>
                                )}
                            </p>
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
                        <p className="text-xs text-zinc-400">
                            {currentSession.practitionerName ? `Practitioner: ${currentSession.practitionerName}` : "Practitioner View"}
                        </p>
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
                                levels={{ ...currentSession.bodyLevels, ...currentSession.practitionerLevels }}
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

                {/* 2. Services & Modalities (New) */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-400 uppercase tracking-wider text-xs">Services & Modalities</h2>
                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-6">
                        {/* Service Tags */}
                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">Services Performed</h3>
                            <div className="space-y-4">
                                {Object.entries(SERVICE_TAGS).filter(([cat]) => cat !== 'Modalities').map(([category, tags]) => (
                                    <div key={category}>
                                        <p className="text-xs text-zinc-400 mb-2">{category}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map(tag => {
                                                const isSelected = currentSession.serviceTags?.includes(tag);
                                                return (
                                                    <button
                                                        key={tag}
                                                        onClick={() => updateSession({
                                                            serviceTags: isSelected
                                                                ? currentSession.serviceTags?.filter(t => t !== tag)
                                                                : [...(currentSession.serviceTags || []), tag]
                                                        })}
                                                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${isSelected
                                                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                                                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-emerald-500/50'
                                                            }`}
                                                    >
                                                        {tag}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-zinc-800" />

                        {/* Modalities */}
                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">Modalities Used</h3>
                            <div className="flex flex-wrap gap-2">
                                {SERVICE_TAGS['Modalities'].map(tag => {
                                    const isSelected = currentSession.modalityTags?.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => updateSession({
                                                modalityTags: isSelected
                                                    ? currentSession.modalityTags?.filter(t => t !== tag)
                                                    : [...(currentSession.modalityTags || []), tag]
                                            })}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${isSelected
                                                ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                                                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-blue-500/50'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Findings (New) */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-400 uppercase tracking-wider text-xs">Findings</h2>
                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-6">
                        <div className="space-y-4">
                            {Object.entries(FINDING_TAGS).map(([category, tags]) => (
                                <div key={category}>
                                    <p className="text-xs text-zinc-400 mb-2">{category}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => {
                                            const isSelected = currentSession.findingTags?.includes(tag);
                                            return (
                                                <button
                                                    key={tag}
                                                    onClick={() => updateSession({
                                                        findingTags: isSelected
                                                            ? currentSession.findingTags?.filter(t => t !== tag)
                                                            : [...(currentSession.findingTags || []), tag]
                                                    })}
                                                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${isSelected
                                                        ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                                                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-amber-500/50'
                                                        }`}
                                                >
                                                    {tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Recommendations */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-400 uppercase tracking-wider text-xs">Recommendations</h2>
                    <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-4 shadow-sm">
                        <div className="space-y-4">
                            {/* Category Select */}
                            <div>
                                <label className="text-xs font-medium text-zinc-500 mb-1 block">Category</label>
                                <select
                                    value={newRecCategory}
                                    onChange={(e) => setNewRecCategory(e.target.value as 'relief' | 'movement' | 'lifestyle' | 'custom')}
                                    className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="relief">Relief & Recovery</option>
                                    <option value="movement">Movement & Mobility</option>
                                    <option value="lifestyle">Lifestyle & Wellness</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>

                            {/* Dynamic Suggestions */}
                            <div className="flex flex-wrap gap-2">
                                {({
                                    relief: ["Cold Therapy", "Heat Therapy", "Contrast Therapy", "Rest & Elevation", "Topical Relief"],
                                    movement: ["Walk", "Run", "Yoga", "Mobility", "Swim", "Gym"],
                                    lifestyle: ["Breathwork", "Meditate", "Journal", "Hydrate", "Sleep", "Nature"],
                                    custom: ["Ice Bath", "Sauna", "Walk", "Journal", "Stretch", "Breathwork"]
                                }[newRecCategory] || []).map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setNewRecTitle(suggestion)}
                                        className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors border border-zinc-700"
                                    >
                                        + {suggestion}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    placeholder="Recommendation (e.g. Ice Back)"
                                    value={newRecTitle}
                                    onChange={(e) => setNewRecTitle(e.target.value)}
                                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                                />
                                <select
                                    value={newRecFreq}
                                    onChange={(e) => setNewRecFreq(e.target.value)}
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="2x Daily">2x Daily</option>
                                    <option value="Morning/Night">Morning/Night</option>
                                    <option value="As Needed">As Needed</option>
                                    <option value="Acute (3x/day)">Acute (3x/day)</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Once">Once</option>
                                </select>
                            </div>
                            <div>
                                <textarea
                                    placeholder="Details"
                                    value={newRecDesc}
                                    onChange={(e) => setNewRecDesc(e.target.value)}
                                    className="w-full min-h-[80px] bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button size="sm" onClick={handleAddRec} disabled={!newRecTitle}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Recommendation
                                </Button>
                            </div>
                        </div>

                        {currentSession.recommendations && currentSession.recommendations.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-zinc-800">
                                {currentSession.recommendations.map((rec) => (
                                    <div key={rec.id} className="flex justify-between items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${rec.category === 'relief' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                                                    rec.category === 'movement' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                                                        rec.category === 'lifestyle' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                                                            'bg-zinc-500/10 text-zinc-300 border-zinc-500/20'
                                                    }`}>
                                                    {rec.category}
                                                </span>
                                                <p className="text-sm font-medium text-zinc-200">{rec.title}</p>
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                {rec.frequency} • {rec.description}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => updateSession({
                                                recommendations: currentSession.recommendations?.filter(r => r.id !== rec.id)
                                            })}
                                            className="text-zinc-500 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </section>

                {/* 5. Smart SOAP Notes */}
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
