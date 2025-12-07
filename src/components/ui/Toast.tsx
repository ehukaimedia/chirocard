import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = "info") => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:top-auto md:left-auto md:translate-x-0 md:translate-y-0 md:bottom-4 md:right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-[320px] md:w-auto px-4 md:px-0">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            layout
                            className={cn(
                                "pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border backdrop-blur-xl min-w-[320px] max-w-[420px]",
                                // Light Mode Styles
                                "bg-white/90 border-zinc-200/50",
                                // Dark Mode Styles
                                "dark:bg-zinc-900/90 dark:border-zinc-800/50",
                                // Type specific borders/accents
                                t.type === "success" && "border-l-4 border-l-emerald-500",
                                t.type === "error" && "border-l-4 border-l-red-500",
                                t.type === "info" && "border-l-4 border-l-blue-500"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-full shrink-0",
                                t.type === "success" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
                                t.type === "error" && "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
                                t.type === "info" && "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                            )}>
                                {t.type === "success" && <CheckCircle className="w-5 h-5" />}
                                {t.type === "error" && <AlertCircle className="w-5 h-5" />}
                                {t.type === "info" && <Info className="w-5 h-5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-medium truncate",
                                    "text-zinc-900 dark:text-zinc-100"
                                )}>
                                    {t.type === "success" && "Success"}
                                    {t.type === "error" && "Error"}
                                    {t.type === "info" && "Information"}
                                </p>
                                <p className={cn(
                                    "text-sm leading-tight mt-0.5",
                                    "text-zinc-500 dark:text-zinc-400"
                                )}>
                                    {t.message}
                                </p>
                            </div>

                            <button
                                onClick={() => removeToast(t.id)}
                                className={cn(
                                    "p-1.5 rounded-lg transition-colors shrink-0",
                                    "hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600",
                                    "dark:hover:bg-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300"
                                )}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
