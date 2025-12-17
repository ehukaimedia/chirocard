import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, Calendar, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import { type BodyworkRoutine } from "../../db/db";
import { useDataStore } from "../../store/useDataStore";
import { useNavigate } from "react-router-dom";
import { RoutineVerificationModal } from "./RoutineVerificationModal";

export function NotificationCenter() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedRoutine, setSelectedRoutine] = useState<BodyworkRoutine | null>(null);
    const { appointments: allAppointments, routines: allRoutines } = useDataStore();

    // Queries
    const appointments = useMemo(() => {
        const now = Date.now();
        return allAppointments
            .filter(a => a.date >= now)
            .sort((a, b) => a.date - b.date)
            .slice(0, 3);
    }, [allAppointments]);


    const now = new Date();
    const dayOfWeek = now.getDay();
    // Get all routines that match today's day of week or are daily (empty days array)
    // Then filter by not completed today
    const routines = useMemo(() => {
        return allRoutines.filter(r => {
            if (r.status !== 'active') return false;
            const matchesDay = r.daysOfWeek?.length === 0 || r.daysOfWeek?.includes(dayOfWeek);
            return matchesDay && !r.isCompletedToday;
        });
    }, [allRoutines, dayOfWeek]);

    const hasNotifications = appointments.length > 0 || routines.length > 0;
    const notificationCount = routines.length + appointments.length;

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleRoutineClick = (routine: BodyworkRoutine) => {
        setSelectedRoutine(routine);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="ghost"
                size="icon"
                className={`relative transition-colors ${hasNotifications ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="w-6 h-6" />
                {notificationCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-zinc-900"></span>
                    </span>
                )}
            </Button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Notifications</h3>
                            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                {notificationCount} New
                            </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {!hasNotifications ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell className="w-5 h-5 text-zinc-300" />
                                </div>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">All caught up!</p>
                                <p className="text-zinc-400 text-xs mt-1">No active reminders for today.</p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-2">
                                {/* Appointments Section */}
                                {appointments.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                            Upcoming Appointments
                                        </div>
                                        {appointments.map(apt => (
                                            <div
                                                key={apt.id}
                                                onClick={() => {
                                                    navigate("/intake", { state: { appointmentId: apt.id } });
                                                    setIsOpen(false);
                                                }}
                                                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                                        {apt.practitionerName}
                                                    </h4>
                                                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(apt.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                                                        {new Date(apt.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 mt-1" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Routines Section */}
                                {routines.length > 0 && (
                                    <div className="space-y-1">
                                        {appointments.length > 0 && <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2 mx-2"></div>}
                                        <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                            Routine Reminders
                                        </div>
                                        {routines.map(routine => (
                                            <div
                                                key={routine.id}
                                                onClick={() => handleRoutineClick(routine)}
                                                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 text-orange-600 dark:text-orange-400">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                                        {routine.title}
                                                    </h4>
                                                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                                                        {routine.description || "Daily routine task"}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] font-medium px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-md uppercase tracking-wide">
                                                            {routine.reminderTimes?.[0] || "Today"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 rounded-full text-zinc-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRoutineClick(routine);
                                                    }}
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <Button
                            variant="ghost"
                            className="w-full text-xs text-zinc-500 h-8 font-medium hover:text-zinc-900 dark:hover:text-zinc-200"
                            onClick={() => {
                                setIsOpen(false);
                                navigate("/calendar");
                            }}
                        >
                            View All Activity
                        </Button>
                    </div>
                </div>
            )}

            {/* Verification Modal for Selected Routine */}
            {selectedRoutine && (
                <RoutineVerificationModal
                    isOpen={!!selectedRoutine}
                    onClose={() => setSelectedRoutine(null)}
                    routines={[selectedRoutine]} // Pass as array but we focus on one
                />
            )}
        </div>
    );
}
