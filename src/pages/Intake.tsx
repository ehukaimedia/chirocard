import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Practitioner } from "../db/db";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { BodyRegionSelector, type BodyStatus } from "../components/BodyMap/BodyRegionSelector";
import { ArrowLeft, Play } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useToast } from "../components/ui/Toast";

export default function Intake() {
    const navigate = useNavigate();
    const { startSession, intakeData, activePractitioner } = useAppStore();

    // Initialize with existing data if returning from session
    const [bodyStatus, setBodyStatus] = useState<Record<string, BodyStatus>>(intakeData?.bodyMap || {});
    const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(
        activePractitioner ? { ...activePractitioner } as Practitioner : null
    );
    const [notes, setNotes] = useState(intakeData?.notes || "");

    const [showStartModal, setShowStartModal] = useState(false);

    const practitioners = useLiveQuery(() => db.practitioners.orderBy('order').toArray());

    const { toast } = useToast();

    const handleStartClick = () => {
        if (!selectedPractitioner) {
            toast("Please select a practitioner first.", "error");
            return;
        }
        setShowStartModal(true);
    };

    const handleConfirmStart = async () => {
        if (!selectedPractitioner) return;

        // Create new session
        const sessionId = crypto.randomUUID();
        await db.sessions.add({
            id: sessionId,
            date: Date.now(),
            practitionerId: selectedPractitioner.id,
            practitionerName: selectedPractitioner.name,
            practitionerClass: selectedPractitioner.role,
            notes: "",
            signatureBase64: null,
            isLocked: false,
            createdAt: Date.now()
        });

        startSession(sessionId, selectedPractitioner, {
            bodyMap: bodyStatus,
            notes: notes
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
                        <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
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

                {/* Question 4: Notes */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                        4. Notes for Practitioner
                    </h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Type or dictate notes here..."
                        className="w-full h-24 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </section>
            </div>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg">
                <Button
                    variant="primary"
                    size="lg"
                    className="w-full shadow-xl shadow-primary/20 text-lg h-14"
                    onClick={handleStartClick}
                >
                    Start Practitioner Mode <Play className="ml-2 w-5 h-5 fill-current" />
                </Button>
                <p className="text-center text-xs text-zinc-500 mt-3">
                    Hand device to practitioner after tapping start
                </p>
            </div>

            <Modal
                isOpen={showStartModal}
                onClose={() => setShowStartModal(false)}
                title="Ready to Start Session?"
                description={`You are about to hand over your device to ${selectedPractitioner?.name}. They will review your intake notes and begin the session.`}
                confirmLabel="Confirm & Hand Over"
                onConfirm={handleConfirmStart}
            />
        </div>
    );
}
