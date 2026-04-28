import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataStore } from "../store/useDataStore";
import { Button } from "../components/ui/Button";
import { BodyRegionSelector } from "../components/BodyMap/BodyRegionSelector";
import { ArrowLeft, Play, CheckCircle } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useToast } from "../components/ui/Toast";
import { IntakeProfileSection } from "../components/Intake/IntakeProfileSection";
import { GuardModal } from "../components/Session/GuardModal";


export default function Intake() {
    const navigate = useNavigate();
    const { currentSession, startSession, updateSession } = useAppStore();
    const { toast } = useToast();

    const { user } = useDataStore();
    // const user = useLiveQuery(() => db.users.get("me"));
    const [showReview, setShowReview] = useState(false);
    const [showGuard, setShowGuard] = useState(false);

    const [agreement, setAgreement] = useState<string | null>(null);

    // Remove practitioner selection from session intake
    // Enforce completed profile requirement for session intake
    // The practitioner selection logic is removed as per the instruction.
    // The `practitioner` variable and its `useLiveQuery` hook are no longer needed.

    // Initialize session on mount if not exists
    useEffect(() => {
        if (!currentSession) {
            startSession();
        }
    }, [currentSession, startSession]);

    // Check for profile completion
    useEffect(() => {
        if (user) {
            const requiredFields = ['name', 'dateOfBirth', 'height', 'weight', 'phone'] as const;
            const missing = requiredFields.filter(field => !(user as Record<string, unknown>)[field]);

            if (missing.length > 0) {
                /* Profile incomplete — handled by UI */
                toast("Please complete your profile to start a session.", "error");
                // Pass state to Profile to auto-enable edit mode
                navigate("/profile", { state: { editMode: true, missingFields: missing } });
            }
        }
    }, [user, navigate, toast]);

    const handleReview = () => {
        if (!currentSession) return;

        // Basic validation
        const hasIssues = Object.values(currentSession.bodyMap).some(s => s === 'issue' || s === 'watch');
        if (!hasIssues && !currentSession.clientNotes) {
            toast("Please select an area of concern or add a note.", "error");
            return;
        }

        setShowReview(true);
        window.scrollTo(0, 0);
    };

    const handleStartSession = async () => {
        if (!agreement) {
            toast("Please agree to start the session.", "error");
            return;
        }

        updateSession({
            userSignature: agreement
        });

        setShowGuard(true);
    };

    const handleUnlock = () => {
        setShowGuard(false);
        // Navigate to the unified active session view
        navigate("/session-active");
    };

    if (!currentSession) return null; // Loading...

    const selectedAreas = Object.entries(currentSession.bodyMap)
        .filter(([part, status]) => {
            const hasPain = (currentSession.bodyLevels[part] || 0) > 0;
            const hasNotes = !!currentSession.bodyNotes[part];
            return status !== 'normal' || hasPain || hasNotes;
        });

    if (showReview) {
        return (
            <div className="min-h-screen bg-light-bg dark:bg-dark-bg px-6 pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-24 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => setShowReview(false)}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Review & Confirm</h1>
                    </div>
                </div>

                <div className="flex-1 space-y-8 max-w-xl mx-auto w-full bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="space-y-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-serif text-emerald-600 dark:text-emerald-400">Intake Summary</h2>
                                <p className="text-sm text-zinc-500">Date: {new Date().toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Client</p>
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.name || "Guest"}</p>
                            </div>
                        </div>


                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Areas of Concern</h3>
                        {selectedAreas.length === 0 ? (
                            <p className="text-sm text-zinc-500 italic">No specific areas selected.</p>
                        ) : (
                            <div className="space-y-4">
                                {selectedAreas.map(([part]) => (
                                    <div key={part} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                                                    {part.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">ISSUE</span>
                                            </div>
                                            <div className="text-sm font-medium text-red-500">
                                                Pain: {currentSession.bodyLevels[part] || 0}/10
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {/* Badges removed */}
                                        </div>
                                        {currentSession.bodyNotes[part] && (
                                            <p className="text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded">
                                                "{currentSession.bodyNotes[part]}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Notes for Practitioner</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">
                            {currentSession.clientNotes || "No notes added."}
                        </p>
                    </div>

                    <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Review & Confirmation</h3>
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center space-y-4">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                I confirm that the information provided is accurate and I understand that this session will be recorded in my personal health log.
                            </p>

                            <Button
                                variant={agreement ? "primary" : "outline"}
                                className={`w-full py-6 text-lg font-medium transition-all ${agreement ? 'bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-500/20' : ''}`}
                                onClick={() => setAgreement(prev => prev ? null : `Digitally Agreed • ${new Date().toLocaleString()}`)}
                            >
                                {agreement ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Agreed & Confirmed
                                    </>
                                ) : (
                                    "Tap to Agree"
                                )}
                            </Button>
                            <div className="flex justify-center items-center text-xs text-zinc-400 mt-2">
                                <span>Agreed by: <strong className="text-zinc-700 dark:text-zinc-300 uppercase">{user?.name || "GUEST"}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg z-10">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full max-w-xl mx-auto shadow-xl shadow-emerald-500/20 text-xl font-bold h-16 rounded-2xl"
                        onClick={handleStartSession}
                        disabled={!agreement}
                    >
                        Start Session <Play className="ml-3 w-6 h-6 flex-shrink-0 fill-current" />
                    </Button>
                </div>

                <GuardModal
                    isOpen={showGuard}
                    onUnlock={handleUnlock}
                    onCancel={() => setShowGuard(false)}
                />
            </div >
        );
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg px-6 pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-24 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Session Intake</h1>
                </div>
            </div>

            <div className="flex-1 space-y-8 max-w-xl mx-auto w-full">
                {/* 1. Profile */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                        1. Client Profile
                    </h2>
                    <IntakeProfileSection />
                </section>



                {/* 3. Body Map */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                        3. Tap areas of concern
                    </h2>
                    <BodyRegionSelector
                        value={currentSession.bodyMap}
                        levels={currentSession.bodyLevels}
                        notes={currentSession.bodyNotes}
                        onSave={(part, data) => {
                            updateSession({
                                bodyMap: { ...currentSession.bodyMap, [part]: data.status },
                                bodyLevels: { ...currentSession.bodyLevels, [part]: data.level },
                                bodyNotes: { ...currentSession.bodyNotes, [part]: data.note }
                            });
                        }}
                    />
                </section>

                {/* 4. Details Summary */}
                {selectedAreas.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                            4. Selected Areas Summary
                        </h2>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 space-y-3">
                            {selectedAreas.map(([part]) => (
                                <div key={part} className="flex items-start justify-between bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100 capitalize text-base">{part.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            {currentSession.bodyLevels[part] > 0 && (
                                                <span className="text-xs px-2 py-1 rounded-full font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300">
                                                    Pain: {currentSession.bodyLevels[part]}/10
                                                </span>
                                            )}
                                        </div>
                                        {currentSession.bodyNotes[part] ? (
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">"{currentSession.bodyNotes[part]}"</p>
                                        ) : (
                                            <p className="text-xs text-zinc-400 italic mt-1">No notes added</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs font-medium text-zinc-400 text-center uppercase tracking-wide">Tap any body part above to edit details.</p>
                    </section>
                )}

                {/* 5. Notes */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                        5. Notes for Practitioner
                    </h2>
                    <textarea
                        value={currentSession.clientNotes}
                        onChange={(e) => updateSession({ clientNotes: e.target.value })}
                        placeholder="Type or dictate notes here..."
                        className="w-full h-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 text-base text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary resize-none shadow-sm"
                    />
                </section>
            </div>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg z-10">
                <Button
                    variant="primary"
                    size="lg"
                    className="flex w-full max-w-xl mx-auto shadow-xl shadow-primary/20 text-lg h-auto min-h-[3.5rem] py-3"
                    onClick={handleReview}
                >
                    Review & Confirm <CheckCircle className="ml-2 w-5 h-5 flex-shrink-0" />
                </Button>
            </div>



        </div >
    );
}

