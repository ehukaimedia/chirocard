import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Appointment, type BodyworkRoutine, type Practitioner } from "../db/db";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { ChevronLeft, CheckCircle, Plus, Trash2, Edit2, MapPin, Phone, Mail, Globe, Building2 } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { PractitionerManager } from "../components/Practitioner/PractitionerManager";
import CalendarComponent from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { BodyworkRoutineModal, type BodyworkRoutineData } from "../components/Shared/BodyworkRoutineModal";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

import { useAppStore } from "../store/useAppStore";

export default function Calendar() {
    const navigate = useNavigate();
    const { calendarViewSpan, routineTimeInterval } = useAppStore();
    const appointments = useLiveQuery(() => db.appointments.orderBy("date").toArray());
    const allRoutines = useLiveQuery(() => db.routines.toArray());

    const activeRoutines = allRoutines?.filter(h => h.status === 'active' || !h.status) || [];
    const pendingRoutines = allRoutines?.filter(h => h.status === 'pending') || [];

    const [date, setDate] = useState<Value>(new Date());
    const [isAddingAppt, setIsAddingAppt] = useState(false);
    const [isAddingRoutine, setIsAddingRoutine] = useState(false);

    // Appointment Form State
    const [apptDate, setApptDate] = useState("");
    const [apptTime, setApptTime] = useState("");
    const [selectedPractitioner, setSelectedPractitioner] = useState<{ id: string, name: string } | null>(null);

    // Routine Form State
    const [editingRoutine, setEditingRoutine] = useState<BodyworkRoutine | null>(null);
    const [modalInitialValues, setModalInitialValues] = useState<BodyworkRoutineData | undefined>(undefined);

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<'appointment' | 'routine' | null>(null);

    // Edit Appointment State
    const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
    const [editApptDate, setEditApptDate] = useState("");
    const [editApptTime, setEditApptTime] = useState("");
    const [editApptPractitioner, setEditApptPractitioner] = useState<{ id: string, name: string } | null>(null);
    const [practitionerDetails, setPractitionerDetails] = useState<Practitioner | null>(null);

    // Filter items for selected date (Specific Day)
    const selectedDateStr = date instanceof Date ? date.toDateString() : new Date().toDateString();
    const selectedDateObj = date instanceof Date ? date : new Date();

    const selectedDateAppointments = appointments?.filter(appt =>
        new Date(appt.date).toDateString() === selectedDateStr
    ) || [];

    const selectedDateRoutine = activeRoutines.filter(hw => {
        if (!hw.daysOfWeek || hw.daysOfWeek.length === 0) return true;
        return hw.daysOfWeek.includes(selectedDateObj.getDay());
    });

    // Filter items for Upcoming (Next 30 Days starting from tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endDate = new Date(tomorrow);
    endDate.setDate(tomorrow.getDate() + (calendarViewSpan || 30));

    const upcomingAppointments = appointments?.filter(appt => {
        const apptDate = new Date(appt.date);
        return apptDate >= tomorrow && apptDate <= endDate && appt.status !== 'completed';
    }) || [];

    // For upcoming routine, we just show the active list that *would* appear in the future.
    // Since routines are recurring, we can just show all active routines in the upcoming section
    // or maybe group them? For now, let's show all active routines as "Active Habits".
    // But the request said "30 day list".
    // Let's stick to:
    // 1. Selected Date (Appointments + Routine for that day)
    // 2. Upcoming Appointments (Next 30 days)
    // 3. Active Routine (General list of habits that will occur)

    const handleAddAppointment = async () => {
        if (!selectedPractitioner || !apptDate || !apptTime) return;

        const dateObj = new Date(`${apptDate}T${apptTime}`);

        await db.appointments.add({
            id: crypto.randomUUID(),
            practitionerId: selectedPractitioner.id,
            practitionerName: selectedPractitioner.name,
            date: dateObj.getTime()
        });

        setIsAddingAppt(false);
        setApptDate("");
        setApptTime("");
        setSelectedPractitioner(null);
    };

    const handleAddRoutine = async (data: BodyworkRoutineData) => {
        await db.routines.add({
            id: crypto.randomUUID(),
            title: data.title,
            description: data.description,
            frequency: data.daysOfWeek.length > 0 && data.daysOfWeek.length < 7 ? "custom" : "daily",
            daysOfWeek: data.daysOfWeek.length > 0 ? data.daysOfWeek : [0, 1, 2, 3, 4, 5, 6],
            reminderTimes: data.reminderTimes,
            category: data.category || 'custom',
            status: 'active',
            createdAt: Date.now(),
            isCompletedToday: false
        });

        setIsAddingRoutine(false);
    };

    const toggleRoutine = async (id: string, currentStatus: boolean, title: string) => {
        const now = new Date().getTime();
        await db.routines.update(id, {
            isCompletedToday: !currentStatus,
            lastCompletedAt: !currentStatus ? now : undefined
        });

        // Log completion to history if marking as done
        if (!currentStatus) {
            // Check if already logged for today to avoid duplicates?
            // Simple approach: just add a log.
            // Better: Check if a completion exists for this routine on this date?
            // For now, let's just add it.
            const todayStr = new Date().toISOString().split('T')[0];
            await db.routineCompletions.add({
                id: crypto.randomUUID(),
                routineId: id,
                routineTitle: title,
                completedAt: now,
                date: todayStr
            });
        } else {
            // If unchecking, maybe remove the log from today?
            // This is tricky if there are multiple completions.
            // Let's find the most recent completion for this routine today and delete it.
            const todayStr = new Date().toISOString().split('T')[0];
            const recent = await db.routineCompletions
                .where({ routineId: id, date: todayStr })
                .last();

            if (recent) {
                await db.routineCompletions.delete(recent.id);
            }
        }
    };

    const deleteItem = (type: 'appointment' | 'routine', id: string) => {
        setDeleteType(type);
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId || !deleteType) return;

        if (deleteType === 'appointment') {
            await db.appointments.delete(deleteId);
            // If we are editing this appointment, close the modal
            if (editingAppt?.id === deleteId) {
                setEditingAppt(null);
                setPractitionerDetails(null);
            }
        } else {
            await db.routines.delete(deleteId);
            // If we are editing this routine, close the modal
            if (editingRoutine?.id === deleteId) {
                setEditingRoutine(null);
            }
        }

        setDeleteId(null);
        setDeleteType(null);
    };

    const activateRoutine = async (id: string, time?: string) => {
        await db.routines.update(id, {
            status: 'active',
            reminderTimes: time ? [time] : []
        });
    };

    const handleEditClick = (hw: BodyworkRoutine, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingRoutine(hw);
        setModalInitialValues({
            title: hw.title,
            description: hw.description || "",
            reminderTimes: hw.reminderTimes || [],
            daysOfWeek: hw.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
            category: hw.category || 'custom'
        });
    };

    const handleSaveEdit = async (data: BodyworkRoutineData) => {
        if (!editingRoutine) return;

        await db.routines.update(editingRoutine.id, {
            title: data.title,
            description: data.description,
            reminderTimes: data.reminderTimes,
            frequency: data.daysOfWeek.length === 7 ? "daily" : "custom",
            daysOfWeek: data.daysOfWeek,
            category: data.category
        });

        setEditingRoutine(null);
        setModalInitialValues(undefined);
    };

    const handleApptClick = async (appt: Appointment) => {
        setEditingAppt(appt);
        const d = new Date(appt.date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setEditApptDate(`${year}-${month}-${day}`);

        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        setEditApptTime(`${hours}:${minutes}`);

        setEditApptPractitioner({ id: appt.practitionerId, name: appt.practitionerName });

        // Fetch full practitioner details
        const practitioner = await db.practitioners.get(appt.practitionerId);
        setPractitionerDetails(practitioner || null);
    };

    const handleSaveApptEdit = async () => {
        if (!editingAppt || !editApptPractitioner || !editApptDate || !editApptTime) return;

        const dateObj = new Date(`${editApptDate}T${editApptTime}`);

        await db.appointments.update(editingAppt.id, {
            practitionerId: editApptPractitioner.id,
            practitionerName: editApptPractitioner.name,
            date: dateObj.getTime()
        });

        // Update local details if practitioner changed
        if (editApptPractitioner.id !== practitionerDetails?.id) {
            const practitioner = await db.practitioners.get(editApptPractitioner.id);
            setPractitionerDetails(practitioner || null);
        }

        setEditingAppt(null);
        setPractitionerDetails(null);
    };

    const handleDeleteApptFromModal = () => {
        if (!editingAppt) return;
        deleteItem('appointment', editingAppt.id);
    };

    // Calendar Tile Content
    const getTileContent = ({ date, view }: { date: Date, view: string }) => {
        if (view !== 'month') return null;

        const dateStr = date.toDateString();
        const hasAppt = appointments?.some(a => new Date(a.date).toDateString() === dateStr);

        // In a real app, we'd check historical completion data here.
        // For now, we'll just show a dot for today if habits are done.
        const isToday = dateStr === new Date().toDateString();
        const allHabitsDone = activeRoutines.length > 0 && activeRoutines.every(h => h.isCompletedToday);
        const hasCompletedHabits = isToday && allHabitsDone;

        return (
            <div className="flex justify-center gap-1 mt-1">
                {hasAppt && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                {hasCompletedHabits && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24">
            {/* ... Navigation ... */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 hidden md:flex items-center px-6 z-50">
                <button
                    onClick={() => navigate("/")}
                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Return to Dashboard
                </button>
            </nav>

            <div className="md:mt-16 mb-6 pt-6 flex items-center gap-4">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Calendar</h1>
            </div>

            <div className="max-w-md mx-auto space-y-8">

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative">
                    <button
                        onClick={() => setDate(new Date())}
                        className="absolute top-4 right-4 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors z-10"
                    >
                        Today
                    </button>
                    <CalendarComponent
                        onChange={setDate}
                        value={date}
                        tileContent={getTileContent}
                        className="w-full border-none font-sans"
                    />
                </div>

                {/* --- SELECTED DATE SECTION --- */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            {selectedDateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h2>
                        {selectedDateStr === new Date().toDateString() && (
                            <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full">
                                TODAY
                            </span>
                        )}
                    </div>

                    {/* Selected Date Appointments */}
                    <section className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                Appointments
                            </h3>
                            <Button size="sm" variant="outline" onClick={() => setIsAddingAppt(!isAddingAppt)} className="h-7 text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {selectedDateAppointments.length > 0 ? (
                                selectedDateAppointments.map((appt: Appointment) => (
                                    <Card
                                        key={appt.id}
                                        className="p-4 flex justify-between items-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                                        onClick={() => handleApptClick(appt)}
                                    >
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{appt.practitionerName}</p>
                                            <p className="text-sm text-zinc-500">
                                                {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {appt.status === 'completed' && <span className="ml-2 text-emerald-500 font-medium text-xs flex items-center inline-flex gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {new Date(appt.date).toDateString() === new Date().toDateString() && appt.status !== 'completed' && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate("/intake", { state: { appointmentId: appt.id } });
                                                    }}
                                                >
                                                    Start Session
                                                </Button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteItem('appointment', appt.id); }}
                                                className="text-zinc-400 hover:text-red-500 p-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-400 italic">No appointments.</p>
                            )}
                        </div>
                    </section>

                    {/* Selected Date Routine */}
                    <section className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                Bodywork Routine Reminders
                            </h3>
                            <Button size="sm" variant="outline" onClick={() => setIsAddingRoutine(!isAddingRoutine)} className="h-7 text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {selectedDateRoutine.length > 0 ? (
                                selectedDateRoutine.map((hw: BodyworkRoutine) => (
                                    <div
                                        key={hw.id}
                                        className={`
                                            p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer
                                            ${hw.isCompletedToday
                                                ? 'bg-emerald-500/10 border-emerald-500/20'
                                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}
                                        `}
                                        onClick={() => toggleRoutine(hw.id, hw.isCompletedToday, hw.title)}
                                    >
                                        <div className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
                                            ${hw.isCompletedToday ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-600'}
                                        `}>
                                            {hw.isCompletedToday && <CheckCircle className="w-3 h-3" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm truncate ${hw.isCompletedToday ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                {hw.title}
                                            </p>
                                            <p className="text-xs text-zinc-500 truncate">{hw.description}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                onClick={(e) => handleEditClick(hw, e)}
                                                className="text-zinc-400 hover:text-emerald-500 p-1.5"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteItem('routine', hw.id); }}
                                                className="text-zinc-400 hover:text-red-500 p-1.5"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-400 italic">No routine items.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* --- UPCOMING SECTION --- */}
                <div className="pt-8 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        Upcoming <span className="text-sm font-normal text-zinc-500">Next {calendarViewSpan || 30} Days</span>
                    </h2>

                    {/* Pending Recommendations Review */}
                    {pendingRoutines.length > 0 && (
                        <section className="space-y-4 mb-6">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                <h2 className="text-lg font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                                    <Plus className="w-5 h-5" /> New Recommendations
                                </h2>
                                <div className="space-y-3">
                                    {pendingRoutines.map(hw => (
                                        <div key={hw.id} className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 mb-1 inline-block">
                                                        {hw.category}
                                                    </span>
                                                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{hw.title}</h3>
                                                    <p className="text-xs text-zinc-500">{hw.frequency} • {hw.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => deleteItem('routine', hw.id)}
                                                    className="text-zinc-400 hover:text-red-500 p-1"
                                                    title="Remove Recommendation"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex gap-2 items-center mt-3">
                                                <Input
                                                    type="time"
                                                    className="h-8 text-xs w-32"
                                                    defaultValue={hw.reminderTimes?.[0] || ""}
                                                    step={routineTimeInterval === 1 ? "60" : "900"}
                                                    onChange={(e) => {
                                                        const btn = document.getElementById(`activate-${hw.id}`);
                                                        if (btn) btn.dataset.time = e.target.value;
                                                    }}
                                                />
                                                <Button
                                                    id={`activate-${hw.id}`}
                                                    size="sm"
                                                    className="flex-1 h-8 text-xs"
                                                    onClick={(e) => {
                                                        const time = (e.currentTarget as HTMLElement).dataset.time;
                                                        activateRoutine(hw.id, time);
                                                    }}
                                                >
                                                    Add to Schedule
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Upcoming Appointments */}
                    <section className="space-y-3 mb-6">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            Appointments
                        </h3>
                        <div className="space-y-2">
                            {upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map((appt: Appointment) => (
                                    <Card
                                        key={appt.id}
                                        className="p-3 flex justify-between items-center cursor-pointer hover:border-emerald-500/50 transition-colors bg-zinc-50 dark:bg-zinc-900/50"
                                        onClick={() => handleApptClick(appt)}
                                    >
                                        <div>
                                            <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{appt.practitionerName}</p>
                                            <p className="text-xs text-zinc-500">
                                                {new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })} • {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-400 italic">No upcoming appointments.</p>
                            )}
                        </div>
                    </section>

                    {/* Active Routine List (Reference) */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            Active Routine Items
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {activeRoutines.length > 0 ? (
                                activeRoutines.map((hw: BodyworkRoutine) => (
                                    <div key={hw.id} className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{hw.title}</p>
                                            <div className="flex gap-2 text-[10px] text-zinc-500 uppercase tracking-wide">
                                                <span>{hw.frequency}</span>
                                                {hw.daysOfWeek && hw.daysOfWeek.length < 7 && (
                                                    <span>• {hw.daysOfWeek.map(d => ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'][d]).join(', ')}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => handleEditClick(hw, e)}
                                                className="text-zinc-400 hover:text-emerald-500 p-2"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteItem('routine', hw.id); }}
                                                className="text-zinc-400 hover:text-red-500 p-2"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-400 italic">No active routines.</p>
                            )}
                        </div>
                    </section>
                </div>

            </div>

            {/* Edit Modal */}
            <BodyworkRoutineModal
                isOpen={!!editingRoutine}
                onClose={() => { setEditingRoutine(null); setModalInitialValues(undefined); }}
                onConfirm={handleSaveEdit}
                initialValues={modalInitialValues}
                title="Edit Bodywork Routine"
                description="Update the details or schedule for this routine."
                confirmLabel="Save Changes"
            />

            {/* Edit Appointment Modal */}
            <Modal
                isOpen={!!editingAppt}
                onClose={() => { setEditingAppt(null); setPractitionerDetails(null); }}
                title="Appointment Details"
                description="View and manage your appointment."
                confirmLabel="Save Changes"
                cancelLabel="Cancel"
                onConfirm={handleSaveApptEdit}
            >
                <div className="space-y-6 py-2">
                    {/* Practitioner Details Card */}
                    {practitionerDetails && (
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3 border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {practitionerDetails.clinicName || practitionerDetails.name}
                                    </h4>
                                    <p className="text-xs text-zinc-500">{practitionerDetails.role}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                {practitionerDetails.address && (
                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{practitionerDetails.address}</span>
                                    </div>
                                )}
                                {practitionerDetails.phone && (
                                    <a
                                        href={`tel:${practitionerDetails.phone}`}
                                        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-500 transition-colors"
                                    >
                                        <Phone className="w-4 h-4 shrink-0" />
                                        <span>{practitionerDetails.phone}</span>
                                    </a>
                                )}
                                {practitionerDetails.email && (
                                    <a
                                        href={`mailto:${practitionerDetails.email}`}
                                        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-500 transition-colors"
                                    >
                                        <Mail className="w-4 h-4 shrink-0" />
                                        <span>{practitionerDetails.email}</span>
                                    </a>
                                )}
                                {practitionerDetails.website && (
                                    <a
                                        href={practitionerDetails.website.startsWith('http') ? practitionerDetails.website : `https://${practitionerDetails.website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-500 transition-colors"
                                    >
                                        <Globe className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{practitionerDetails.website}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Edit Details</h4>
                        {!editApptPractitioner ? (
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500">Select Practitioner</label>
                                <PractitionerManager onSelect={(p) => setEditApptPractitioner({ id: p.id, name: p.name })} />
                            </div>
                        ) : (
                            <div className="p-2 bg-primary/10 rounded-lg flex justify-between items-center">
                                <span className="text-sm font-medium">{editApptPractitioner.name}</span>
                                <Button size="sm" variant="ghost" onClick={() => setEditApptPractitioner(null)}>Change</Button>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <Input type="date" value={editApptDate} onChange={e => setEditApptDate(e.target.value)} />
                            <Input
                                type="time"
                                value={editApptTime}
                                onChange={e => setEditApptTime(e.target.value)}
                                step={routineTimeInterval === 1 ? "60" : "900"}
                            />
                        </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <Button
                            variant="ghost"
                            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleDeleteApptFromModal}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Appointment
                        </Button>
                    </div>
                </div>
            </Modal>
            {/* Add Appointment Modal */}
            <Modal
                isOpen={isAddingAppt}
                onClose={() => setIsAddingAppt(false)}
                title="New Appointment"
                description="Schedule a new session."
                confirmLabel="Add Appointment"
                cancelLabel="Cancel"
                onConfirm={handleAddAppointment}
            >
                <div className="space-y-4 py-2">
                    {!selectedPractitioner ? (
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500">Select Practitioner</label>
                            <PractitionerManager onSelect={(p) => setSelectedPractitioner({ id: p.id, name: p.name })} />
                        </div>
                    ) : (
                        <div className="p-2 bg-primary/10 rounded-lg flex justify-between items-center">
                            <span className="text-sm font-medium">{selectedPractitioner.name}</span>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedPractitioner(null)}>Change</Button>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        <Input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} />
                        <Input
                            type="time"
                            value={apptTime}
                            onChange={e => setApptTime(e.target.value)}
                            step={routineTimeInterval === 1 ? "60" : "900"}
                        />
                    </div>
                </div>
            </Modal>

            {/* Add Routine Modal */}
            <BodyworkRoutineModal
                isOpen={isAddingRoutine}
                onClose={() => setIsAddingRoutine(false)}
                onConfirm={handleAddRoutine}
                title="New Bodywork Routine"
                description="Add a routine activity."
                confirmLabel="Add Routine"
            />
            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => { setDeleteId(null); setDeleteType(null); }}
                title={deleteType === 'appointment' ? "Delete Appointment" : "Delete Routine Item"}
                description={`Are you sure you want to delete this ${deleteType === 'appointment' ? 'appointment' : 'routine item'}? This cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={confirmDelete}
                variant="danger"
            />
        </div>
    );
}
