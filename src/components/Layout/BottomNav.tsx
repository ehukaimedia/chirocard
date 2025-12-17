import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, History, User, Settings as SettingsIcon } from "lucide-react";

export function BottomNav() {
    const location = useLocation();
    const pathname = location.pathname;

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200/50 dark:border-zinc-800/50 pb-safe z-50 transition-all duration-300">
            <div className="flex justify-around items-center h-16 px-1">
                {[
                    { path: "/", label: "Home", Icon: Home },
                    { path: "/calendar", label: "Calendar", Icon: Calendar },
                    { path: "/journal", label: "Journal", Icon: History },
                    { path: "/profile", label: "Profile", Icon: User },
                    { path: "/settings", label: "Settings", Icon: SettingsIcon },
                ].map(({ path, label, Icon }) => {
                    const active = isActive(path);
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`group flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95`}
                        >
                            <div className={`p-2 rounded-xl transition-all duration-300 ${active
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 translate-y-[-4px]"
                                : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200"
                                }`}>
                                <Icon
                                    className={`w-6 h-6 transition-transform duration-300 ${active ? "scale-110" : "scale-100"}`}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                            </div>
                            <span className={`text-[10px] font-bold transition-all duration-300 ${active
                                ? "text-emerald-600 dark:text-emerald-400 opacity-100 translate-y-[-2px]"
                                : "text-zinc-400 opacity-70"
                                }`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
