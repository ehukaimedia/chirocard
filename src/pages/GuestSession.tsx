import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { BodyRegionSelector, type BodyStatus, REGIONS } from "../components/BodyMap/BodyRegionSelector";
import { SignaturePad, type SignaturePadRef } from "../components/SignaturePad";
import { BodyAreaCard } from "../components/Practitioner/BodyAreaCard";
import { Hand, AlertTriangle, Info, Plus, Trash2, CheckCircle, FileText, Home } from "lucide-react";

import { type Homework } from "../db/db";
import { useToast } from "../components/ui/Toast";

export default function GuestSession() {
    const navigate = useNavigate();
    const { endSession, activePractitioner, intakeData, updateIntakeData } = useAppStore();
    const user = useLiveQuery(() => db.users.get("me"));
    const sigPadRef = useRef<SignaturePadRef>(null);

    const [step, setStep] = useState<"work" | "sign" | "finish" | "completed">("work");
    // Initialize with data from Intake if available
    const [bodyStatus, setBodyStatus] = useState<Record<string, BodyStatus>>(intakeData?.bodyMap || {});
    const [bodyNotes] = useState<Record<string, string>>(intakeData?.bodyNotes || {});
    const [treatmentNotes, setTreatmentNotes] = useState<Record<string, string>>({});
    const [notes, setNotes] = useState("");
    const [practitionerName, setPractitionerName] = useState(activePractitioner?.name || "");

    const [showExitModal, setShowExitModal] = useState(false);

    const handleExitClick = () => {
        setShowExitModal(true);
    };

    const handleConfirmExit = () => {
        // Sync current state back to store so Intake page reflects changes
        updateIntakeData({
            bodyMap: bodyStatus,
            bodyNotes: bodyNotes,
            notes: notes
        });
        navigate("/intake");
    };

    // Recommendations State
    const [recommendations, setRecommendations] = useState<Homework[]>([]);
    const [newRecTitle, setNewRecTitle] = useState("");
    const [newRecDesc, setNewRecDesc] = useState("");
    const [newRecFreq, setNewRecFreq] = useState<string>("Daily");
    const [newRecCategory, setNewRecCategory] = useState<'relief' | 'movement' | 'lifestyle' | 'custom'>('custom');
    const handleAddRec = () => {
        if (!newRecTitle) return;
        setRecommendations(prev => [...prev, {
            id: crypto.randomUUID(),
            title: newRecTitle,
            description: newRecDesc,
            frequency: newRecFreq,
            category: newRecCategory,
            reminderTimes: [], // Time set in Calendar
            isCompletedToday: false,
            status: 'pending',
            createdAt: Date.now()
        }]);
        setNewRecTitle("");
        setNewRecDesc("");
        setNewRecFreq("Daily");
        setNewRecCategory('custom');
    };

    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);

    const handleFinish = async () => {
        if (step === "work") {
            setStep("sign");
            return;
        }

        if (step === "sign") {
            setIsSaving(true);
            try {
                // Generate Signature
                const signature = sigPadRef.current?.getTrimmedCanvas().toDataURL("image/png") || "";

                // Use the active session ID from the store, or fallback to a new one if something went wrong
                const { activeSessionId } = useAppStore.getState();
                const sessionId = activeSessionId || crypto.randomUUID();

                setCompletedSessionId(sessionId);

                // Save to DB (use put to create or update)
                await db.sessions.put({
                    id: sessionId,
                    date: Date.now(),
                    practitionerId: activePractitioner?.id || "guest",
                    practitionerName,
                    practitionerClass: activePractitioner?.role || "Other",
                    notes,
                    recommendations, // Save snapshot
                    bodyMap: bodyStatus, // Save snapshot of body status
                    bodyNotes: bodyNotes, // Save user notes
                    treatmentNotes: treatmentNotes, // Save practitioner notes
                    signatureBase64: signature,
                    userSignature: intakeData?.userSignature, // Save patient signature
                    isLocked: true,
                    createdAt: Date.now()
                });

                // Add recommendations to user's active homework list
                if (recommendations.length > 0) {
                    await db.homework.bulkAdd(recommendations);
                }

                // Open Report Page - REMOVED
                // window.open(`/session/${sessionId}/report`, '_blank');

                toast("Session completed and saved!", "success");
                setStep("completed");
                setIsSaving(false);
            } catch (error) {
                console.error("Failed to save session:", error);
                if (error instanceof Error) {
                    console.error("Error details:", {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    });
                }
                toast("Failed to save session. Please try again.", "error");
                setIsSaving(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 p-4 pb-24">
            {/* Practitioner Header */}
            <header className="flex justify-between items-center mb-6 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-lg">
                <div className="flex items-center gap-2 text-emerald-500">
                    <Hand className="w-5 h-5" />
                    <span className="font-mono text-sm uppercase tracking-widest">
                        Practitioner Mode: {activePractitioner?.name || "Practitioner"}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {/* App Locked text removed */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-500 hover:text-zinc-300 h-8 px-2"
                        onClick={handleExitClick}
                        title="Return to intake to update patient info"
                    >
                        Back to Session Intake
                    </Button>
                </div>
            </header>

            <Modal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                title="Return to Intake?"
                description="Any recommendations added in this session will be lost, but your notes and body map will be saved."
                confirmLabel="Exit Session"
                cancelLabel="Stay"
                onConfirm={handleConfirmExit}
                variant="danger"
            />

            <div className="space-y-6">
                {step === "work" && (
                    <>
                        {/* Patient Context Card */}
                        {(user?.primaryComplaints?.length || user?.contraindications?.length) && (
                            <Card className="bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 p-4 space-y-3 shadow-sm">
                                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Patient Context
                                </h3>

                                {user.primaryComplaints && user.primaryComplaints.length > 0 && (
                                    <div>
                                        <span className="text-xs text-zinc-500 block mb-1">Primary Complaints:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {user.primaryComplaints.map((c: string, i: number) => (
                                                <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md border border-blue-500/30">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user.contraindications && user.contraindications.length > 0 && (
                                    <div>
                                        <span className="text-xs text-zinc-500 block mb-1">Contraindications:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {user.contraindications.map((c: string, i: number) => (
                                                <span key={i} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-md border border-red-500/30 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Intake Notes Display */}
                        {intakeData?.notes && (
                            <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 p-4 space-y-2">
                                <h3 className="text-sm font-medium text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Patient Intake Notes
                                </h3>
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap italic">
                                    "{intakeData.notes}"
                                </p>
                            </Card>
                        )}


                        <section>
                            <h2 className="text-lg font-medium mb-3 text-zinc-900 dark:text-zinc-300">1. Log Bodywork</h2>
                            <BodyRegionSelector
                                value={bodyStatus}
                                onChange={(part, status) => setBodyStatus(prev => ({ ...prev, [part]: status }))}
                            />

                            {/* Active Body Areas Cards */}
                            <div className="mt-6 space-y-4">
                                {Object.entries(bodyStatus)
                                    .filter(([_, status]) => status !== 'normal')
                                    .map(([partId, status]) => {
                                        const region = REGIONS.find(r => r.id === partId);
                                        if (!region) return null;

                                        return (
                                            <BodyAreaCard
                                                key={partId}
                                                regionId={partId}
                                                regionLabel={region.label}
                                                patientStatus={intakeData?.bodyMap?.[partId]}
                                                patientNote={intakeData?.bodyNotes?.[partId]}
                                                practitionerStatus={status}
                                                practitionerNote={treatmentNotes[partId] || ""}
                                                onStatusChange={(newStatus) => setBodyStatus(prev => ({ ...prev, [partId]: newStatus }))}
                                                onNoteChange={(note) => setTreatmentNotes(prev => ({ ...prev, [partId]: note }))}
                                            />
                                        );
                                    })}

                                {/* Hint if nothing selected */}
                                {Object.values(bodyStatus).every(s => s === 'normal') && (
                                    <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                        <p className="text-zinc-500">Tap areas on the body map above to add them to the session.</p>
                                    </div>
                                )}
                            </div>


                        </section>

                        <section>
                            <h2 className="text-lg font-medium mb-3 text-zinc-300">2. Session Notes</h2>
                            <div className="relative">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Tap microphone to dictate or type notes..."
                                    className="w-full h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-medium mb-3 text-zinc-900 dark:text-zinc-300">3. Holistic Recommendations</h2>
                            <Card className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 p-4 space-y-4 shadow-sm">
                                {/* Quick Add Options */}
                                <div className="space-y-3 mb-4">
                                    <div>
                                        <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Relief & Recovery</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: "Cold Therapy", desc: "Ice/Cold pack, 15-20 mins", freq: "Acute (3x/day)" },
                                                { label: "Heat Therapy", desc: "Heating pad/Warm compress, 20 mins", freq: "As Needed" },
                                                { label: "Contrast Therapy", desc: "3 min heat / 1 min ice", freq: "Daily" },
                                                { label: "Rest & Elevation", desc: "Elevate and rest area", freq: "As Needed" },
                                                { label: "Topical Relief", desc: "Apply biofreeze/cream", freq: "As Needed" }
                                            ].map(opt => (
                                                <button
                                                    key={opt.label}
                                                    onClick={() => {
                                                        setNewRecTitle(opt.label);
                                                        setNewRecDesc(opt.desc);
                                                        setNewRecFreq(opt.freq);
                                                        setNewRecCategory('relief');
                                                    }}
                                                    className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-200 px-3 py-1.5 rounded-full border border-blue-500/20 transition-colors"
                                                >
                                                    + {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Movement & Mobility</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: "Stretching", desc: "Gentle hold, 30s", freq: "Morning/Night" },
                                                { label: "Mobility Work", desc: "Dynamic movement/Foam rolling", freq: "Daily" },
                                                { label: "Light Activity", desc: "Walking/Gentle movement", freq: "Daily" },
                                                { label: "Strengthening", desc: "Resistance exercises", freq: "3x/Week" },
                                                { label: "Range of Motion", desc: "Active ROM exercises", freq: "Daily" }
                                            ].map(opt => (
                                                <button
                                                    key={opt.label}
                                                    onClick={() => {
                                                        setNewRecTitle(opt.label);
                                                        setNewRecDesc(opt.desc);
                                                        setNewRecFreq(opt.freq);
                                                        setNewRecCategory('movement');
                                                    }}
                                                    className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 px-3 py-1.5 rounded-full border border-emerald-500/20 transition-colors"
                                                >
                                                    + {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Lifestyle & Wellness</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: "Hydration", desc: "Increase water intake", freq: "Daily" },
                                                { label: "Sleep Hygiene", desc: "8 hours, consistent schedule", freq: "Daily" },
                                                { label: "Breathwork", desc: "Deep diaphragmatic breathing", freq: "As Needed" },
                                                { label: "Ergonomics", desc: "Check posture/workstation", freq: "Daily" },
                                                { label: "Stress Management", desc: "Meditation/Relaxation", freq: "Daily" }
                                            ].map(opt => (
                                                <button
                                                    key={opt.label}
                                                    onClick={() => {
                                                        setNewRecTitle(opt.label);
                                                        setNewRecDesc(opt.desc);
                                                        setNewRecFreq(opt.freq);
                                                        setNewRecCategory('lifestyle');
                                                    }}
                                                    className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-200 px-3 py-1.5 rounded-full border border-purple-500/20 transition-colors"
                                                >
                                                    + {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="Recommendation (e.g. Ice Back)"
                                            value={newRecTitle}
                                            onChange={(e) => setNewRecTitle(e.target.value)}
                                            className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                                        />
                                        <select
                                            value={newRecFreq}
                                            onChange={(e) => setNewRecFreq(e.target.value)}
                                            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-sm text-zinc-900 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="Details (e.g. 20 mins)"
                                            value={newRecDesc}
                                            onChange={(e) => setNewRecDesc(e.target.value)}
                                            className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                                        />

                                    </div>
                                    <div className="flex justify-end">
                                        <Button size="sm" onClick={handleAddRec} disabled={!newRecTitle}>
                                            <Plus className="w-4 h-4 mr-1" /> Add Recommendation
                                        </Button>
                                    </div>
                                </div>

                                {recommendations.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                        {recommendations.map((rec) => (
                                            <div key={rec.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${rec.category === 'relief' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                                                            rec.category === 'movement' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                                                                rec.category === 'lifestyle' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                                                                    'bg-zinc-500/10 text-zinc-300 border-zinc-500/20'
                                                            }`}>
                                                            {rec.category}
                                                        </span>
                                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{rec.title}</p>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 mt-1">
                                                        {rec.frequency} • {rec.description}
                                                        {rec.reminderTimes && rec.reminderTimes.length > 0 && (
                                                            <span className="ml-2 text-emerald-500">
                                                                ⏰ {rec.reminderTimes[0]}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <button onClick={() => setRecommendations(prev => prev.filter(r => r.id !== rec.id))} className="text-zinc-500 hover:text-red-400">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </section>
                    </>
                )}

                {step === "sign" && (
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-3xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Review & Sign</h2>
                            <Button variant="ghost" onClick={() => setStep("work")} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                                Edit Session
                            </Button>
                        </div>

                        {/* Digital Document Preview */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                            {/* Watermark/Background decoration - REMOVED */}


                            {/* Header */}
                            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-6">
                                <h1 className="text-2xl font-serif text-emerald-600 dark:text-emerald-500 mb-2">ChiroCard Session Record</h1>
                                <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                                    <span>Date: {new Date().toLocaleDateString()}</span>
                                    <span>Practitioner: {practitionerName || "Guest Practitioner"}</span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* 1. Patient Context (if any) */}
                                {intakeData?.notes && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Patient Intake</h3>
                                        <p className="text-zinc-700 dark:text-zinc-300 text-sm italic border-l-2 border-zinc-300 dark:border-zinc-700 pl-3 py-1">
                                            "{intakeData.notes}"
                                        </p>
                                    </div>
                                )}

                                {/* 2. Bodywork Log */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Bodywork Log</h3>
                                    {Object.entries(bodyStatus).filter(([_, s]) => s !== 'normal').length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {Object.entries(bodyStatus)
                                                .filter(([_, status]) => status !== 'normal')
                                                .map(([partId, status]) => {
                                                    const region = REGIONS.find(r => r.id === partId);
                                                    const note = treatmentNotes[partId];
                                                    return (
                                                        <div key={partId} className="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/50 flex justify-between items-start">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{region?.label}</span>
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${status === 'issue' ? 'bg-red-500/10 text-red-400' :
                                                                        status === 'addressed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                            'bg-amber-500/10 text-amber-400'
                                                                        }`}>
                                                                        {status}
                                                                    </span>
                                                                </div>
                                                                {note && <p className="text-sm text-zinc-400 mt-1">{note}</p>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-500 italic">No specific body areas logged.</p>
                                    )}
                                </div>

                                {/* 3. Session Notes */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Session Notes</h3>
                                    <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/50 min-h-[60px]">
                                        <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap">
                                            {notes || "No general notes added."}
                                        </p>
                                    </div>
                                </div>

                                {/* 4. Holistic Recommendations */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Holistic Recommendations</h3>
                                    {recommendations.length > 0 ? (
                                        <div className="space-y-2">
                                            {recommendations.map((rec) => (
                                                <div key={rec.id} className="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/50">
                                                    <div className={`mt-1 w-2 h-2 rounded-full ${rec.category === 'relief' ? 'bg-blue-500' :
                                                        rec.category === 'movement' ? 'bg-emerald-500' :
                                                            rec.category === 'lifestyle' ? 'bg-purple-500' : 'bg-zinc-500'
                                                        }`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{rec.title}</p>
                                                        <p className="text-xs text-zinc-500">
                                                            {rec.frequency} • {rec.category}
                                                            {rec.reminderTimes && rec.reminderTimes.length > 0 && ` • ⏰ ${rec.reminderTimes[0]}`}
                                                        </p>
                                                        {rec.description && <p className="text-xs text-zinc-400 mt-1">{rec.description}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-500 italic">No recommendations added.</p>
                                    )}
                                </div>

                                {/* Footer Disclaimer */}
                                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-8">
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-600 text-center">
                                        Disclaimer: This is a user-owned personal record and does not replace the official legal medical record maintained by the provider.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Signature Section */}
                        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-200 mb-4">Sign to Complete</h3>
                            <Input
                                label="Practitioner Name"
                                value={practitionerName}
                                onChange={(e) => setPractitionerName(e.target.value)}
                                placeholder="Dr. Name or Therapist Name"
                                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white mb-4"
                            />
                            <div>
                                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Signature</label>
                                <SignaturePad ref={sigPadRef} />
                            </div>
                        </div>
                    </section>
                )}

                {step === "completed" && (
                    <section className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-300">
                        <div className="bg-emerald-500/10 p-6 rounded-full mb-6">
                            <CheckCircle className="w-16 h-16 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Session Completed!</h2>
                        <p className="text-zinc-400 text-center max-w-md mb-8">
                            The session has been recorded and the PDF has been generated.
                        </p>

                        <div className="flex flex-col gap-4 w-full max-w-xs">
                            <Button
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2 h-12"
                                onClick={() => {
                                    if (completedSessionId) {
                                        navigate(`/session/${completedSessionId}/report`);
                                    }
                                }}
                            >
                                <FileText className="w-4 h-4" /> Download PDF
                            </Button>

                            <Button
                                variant="primary"
                                className="w-full flex items-center justify-center gap-2 h-12"
                                onClick={() => {
                                    endSession();
                                    navigate("/");
                                }}
                            >
                                <Home className="w-4 h-4" /> Return to Dashboard
                            </Button>
                        </div>
                    </section>
                )}
            </div>

            {/* Footer Action */}
            {
                step !== "completed" && (
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900">
                        <div className="flex gap-4">
                            {step === "sign" && (
                                <Button variant="ghost" onClick={() => setStep("work")} className="flex-1">
                                    Back
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                size="lg"
                                disabled={isSaving}
                                className="flex-1 shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleFinish}
                            >
                                {step === "work" ? "Review & Sign" : (isSaving ? "Saving..." : "Complete Session")}
                            </Button>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
