import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { DataManagement } from "../components/Profile/DataManagement";
import { useAppStore } from "../store/useAppStore";

export default function Settings() {
    const navigate = useNavigate();
    const { theme, toggleTheme, calendarViewSpan, setCalendarViewSpan } = useAppStore();

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 z-50">
                <Button variant="ghost" onClick={() => navigate("/")} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Dashboard
                </Button>
            </nav>

            {/* Header Content */}
            <div className="mt-16 mb-6 pt-6 flex items-center gap-4">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                {/* Appearance */}
                <section className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Appearance</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                {theme === 'dark' ? <Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" /> : <Sun className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />}
                            </div>
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">Dark Mode</p>
                                <p className="text-xs text-zinc-500">Adjust the screen brightness</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>
                </section>

                {/* Calendar Settings */}
                <section className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Calendar</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                                Calendar Look Ahead
                            </label>
                            <p className="text-xs text-zinc-500 mb-3">
                                How many days of upcoming items to show in the list.
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                                {[7, 14, 30, 60].map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => setCalendarViewSpan(days)}
                                        className={`
                                            py-2 px-3 rounded-lg text-sm font-medium border transition-all
                                            ${calendarViewSpan === days
                                                ? 'bg-emerald-500 text-white border-emerald-500'
                                                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50'}
                                        `}
                                    >
                                        {days} Days
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                <DataManagement />
            </div>
        </div>
    );
}
