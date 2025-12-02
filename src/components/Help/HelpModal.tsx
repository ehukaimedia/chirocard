import { Modal } from "../ui/Modal";
import { Smartphone, QrCode, Users, ShieldCheck } from "lucide-react";

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
                            <QrCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">2. Scan to Check In</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Start a session and show your QR code to your practitioner. This instantly shares your profile and current complaints.
                        </p>
                    </div>
                </div>

                {/* 3. Practitioner Kiosk */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">3. Practitioner Kiosk</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Practitioners use the <strong>Kiosk Mode</strong> (on tablet or phone) to chart your session. No account required for them.
                        </p>
                    </div>
                </div>

                {/* 4. Save & Auto-Add */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">4. Scan to Save</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            When done, scan the practitioner's screen to save your record. This <strong>automatically adds</strong> them to your Care Team.
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
