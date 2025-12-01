import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Practitioner } from "../db/db";
import { Button } from "../components/ui/Button";
import { BodyRegionSelector, type BodyStatus, REGIONS } from "../components/BodyMap/BodyRegionSelector";
import { ArrowLeft, Play } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { SignaturePad, type SignaturePadRef } from "../components/SignaturePad";
import { useToast } from "../components/ui/Toast";
import { Modal } from "../components/ui/Modal";
import { AddPractitionerModal } from "../components/Practitioner/AddPractitionerModal";

export default function Intake() {
    const navigate = useNavigate();
    const location = useLocation();
    const appointmentId = location.state?.appointmentId;
    const { startSession, intakeData, activePractitioner, clearIntakeData } = useAppStore();

    // Initialize with existing data if returning from session
    const [bodyStatus, setBodyStatus] = useState<Record<string, BodyStatus>>(intakeData?.bodyMap || {});
    const [bodyNotes, setBodyNotes] = useState<Record<string, string>>(intakeData?.bodyNotes || {});
    const [bodyLevels, setBodyLevels] = useState<Record<string, number>>(intakeData?.bodyLevels || {});
    const [bodyBadges, setBodyBadges] = useState<Record<string, string[]>>(intakeData?.bodyBadges || {});
    const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(
        activePractitioner ? { ...activePractitioner } as Practitioner : null
    );
    const [notes, setNotes] = useState(intakeData?.notes || "");

    const [step, setStep] = useState<"intake" | "review">("intake");
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [showAddPractitionerModal, setShowAddPractitionerModal] = useState(false);
    const sigPadRef = useRef<SignaturePadRef>(null);

    const practitioners = useLiveQuery(() => db.practitioners.orderBy('order').toArray());

    const { toast } = useToast();

    useEffect(() => {
        // Check if there is existing intake data when the component mounts
        if (intakeData && (Object.keys(intakeData.bodyMap).length > 0 || intakeData.notes)) {
            setShowResumeModal(true);
        } else if (appointmentId) {
            // If starting from an appointment, try to find it and pre-fill
            db.appointments.get(appointmentId).then(appt => {
                if (appt) {
                    db.practitioners.get(appt.practitionerId).then(p => {
                        if (p) {
                            setSelectedPractitioner(p);
                            toast(`Starting session with ${p.name}`, "info");
                        }
                    });
                }
            });
        }
    }, [appointmentId, intakeData]);

    const handleResume = () => {
        setShowResumeModal(false);
        toast("Resumed previous session intake.", "info");
    };

    const handleStartNew = () => {
        clearIntakeData();
        setBodyStatus({});
        setBodyNotes({});
        setBodyLevels({});
        setBodyBadges({});
        setNotes("");
        setSelectedPractitioner(null);
        setShowResumeModal(false);
        toast("Started a new session intake.", "success");
    };

    const handleStartClick = () => {
        if (!selectedPractitioner) {
            toast("Please select a practitioner first.", "error");
            return;
        }
        setStep("review");
    };

    const handleConfirmStart = async () => {
        if (!selectedPractitioner) return;

        // Get signature
        const signature = sigPadRef.current?.getTrimmedCanvas().toDataURL("image/png") || null;

        // Create new session
        const sessionId = crypto.randomUUID();
        // Session is now only saved to DB upon completion in GuestSession.tsx


        // Pass full practitioner data including contact info for PDF
        startSession(sessionId, {
            id: selectedPractitioner.id,
            name: selectedPractitioner.name,
            role: selectedPractitioner.role,
            clinicName: selectedPractitioner.clinicName,
            phone: selectedPractitioner.phone,
            email: selectedPractitioner.email,
            address: selectedPractitioner.address,
            website: selectedPractitioner.website
        }, {
            bodyMap: bodyStatus,
            bodyNotes: bodyNotes,
            bodyLevels: bodyLevels,
            bodyBadges: bodyBadges,
            notes: notes,
            userSignature: signature || undefined
        }, appointmentId);

        navigate("/guest-session");
    };

    // Auto-select first practitioner if available and none selected
    if (practitioners && practitioners.length > 0 && !selectedPractitioner) {
        setSelectedPractitioner(practitioners[0]);
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Session Intake</h1>
            </div>

            <Modal
                isOpen={showResumeModal}
                onClose={() => { /* Prevent closing by clicking outside to force choice? Or just default to resume? Let's default to resume if they click out */ setShowResumeModal(false); }}
                title="Resume Session?"
                description="You have an unfinished session intake in progress. Would you like to resume it or start over?"
                confirmLabel="Resume Session"
                cancelLabel="Start New"
                onConfirm={handleResume}
                onCancel={handleStartNew}
            />

            <div className="flex-1 space-y-8">
                {step === "intake" ? (
                    <>
                        {/* Practitioner Selection - Cards */}
                        <section>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Select Practitioner</h2>
                            {practitioners && practitioners.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {practitioners.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => setSelectedPractitioner(p)}
                                                className={`
                                                    relative p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]
                                                    ${selectedPractitioner?.id === p.id
                                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`
                                                        w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                                                        ${selectedPractitioner?.id === p.id
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}
                                                    `}>
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                                                        <p className="text-xs text-zinc-500">{p.role}</p>
                                                    </div>
                                                </div>
                                                {selectedPractitioner?.id === p.id && (
                                                    <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center px-2">
                                        <p className="text-xs text-zinc-500">
                                            Manage your team in <span className="font-bold cursor-pointer hover:text-emerald-500" onClick={() => navigate('/team')}>Team Settings</span>.
                                        </p>
                                        <button
                                            onClick={() => setShowAddPractitionerModal(true)}
                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full"
                                        >
                                            + Add New
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                    <p className="text-zinc-500 mb-4">No practitioners found.</p>
                                    <Button onClick={() => setShowAddPractitionerModal(true)}>Add Practitioner</Button>
                                </div>
                            )}

                            <AddPractitionerModal
                                isOpen={showAddPractitionerModal}
                                onClose={() => setShowAddPractitionerModal(false)}
                                onAdded={(newPractitioner) => {
                                    setSelectedPractitioner(newPractitioner);
                                    toast(`Added ${newPractitioner.name} to your team.`, "success");
                                }}
                            />
                        </section>

                        {/* Question 3 */}
                        <section className="space-y-4 pb-4">
                            <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                                3. Tap areas of concern
                            </h2>
                            <BodyRegionSelector
                                value={bodyStatus}
                                onChange={(part, status) => setBodyStatus(prev => ({ ...prev, [part]: status }))}
                                mode="simple"
                            />
                        </section>

                        {/* Dynamic Body Notes */}
                        {Object.entries(bodyStatus).some(([_, status]) => status === 'issue' || status === 'watch') && (
                            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                                    Details for Selected Areas
                                </h2>
                                <div className="grid gap-4">
                                    {Object.entries(bodyStatus)
                                        .filter(([_, status]) => status === 'issue' || status === 'watch')
                                        .map(([partId, status]) => {
                                            const region = REGIONS.find(r => r.id === partId);
                                            if (!region) return null;
                                            return (
                                                <div key={partId} className="space-y-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${status === 'issue' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                            {region.label}
                                                        </label>
                                                        <span className="text-xs font-bold text-zinc-500">
                                                            Pain Level: {bodyLevels[partId] || 0}/10
                                                        </span>
                                                    </div>

                                                    {/* Intensity Slider */}
                                                    <div className="px-2">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="10"
                                                            step="1"
                                                            value={bodyLevels[partId] || 0}
                                                            onChange={(e) => setBodyLevels(prev => ({ ...prev, [partId]: parseInt(e.target.value) }))}
                                                            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-emerald-500"
                                                        />
                                                        <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                                            <span>None</span>
                                                            <span>Moderate</span>
                                                            <span>Severe</span>
                                                        </div>
                                                    </div>

                                                    {/* Badges */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {["Pain", "Stiffness", "Numbness", "Tingling", "Weakness", "Spasm", "Limited ROM", "Swelling"].map(badge => {
                                                            const isSelected = (bodyBadges[partId] || []).includes(badge);
                                                            return (
                                                                <button
                                                                    key={badge}
                                                                    onClick={() => {
                                                                        setBodyBadges(prev => {
                                                                            const current = prev[partId] || [];
                                                                            return {
                                                                                ...prev,
                                                                                [partId]: isSelected
                                                                                    ? current.filter(b => b !== badge)
                                                                                    : [...current, badge]
                                                                            };
                                                                        });
                                                                    }}
                                                                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${isSelected
                                                                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                                                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50'
                                                                        }`}
                                                                >
                                                                    {badge}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <input
                                                        type="text"
                                                        value={bodyNotes[partId] || ""}
                                                        onChange={(e) => setBodyNotes(prev => ({ ...prev, [partId]: e.target.value }))}
                                                        placeholder={`Specifics for ${region.label}...`}
                                                        className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                </div>
                                            );
                                        })}
                                </div>
                            </section>
                        )}

                        {/* Question 4: Notes */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                                4. Notes for Practitioner
                            </h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Type or dictate notes here..."
                                className="w-full h-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </section>
                    </>
                ) : (
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-3xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Review & Sign</h2>
                            <Button variant="ghost" onClick={() => setStep("intake")} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                                Edit Intake
                            </Button>
                        </div>

                        {/* Digital Document Preview */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                            {/* Header */}
                            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-6">
                                <h1 className="text-2xl font-serif text-emerald-600 dark:text-emerald-500 mb-2">Intake Summary</h1>
                                <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                                    <span>Date: {new Date().toLocaleDateString()}</span>
                                    <span>Practitioner: {selectedPractitioner?.name}</span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Body Areas */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Areas of Concern</h3>
                                    {Object.entries(bodyStatus).filter(([_, s]) => s === 'issue' || s === 'watch').length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {Object.entries(bodyStatus)
                                                .filter(([_, status]) => status === 'issue' || status === 'watch')
                                                .map(([partId, status]) => {
                                                    const region = REGIONS.find(r => r.id === partId);
                                                    const note = bodyNotes[partId];
                                                    return (
                                                        <div key={partId} className="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/50 flex justify-between items-start">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{region?.label}</span>
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${status === 'issue' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                                        {status}
                                                                    </span>
                                                                </div>
                                                                {(bodyLevels[partId] !== undefined || (bodyBadges[partId] && bodyBadges[partId].length > 0)) && (
                                                                    <div className="flex flex-wrap gap-2 mt-1 mb-1">
                                                                        {bodyLevels[partId] !== undefined && (
                                                                            <span className="text-xs font-bold text-zinc-500">Pain Level: {bodyLevels[partId]}/10</span>
                                                                        )}
                                                                        {bodyBadges[partId]?.map(badge => (
                                                                            <span key={badge} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                                                                {badge}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {note && <p className="text-sm text-zinc-400 mt-1">{note}</p>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-500 italic">No specific areas marked.</p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Notes for Practitioner</h3>
                                    <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/50 min-h-[60px]">
                                        <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap">
                                            {notes || "No notes added."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Signature Section */}
                        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-200 mb-4">Sign to Start Session</h3>
                            <div>
                                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Client Initials</label>
                                <SignaturePad ref={sigPadRef} />
                                <p className="text-xs text-zinc-500 mt-2">
                                    By signing, you confirm that the information provided is accurate.
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg z-10">
                {step === "intake" ? (
                    <>
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full shadow-xl shadow-primary/20 text-lg h-14"
                            onClick={handleStartClick}
                        >
                            Review & Sign <Play className="ml-2 w-5 h-5 fill-current" />
                        </Button>
                        <p className="text-center text-xs text-zinc-500 mt-3">
                            Review your information before starting
                        </p>
                    </>
                ) : (
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => setStep("intake")} className="flex-1">
                            Back
                        </Button>
                        <Button
                            variant="primary"
                            size="lg"
                            className="flex-1 shadow-xl shadow-primary/20 text-lg h-14"
                            onClick={handleConfirmStart}
                        >
                            Start Practitioner Mode <Play className="ml-2 w-5 h-5 fill-current" />
                        </Button>
                    </div>
                )}
            </div>


        </div>
    );
}
