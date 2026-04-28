import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { useDataStore } from "../store/useDataStore";
import { Button } from "../components/ui/Button";
import { BodyRegionSelector } from "../components/BodyMap/BodyRegionSelector";
import { ArrowLeft, CheckCircle, FileText, Plus, Trash2 } from "lucide-react";
import { Input } from "../components/ui/Input";
import { useState, useMemo } from "react";
import { useToast } from "../components/ui/Toast";
import { SERVICE_TAGS, FINDING_TAGS } from "../db/db";
import { trackEvent } from "../utils/analytics";



export default function SessionActive() {
    const navigate = useNavigate();
    const { currentSession, updateSession, endSession } = useAppStore();
    const { user, practitioners, saveSession } = useDataStore();
    const { toast } = useToast();
    const [showReview, setShowReview] = useState(false);
    const [practitionerVerification, setPractitionerVerification] = useState<string | null>(null);


    const practitioner = useMemo(() => {
        if (currentSession?.practitionerId && practitioners) {
            return practitioners.find(p => p.id === currentSession.practitionerId);
        }
        return undefined;
    }, [currentSession?.practitionerId, practitioners]);

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




    const handleFinishSession = async () => {
        if (!practitionerVerification) {
            toast("Please verify to finalize the session.", "error");
            return;
        }

        try {
            await saveSession({
                id: currentSession.id,
                date: currentSession.startTime, // Use start time as session date
                practitionerId: currentSession.practitionerId || "me",
                practitionerName: currentSession.practitionerName || "Dr. Chiro",
                practitionerClass: currentSession.practitionerClass || "Chiropractor",
                notes: currentSession.practitionerNotes, // Main notes
                signatureBase64: practitionerVerification, // Save practitioner verification as signatureBase64 for compatibility
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
            trackEvent('complete_session', { id: currentSession.id, practitioner: currentSession.practitionerName });
            endSession();
            navigate("/");
        } catch {
            /* Error handled by UI toast */
            toast("Failed to save session.", "error");
        }
    };



    // --- Review Screen ---
    if (showReview) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
                <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 pb-4 pt-[calc(env(safe-area-inset-top)+4rem)] flex items-center justify-between transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setShowReview(false)} className="text-zinc-400 hover:text-zinc-100">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold">Review & Verify</h1>
                            <p className="text-xs text-zinc-400">Finalize Session</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-emerald-500 hover:text-emerald-400 font-medium">
                        Home
                    </Button>
                </header>

                <main className="flex-1 p-4 space-y-6 max-w-3xl mx-auto w-full pb-48">

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
                            <FileText className="w-5 h-5" />
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
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Client Agreement</h3>
                            <div className="bg-zinc-950 p-4 rounded border border-zinc-800 h-24 flex items-center justify-center">
                                {currentSession.userSignature ? (
                                    currentSession.userSignature.startsWith('data:image') ? (
                                        <img src={currentSession.userSignature} alt="Client Signature" className="max-h-full max-w-full object-contain invert" />
                                    ) : (
                                        <div className="text-center">
                                            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                            <span className="text-emerald-500 font-bold text-sm block">DIGITALLY AGREED</span>
                                            <span className="text-zinc-500 text-[10px]">{currentSession.userSignature}</span>
                                        </div>
                                    )
                                ) : (
                                    <span className="text-zinc-600 text-xs italic">No agreement recorded</span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500">
                                Agreed by: <span className="font-medium text-zinc-300">{user?.name || "Guest"}</span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                                Practitioner Verification
                            </h3>
                            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-4">
                                <Button
                                    variant={practitionerVerification ? "primary" : "outline"}
                                    className={`w-full py-8 text-lg font-medium transition-all flex flex-col gap-2 h-auto ${practitionerVerification ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/20' : 'border-dashed border-2'}`}
                                    onClick={() => setPractitionerVerification(prev => prev ? null : `Digitally Verified • ${new Date().toLocaleString()}`)}
                                >
                                    {practitionerVerification ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-6 h-6" />
                                                <span>Session Verified</span>
                                            </div>
                                            <span className="text-xs font-normal opacity-80">Tap to undo</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Tap to Verify</span>
                                            <span className="text-xs font-normal text-zinc-500">
                                                I certify that I have performed the services as described.
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Verified by: <span className="font-medium text-zinc-300">{practitioner?.name || currentSession.practitionerName || "Practitioner"}</span>
                                {practitioner?.clinicName && (
                                    <span className="block text-zinc-500 mt-0.5">{practitioner.clinicName}</span>
                                )}
                            </p>
                        </div>
                    </div>
                </main>

                <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-30 border-t border-zinc-800/50">
                    <Button
                        variant="primary"
                        size="lg"
                        className="flex w-full max-w-3xl mx-auto shadow-xl shadow-emerald-500/20 text-lg h-14 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleFinishSession}
                        disabled={!practitionerVerification}
                    >
                        Finalize Session <CheckCircle className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        );
    }

    // --- Main Active Session Screen ---
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 pb-4 pt-[calc(env(safe-area-inset-top)+4rem)] flex items-center justify-between transition-all duration-300">
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
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                        LIVE
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-emerald-500 hover:text-emerald-400 font-medium">
                        Home
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-4 space-y-8 max-w-3xl mx-auto w-full pb-48">

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
                        <div className="w-full flex justify-center">
                            <BodyRegionSelector
                                value={currentSession.bodyMap}
                                levels={{ ...currentSession.bodyLevels, ...currentSession.practitionerLevels }}
                                notes={{ ...currentSession.bodyNotes, ...currentSession.treatmentNotes }}
                                onSave={(part, data) => updateSession({
                                    bodyMap: { ...currentSession.bodyMap, [part]: data.status },
                                    bodyLevels: { ...currentSession.bodyLevels, [part]: data.level },
                                    bodyNotes: { ...currentSession.bodyNotes, [part]: data.note }
                                })}
                            />
                        </div>
                    </div>

                    {/* Summary List */}
                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                            <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Selected Areas Summary</h3>
                        </div>
                        {activeBodyParts.length === 0 ? (
                            <p className="text-zinc-500 text-sm italic">No areas selected. Tap the map above to add details.</p>
                        ) : (
                            <div className="space-y-3">
                                {activeBodyParts.map(part => {
                                    const level = currentSession.practitionerLevels?.[part] ?? currentSession.bodyLevels[part] ?? 0;
                                    const note = currentSession.treatmentNotes?.[part] || currentSession.bodyNotes[part] || "";
                                    const status = currentSession.bodyMap[part];

                                    return (
                                        <div key={part} className="flex flex-col gap-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-zinc-100 capitalize text-base">{part.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    {status && status !== 'normal' && status !== 'issue' && (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase font-medium tracking-wide">
                                                            {status}
                                                        </span>
                                                    )}
                                                </div>
                                                {level > 0 && (
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${level > 6 ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/20' : 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/20'}`}>
                                                        Level {level}
                                                    </span>
                                                )}
                                            </div>

                                            {note ? (
                                                <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                                                    <p className="text-sm text-zinc-400 leading-relaxed">"{note}"</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-zinc-600 italic">No notes added</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. Services & Modalities (New) */}
                {/* 2. Services & Modalities (New) */}
                <section className="space-y-4">
                    <h2 className="text-xl font-black text-zinc-100 uppercase tracking-widest ml-1">Services & Modalities</h2>
                    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-10 shadow-lg">
                        {/* Service Tags */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-6 w-1.5 bg-emerald-500 rounded-full" />
                                <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wide">Services Performed</h3>
                            </div>
                            <div className="space-y-8">
                                {Object.entries(SERVICE_TAGS).filter(([cat]) => cat !== 'Modalities').map(([category, tags]) => (
                                    <div key={category}>
                                        <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 ml-1">{category}</p>
                                        <div className="flex flex-wrap gap-3">
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
                                                        className={`text-base font-semibold px-6 py-4 rounded-xl border-2 transition-all active:scale-95 duration-200 ${isSelected
                                                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-500/30'
                                                            : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 hover:text-white'
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
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-6 w-1.5 bg-blue-500 rounded-full" />
                                <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wide">Modalities Used</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
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
                                            className={`text-base font-semibold px-6 py-4 rounded-xl border-2 transition-all active:scale-95 duration-200 ${isSelected
                                                ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-500/30'
                                                : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 hover:text-white'
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
                    <h2 className="text-xl font-black text-zinc-100 uppercase tracking-widest ml-1">Findings</h2>
                    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-8 shadow-lg">
                        <div className="space-y-8">
                            {Object.entries(FINDING_TAGS).map(([category, tags]) => (
                                <div key={category}>
                                    <p className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4 ml-1">{category}</p>
                                    <div className="flex flex-wrap gap-3">
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
                                                    className={`text-base font-semibold px-6 py-4 rounded-xl border-2 transition-all active:scale-95 duration-200 ${isSelected
                                                        ? 'bg-amber-600 text-white border-amber-500 shadow-xl shadow-amber-500/30'
                                                        : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 hover:text-white'
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
                {/* 4. Recommendations */}
                <section className="space-y-4">
                    <h2 className="text-xl font-black text-zinc-100 uppercase tracking-widest ml-1">Recommendations</h2>
                    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-8 shadow-lg">
                        <div className="space-y-8">
                            {/* Category Select */}
                            <div>
                                <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 block ml-1">Category</label>
                                <div className="relative">
                                    <select
                                        value={newRecCategory}
                                        onChange={(e) => setNewRecCategory(e.target.value as 'relief' | 'movement' | 'lifestyle' | 'custom')}
                                        className="w-full h-16 bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-6 text-xl font-medium text-zinc-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none transition-all"
                                    >
                                        <option value="relief">Relief & Recovery</option>
                                        <option value="movement">Movement & Mobility</option>
                                        <option value="lifestyle">Lifestyle & Wellness</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-zinc-500">
                                        <svg className="h-6 w-6 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Suggestions */}
                            <div className="flex flex-wrap gap-3">
                                {({
                                    relief: ["Cold Therapy", "Heat Therapy", "Contrast Therapy", "Rest & Elevation", "Topical Relief"],
                                    movement: ["Walk", "Run", "Yoga", "Mobility", "Swim", "Gym"],
                                    lifestyle: ["Breathwork", "Meditate", "Journal", "Hydrate", "Sleep", "Nature"],
                                    custom: ["Ice Bath", "Sauna", "Walk", "Journal", "Stretch", "Breathwork"]
                                }[newRecCategory] || []).map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setNewRecTitle(suggestion)}
                                        className="text-base font-semibold px-6 py-4 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all border-2 border-zinc-700 active:scale-95 active:bg-emerald-600 active:border-emerald-500 active:text-white shadow-sm"
                                    >
                                        + {suggestion}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <Input
                                    placeholder="Recommendation Title"
                                    value={newRecTitle}
                                    onChange={(e) => setNewRecTitle(e.target.value)}
                                    className="bg-zinc-950 border-2 border-zinc-800 text-zinc-100 h-16 text-xl font-medium rounded-2xl px-6 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                <div className="relative">
                                    <select
                                        value={newRecFreq}
                                        onChange={(e) => setNewRecFreq(e.target.value)}
                                        className="w-full h-16 bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-6 text-xl font-medium text-zinc-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none transition-all"
                                    >
                                        <option value="Daily">Daily</option>
                                        <option value="2x Daily">2x Daily</option>
                                        <option value="Morning/Night">Morning/Night</option>
                                        <option value="As Needed">As Needed</option>
                                        <option value="Acute (3x/day)">Acute (3x/day)</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Once">Once</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-zinc-500">
                                        <svg className="h-6 w-6 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <textarea
                                    placeholder="Additional details or instructions..."
                                    value={newRecDesc}
                                    onChange={(e) => setNewRecDesc(e.target.value)}
                                    className="w-full min-h-[120px] bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-6 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 resize-y"
                                />
                            </div>
                            <div className="pt-2">
                                <Button size="lg" onClick={handleAddRec} disabled={!newRecTitle} className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow">
                                    <Plus className="w-6 h-6 mr-3" /> Add Recommendation
                                </Button>
                            </div>
                        </div>

                        {currentSession.recommendations && currentSession.recommendations.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-zinc-800">
                                {currentSession.recommendations.map((rec) => (
                                    <div key={rec.id} className="flex justify-between items-start bg-zinc-950 p-5 rounded-2xl border border-zinc-800 shadow-sm">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-lg border ${rec.category === 'relief' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    rec.category === 'movement' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        rec.category === 'lifestyle' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                            'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                                    }`}>
                                                    {rec.category}
                                                </span>
                                                <p className="text-lg font-bold text-zinc-100">{rec.title}</p>
                                            </div>
                                            <p className="text-sm font-medium text-zinc-400 pl-1">
                                                <span className="text-zinc-300">{rec.frequency}</span> • {rec.description}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => updateSession({
                                                recommendations: currentSession.recommendations?.filter(r => r.id !== rec.id)
                                            })}
                                            className="p-2 text-zinc-500 hover:text-red-400 transition-colors bg-zinc-900 rounded-lg hover:bg-zinc-800"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* 5. Smart SOAP Notes */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-zinc-400 uppercase tracking-wider text-xs">Session Notes</h2>
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
            <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-30 border-t border-zinc-800/50">
                <Button
                    variant="primary"
                    size="lg"
                    className="flex w-full max-w-3xl mx-auto shadow-xl shadow-emerald-500/20 text-lg h-14 bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => setShowReview(true)}
                >
                    Review & Sign <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
