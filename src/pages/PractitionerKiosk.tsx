import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { SessionEditor, type SessionData } from "../components/Session/SessionEditor";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Scan, ArrowRight, RefreshCw, QrCode, Smartphone, CheckCircle, Camera, Share, Settings } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { PlacesAutocomplete } from "../components/ui/PlacesAutocomplete";
import { useToast } from "../components/ui/Toast";
import { compressData, decompressData } from "../utils/compression";

type KioskMode = "scan" | "session" | "transfer";

export default function PractitionerKiosk() {
    const [mode, setMode] = useState<KioskMode>("scan");
    const [scannedData, setScannedData] = useState<any>(null);
    const [finalSessionData, setFinalSessionData] = useState<SessionData | null>(null);
    const [compressedOutput, setCompressedOutput] = useState<string>("");
    const [manualInput, setManualInput] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [kioskSettings, setKioskSettings] = useState<{ practitionerName: string; clinicName: string; practitionerId: string }>({
        practitionerName: "",
        clinicName: "",
        practitionerId: ""
    });
    const { toast } = useToast();

    // Load settings on mount
    useEffect(() => {
        const saved = localStorage.getItem('chirocard_kiosk_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Ensure practitionerId exists (migration for existing users)
                if (!parsed.practitionerId) {
                    parsed.practitionerId = crypto.randomUUID();
                    localStorage.setItem('chirocard_kiosk_settings', JSON.stringify(parsed));
                }
                setKioskSettings(parsed);
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        } else {
            // Initialize with a new ID if no settings exist
            const newSettings = {
                practitionerName: "",
                clinicName: "",
                practitionerId: crypto.randomUUID()
            };
            setKioskSettings(newSettings);
            localStorage.setItem('chirocard_kiosk_settings', JSON.stringify(newSettings));
        }
    }, []);

    // Scanner Ref
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (mode === "scan") {
            // Initialize Scanner
            // We need a slight delay to ensure the DOM element exists
            const timer = setTimeout(() => {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );

                scanner.render((decodedText) => {
                    handleScanSuccess(decodedText);
                    scanner.clear();
                }, () => {
                    // console.warn(error);
                });

                scannerRef.current = scanner;
            }, 100);

            return () => {
                clearTimeout(timer);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(console.error);
                }
            };
        }
    }, [mode]);

    const handleScanSuccess = (decodedText: string) => {
        try {
            // Try to decompress first
            let data = decompressData(decodedText);

            // If decompression fails (returns null), maybe it's raw JSON?
            if (!data) {
                try {
                    data = JSON.parse(decodedText);
                } catch (e) {
                    console.error("Not JSON either");
                }
            }

            if (data) {
                setScannedData(data);
                setMode("session");
                toast("Patient data loaded!", "success");
            } else {
                toast("Invalid QR Code format", "error");
            }
        } catch (e) {
            toast("Failed to process QR code", "error");
        }
    };

    // Mock function to simulate scanning
    const handleSimulateScan = () => {
        try {
            if (!manualInput) {
                toast("Please enter JSON data to simulate scan", "error");
                return;
            }
            const data = JSON.parse(manualInput);
            setScannedData(data);
            setMode("session");
            toast("Patient data loaded!", "success");
        } catch (e) {
            toast("Invalid JSON data", "error");
        }
    };

    const handleSessionSave = async (data: SessionData) => {
        // In Kiosk mode, "Save" means "Generate QR"
        // Enrich data with Kiosk identity
        const enrichedData = {
            ...data,
            id: crypto.randomUUID(),
            date: Date.now(),
            practitionerId: kioskSettings.practitionerId,
            clinicName: kioskSettings.clinicName
        };
        setFinalSessionData(enrichedData);

        // Compress the data
        const compressed = compressData(enrichedData);
        setCompressedOutput(compressed);

        setMode("transfer");
    };

    const handleReset = () => {
        if (confirm("Are you sure? This will clear the current session.")) {
            setMode("scan");
            setScannedData(null);
            setFinalSessionData(null);
            setCompressedOutput("");
            setManualInput("");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
            {/* Kiosk Header - Minimalist */}
            <header className="p-6 flex justify-between items-center border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">ChiroCard <span className="text-emerald-500 font-mono text-xs uppercase tracking-widest ml-1">Kiosk</span></h1>
                        <p className="text-xs text-zinc-500">Stateless Practitioner Interface</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {mode === "scan" && (
                        <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} className="text-zinc-500 hover:text-emerald-400">
                            <Settings className="w-4 h-4 mr-2" /> Settings
                        </Button>
                    )}
                    {mode !== "scan" && (
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-zinc-500 hover:text-red-400">
                            <RefreshCw className="w-4 h-4 mr-2" /> Reset
                        </Button>
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6">
                {mode === "scan" && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="text-center space-y-4 mb-8">
                            <h2 className="text-4xl font-bold text-white mb-2">Ready for Patient</h2>
                            <p className="text-zinc-400 text-lg max-w-md mx-auto">
                                Scan the patient's ChiroCard QR code to begin the session.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                            {/* Camera Scanner */}
                            <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center gap-4 shadow-2xl shadow-black/50">
                                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                    <Camera className="w-5 h-5" />
                                    <span className="font-mono text-xs uppercase tracking-widest">Camera Scan</span>
                                </div>
                                <div id="reader" className="w-full max-w-[300px] overflow-hidden rounded-xl border-2 border-zinc-800 bg-black"></div>
                                <p className="text-xs text-zinc-500 text-center mt-2">
                                    Allow camera access when prompted.
                                </p>
                            </Card>

                            {/* Manual/Dev Input */}
                            <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col items-center gap-4 shadow-2xl shadow-black/50">
                                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                                    <Scan className="w-5 h-5" />
                                    <span className="font-mono text-xs uppercase tracking-widest">Simulate / Dev</span>
                                </div>

                                <div className="w-full space-y-3">
                                    <Input
                                        placeholder='Paste Patient JSON...'
                                        value={manualInput}
                                        onChange={(e) => setManualInput(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono text-xs"
                                    />
                                    <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white" onClick={handleSimulateScan}>
                                        Load JSON Data <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {mode === "session" && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <SessionEditor
                            intakeData={scannedData?.intake}
                            clientProfile={scannedData?.profile}
                            initialData={scannedData?.lastSession}
                            onSave={handleSessionSave}
                            onExit={handleReset}
                            defaultPractitionerName={kioskSettings.practitionerName}
                        />
                    </div>
                )}

                {mode === "transfer" && finalSessionData && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="text-center space-y-4 mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">Session Completed</h2>
                            <p className="text-zinc-400 max-w-md mx-auto">
                                Ask the patient to scan this QR code to transfer the session record to their device.
                            </p>
                        </div>

                        <Card className="bg-white p-8 rounded-3xl shadow-2xl shadow-emerald-900/20 mb-8">
                            <QRCodeSVG
                                value={compressedOutput || JSON.stringify(finalSessionData)}
                                size={256}
                                level="L"
                                includeMargin={true}
                            />
                        </Card>

                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                            <Smartphone className="w-4 h-4" />
                            <span>Data is compressed & ready for transfer</span>
                        </div>

                        <Button variant="outline" className="mt-12 text-zinc-500 border-zinc-800 hover:bg-zinc-900" onClick={handleReset}>
                            Start New Session
                        </Button>

                        {/* Share Button */}
                        <Button
                            variant="ghost"
                            className="mt-4 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                            onClick={async () => {
                                if (!finalSessionData) return;

                                const shareData = {
                                    title: 'ChiroCard Session',
                                    text: `ChiroCard Session\nDate: ${new Date().toLocaleDateString()}\nPractitioner: ${finalSessionData.practitionerName}\n\nData: ${compressedOutput}`,
                                    url: window.location.origin // Optional: Link to app
                                };

                                try {
                                    if (navigator.share) {
                                        await navigator.share(shareData);
                                        toast("Shared successfully", "success");
                                    } else {
                                        // Fallback for browsers that don't support share
                                        await navigator.clipboard.writeText(shareData.text);
                                        toast("Copied to clipboard", "success");
                                    }
                                } catch (err) {
                                    console.error('Error sharing:', err);
                                }
                            }}
                        >
                            <Share className="w-4 h-4 mr-2" />
                            Share Session (Text/Email)
                        </Button>
                    </div>
                )}
            </main>

            {/* Settings Modal */}
            <Modal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                title="Kiosk Settings"
                description="Configure your practitioner details for this device."
                confirmLabel="Save Settings"
                onConfirm={() => {
                    localStorage.setItem('chirocard_kiosk_settings', JSON.stringify(kioskSettings));
                    setShowSettings(false);
                    toast("Settings saved", "success");
                }}
            >
                <div className="space-y-4 py-4">
                    <Input
                        label="Practitioner Name"
                        placeholder="Dr. Jane Doe"
                        value={kioskSettings.practitionerName}
                        onChange={(e) => setKioskSettings(prev => ({ ...prev, practitionerName: e.target.value }))}
                        className="bg-white border-zinc-200 text-zinc-900"
                    />
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-700">Clinic Name / Location</label>
                        <PlacesAutocomplete
                            defaultValue={kioskSettings.clinicName}
                            onChange={(e) => setKioskSettings(prev => ({ ...prev, clinicName: e.target.value }))}
                            onSelect={(place) => {
                                // Use the formatted address or name
                                const name = place.formatted_address || place.name || "";
                                setKioskSettings(prev => ({ ...prev, clinicName: name }));
                            }}
                            placeholder="Search for your clinic..."
                            className="bg-white border-zinc-200 text-zinc-900"
                        />
                    </div>
                    <p className="text-xs text-zinc-500">
                        These details are saved locally on this device and will pre-fill all future sessions.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
