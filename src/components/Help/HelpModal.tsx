import { Modal } from "../ui/Modal";
import { Smartphone, BookOpen, Activity, ShieldCheck, Hand, Brain } from "lucide-react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Holistic User Guide"
            description="Master your Digital Bodywork Passport."
            confirmLabel="Got it"
            onConfirm={onClose}
            variant="default"
        >
            <div className="space-y-8 py-2">

                {/* Intro / Chiro Meaning */}
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <Hand className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Chiro = Hand</h3>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
                                "Chiro" means <strong>"hand"</strong>. ChiroCard is your personalized journal for holistic body care that keeps track of all hands-on bodywork.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 1. Bodywork Passport (Profile) */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">1. Bodywork Passport (Profile)</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Your <strong>Profile</strong> is your Bodywork Passport. It contains your health context and identity. Carry it to every practitioner to check in and share your story.
                        </p>
                    </div>
                </div>

                {/* 2. Bodywork Journal */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                            <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">2. Bodywork Journal</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            This entire app is your Journal. It tracks your complete history: <strong>Practitioner Sessions</strong>, <strong>Personal Routines</strong>, and <strong>Notes</strong>.
                        </p>
                    </div>
                </div>

                {/* 3. Collaborative Care */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">3. Collaborative Care</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Start a session and <strong>hand your device</strong> to your practitioner. They log their notes directly into your journal, keeping your history complete.
                        </p>
                    </div>
                </div>

                {/* 4. ChiroCard Brain */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-full">
                            <Brain className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">4. ChiroCard Brain</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Your data backup primarily secures your personal records. Additionally, it provides a structured format that you can optionally use with AI models to gain intelligent insights, spot patterns, and better understand your health journey.
                        </p>
                    </div>
                </div>

                {/* 5. Local-First Privacy */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">5. Local-First Privacy</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            You are the database. Your health records live on your phone, not in the cloud. You have 100% ownership and control.
                        </p>
                    </div>
                </div>

            </div>
        </Modal>
    );
}
