import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Session } from "../db/db";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { StatusUpdateModal } from "../components/Dashboard/StatusUpdateModal";
import { Plus, Calendar as CalendarIcon, User, Info, ShieldCheck, CheckCircle, ChevronRight, Pencil, Bell } from "lucide-react";
import { SessionCard } from "../components/Dashboard/SessionCard";
import { WelcomeModal } from "../components/Onboarding/WelcomeModal";
import { RoutineVerificationModal } from "../components/Dashboard/RoutineVerificationModal";
import { NotificationCenter } from "../components/Dashboard/NotificationCenter";
import { HelpModal } from "../components/Help/HelpModal";

import { ScanLine, Timer } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Trash2 } from "lucide-react";
import { trackEvent } from "../utils/analytics";


export default function Dashboard() {
    const navigate = useNavigate();
    const user = useLiveQuery(() => db.users.get("me"));
    const sessions = useLiveQuery(() => db.sessions.orderBy("date").reverse().limit(5).toArray());

    // Get active routines for today
    const allRoutines = useLiveQuery(() => db.routines.toArray()) || [];

    const activeRoutines = allRoutines.filter(r => {
        const dayOfWeek = new Date().getDay();
        const days = r.daysOfWeek || [];
        return days.length === 0 || days.includes(dayOfWeek);
    });

    const appointments = useLiveQuery(() => db.appointments.where("date").aboveOrEqual(Date.now()).limit(1).toArray());
    const { currentSession, endSession, viewMode } = useAppStore();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const pendingRoutines = activeRoutines.filter(r => !r.isCompletedToday);
    const hasPendingRoutines = pendingRoutines.length > 0;

    const nextAppointment = appointments?.[0];

    const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);


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



    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg pb-32">
            {/* Mobile Header - Sticky */}
            <header className="sticky top-0 z-40 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src="/chirocard-icon.png" alt="ChiroCard" className="w-10 h-10 rounded-xl shadow-lg shadow-emerald-500/20" />
                    <div>
                        <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter leading-none">
                            <span className="text-emerald-600 dark:text-emerald-500">Chiro</span>Card
                        </h1>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold tracking-widest uppercase">BODYWORK JOURNAL</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <NotificationCenter />
                    <Link to="/profile">
                        <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                            <User className="w-5 h-5 text-zinc-400" />
                        </div>
                    </Link>
                </div>
            </header>

            <main className="px-6 pt-6 space-y-8">
                {/* 1. Primary Hero Action */}
                <section>
                    {currentSession ? (
                        <div className="bg-emerald-600 dark:bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-20">
                                <Timer className="w-24 h-24 rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">
                                        <ScanLine className="w-3 h-3 animate-pulse" />
                                        <span>Active Session</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowClearConfirm(true); }}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-white/80" />
                                    </button>
                                </div>

                                <h2 className="text-2xl font-bold mb-1">Session in Progress</h2>
                                <p className="text-emerald-100 mb-6 text-sm font-medium">
                                    Started {currentSession.startTime ? new Date(currentSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                                </p>

                                <Button
                                    className="w-full bg-white text-emerald-700 hover:bg-emerald-50 border-none font-bold h-12 rounded-xl"
                                    onClick={() => navigate(viewMode === 'session' ? "/session-active" : "/intake")}
                                >
                                    {viewMode === 'session' ? 'Continue Session' : 'Resume Check-In'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        nextAppointment && new Date(nextAppointment.date).toDateString() === new Date().toDateString() ? (
                            <div
                                onClick={() => {
                                    trackEvent('begin_session', { type: 'appointment', id: nextAppointment.id });
                                    navigate("/intake", { state: { appointmentId: nextAppointment.id } });
                                }}
                                className="group bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 rounded-3xl p-1 pb-1 shadow-lg cursor-pointer transform transition-all active:scale-[0.98]"
                            >
                                <div className="bg-zinc-900 dark:bg-zinc-950 rounded-[22px] p-6 h-full border border-zinc-800 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>

                                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-500">
                                            <CalendarIcon className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">Check In Now</h2>
                                            <p className="text-zinc-400 text-sm">
                                                For your {new Date(nextAppointment.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} Appointment
                                            </p>
                                        </div>
                                        <div className="w-full flex items-center justify-center gap-2 text-emerald-500 font-bold text-sm uppercase tracking-wider pt-2">
                                            <span>Tap to Start</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => {
                                    trackEvent('begin_session', { type: 'new' });
                                    navigate("/intake");
                                }}
                                className="group bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 shadow-xl shadow-emerald-500/20 cursor-pointer text-center relative overflow-hidden transform transition-all active:scale-[0.98]"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Plus className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                                </div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-active:scale-95 transition-transform">
                                        <Plus className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-1">New Session</h2>
                                    <p className="text-emerald-100 text-sm font-medium mb-0">Record a new bodywork visit</p>
                                </div>
                            </div>
                        )
                    )}
                </section>

                {/* 2. Status & Routine Mini-Cards */}
                <section className="grid grid-cols-2 gap-4">
                    {/* Status Card */}
                    <Card
                        onClick={() => setShowStatusModal(true)}
                        className="p-4 flex flex-col justify-between h-32 cursor-pointer border-none bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Info className="w-5 h-5 text-blue-500" />
                            </div>
                            <button className="text-zinc-300">
                                <Pencil className="w-3 h-3" />
                            </button>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Current Focus</p>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight line-clamp-2">
                                {activeFocus}
                            </p>
                        </div>
                    </Card>

                    {/* Routine Card */}
                    <Card
                        onClick={() => navigate("/calendar")}
                        className={`p-4 flex flex-col justify-between h-32 cursor-pointer border-none transition-colors ${hasPendingRoutines
                            ? 'bg-orange-500/5 hover:bg-orange-500/10'
                            : 'bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-lg ${hasPendingRoutines ? 'bg-orange-500/10' : 'bg-emerald-500/10'}`}>
                                {hasPendingRoutines ? (
                                    <Bell className={`w-5 h-5 ${hasPendingRoutines ? 'text-orange-500' : 'text-emerald-500'}`} />
                                ) : (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Daily Routine</p>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">
                                {allRoutines.length === 0 ? "No routines set" :
                                    (hasPendingRoutines ? `${pendingRoutines.length} tasks todo` : "All complete!")}
                            </p>
                        </div>
                    </Card>
                </section>

                {/* 3. Recent Activity */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Recent Sessions</h3>
                        <Link to="/journal" className="text-xs font-medium text-emerald-600 dark:text-emerald-500">View All</Link>
                    </div>

                    <div className="space-y-3">
                        {sessions?.map((session: Session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                        {(!sessions || sessions.length === 0) && (
                            <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                <p className="text-zinc-400 text-sm">No recent sessions found.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 4. Did You Know? (Moved to bottom) */}
                <section
                    onClick={() => {
                        trackEvent('view_promotion', { creative_name: 'did_you_know' });
                        setShowHelpModal(true);
                    }}
                    className="bg-zinc-900 rounded-2xl p-6 relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                                <Info className="w-4 h-4" />
                                <span>Did you know?</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-medium bg-zinc-800/50 px-2 py-0.5 rounded-full border border-zinc-700/50">Tap to learn more</span>
                        </div>

                        <p className="text-zinc-100 font-medium text-sm leading-relaxed mb-4">
                            "Chiro" means <span className="text-emerald-400">"hand"</span>. ChiroCard is your personalized journal for holistic body care that keeps track of all hands on bodywork.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Chiropractic', 'Massage', 'PT', 'Cupping', 'Acupuncture'].map(tag => (
                                <span key={tag} className="px-2 py-1 rounded bg-zinc-800 text-zinc-400 text-[10px] border border-zinc-700">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Compliance Footer */}
                <footer className="pt-4 pb-8 text-center opacity-50">
                    <div className="flex items-center justify-center gap-1 text-zinc-500 mb-2">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Local-First Privacy</span>
                    </div>
                </footer>
            </main>

            {/* Modals */}
            <WelcomeModal />
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
            <StatusUpdateModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
            />
            <RoutineVerificationModal
                isOpen={showRoutineModal}
                onClose={() => setShowRoutineModal(false)}
                routines={pendingRoutines}
            />
            <HelpModal
                isOpen={showHelpModal}
                onClose={() => setShowHelpModal(false)}
            />
        </div>
    );
}
