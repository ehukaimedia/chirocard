import { Modal } from "../ui/Modal";
import { Smartphone, Users, ShieldCheck } from "lucide-react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="How ChiroCard Works"
            description="Your guide to the digital health passport."
            confirmLabel="Got it"
            onConfirm={onClose}
            variant="default"
        >
            <div className="space-y-6 py-2">
                {/* 1. Patient is the Database */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                            <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">1. You Own Your Data</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            ChiroCard is a "Lite" app. Your health records live on <strong>your phone</strong>, not in the cloud. You are the database.
                        </p>
                    </div>
                </div>

                {/* 2. Check In */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">2. Start a Session</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Begin a new session on your device. Hand it to your practitioner or use the Kiosk mode to let them chart your visit.
                        </p>
                    </div>
                </div>

                {/* 3. Practitioner Kiosk */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">3. Secure & Private</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Your session data is stored locally. You can export your history or share it with your care team securely.
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
