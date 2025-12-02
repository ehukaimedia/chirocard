import { useState } from "react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { BodyRegionSelector, type BodyStatus, REGIONS } from "../BodyMap/BodyRegionSelector";
import { BodyAreaCard } from "../Practitioner/BodyAreaCard";
import { Hand, AlertTriangle, Info, Plus, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "../ui/Toast";
import { type Homework } from "../../db/db";

export interface SessionData {
    id?: string;
    date?: number;
    practitionerId?: string;
    practitionerName: string;
    clinicName?: string;
    notes: string;
    bodyMap: Record<string, BodyStatus>;
    treatmentNotes: Record<string, string>;
    practitionerLevels: Record<string, number>;
    practitionerBadges: Record<string, string[]>;
    recommendations: Homework[];
    signatureBase64: string;
}

interface SessionEditorProps {
    initialData?: Partial<SessionData>;
    intakeData?: {
        bodyMap?: Record<string, BodyStatus>;
        bodyNotes?: Record<string, string>;
        bodyLevels?: Record<string, number>;
        bodyBadges?: Record<string, string[]>;
        notes?: string;
        userSignature?: string;
    } | null;
    clientProfile?: {
        name?: string;
        primaryComplaints?: string[];
        contraindications?: string[];
    } | null;
    defaultPractitionerName?: string;
    onSave: (data: SessionData) => Promise<void>;
    onExit: () => void;
}

export function SessionEditor({
    initialData,
    intakeData,
    clientProfile,
    defaultPractitionerName = "",
    onSave,
    onExit
}: SessionEditorProps) {
    const { toast } = useToast();

    const [step, setStep] = useState<"work" | "sign">("work");

    // State
    const [bodyStatus, setBodyStatus] = useState<Record<string, BodyStatus>>(intakeData?.bodyMap || initialData?.bodyMap || {});
    // Note: We don't edit patient body notes/levels/badges, only display them.
    // Practitioner edits:
    const [treatmentNotes, setTreatmentNotes] = useState<Record<string, string>>(initialData?.treatmentNotes || {});
    const [practitionerLevels, setPractitionerLevels] = useState<Record<string, number>>(initialData?.practitionerLevels || {});
    const [practitionerBadges, setPractitionerBadges] = useState<Record<string, string[]>>(initialData?.practitionerBadges || {});
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [practitionerName, setPractitionerName] = useState(defaultPractitionerName);

    // Recommendations
    const [recommendations, setRecommendations] = useState<Homework[]>(initialData?.recommendations || []);
    const [newRecTitle, setNewRecTitle] = useState("");
    const [newRecDesc, setNewRecDesc] = useState("");
    const [newRecFreq, setNewRecFreq] = useState<string>("Daily");
    const [newRecCategory, setNewRecCategory] = useState<'relief' | 'movement' | 'lifestyle' | 'custom'>('custom');

    // Modals
    const [showExitModal, setShowExitModal] = useState(false);
    const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(false);
    const [showMissingDetailsAlert, setShowMissingDetailsAlert] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleAddRec = () => {
        if (!newRecTitle) return;
        setRecommendations(prev => [...prev, {
            id: crypto.randomUUID(),
            title: newRecTitle,
            description: newRecDesc,
            frequency: newRecFreq,
            category: newRecCategory,
            reminderTimes: [],
            isCompletedToday: false,
            status: 'pending',
            createdAt: Date.now()
        }]);
        setNewRecTitle("");
        setNewRecDesc("");
        setNewRecFreq("Daily");
        setNewRecCategory('custom');
    };

    const handleProceedToSign = () => {
        // Validation: Require at least one body area
        const activeRegions = Object.entries(bodyStatus).filter(([_, status]) => status !== 'normal');
        if (activeRegions.length === 0) {
            setShowNoSelectionAlert(true);
            return;
        }

        // Validation: Require details for selected areas
        const missingDetails = activeRegions.some(([partId, _]) => {
            const hasNote = treatmentNotes[partId] && treatmentNotes[partId].trim().length > 0;
            const hasBadges = practitionerBadges[partId] && practitionerBadges[partId].length > 0;
            return !hasNote && !hasBadges;
        });

        if (missingDetails) {
            setShowMissingDetailsAlert(true);
            return;
        }

        setStep("sign");
    };

    const handleFinalSave = async () => {
        setIsSaving(true);
        try {
            const signature = `Digitally Signed by ${practitionerName || "Guest Practitioner"} on ${new Date().toLocaleDateString()}`;

            await onSave({
                practitionerName,
                notes,
                bodyMap: bodyStatus,
                treatmentNotes,
                practitionerLevels,
                practitionerBadges,
                recommendations,
                signatureBase64: signature
            });
            // Parent handles navigation/state update after promise resolves
        } catch (error) {
            console.error("Save failed", error);
            toast("Failed to save session", "error");
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 p-4 pb-24">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-lg">
                <div className="flex items-center gap-2 text-emerald-500">
                    <Hand className="w-5 h-5" />
                    <span className="font-mono text-sm uppercase tracking-widest">
                        Practitioner Mode: {practitionerName || "Guest"}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-500 hover:text-zinc-300 h-8 px-2"
                        onClick={() => setShowExitModal(true)}
                    >
                        Exit
                    </Button>
                </div>
            </header>

            <Modal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                title="Exit Session?"
                description="Any unsaved changes will be lost."
                confirmLabel="Exit"
                cancelLabel="Stay"
                onConfirm={onExit}
                variant="danger"
            />

            <Modal
                isOpen={showNoSelectionAlert}
                onClose={() => setShowNoSelectionAlert(false)}
                title="No Body Area Selected"
                description="Please select at least one area of concern on the body map before proceeding."
                confirmLabel="OK"
                onConfirm={() => setShowNoSelectionAlert(false)}
            />

            <Modal
                isOpen={showMissingDetailsAlert}
                onClose={() => setShowMissingDetailsAlert(false)}
                title="Missing Details"
                description="Please provide at least one detail (badge or note) for each selected body area."
                confirmLabel="OK"
                onConfirm={() => setShowMissingDetailsAlert(false)}
            />

            <div className="space-y-6">
                {step === "work" && (
                    <>
                        {/* Client Context */}
                        {clientProfile && ((clientProfile.primaryComplaints?.length || 0) > 0 || (clientProfile.contraindications?.length || 0) > 0) && (
                            <Card className="bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 p-4 space-y-3 shadow-sm">
                                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Client Context
                                </h3>
                                {clientProfile.primaryComplaints && clientProfile.primaryComplaints.length > 0 && (
                                    <div>
                                        <span className="text-xs text-zinc-500 block mb-1">Primary Complaints:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {clientProfile.primaryComplaints.map((c, i) => (
                                                <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md border border-blue-500/30">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {clientProfile.contraindications && clientProfile.contraindications.length > 0 && (
                                    <div>
                                        <span className="text-xs text-zinc-500 block mb-1">Contraindications:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {clientProfile.contraindications.map((c, i) => (
                                                <span key={i} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-md border border-red-500/30 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Intake Notes */}
                        {intakeData?.notes && (
                            <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 p-4 space-y-2">
                                <h3 className="text-sm font-medium text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Client Intake Notes
                                </h3>
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap italic">"{intakeData.notes}"</p>
                            </Card>
                        )}

                        {/* 1. Bodywork */}
                        <section>
                            <h2 className="text-lg font-medium mb-3 text-zinc-900 dark:text-zinc-300">1. Log Bodywork</h2>
                            <BodyRegionSelector
                                value={bodyStatus}
                                onChange={(part, status) => setBodyStatus(prev => ({ ...prev, [part]: status }))}
                            />
                        </section>

                        {/* 2. Details */}
                        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">2. Details for Selected Areas</h2>
                            <div className="grid gap-4">
                                {Object.entries(bodyStatus).some(([_, status]) => status !== 'normal') ? (
                                    Object.entries(bodyStatus)
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
                                                    practitionerLevel={practitionerLevels[partId]}
                                                    practitionerBadges={practitionerBadges[partId]}
                                                    patientLevel={intakeData?.bodyLevels?.[partId]}
                                                    patientBadges={intakeData?.bodyBadges?.[partId]}
                                                    onStatusChange={(newStatus) => setBodyStatus(prev => ({ ...prev, [partId]: newStatus }))}
                                                    onNoteChange={(note) => setTreatmentNotes(prev => ({ ...prev, [partId]: note }))}
                                                    onLevelChange={(level) => setPractitionerLevels(prev => ({ ...prev, [partId]: level }))}
                                                    onBadgesChange={(badges) => setPractitionerBadges(prev => ({ ...prev, [partId]: badges }))}
                                                />
                                            );
                                        })
                                ) : (
                                    <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                        <p className="text-sm text-zinc-500">Select an area above to add details.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 3. Notes */}
                        <section>
                            <h2 className="text-lg font-medium mb-3 text-zinc-300">3. Session Notes</h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Tap microphone to dictate or type notes..."
                                className="w-full h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </section>

                        {/* 4. Recommendations */}
                        <section>
                            <h2 className="text-lg font-medium mb-3 text-zinc-900 dark:text-zinc-300">4. Holistic Recommendations</h2>
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
                                    {/* ... (Other categories omitted for brevity, but should be included if full fidelity needed. For now I'll include them to be safe) */}
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
                                    <div>
                                        <textarea
                                            placeholder="Details (e.g. 20 mins, specific instructions...)"
                                            value={newRecDesc}
                                            onChange={(e) => setNewRecDesc(e.target.value)}
                                            className="w-full min-h-[80px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
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

                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center z-50">
                            <span className="text-sm text-zinc-500">
                                {Object.values(bodyStatus).filter(s => s !== 'normal').length} Areas Logged
                            </span>
                            <Button onClick={handleProceedToSign} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                                Review & Sign <CheckCircle className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
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
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden space-y-8">
                            {/* Header */}
                            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
                                <h1 className="text-2xl font-serif text-emerald-600 dark:text-emerald-500 mb-2">ChiroCard Session Record</h1>
                                <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                                    <span>Date: {new Date().toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* 1. Client Context (if any) */}
                            {intakeData?.notes && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Client Intake</h3>
                                    <p className="text-zinc-700 dark:text-zinc-300 text-sm italic border-l-2 border-zinc-300 dark:border-zinc-700 pl-3 py-1">
                                        "{intakeData.notes}"
                                    </p>
                                </div>
                            )}

                            {/* 2. Bodywork Log */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Bodywork Log</h3>
                                {Object.entries(bodyStatus).filter(([_, s]) => s !== 'normal').length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(bodyStatus)
                                            .filter(([_, status]) => status !== 'normal')
                                            .map(([partId, status]) => {
                                                const region = REGIONS.find(r => r.id === partId);
                                                const note = treatmentNotes[partId];
                                                return (
                                                    <div key={partId} className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                                                        <div className="w-full">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-zinc-900 dark:text-zinc-200">{region?.label}</span>
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${status === 'issue' ? 'bg-red-500/10 text-red-400' :
                                                                    status === 'addressed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                        'bg-amber-500/10 text-amber-400'
                                                                    }`}>
                                                                    {status}
                                                                </span>
                                                            </div>
                                                            {(intakeData?.bodyLevels?.[partId] !== undefined || (intakeData?.bodyBadges?.[partId] && intakeData.bodyBadges[partId].length > 0)) && (
                                                                <div className="flex flex-wrap gap-2 mb-2">
                                                                    {intakeData?.bodyLevels?.[partId] !== undefined && (
                                                                        <span className="text-xs font-bold text-zinc-500">Pain Level: {intakeData.bodyLevels[partId]}/10</span>
                                                                    )}
                                                                    {intakeData?.bodyBadges?.[partId]?.map(badge => (
                                                                        <span key={badge} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                                                            {badge}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {note && <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">"{note}"</p>}
                                                            {(practitionerLevels[partId] !== undefined || (practitionerBadges[partId] && practitionerBadges[partId].length > 0)) && (
                                                                <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                                                    <p className="text-[10px] uppercase text-emerald-500 font-bold mb-1">Practitioner Assessment</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {practitionerLevels[partId] !== undefined && (
                                                                            <span className="text-xs font-bold text-zinc-500">Level: {practitionerLevels[partId]}/10</span>
                                                                        )}
                                                                        {practitionerBadges[partId]?.map(badge => (
                                                                            <span key={badge} className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                                                {badge}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-500 italic">No specific body areas logged.</p>
                                )}
                            </div>

                            <hr className="border-zinc-200 dark:border-zinc-800" />

                            {/* 3. Session Notes */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Session Notes</h3>
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                                    {notes || "No general notes added."}
                                </p>
                            </div>

                            <hr className="border-zinc-200 dark:border-zinc-800" />

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

                            <hr className="border-zinc-200 dark:border-zinc-800" />

                            {/* Client Authorization */}
                            {intakeData?.userSignature && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Client Authorization</h3>
                                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50 dark:bg-zinc-950/50 w-fit min-w-[200px]">
                                        <div className="h-16 flex items-end mb-2">
                                            <img src={intakeData.userSignature} alt="Client Signature" className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <p className="text-xs text-zinc-500 border-t border-zinc-200 dark:border-zinc-700 pt-1">
                                            Signed by: <span className="font-medium text-zinc-900 dark:text-zinc-300">{clientProfile?.name || "Client"}</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <hr className="border-zinc-200 dark:border-zinc-800" />

                            {/* Footer Disclaimer */}
                            <div>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-600 text-center mb-6">
                                    Disclaimer: This is a user-owned personal record and does not replace the official legal health record maintained by the provider.
                                </p>
                            </div>

                            {/* Signature Section */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-200">Sign to Complete</h3>
                                <Input
                                    label="Practitioner Name"
                                    value={practitionerName}
                                    onChange={(e) => setPractitionerName(e.target.value)}
                                    placeholder="Dr. Name or Therapist Name"
                                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white mb-4"
                                />

                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Digital Attestation</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                            By clicking "Finish & Save", I certify that this session record is accurate.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Digitally Signed by: <span className="font-medium text-zinc-900 dark:text-zinc-100">{practitionerName || "Guest Practitioner"}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 pb-12">
                            <Button variant="outline" onClick={() => setStep("work")}>Back to Edit</Button>
                            <Button onClick={handleFinalSave} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                {isSaving ? "Saving..." : "Finish & Save Session"}
                            </Button>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
