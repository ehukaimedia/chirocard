import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X, Camera, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { decompressData } from "../../utils/compression";
import { db } from "../../db/db";
import { useToast } from "../ui/Toast";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

interface SessionScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess?: () => void;
}

export function SessionScannerModal({ isOpen, onClose, onScanSuccess }: SessionScannerModalProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { setScannedPatientData, setMode } = useAppStore();

    useEffect(() => {
        if (isOpen && !scannerRef.current) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                startScanner();
            }, 100);
            return () => clearTimeout(timer);
        } else if (!isOpen && scannerRef.current) {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen]);

    const startScanner = () => {
        setError(null);
        setIsScanning(true);

        try {
            const scanner = new Html5QrcodeScanner(
                "session-reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                false
            );

            scanner.render(onScan, onScanError);
            scannerRef.current = scanner;
        } catch (err) {
            console.error("Failed to start scanner:", err);
            setError("Could not start camera. Please ensure permissions are granted.");
            setIsScanning(false);
        }
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            try {
                scannerRef.current.clear();
            } catch (e) {
                console.error("Error clearing scanner:", e);
            }
            scannerRef.current = null;
            setIsScanning(false);
        }
    };

    const onScan = async (decodedText: string) => {
        try {
            // Pause scanning
            if (scannerRef.current) {
                scannerRef.current.pause();
            }

            console.log("Scanned raw data length:", decodedText.length);

            let sessionData;
            try {
                // Try decompressing first
                sessionData = decompressData(decodedText);
            } catch (e) {
                console.log("Decompression failed, trying raw JSON parse", e);
                // Fallback to raw JSON if not compressed (legacy support)
                sessionData = JSON.parse(decodedText);
            }

            console.log("Parsed session data:", sessionData);

            // 1. Check for Patient Check-In Payload (Profile + Intake)
            if (sessionData.profile && sessionData.intake) {
                console.log("Detected Patient Check-In QR");

                // Store data and switch to Guest Mode
                setScannedPatientData(sessionData);
                setMode('guest');

                toast("Starting Guest Session...", "success");
                onClose();
                navigate("/guest-session");
                return;
            }

            // 2. Check for Session Record Payload (Completed Session)
            if (!sessionData.practitionerName) {
                throw new Error("Invalid session data format");
            }

            // 3. Process Session Record Import
            // Auto-Add Practitioner to Team
            if (sessionData.practitionerId) {
                const existingPractitioner = await db.practitioners.get(sessionData.practitionerId);
                if (!existingPractitioner) {
                    await db.practitioners.add({
                        id: sessionData.practitionerId,
                        name: sessionData.practitionerName,
                        role: 'Chiropractor', // Default role, can be edited later
                        clinicName: sessionData.clinicName,
                        order: 0 // Add to top or bottom logic can be improved later
                    });
                    toast(`Added ${sessionData.practitionerName} to your Team!`, "success");
                }
            }

            // 2. Save Session to database
            // Ensure ID is unique or overwrite if re-scanning same session
            await db.sessions.put(sessionData);

            toast("Session saved successfully!", "success");
            onScanSuccess?.();
            onClose();

        } catch (err) {
            console.error("Scan processing error:", err);
            setError("Invalid QR code. Please try again.");
            // Resume scanning
            if (scannerRef.current) {
                scannerRef.current.resume();
            }
        }
    };

    const onScanError = () => {
        // Ignore scan errors as they happen frequently when no QR is in view
        // console.log(errorMessage);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-emerald-500" />
                        Scan Session Record
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6">
                    <div className="bg-zinc-100 dark:bg-black rounded-xl overflow-hidden aspect-square relative">
                        <div id="session-reader" className="w-full h-full"></div>

                        {!isScanning && !error && (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                                <p>Initializing camera...</p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <p className="text-center text-sm text-zinc-500 mt-4">
                        Point your camera at the Practitioner's screen to save your session record.
                    </p>
                </div>
            </div>
        </div>
    );
}
