import { Outlet, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav } from "./BottomNav";
import { ConsentBanner } from "../Consent/ConsentBanner";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useDataStore } from "../../store/useDataStore";

export function MainLayout() {
    const location = useLocation();
    const reduceMotion = usePrefersReducedMotion();
    const dataError = useDataStore((s) => s.error);
    const initialized = useDataStore((s) => s.initialized);

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col relative">
            {dataError && !initialized && (
                <div role="alert" className="px-4 py-3 bg-red-50 text-red-800 text-sm text-center border-b border-red-100">
                    Could not load your local health record.{' '}
                    <button
                        type="button"
                        className="font-medium underline"
                        onClick={() => useDataStore.getState().initialize()}
                    >
                        Try again
                    </button>
                </div>
            )}
            <div className="flex-1 pb-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                        transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
                <footer className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
                    <div className="flex justify-center gap-2">
                        <Link to="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Privacy Policy</Link>
                        <span>•</span>
                        <Link to="/terms" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Terms of Service</Link>
                    </div>
                    <p>
                        App design by{' '}
                        <a
                            href="https://ehukaimedia.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold hover:text-emerald-500 transition-colors"
                        >
                            Ehukai Media
                        </a>
                    </p>
                </footer>
            </div>
            <BottomNav />
            <ConsentBanner />
        </div>
    );
}
