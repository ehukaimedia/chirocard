import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Homework, type Session } from "../db/db";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Plus, History, Calendar as CalendarIcon, User, Info, ShieldCheck, Users } from "lucide-react";
import { SessionCard } from "../components/Dashboard/SessionCard";

export default function Dashboard() {
    const navigate = useNavigate();
    const sessions = useLiveQuery(() => db.sessions.orderBy("date").reverse().limit(5).toArray());
    const homework = useLiveQuery(() => db.homework.toArray());
    const appointments = useLiveQuery(() => db.appointments.orderBy("date").limit(1).toArray());

    const activeHomeworkCount = homework?.filter((h: Homework) => !h.isCompletedToday).length || 0;
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

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 space-y-8 pb-24">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <img src="/chirocard-icon.png" alt="ChiroCard" className="w-14 h-14 rounded-2xl shadow-lg shadow-emerald-500/20" />
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter mb-0 leading-none">
                            <span className="text-emerald-600 dark:text-emerald-500">Chiro</span>Card<span className="text-emerald-600 dark:text-emerald-500">.</span>
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-bold tracking-wide uppercase text-[10px] md:text-xs">The Digital Body Work Passport</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to="/team">
                        <Button variant="outline" size="icon" className="border-zinc-800 text-zinc-400 hover:text-zinc-100" title="My Team">
                            <Users className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link to="/calendar">
                        <Button variant="outline" size="icon" className="border-zinc-800 text-zinc-400 hover:text-zinc-100">
                            <CalendarIcon className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link to="/profile">
                        <Button variant="outline" size="icon" className="border-zinc-800 text-zinc-400 hover:text-zinc-100">
                            <User className="w-5 h-5" />
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
                            <span className="text-emerald-600 dark:text-emerald-500 text-xs font-bold tracking-wider uppercase mb-1 block">Active Care Plan</span>
                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Maintenance</h3>
                        </div>
                        <div className="h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800/50">
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-1">Next Session</p>
                            <p className="text-zinc-900 dark:text-zinc-200 font-semibold truncate">
                                {nextAppointment ? new Date(nextAppointment.date).toLocaleDateString() : "None scheduled"}
                            </p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800/50">
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-1">Daily Habits</p>
                            <p className="text-zinc-900 dark:text-zinc-200 font-semibold">
                                {activeHomeworkCount > 0 ? `${activeHomeworkCount} remaining` : "All done!"}
                            </p>
                        </div>
                    </div>
                </Card>
            </section>
            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="primary"
                    className="h-32 flex flex-col items-center justify-center gap-3 text-lg shadow-lg shadow-emerald-500/20"
                    onClick={() => navigate("/intake")}
                >
                    <div className="p-3 bg-white/20 rounded-full">
                        <Plus className="w-6 h-6" />
                    </div>
                    Start Session
                </Button>
                <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center gap-3 text-lg bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-sm"
                    onClick={() => navigate("/history")}
                >
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                        <History className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                    </div>
                    <span className="text-zinc-900 dark:text-zinc-100">History</span>
                </Button>
            </div>

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
                    Your health data never leaves this device.
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
        </div>
    );
}
