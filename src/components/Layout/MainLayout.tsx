import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function MainLayout() {
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col">
            <div className="flex-1 pb-20 md:pb-0">
                <Outlet />
            </div>
            <footer className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-600 pb-24 md:pb-4">
                <p>
                    App Design by{" "}
                    <a
                        href="https://ehukaimedia.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
                    >
                        Ehukai Media
                    </a>
                </p>
            </footer>
            <BottomNav />
        </div>
    );
}
