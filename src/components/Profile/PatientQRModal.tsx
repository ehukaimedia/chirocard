import { QRCodeSVG } from "qrcode.react";
import { Modal } from "../ui/Modal";
import { compressData } from "../../utils/compression";
import { type UserProfile } from "../../db/db";
import { useAppStore } from "../../store/useAppStore";
import { QrCode, ScanLine } from "lucide-react";
import { SessionScannerModal } from "../Dashboard/SessionScannerModal";
import { useState } from "react";
import { Button } from "../ui/Button";

interface PatientQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile | undefined;
}

export function PatientQRModal({ isOpen, onClose, user }: PatientQRModalProps) {
    const { intakeData } = useAppStore();
    const [showScanner, setShowScanner] = useState(false);

    if (!user) return null;

    // Prepare the payload
    // We include the profile and any active intake data (e.g. if they just filled out an intake form)
    const payload = {
        profile: user,
        intake: intakeData || {}, // Include current intake state if available
        timestamp: Date.now()
    };

    const compressedData = compressData(payload);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Your ChiroCard"
            description="Show this QR code to your practitioner to check in."
            confirmLabel="Close"
            onConfirm={onClose}
            variant="default"
        >
            <div className="flex flex-col items-center justify-center py-4 space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-inner border border-zinc-100">
                    <QRCodeSVG
                        value={compressedData}
                        size={256}
                        level="L"
                        includeMargin={true}
                    />
                </div>

                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium">
                        <QrCode className="w-5 h-5" />
                        <span>Ready to Scan</span>
                    </div>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        Show this to your practitioner to check in.
                    </p>
                </div>

                <div className="w-full pt-4 border-t border-zinc-100">
                    <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 py-6 border-dashed border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50 text-zinc-600 hover:text-emerald-700 transition-all"
                        onClick={() => setShowScanner(true)}
                    >
                        <ScanLine className="w-5 h-5" />
                        <span>Scan to Complete Session</span>
                    </Button>
                </div>
            </div>

            <SessionScannerModal
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onScanSuccess={() => {
                    onClose(); // Close the parent modal too when done
                }}
            />
        </Modal>
    );
}
