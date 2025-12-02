import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { Button } from "../components/ui/Button";
import { BodyRegionSelector } from "../components/BodyMap/BodyRegionSelector";
import { ArrowLeft, Play, CheckCircle } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useToast } from "../components/ui/Toast";
import { IntakeProfileSection } from "../components/Intake/IntakeProfileSection";
import { IntakePractitionerSection } from "../components/Intake/IntakePractitionerSection";
import { BodyRegionDetails } from "../components/Intake/BodyRegionDetails";
import { SignaturePad } from "../components/Shared/SignaturePad";

export default function Intake() {
    const navigate = useNavigate();
    const { currentSession, startSession, updateSession } = useAppStore();
    const { toast } = useToast();

    const user = useLiveQuery(() => db.users.get("me"));
    const [showReview, setShowReview] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);

    const practitioner = useLiveQuery(
        () => currentSession?.practitionerId ? db.practitioners.get(currentSession.practitionerId) : Promise.resolve(null),
        [currentSession?.practitionerId]
    );

    // Initialize session on mount if not exists
    useEffect(() => {
        if (!currentSession) {
            startSession();
        }
    }, [currentSession, startSession]);

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
        if (!signature) {
            toast("Please sign to start the session.", "error");
            return;
        }

        updateSession({
            // @ts-ignore - we will add this field to store type
            userSignature: signature
        });

        navigate("/session-active");
    };

    if (!currentSession) return null; // Loading...

    const issueAreas = Object.entries(currentSession.bodyMap)
        .filter(([_, status]) => status === 'issue');
    if (showReview) {
        return (
            <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => setShowReview(false)}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Review & Sign</h1>
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

                        {practitioner && (
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                    {practitioner.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Practitioner</p>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{practitioner.name}</p>
                                    <p className="text-xs text-zinc-500">{practitioner.role}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Areas of Concern</h3>
                        {issueAreas.length === 0 ? (
                            <p className="text-sm text-zinc-500 italic">No specific areas selected.</p>
                        ) : (
                            <div className="space-y-4">
                                {issueAreas.map(([part]) => (
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
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Sign to Start Session</h3>
                        <SignaturePad onChange={setSignature} />
                        <div className="flex justify-between items-center text-xs text-zinc-400 mt-2">
                            <span>Signed by: <strong className="text-zinc-700 dark:text-zinc-300 uppercase">{user?.name || "GUEST"}</strong></span>
                        </div>
                        <p className="text-[10px] text-center text-zinc-400 mt-4">
                            By signing, you confirm that the information provided is accurate.
                        </p>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg z-10">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full max-w-xl mx-auto shadow-xl shadow-primary/20 text-lg h-auto min-h-[3.5rem] py-3"
                        onClick={handleStartSession}
                        disabled={!signature}
                    >
                        Start Session <Play className="ml-2 w-5 h-5 flex-shrink-0" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24 flex flex-col">
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

                {/* 2. Practitioner */}
                <section className="space-y-4">
                    <IntakePractitionerSection />
                </section>

                {/* 3. Body Map */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                        3. Tap areas of concern
                    </h2>
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
                </section>

                {/* 4. Details */}
                {issueAreas.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                            4. Details for Selected Areas
                        </h2>
                        <div className="space-y-4">
                            {issueAreas.map(([part]) => (
                                <BodyRegionDetails
                                    key={part}
                                    bodyPart={part}
                                    data={{
                                        level: currentSession.bodyLevels[part] || 0,
                                        notes: currentSession.bodyNotes[part] || ""
                                    }}
                                    onChange={(data) => updateSession({
                                        bodyLevels: { ...currentSession.bodyLevels, [part]: data.level },
                                        bodyNotes: { ...currentSession.bodyNotes, [part]: data.notes }
                                    })}
                                />
                            ))}
                        </div>
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
                        className="w-full h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                </section>
            </div>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg z-10">
                <Button
                    variant="primary"
                    size="lg"
                    className="w-full max-w-xl mx-auto shadow-xl shadow-primary/20 text-lg h-auto min-h-[3.5rem] py-3"
                    onClick={handleReview}
                >
                    Review & Sign <CheckCircle className="ml-2 w-5 h-5 flex-shrink-0" />
                </Button>
            </div>
        </div>
    );
}

