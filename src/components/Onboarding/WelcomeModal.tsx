import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { ArrowRight, ShieldCheck, Activity, FileText } from "lucide-react";

export function WelcomeModal() {
    const navigate = useNavigate();
    const user = useLiveQuery(() => db.users.get("me"));
    const [isOpen, setIsOpen] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Only check once user data is loaded (or confirmed missing)
        // We use a small timeout to ensure Dexie has had a chance to return undefined if empty
        const timer = setTimeout(() => {
            if (user === undefined) {
                // User doesn't exist yet, show modal
                setIsOpen(true);
            } else if (user && !user.name) {
                // User exists but hasn't set a name (incomplete profile)
                setIsOpen(true);
            }
            setHasChecked(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [user]);

    const handleCompleteProfile = () => {
        setIsOpen(false);
        navigate("/profile");
    };

    const handleContinueGuest = () => {
        setIsOpen(false);
    };

    if (!hasChecked && !isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { }} // Force choice
            title="Welcome to ChiroCard"
            description="Your personal digital health passport for holistic bodywork."
            variant="default"
            className="sm:max-w-lg"
        >
            <div className="space-y-6 mt-2">
                {/* Value Props Grid */}
                <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Digital Bodywork Passport</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                Carry your complete history, preferences, and contraindications with you. Share it seamlessly with any practitioner.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg shrink-0">
                            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Track & Visualize Progress</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                Log sessions, track pain levels, and visualize your healing journey over time with intuitive charts.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg shrink-0">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Private & Local-First</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                Your data lives on your device. We don't collect, sell, or see your personal health information. You are in control.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 text-center">
                        To get started, let's set up your basic profile. It only takes a minute.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            size="lg"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                            onClick={handleCompleteProfile}
                        >
                            Create My Passport <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleContinueGuest}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                            I'll explore first
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
