import React from "react";
import { QrCode, LogOut } from "lucide-react";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

interface KioskLayoutProps {
    children: React.ReactNode;
}

export function KioskLayout({ children }: KioskLayoutProps) {
    const navigate = useNavigate();
    const { reset } = useAppStore();

    const handleExit = () => {
        if (confirm("Are you sure you want to exit Kiosk mode? Current session data will be lost.")) {
            reset(); // Clear session state
            navigate("/dashboard");
        }
    };

    return (
        <div className="dark">
            <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30 flex flex-col">
                {/* Kiosk Header */}
                <header className="px-6 py-4 flex justify-between items-center border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <QrCode className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight text-white">
                                ChiroCard <span className="text-emerald-500 font-mono text-xs uppercase tracking-widest ml-1">Kiosk</span>
                            </h1>
                            <p className="text-xs text-zinc-500">Guest Practitioner Mode</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExit}
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Exit Kiosk
                    </Button>
                </header>

                {/* Main Content */}
                <main className="flex-1 relative">
                    {children}
                </main>

                {/* Kiosk Footer */}
                <footer className="py-4 text-center text-[10px] text-zinc-600 border-t border-zinc-900 bg-zinc-950">
                    <p>ChiroCard Kiosk Mode • Secure Session Environment</p>
                </footer>
            </div>
        </div>
    );
}
