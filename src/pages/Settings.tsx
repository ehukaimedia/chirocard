import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Users, User, Calendar, History, AlertTriangle, Trash2 } from "lucide-react";
import { DataManagement } from "../components/Profile/DataManagement";
import { useAppStore } from "../store/useAppStore";
import { db } from "../db/db";
import { Modal } from "../components/ui/Modal";
import { WelcomeModal } from "../components/Onboarding/WelcomeModal";
import { TagInput } from "../components/ui/TagInput";
import { useToast } from "../components/ui/Toast";
import { useLiveQuery } from "dexie-react-hooks";

export default function Settings() {
    const navigate = useNavigate();
    const user = useLiveQuery(() => db.users.get("me"));
    const {
        calendarViewSpan,
        setCalendarViewSpan,
        reset,
        defaultRoutineTime,
        setDefaultRoutineTime,
        routineTimeInterval,
        setRoutineTimeInterval,
        routineBadges,
        setRoutineBadges
    } = useAppStore();
    const [isFreshStartModalOpen, setIsFreshStartModalOpen] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const { toast } = useToast();

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
            toast("Failed to reset application data. Please try again.", "error");
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
                        onClick={() => navigate("/journal")}
                        className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 cursor-pointer hover:border-emerald-500/50 transition-colors flex flex-col items-center text-center gap-3"
                    >
                        <div className="p-3 bg-amber-50 rounded-full">
                            <History className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-zinc-900">Bodywork Journal</h2>
                            <p className="text-xs text-zinc-500">Past Sessions</p>
                        </div>
                    </div>



                    <div
                        onClick={() => setShowWelcomeModal(true)}
                        className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100 cursor-pointer hover:border-emerald-500/50 transition-colors flex flex-col items-center text-center gap-3"
                    >
                        <div className="p-3 bg-teal-50 rounded-full">
                            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-semibold text-zinc-900">Help & Guide</h2>
                            <p className="text-xs text-zinc-500">How it works</p>
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

                    <div className="space-y-6">
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

                {/* Bodywork Routine Settings */}
                <section className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-emerald-50 rounded-xl">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900">Bodywork Routine Preferences</h2>
                            <p className="text-sm text-zinc-500">Customize your daily habits</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-900 mb-2">
                                Default Routine Time
                            </label>
                            <p className="text-xs text-zinc-500 mb-4">
                                Set the default time for new wellness routine items.
                            </p>
                            <input
                                type="time"
                                value={defaultRoutineTime}
                                onChange={(e) => setDefaultRoutineTime(e.target.value)}
                                className="w-full max-w-xs h-12 px-4 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-900 mb-2">
                                Time Picker Interval
                            </label>
                            <p className="text-xs text-zinc-500 mb-4">
                                Choose the minute interval for selecting times.
                            </p>
                            <div className="grid grid-cols-2 gap-3 max-w-xs">
                                {[1, 15].map((interval) => (
                                    <button
                                        key={interval}
                                        onClick={() => setRoutineTimeInterval(interval)}
                                        className={`
                                            py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-200
                                            ${routineTimeInterval === interval
                                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}
                                        `}
                                    >
                                        {interval} Minute{interval > 1 ? 's' : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>



                {/* Routine Badges Customization */}
                <section className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-sky-50 rounded-xl">
                            <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900">Routine Badges</h2>
                            <p className="text-sm text-zinc-500">Customize available activities for each category</p>
                        </div>
                    </div>

                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mb-6">
                        <div className="flex gap-3">
                            <div className="mt-0.5">
                                <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-sm text-sky-900">
                                <p className="font-medium mb-1">How to customize:</p>
                                <ul className="list-disc list-inside space-y-1 text-sky-800">
                                    <li>Type a new activity name and press <span className="font-bold">Enter</span> to add it.</li>
                                    <li>Click the <span className="font-bold">×</span> icon on any badge to remove it.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {routineBadges && Object.entries(routineBadges).map(([category, badges]) => (
                            <TagInput
                                key={category}
                                label={category.charAt(0).toUpperCase() + category.slice(1)}
                                value={badges}
                                onChange={(newBadges) => setRoutineBadges({
                                    ...routineBadges,
                                    [category]: newBadges
                                })}
                                placeholder={`Add ${category} activity...`}
                            />
                        ))}
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

            <WelcomeModal
                isOpen={showWelcomeModal}
                onClose={() => setShowWelcomeModal(false)}
            />
        </div >
    );
}
