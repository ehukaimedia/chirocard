import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { Button } from "../components/ui/Button";
import { BodyRegionSelector } from "../components/BodyMap/BodyRegionSelector";
import { ArrowLeft, Play } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useToast } from "../components/ui/Toast";

export default function Intake() {
    const navigate = useNavigate();
    const { currentSession, startSession, updateSession } = useAppStore();
    const { toast } = useToast();
    const user = useLiveQuery(() => db.users.get("me"));

    // Initialize session on mount if not exists
    useEffect(() => {
        if (!currentSession) {
            startSession();
        }
    }, [currentSession, startSession]);

    const handleReady = () => {
        if (!currentSession) return;

        // Basic validation
        const hasIssues = Object.values(currentSession.bodyMap).some(s => s === 'issue' || s === 'watch');
        if (!hasIssues && !currentSession.clientNotes) {
            toast("Please select an area of concern or add a note.", "error");
            return;
        }

        // Navigate to Practitioner View
        navigate("/session-active");
    };

    if (!currentSession) return null; // Loading...

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Check In</h1>
                    <p className="text-sm text-zinc-500">
                        {user?.name ? `Hi ${user.name.split(' ')[0]}, how are you feeling?` : "How are you feeling?"}
                    </p>
                </div>
            </div>

            <div className="flex-1 space-y-8 max-w-xl mx-auto w-full">
                {/* Body Map */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                        1. Tap areas of concern
                    </h2>
                    <BodyRegionSelector
                        value={currentSession.bodyMap}
                        onChange={(part, status) => updateSession({
                            bodyMap: { ...currentSession.bodyMap, [part]: status }
                        })}
                        mode="simple"
                    />
                </section>

                {/* Notes */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                        2. Notes for today
                    </h2>
                    <textarea
                        value={currentSession.clientNotes}
                        onChange={(e) => updateSession({ clientNotes: e.target.value })}
                        placeholder="Describe your pain, stiffness, or goals for this session..."
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
                    onClick={handleReady}
                >
                    Ready for Session <Play className="ml-2 w-5 h-5 fill-current flex-shrink-0" />
                </Button>
            </div>
        </div>
    );
}
