import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if device is iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Initial check for standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

        // If already installed/standalone, don't show anything
        if (isStandalone) return;

        // For Android/Desktop Chrome
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, we might want to show it after a delay or based on some engagement
        // For now, let's only show if it's NOT standalone, which we checked above.
        if (isIOSDevice && !isStandalone) {
            // Small delay to not be annoying immediately
            const timer = setTimeout(() => setShowBanner(true), 3000);
            return () => clearTimeout(timer);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowBanner(false);
                setDeferredPrompt(null);
            }
        }
    };

    const handleDismiss = () => {
        setShowBanner(false);
    };

    if (!showBanner && !showIOSInstructions) return null;

    // iOS Instructions Modal
    if (showIOSInstructions) {
        return (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowIOSInstructions(false)}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in slide-in-from-bottom-10 fade-in duration-300" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Install ChiroCard</h3>
                        <button onClick={() => setShowIOSInstructions(false)} className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4 text-zinc-600 dark:text-zinc-300">
                        <p>Install this app on your iPhone for the best experience:</p>
                        <ol className="space-y-3 list-decimal list-inside">
                            <li className="flex items-center gap-2">
                                Tap the <Share size={18} className="text-blue-500" /> <strong>Share</strong> button below.
                            </li>
                            <li className="flex items-center gap-2">
                                Scroll down and tap <span className="flex items-center gap-1 font-semibold"><span className="border border-zinc-400 rounded-[4px] w-5 h-5 flex items-center justify-center text-[10px]">+</span> Add to Home Screen</span>.
                            </li>
                        </ol>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <div className="animate-bounce">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
                                <path d="M12 5v14M19 12l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Floating Banner
    return (
        <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-8 md:bottom-8 md:w-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-emerald-600/90 dark:bg-emerald-500/90 backdrop-blur-md text-white p-3 rounded-xl shadow-lg flex items-center justify-between gap-4 md:min-w-[320px]">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Download size={20} />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Install App</p>
                        <p className="text-xs text-white/80">Add to home screen for quick access</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleInstallClick}
                        className="bg-white text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-transform"
                    >
                        Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
