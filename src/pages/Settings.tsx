import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { DataManagement } from "../components/Profile/DataManagement";
import { useAppStore } from "../store/useAppStore";

export default function Settings() {
    const navigate = useNavigate();
    const { calendarViewSpan, setCalendarViewSpan } = useAppStore();

    return (
        <div className="min-h-screen bg-zinc-50 p-6 pb-24">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center px-6 z-50">
                <Button variant="ghost" onClick={() => navigate("/")} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Dashboard
                </Button>
            </nav>

            {/* Header Content */}
            <div className="mt-16 mb-8 pt-6 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Settings</h1>
                <p className="text-zinc-500 mt-2">Manage your app preferences and data.</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
                {/* Calendar Settings */}
                <section className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-indigo-50 rounded-xl">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900">Calendar Preferences</h2>
                            <p className="text-sm text-zinc-500">Customize how your schedule is displayed</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-900 mb-2">
                                Upcoming View Range
                            </label>
                            <p className="text-xs text-zinc-500 mb-4">
                                Select how many days of future events to display in your upcoming list.
                            </p>
                            <div className="grid grid-cols-4 gap-3">
                                {[7, 14, 30, 60].map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => setCalendarViewSpan(days)}
                                        className={`
                                            py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-200
                                            ${calendarViewSpan === days
                                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}
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
