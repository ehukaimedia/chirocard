import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, History, User, Settings as SettingsIcon } from "lucide-react";

const NAV_ITEMS = [
    { path: "/", label: "Home", icon: Home },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/journal", label: "Journal", icon: History },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export function BottomNav() {
    const location = useLocation();
    const pathname = location.pathname;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200/60 dark:border-zinc-800/60 pb-safe z-50">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                    const active = pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            aria-current={active ? "page" : undefined}
                            className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                                active
                                    ? "text-emerald-600 dark:text-emerald-500"
                                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                            }`}
                        >
                            {active && (
                                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-full" />
                            )}
                            <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                            <span className="text-[10px] font-semibold">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
