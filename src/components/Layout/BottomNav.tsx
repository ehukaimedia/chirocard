import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, History, User, Settings as SettingsIcon } from "lucide-react";

export function BottomNav() {
    const location = useLocation();
    const pathname = location.pathname;

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                <Link
                    to="/"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive("/") ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500 dark:text-zinc-400"
                        }`}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                <Link
                    to="/calendar"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive("/calendar") ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500 dark:text-zinc-400"
                        }`}
                >
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Calendar</span>
                </Link>

                <Link
                    to="/journal"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive("/journal") ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500 dark:text-zinc-400"
                        }`}
                >
                    <History className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Journal</span>
                </Link>

                <Link
                    to="/profile"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive("/profile") ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500 dark:text-zinc-400"
                        }`}
                >
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>

                <Link
                    to="/settings"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive("/settings") ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500 dark:text-zinc-400"
                        }`}
                >
                    <SettingsIcon className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Settings</span>
                </Link>
            </div>
        </div>
    );
}
