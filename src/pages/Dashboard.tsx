import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type BodyworkRoutine, type Session } from "../db/db";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Plus, Calendar as CalendarIcon, User, Info, ShieldCheck, Users, Settings, History, CheckCircle, ChevronRight } from "lucide-react";
import { SessionCard } from "../components/Dashboard/SessionCard";
import { WelcomeModal } from "../components/Onboarding/WelcomeModal";
import { SessionScannerModal } from "../components/Dashboard/SessionScannerModal";
import { ScanLine, Timer } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { PatientQRModal } from "../components/Profile/PatientQRModal";
import { Trash2 } from "lucide-react";


export default function Dashboard() {
    const navigate = useNavigate();
    const user = useLiveQuery(() => db.users.get("me"));
    const sessions = useLiveQuery(() => db.sessions.orderBy("date").reverse().limit(5).toArray());

    // Get active routines for today
    const activeRoutines = useLiveQuery(
        async () => {
            const dayOfWeek = new Date().getDay();

            // Get all routines
            const allRoutines = await db.routines.toArray();

            // Filter for active routines for today
            return allRoutines.filter(r => {
                // Check if active for today (based on daysOfWeek)
                const days = r.daysOfWeek || [];
                const isDayMatch = days.length === 0 || days.includes(dayOfWeek);
                return isDayMatch;
            });
        },
        []
    ) || [];

    const appointments = useLiveQuery(() => db.appointments.orderBy("date").limit(1).toArray());
    const { currentSession, endSession, viewMode } = useAppStore();
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const nextAppointment = appointments?.[0];

    const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setDeleteSessionId(id);
    };

    const confirmDelete = async () => {
        if (deleteSessionId) {
            await db.sessions.delete(deleteSessionId);
            setDeleteSessionId(null);
        }
    };

    const activeFocus = user?.primaryComplaints && user.primaryComplaints.length > 0
        ? user.primaryComplaints.join(", ")
        : "Maintenance & Prevention";

    const statusLabel = user?.primaryComplaints && user.primaryComplaints.length > 0
        ? "Active Focus"
        : "Current Status";

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 space-y-8 pb-24">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3 md:gap-4">
                    <img src="/chirocard-icon.png" alt="ChiroCard" className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl shadow-lg shadow-emerald-500/20" />
                    <div>
                        <h1 className="text-2xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter mb-0 leading-none">
                            <span className="text-emerald-600 dark:text-emerald-500">Chiro</span>Card<span className="text-emerald-600 dark:text-emerald-500">.</span>
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-bold tracking-wide uppercase text-[9px] md:text-xs leading-tight hidden md:block">Your Digital Body Work Passport</p>
                    </div>
                </div>
                <div className="hidden md:flex gap-3">
                    <Link to="/team">
                        <Button variant="outline" size="icon" className="border-zinc-800 text-zinc-400 hover:text-zinc-100" title="My Team">
                            <Users className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link to="/calendar">
                        <Button variant="outline" size="icon" className="border-zinc-800 text-zinc-400 hover:text-zinc-100" title="Calendar">
                            <CalendarIcon className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link to="/journal">
                        <Button variant="outline" size="icon" className="border-zinc-800 text-zinc-400 hover:text-zinc-100" title="Bodywork Journal">
                            <History className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link to="/profile">
                        <Button variant="outline" size="icon" className="border-zinc-800 text-zinc-400 hover:text-zinc-100" title="Profile">
                            <User className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link to="/settings">
                        <Button variant="outline" size="icon" className="border-zinc-800 text-zinc-400 hover:text-zinc-100" title="Settings">
                            <Settings className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Intuitive Insights - Simplified & Clean */}
            <section className="mb-8">
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        <div className="space-y-2 max-w-2xl">
                            <div className="flex items-center gap-2 text-emerald-500 font-medium text-sm uppercase tracking-wider">
                                <Info className="w-4 h-4" />
                                <span>Did you know?</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-zinc-100">
                                "Chiro" means <span className="text-emerald-400">Hand</span>.
                            </h2>
                            <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
                                ChiroCard is your digital passport for holistic hands-on therapies—chiropractic, massage, physical therapy, cupping, and acupuncture, giving you full control of your holistic body-work data.
                            </p>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            {['Chiropractic', 'Massage', 'PT', 'Cupping', 'Acupuncture'].map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Holistic Health Passport (Quick View) */}
            <section>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Current Status</h2>
                    <Link to="/profile">
                        <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10">
                            View Full Passport
                        </Button>
                    </Link>
                </div>

                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 relative overflow-hidden shadow-sm">
                    {/* Status Indicator */}
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <span className="text-emerald-600 dark:text-emerald-500 text-xs font-bold tracking-wider uppercase mb-1 block">{statusLabel}</span>
                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight" title={activeFocus}>{activeFocus}</h3>
                        </div>
                        <div className="h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div
                            onClick={() => {
                                if (nextAppointment && new Date(nextAppointment.date).toDateString() === new Date().toDateString()) {
                                    navigate("/intake", { state: { appointmentId: nextAppointment.id } });
                                } else {
                                    navigate("/calendar");
                                }
                            }}
                            className={`
                                bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800/50 cursor-pointer transition-colors
                                ${nextAppointment && new Date(nextAppointment.date).toDateString() === new Date().toDateString()
                                    ? 'border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10'
                                    : 'hover:border-emerald-500/50'}
                            `}
                        >
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-1">
                                {nextAppointment && new Date(nextAppointment.date).toDateString() === new Date().toDateString() ? "Today's Session" : "Next Session"}
                            </p>
                            <p className="text-zinc-900 dark:text-zinc-200 font-semibold truncate">
                                {nextAppointment ? new Date(nextAppointment.date).toLocaleDateString() : "None scheduled"}
                            </p>
                        </div>
                        <div
                            onClick={() => navigate("/calendar")}
                            className="bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800/50 cursor-pointer hover:border-emerald-500/50 transition-colors"
                        >
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-1">Bodywork Routine</p>
                            <p className="text-zinc-900 dark:text-zinc-200 font-semibold">
                                {activeRoutines.filter(r => !r.isCompletedToday).length > 0 ? `${activeRoutines.filter(r => !r.isCompletedToday).length} remaining` : "All done!"}
                            </p>
                        </div>
                    </div>
                </Card>
            </section>
            {/* Quick Actions Grid */}
            <div className={`grid ${currentSession ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} gap-4`}>
                {currentSession ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 relative">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full animate-pulse">
                                <Timer className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Session in Progress</h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Started {currentSession.startTime ? new Date(currentSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 absolute top-4 right-4"
                            onClick={() => setShowClearConfirm(true)}
                            title="Discard Session"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            {viewMode === 'session' ? (
                                <Button
                                    className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                                    onClick={() => navigate("/session-active")}
                                >
                                    <ScanLine className="w-4 h-4 mr-2" />
                                    Return to Session
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="flex-1 md:flex-none border-emerald-200 hover:bg-emerald-100 dark:border-emerald-800 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                                    onClick={() => navigate("/intake")}
                                >
                                    Resume Check-In
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 1. Start Session / Check In (Primary) */}
                        {nextAppointment && new Date(nextAppointment.date).toDateString() === new Date().toDateString() ? (
                            <Button
                                variant="outline"
                                className="h-auto py-6 flex flex-col gap-3 border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group relative overflow-hidden"
                                onClick={() => navigate("/intake", { state: { appointmentId: nextAppointment.id } })}
                            >
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full group-hover:scale-110 transition-transform">
                                    <CalendarIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-zinc-900 dark:text-zinc-100">Check In</span>
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                        {new Date(nextAppointment.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} Appointment
                                    </span>
                                </div>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="h-auto py-6 flex flex-col gap-3 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group"
                                onClick={() => navigate("/intake")}
                            >
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full group-hover:scale-110 transition-transform">
                                    <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">Start Session</span>
                            </Button>
                        )}

                        {/* 2. Profile (Always Visible) */}
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-3 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                            onClick={() => navigate("/profile")}
                        >
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:scale-110 transition-transform">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Profile</span>
                        </Button>

                        {/* 3. Bodywork Routine (Conditional) */}
                        {activeRoutines.length > 0 && (
                            <div
                                onClick={() => navigate("/calendar")}
                                className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block font-medium text-zinc-700 dark:text-zinc-300">Bodywork Routine</span>
                                        <span className="text-xs text-zinc-500">
                                            {activeRoutines.filter((r: BodyworkRoutine) => r.isCompletedToday).length}/{activeRoutines.length} completed
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-400" />
                            </div>
                        )}
                    </>
                )}
            </div>

            <SessionScannerModal
                isOpen={showScannerModal}
                onClose={() => setShowScannerModal(false)}
                onScanSuccess={() => {
                    // Refresh data? Dexie useLiveQuery handles it automatically!
                }}
            />

            <PatientQRModal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                user={user}
            />

            <WelcomeModal />

            {/* Recent Activity */}
            <section>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {sessions?.map((session: Session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                    {sessions?.length === 0 && (
                        <p className="text-center text-zinc-500 py-8">No sessions yet. Start one above!</p>
                    )}
                </div>
            </section>
            {/* Compliance Footer */}
            <footer className="pt-8 pb-4 border-t border-zinc-800/50">
                <div className="flex items-center justify-center gap-2 text-zinc-500 mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Global Privacy Standards</span>
                </div>
                <p className="text-center text-[10px] text-zinc-600 max-w-xs mx-auto leading-relaxed">
                    Local-First Architecture designed for <strong>HIPAA, GDPR, & CCPA</strong> compliance.
                    <br />
                    We do not collect any user data. Your data is safely kept on your device or the cloud provider of your choosing.
                </p>
            </footer>

            <Modal
                isOpen={!!deleteSessionId}
                onClose={() => setDeleteSessionId(null)}
                title="Delete Session"
                description="Are you sure you want to delete this session record? This cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={confirmDelete}
                variant="danger"
            />
            <Modal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                title="Discard Session?"
                description="This will clear your current progress. This action cannot be undone."
                confirmLabel="Discard"
                cancelLabel="Cancel"
                onConfirm={() => {
                    endSession();
                    setShowClearConfirm(false);
                }}
                variant="danger"
            />
        </div>
    );
}
