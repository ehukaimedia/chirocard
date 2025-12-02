import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Users, User, Calendar, History, Trash2, AlertTriangle } from "lucide-react";
import { DataManagement } from "../components/Profile/DataManagement";
import { useAppStore } from "../store/useAppStore";
import { db } from "../db/db";
import { Modal } from "../components/ui/Modal";

export default function Settings() {
    const navigate = useNavigate();
    const { calendarViewSpan, setCalendarViewSpan, reset } = useAppStore();
    const [isFreshStartModalOpen, setIsFreshStartModalOpen] = useState(false);

    const handleFreshStart = async () => {
        try {
            // 1. Wipe Database
            await db.delete();
            await db.open(); // Re-open to ensure it's clean and ready if needed, though reload will handle it.

            // 2. Reset Store
            reset();

            // 3. Clear Local Storage (Persisted Store)
            localStorage.removeItem('chirocard-storage');

            // 4. Reload
            window.location.reload();
        } catch (error) {
            console.error("Failed to reset app:", error);
            alert("Failed to reset application data. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 p-6 pb-24">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 hidden md:flex items-center px-6 z-50">
                <Button variant="ghost" onClick={() => navigate("/")} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Dashboard
                </Button>
            </nav>

            {/* Header Content */}
            <div className="md:mt-16 mb-8 pt-6 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Settings</h1>
                <p className="text-zinc-500 mt-2">Manage your app preferences and data.</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
                {/* Navigation Grid */}
                <section className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => navigate("/profile")}
                        className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 cursor-pointer hover:border-emerald-500/50 transition-colors flex flex-col items-center text-center gap-3"
                    >
                        <div className="p-3 bg-emerald-50 rounded-full">
                            <User className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-zinc-900">Profile</h2>
                            <p className="text-xs text-zinc-500">Personal details</p>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate("/team")}
                        className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 cursor-pointer hover:border-emerald-500/50 transition-colors flex flex-col items-center text-center gap-3"
                    >
                        <div className="p-3 bg-blue-50 rounded-full">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-zinc-900">Care Team</h2>
                            <p className="text-xs text-zinc-500">Practitioners</p>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate("/calendar")}
                        className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 cursor-pointer hover:border-emerald-500/50 transition-colors flex flex-col items-center text-center gap-3"
                    >
                        <div className="p-3 bg-purple-50 rounded-full">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-zinc-900">Calendar</h2>
                            <p className="text-xs text-zinc-500">Schedule</p>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate("/history")}
                        className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 cursor-pointer hover:border-emerald-500/50 transition-colors flex flex-col items-center text-center gap-3"
                    >
                        <div className="p-3 bg-amber-50 rounded-full">
                            <History className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-zinc-900">History</h2>
                            <p className="text-xs text-zinc-500">Past Sessions</p>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate("/practitioner")}
                        className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 cursor-pointer hover:border-emerald-500/50 transition-colors flex flex-col items-center text-center gap-3 col-span-2"
                    >
                        <div className="p-3 bg-zinc-100 rounded-full">
                            <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-semibold text-zinc-900">Practitioner Mode</h2>
                            <p className="text-xs text-zinc-500">Open Kiosk Interface</p>
                        </div>
                    </div>
                </section>

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

                {/* Danger Zone */}
                <section className="bg-rose-50 p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-rose-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-rose-100 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-rose-900">Danger Zone</h2>
                            <p className="text-sm text-rose-700">Irreversible actions</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-rose-800 leading-relaxed">
                            Need a clean slate? You can erase all data and settings to start fresh. This action cannot be undone.
                        </p>
                        <Button
                            variant="danger"
                            className="w-full justify-start h-12"
                            onClick={() => setIsFreshStartModalOpen(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Erase All Data
                        </Button>
                    </div>
                </section>
            </div>

            <Modal
                isOpen={isFreshStartModalOpen}
                onClose={() => setIsFreshStartModalOpen(false)}
                title="Reset Application?"
                description="Are you sure you want to erase all data and reset the application? This includes your profile, all sessions, practitioners, and settings. This action is permanent and cannot be undone."
                confirmLabel="Yes, Erase Everything"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={handleFreshStart}
            />
        </div>
    );
}
