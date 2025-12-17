import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, History, User, Settings as SettingsIcon } from "lucide-react";

export function BottomNav() {
    const location = useLocation();
    const pathname = location.pathname;

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200/50 dark:border-zinc-800/50 pb-safe z-50 transition-all duration-300">
            <div className="flex justify-around items-center h-16 px-2">
                <Link
                    to="/"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors active:scale-95 ${isActive("/") ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                >
                    <Home className={`w-6 h-6 ${isActive("/") ? "fill-current" : ""}`} strokeWidth={isActive("/") ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                <Link
                    to="/calendar"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors active:scale-95 ${isActive("/calendar") ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                >
                    <Calendar className={`w-6 h-6 ${isActive("/calendar") ? "fill-current" : ""}`} strokeWidth={isActive("/calendar") ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Calendar</span>
                </Link>

                <Link
                    to="/journal"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors active:scale-95 ${isActive("/journal") ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                >
                    <History className={`w-6 h-6 ${isActive("/journal") ? "fill-current" : ""}`} strokeWidth={isActive("/journal") ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Journal</span>
                </Link>

                <Link
                    to="/profile"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors active:scale-95 ${isActive("/profile") ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                >
                    <User className={`w-6 h-6 ${isActive("/profile") ? "fill-current" : ""}`} strokeWidth={isActive("/profile") ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>

                <Link
                    to="/settings"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors active:scale-95 ${isActive("/settings") ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                >
                    <SettingsIcon className={`w-6 h-6 ${isActive("/settings") ? "fill-current" : ""}`} strokeWidth={isActive("/settings") ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Settings</span>
                </Link>
            </div>
        </div>
    );
}
