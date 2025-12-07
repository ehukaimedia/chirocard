import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { InstallBanner } from "../PWA/InstallBanner";

export function MainLayout() {
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col relative">
            <div className="flex-1 pb-20">
                <Outlet />
                <footer className="py-6 text-center text-[10px] text-zinc-400 dark:text-zinc-600 opacity-60 hover:opacity-100 transition-opacity space-y-2">
                    <div className="flex justify-center gap-2">
                        <a href="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Privacy Policy</a>
                        <span>•</span>
                        <a href="/terms" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Terms of Service</a>
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
            <InstallBanner />
            <BottomNav />
        </div>
    );
}
