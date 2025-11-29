import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Practitioner } from "../db/db";
import { Button } from "../components/ui/Button";
import { BodyRegionSelector, type BodyStatus, REGIONS } from "../components/BodyMap/BodyRegionSelector";
import { ArrowLeft, Play } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { SignaturePad, type SignaturePadRef } from "../components/SignaturePad";
import { useToast } from "../components/ui/Toast";

export default function Intake() {
    const navigate = useNavigate();
    const { startSession, intakeData, activePractitioner } = useAppStore();

    // Initialize with existing data if returning from session
    const [bodyStatus, setBodyStatus] = useState<Record<string, BodyStatus>>(intakeData?.bodyMap || {});
    const [bodyNotes, setBodyNotes] = useState<Record<string, string>>(intakeData?.bodyNotes || {});
    const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(
        activePractitioner ? { ...activePractitioner } as Practitioner : null
    );
    const [notes, setNotes] = useState(intakeData?.notes || "");

    const [step, setStep] = useState<"intake" | "review">("intake");
    const sigPadRef = useRef<SignaturePadRef>(null);

    const practitioners = useLiveQuery(() => db.practitioners.orderBy('order').toArray());

    const { toast } = useToast();

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
        await db.sessions.add({
            id: sessionId,
            date: Date.now(),
            practitionerId: selectedPractitioner.id,
            practitionerName: selectedPractitioner.name,
            practitionerClass: selectedPractitioner.role,
            notes: "",
            signatureBase64: signature,
            isLocked: false,
            createdAt: Date.now()
        });

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
            notes: notes,
            userSignature: signature || undefined
        });

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

            <div className="flex-1 space-y-8">
                {step === "intake" ? (
                    <>
                        {/* Practitioner Selection - Dropdown */}
                        <section>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Select Practitioner</h2>
                            {practitioners && practitioners.length > 0 ? (
                                <div className="space-y-2">
                                    <select
                                        className="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-lg font-medium text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none appearance-none"
                                        value={selectedPractitioner?.id || ""}
                                        onChange={(e) => {
                                            const p = practitioners.find(p => p.id === e.target.value);
                                            if (p) setSelectedPractitioner(p);
                                        }}
                                    >
                                        {practitioners.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} - {p.role}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-zinc-500 px-2">
                                        Manage your team order in the <span className="font-bold cursor-pointer hover:text-emerald-500" onClick={() => navigate('/team')}>Team</span> page.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                    <p className="text-zinc-500 mb-4">No practitioners found.</p>
                                    <Button onClick={() => navigate("/team")}>Add Practitioner</Button>
                                </div>
                            )}
                        </section>

                        {/* Question 3 */}
                        <section className="space-y-4">
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
                                                <div key={partId} className="space-y-2">
                                                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${status === 'issue' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                        {region.label}
                                                    </label>
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
                                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Patient Signature</label>
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
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg">
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
