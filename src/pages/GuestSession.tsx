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
import { generateSessionPDF } from "../utils/pdfGenerator";
import { Lock, Mic, AlertTriangle, Info, Plus, Trash2 } from "lucide-react";
import { type Homework } from "../db/db";
import { useToast } from "../components/ui/Toast";

export default function GuestSession() {
    const navigate = useNavigate();
    const { endSession, activePractitioner, intakeData, updateIntakeData } = useAppStore();
    const user = useLiveQuery(() => db.users.get("me"));
    const sigPadRef = useRef<SignaturePadRef>(null);

    const [step, setStep] = useState<"work" | "sign" | "finish">("work");
    // Initialize with data from Intake if available
    const [bodyStatus, setBodyStatus] = useState<Record<string, BodyStatus>>(intakeData?.bodyMap || {});
    const [bodyNotes] = useState<Record<string, string>>(intakeData?.bodyNotes || {});
    const [treatmentNotes, setTreatmentNotes] = useState<Record<string, string>>({});
    const [notes, setNotes] = useState(intakeData?.notes || "");
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

    const handleAddRec = () => {
        if (!newRecTitle) return;
        setRecommendations(prev => [...prev, {
            id: crypto.randomUUID(),
            title: newRecTitle,
            description: newRecDesc,
            frequency: newRecFreq,
            isCompletedToday: false
        }]);
        setNewRecTitle("");
        setNewRecDesc("");
        setNewRecFreq("Daily");
    };

    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const handleFinish = async () => {
        if (step === "work") {
            setStep("sign");
            return;
        }

        if (step === "sign") {
            setIsSaving(true);
            try {
                // Generate PDF
                const signature = sigPadRef.current?.getTrimmedCanvas().toDataURL("image/png") || "";

                // Note: PDF generation is synchronous but heavy. In a real app, might want to offload to worker.
                const pdf = generateSessionPDF({
                    date: new Date().toLocaleDateString(),
                    practitionerName,
                    notes,
                    bodyLog: bodyStatus,
                    signatureImage: signature
                });

                // Save to DB
                await db.sessions.add({
                    id: crypto.randomUUID(),
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
                    isLocked: true,
                    createdAt: Date.now()
                });

                // Add recommendations to user's active homework list
                if (recommendations.length > 0) {
                    await db.homework.bulkAdd(recommendations);
                }

                // Download PDF (Manual Blob method for better compatibility)
                const pdfBlob = pdf.output("blob");
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `chirocard-session-${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast("Session completed and saved!", "success");

                // End session and return to dashboard immediately (with small delay to allow download to start)
                setTimeout(() => {
                    endSession();
                    navigate("/");
                }, 1000);
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
        <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 pb-24">
            {/* Locked Header */}
            <header className="flex justify-between items-center mb-6 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2 text-emerald-500">
                    <Lock className="w-5 h-5" />
                    <span className="font-mono text-sm uppercase tracking-widest">
                        Practitioner Mode: {activePractitioner?.name || "Practitioner"}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-xs text-zinc-500">App Locked</div>
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
                            <Card className="bg-zinc-900/80 border-zinc-800 p-4 space-y-3">
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
                            <Card className="bg-amber-950/30 border-amber-900/50 p-4 space-y-2">
                                <h3 className="text-sm font-medium text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Patient Intake Notes
                                </h3>
                                <p className="text-zinc-300 text-sm whitespace-pre-wrap italic">
                                    "{intakeData.notes}"
                                </p>
                            </Card>
                        )}

                        {/* Body Notes Display */}
                        {Object.keys(bodyNotes).length > 0 && (
                            <Card className="bg-zinc-900/80 border-zinc-800 p-4 space-y-3">
                                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Specific Area Notes
                                </h3>
                                <div className="grid gap-2">
                                    {Object.entries(bodyNotes).map(([partId, note]) => {
                                        const region = REGIONS.find(r => r.id === partId);
                                        if (!region || !note) return null;
                                        return (
                                            <div key={partId} className="text-sm">
                                                <span className="font-medium text-emerald-400">{region.label}:</span> <span className="text-zinc-300">{note}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}

                        <section>
                            <h2 className="text-lg font-medium mb-3 text-zinc-300">1. Log Bodywork</h2>
                            <BodyRegionSelector
                                value={bodyStatus}
                                onChange={(part, status) => setBodyStatus(prev => ({ ...prev, [part]: status }))}
                            />

                            {/* Practitioner Treatment Notes */}
                            {Object.entries(bodyStatus).some(([_, status]) => status === 'addressed') && (
                                <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Treatment Notes</h3>
                                    <div className="grid gap-3">
                                        {Object.entries(bodyStatus)
                                            .filter(([_, status]) => status === 'addressed')
                                            .map(([partId]) => {
                                                const region = REGIONS.find(r => r.id === partId);
                                                if (!region) return null;
                                                return (
                                                    <div key={partId} className="flex items-center gap-3">
                                                        <label className="text-sm font-medium text-emerald-500 w-24 flex-shrink-0">
                                                            {region.label}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={treatmentNotes[partId] || ""}
                                                            onChange={(e) => setTreatmentNotes(prev => ({ ...prev, [partId]: e.target.value }))}
                                                            placeholder={`Treatment details for ${region.label}...`}
                                                            className="flex-1 h-9 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}


                        </section>

                        <section>
                            <h2 className="text-lg font-medium mb-3 text-zinc-300">2. Session Notes</h2>
                            <div className="relative">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Tap microphone to dictate or type notes..."
                                    className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <button className="absolute bottom-4 right-4 p-2 bg-emerald-600 rounded-full hover:bg-emerald-500 transition-colors">
                                    <Mic className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-medium mb-3 text-zinc-300">3. Holistic Recommendations</h2>
                            <Card className="bg-zinc-900/50 border-zinc-800 p-4 space-y-4">
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
                                                    }}
                                                    className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 px-3 py-1.5 rounded-full border border-blue-500/20 transition-colors"
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
                                                    }}
                                                    className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 px-3 py-1.5 rounded-full border border-emerald-500/20 transition-colors"
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
                                                    }}
                                                    className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 px-3 py-1.5 rounded-full border border-purple-500/20 transition-colors"
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
                                            className="bg-zinc-950 border-zinc-800"
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
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Details (e.g. 20 mins)"
                                            value={newRecDesc}
                                            onChange={(e) => setNewRecDesc(e.target.value)}
                                            className="bg-zinc-950 border-zinc-800 flex-1"
                                        />
                                        <Button size="sm" onClick={handleAddRec} disabled={!newRecTitle}>
                                            <Plus className="w-4 h-4" /> Add
                                        </Button>
                                    </div>
                                </div>

                                {recommendations.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-zinc-800">
                                        {recommendations.map((rec) => (
                                            <div key={rec.id} className="flex justify-between items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-200">{rec.title}</p>
                                                    <p className="text-xs text-zinc-500">{rec.frequency} • {rec.description}</p>
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
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold text-center">Finalize Session</h2>

                        <Input
                            label="Practitioner Name"
                            value={practitionerName}
                            onChange={(e) => setPractitionerName(e.target.value)}
                            placeholder="Dr. Name or Therapist Name"
                            className="bg-zinc-900 border-zinc-800 text-white"
                        />

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Signature</label>
                            <SignaturePad ref={sigPadRef} />
                        </div>
                    </section>
                )}
            </div>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-950 border-t border-zinc-900">
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
        </div>
    );
}
