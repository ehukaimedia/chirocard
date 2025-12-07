import { usePWAInstall } from "../../hooks/usePWAInstall";
import { Download, Smartphone, Share, Plus, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";

export function AppInstallSection() {
    const { isInstalled, canInstall, isIOS, installPWA } = usePWAInstall();

    if (isInstalled) return null;

    return (
        <section className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900">App Installation</h2>
                    <p className="text-sm text-zinc-500">Install for the best experience</p>
                </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                        <h3 className="font-semibold text-zinc-900 mb-2">Install ChiroCard</h3>
                        <p className="text-sm text-zinc-600 mb-4">
                            Add to your home screen for quick access, offline support, and a better fullscreen experience.
                        </p>

                        {isIOS ? (
                            <div className="space-y-3 text-sm text-zinc-600 bg-white/50 p-4 rounded-lg border border-emerald-100">
                                <p className="font-medium text-emerald-800">To install on iOS:</p>
                                <ol className="space-y-2 list-decimal list-inside">
                                    <li className="flex items-center gap-2">
                                        Tap <Share className="w-4 h-4 text-blue-500" /> <span className="font-medium">Share</span> in your browser menu
                                    </li>
                                    <li className="flex items-center gap-2">
                                        Scroll down and tap <span className="inline-flex items-center gap-1 font-medium bg-zinc-100 px-1.5 py-0.5 rounded text-xs border border-zinc-200"><Plus className="w-3 h-3" /> Add to Home Screen</span>
                                    </li>
                                </ol>
                            </div>
                        ) : (
                            canInstall ? (
                                <Button onClick={installPWA} variant="primary" className="w-full md:w-auto">
                                    <Download className="w-4 h-4 mr-2" />
                                    Install App
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2 text-zinc-500 text-sm italic">
                                    <CheckCircle className="w-4 h-4" />
                                    App is ready or installed
                                </div>
                            )
                        )}
                    </div>
                    <div className="hidden md:flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-emerald-100 transform rotate-2">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-emerald-800">ChiroCard</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
