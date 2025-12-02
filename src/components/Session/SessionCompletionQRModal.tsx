import { QRCodeSVG } from "qrcode.react";
import { Modal } from "../ui/Modal";
import { compressData } from "../../utils/compression";
import { QrCode } from "lucide-react";

interface SessionCompletionQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionData: any;
}

export function SessionCompletionQRModal({ isOpen, onClose, sessionData }: SessionCompletionQRModalProps) {
    if (!sessionData) return null;

    // Compress the session data for the QR code
    const compressedData = compressData(sessionData);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Session Record QR"
            description="Ask the patient to scan this code to save the session record to their device."
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
                        <span>Ready to Transfer</span>
                    </div>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        This QR code contains the full signed session record.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
