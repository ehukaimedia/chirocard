import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, History, User, Settings as SettingsIcon } from "lucide-react";

export function BottomNav() {
    const location = useLocation();
    const pathname = location.pathname;

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-glass-card/90 backdrop-blur-xl border-t border-glass-border pb-safe z-50">
            <div className="flex justify-around items-center h-16 px-2">
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
                            <div className={`p-2 rounded-2xl transition-all duration-300 ${active
                                ? "bg-primary text-white shadow-glass-sm translate-y-[-4px]"
                                : "text-glass-text-secondary hover:bg-glass-100"
                                }`}>
                                <Icon
                                    className={`w-6 h-6 transition-transform duration-300 ${active ? "scale-105" : "scale-100"}`}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                            </div>
                            {/* Label - visible but small, or could be hidden for cleaner look. keeping for usability */}
                            <span className={`text-[10px] font-bold transition-all duration-300 ${active
                                ? "text-primary opacity-100 translate-y-[-2px]"
                                : "text-glass-text-secondary opacity-60"
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
