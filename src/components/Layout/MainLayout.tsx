import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function MainLayout() {
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col relative">
            <div className="flex-1 pb-20 md:pb-0">
                <Outlet />
                <footer className="py-6 text-center text-[10px] text-zinc-400 dark:text-zinc-600 opacity-60 hover:opacity-100 transition-opacity">
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
        </div>
    );
}
