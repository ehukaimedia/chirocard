import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Appointment, type Homework, type Practitioner } from "../db/db";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { ChevronLeft, CheckCircle, Plus, Trash2, Edit2, Clock, MapPin, Phone, Mail, Globe, Building2 } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { PractitionerManager } from "../components/Practitioner/PractitionerManager";
import CalendarComponent from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function Calendar() {
    const navigate = useNavigate();
    const appointments = useLiveQuery(() => db.appointments.orderBy("date").toArray());
    const allHomework = useLiveQuery(() => db.homework.toArray());

    const activeHomework = allHomework?.filter(h => h.status === 'active' || !h.status) || [];
    const pendingHomework = allHomework?.filter(h => h.status === 'pending') || [];

    const [date, setDate] = useState<Value>(new Date());
    const [isAddingAppt, setIsAddingAppt] = useState(false);
    const [isAddingHomework, setIsAddingHomework] = useState(false);

    // Appointment Form State
    const [apptDate, setApptDate] = useState("");
    const [apptTime, setApptTime] = useState("");
    const [selectedPractitioner, setSelectedPractitioner] = useState<{ id: string, name: string } | null>(null);

    // Homework Form State
    const [homeworkTitle, setHomeworkTitle] = useState("");
    const [homeworkDesc, setHomeworkDesc] = useState("");

    // Edit Homework State
    const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editTime, setEditTime] = useState("");
    const [editFreq, setEditFreq] = useState("");
    const [editCategory, setEditCategory] = useState<'relief' | 'movement' | 'lifestyle' | 'custom'>('custom');

    // Edit Appointment State
    const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
    const [editApptDate, setEditApptDate] = useState("");
    const [editApptTime, setEditApptTime] = useState("");
    const [editApptPractitioner, setEditApptPractitioner] = useState<{ id: string, name: string } | null>(null);
    const [practitionerDetails, setPractitionerDetails] = useState<Practitioner | null>(null);

    // Filter items for selected date
    const selectedDateStr = date instanceof Date ? date.toDateString() : "";

    // We show ALL active homework regardless of date (since they are daily habits), 
    // but we could filter completed history if we tracked completion history per day.
    // For now, we just show the active list.

    // Filter appointments for selected date
    const dayAppointments = appointments?.filter(appt =>
        new Date(appt.date).toDateString() === selectedDateStr
    ) || [];

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

    const handleAddHomework = async () => {
        if (!homeworkTitle) return;

        await db.homework.add({
            id: crypto.randomUUID(),
            title: homeworkTitle,
            description: homeworkDesc,
            frequency: "daily",
            category: 'custom',
            status: 'active',
            createdAt: Date.now(),
            isCompletedToday: false
        });

        setIsAddingHomework(false);
        setHomeworkTitle("");
        setHomeworkDesc("");
    };

    const toggleHomework = async (id: string, currentStatus: boolean) => {
        await db.homework.update(id, {
            isCompletedToday: !currentStatus,
            // eslint-disable-next-line react-hooks/purity
            lastCompletedAt: !currentStatus ? Date.now() : undefined
        });
    };

    const deleteItem = async (type: 'appointment' | 'homework', id: string) => {
        if (confirm("Delete this item?")) {
            if (type === 'appointment') await db.appointments.delete(id);
            else await db.homework.delete(id);
        }
    };

    const activateHomework = async (id: string, time?: string) => {
        await db.homework.update(id, {
            status: 'active',
            reminderTimes: time ? [time] : []
        });
    };

    const handleEditClick = (hw: Homework, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingHomework(hw);
        setEditTitle(hw.title);
        setEditDesc(hw.description || "");
        setEditTime(hw.reminderTimes?.[0] || "");
        setEditFreq(hw.frequency || "daily");
        setEditCategory(hw.category || 'custom');
    };

    const handleSaveEdit = async () => {
        if (!editingHomework) return;

        await db.homework.update(editingHomework.id, {
            title: editTitle,
            description: editDesc,
            reminderTimes: editTime ? [editTime] : [],
            frequency: editFreq,
            category: editCategory
        });

        setEditingHomework(null);
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

    const handleDeleteApptFromModal = async () => {
        if (!editingAppt) return;
        if (confirm("Delete this appointment?")) {
            await db.appointments.delete(editingAppt.id);
            setEditingAppt(null);
            setPractitionerDetails(null);
        }
    };

    // Calendar Tile Content
    const getTileContent = ({ date, view }: { date: Date, view: string }) => {
        if (view !== 'month') return null;

        const dateStr = date.toDateString();
        const hasAppt = appointments?.some(a => new Date(a.date).toDateString() === dateStr);

        // In a real app, we'd check historical completion data here.
        // For now, we'll just show a dot for today if habits are done.
        const isToday = dateStr === new Date().toDateString();
        const allHabitsDone = activeHomework.length > 0 && activeHomework.every(h => h.isCompletedToday);
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
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 z-50">
                <button
                    onClick={() => navigate("/")}
                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Return to Dashboard
                </button>
            </nav>

            <div className="mt-16 mb-6 pt-6 flex items-center gap-4">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Calendar</h1>
            </div>

            <div className="max-w-md mx-auto space-y-8">

                {/* Visual Calendar */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <CalendarComponent
                        onChange={setDate}
                        value={date}
                        tileContent={getTileContent}
                        className="w-full border-none font-sans"
                    />
                </div>

                {/* Selected Date Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                        {date instanceof Date ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Selected Date'}
                    </h2>
                </div>

                {/* Appointments Section */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            Appointments
                        </h3>
                        <Button size="sm" variant="outline" onClick={() => setIsAddingAppt(!isAddingAppt)}>
                            <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                    </div>

                    {isAddingAppt && (
                        <Card className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <h3 className="font-medium">New Appointment</h3>
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
                                <Input type="time" value={apptTime} onChange={e => setApptTime(e.target.value)} />
                            </div>
                            <div className="flex gap-2">
                                <Button className="flex-1" onClick={handleAddAppointment}>Save</Button>
                                <Button variant="ghost" onClick={() => setIsAddingAppt(false)}>Cancel</Button>
                            </div>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {/* Show appointments for selected day OR all upcoming if today is selected? 
                            Let's show ALL upcoming if no specific day selected, or just the day's.
                            For simplicity, let's show the selected day's appointments.
                        */}
                        {dayAppointments.length > 0 ? (
                            dayAppointments.map((appt: Appointment) => (
                                <Card
                                    key={appt.id}
                                    className="p-4 flex justify-between items-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                                    onClick={() => handleApptClick(appt)}
                                >
                                    <div>
                                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{appt.practitionerName}</p>
                                        <p className="text-sm text-zinc-500">
                                            {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
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
                            <p className="text-center text-sm text-zinc-500 py-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                No appointments for this day.
                            </p>
                        )}
                    </div>
                </section>

                {/* Pending Recommendations Review */}
                {pendingHomework.length > 0 && (
                    <section className="space-y-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                            <h2 className="text-lg font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                                <Plus className="w-5 h-5" /> New Recommendations
                            </h2>
                            <div className="space-y-3">
                                {pendingHomework.map(hw => (
                                    <div key={hw.id} className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 mb-1 inline-block">
                                                    {hw.category}
                                                </span>
                                                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{hw.title}</h3>
                                                <p className="text-xs text-zinc-500">{hw.frequency} • {hw.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center mt-3">
                                            <Input
                                                type="time"
                                                className="h-8 text-xs w-32"
                                                defaultValue={hw.reminderTimes?.[0] || ""}
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
                                                    activateHomework(hw.id, time);
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

                {/* Homework Section */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            Daily Habits
                        </h3>
                        <Button size="sm" variant="outline" onClick={() => setIsAddingHomework(!isAddingHomework)}>
                            <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                    </div>

                    {isAddingHomework && (
                        <Card className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <h3 className="font-medium">New Habit / Homework</h3>
                            <Input
                                label="Title"
                                placeholder="e.g. Ice Lower Back"
                                value={homeworkTitle}
                                onChange={e => setHomeworkTitle(e.target.value)}
                            />
                            <Input
                                label="Description"
                                placeholder="e.g. 20 mins, 3x a day"
                                value={homeworkDesc}
                                onChange={e => setHomeworkDesc(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button className="flex-1" onClick={handleAddHomework}>Save</Button>
                                <Button variant="ghost" onClick={() => setIsAddingHomework(false)}>Cancel</Button>
                            </div>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {activeHomework?.map((hw: Homework) => (
                            <div
                                key={hw.id}
                                className={`
                  p-4 rounded-xl border transition-all flex items-center gap-3 cursor-pointer
                  ${hw.isCompletedToday
                                        ? 'bg-emerald-500/10 border-emerald-500/20'
                                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}
                `}
                                onClick={() => toggleHomework(hw.id, hw.isCompletedToday)}
                            >
                                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                  ${hw.isCompletedToday ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-600'}
                `}>
                                    {hw.isCompletedToday && <CheckCircle className="w-4 h-4" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className={`font-medium ${hw.isCompletedToday ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                            {hw.title}
                                        </p>
                                        {hw.reminderTimes && hw.reminderTimes.length > 0 && (
                                            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                {hw.reminderTimes[0]}
                                            </span>
                                        )}
                                    </div>
                                    {hw.description && (
                                        <p className="text-xs text-zinc-500">{hw.description}</p>
                                    )}
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
                                        onClick={(e) => { e.stopPropagation(); deleteItem('homework', hw.id); }}
                                        className="text-zinc-400 hover:text-red-500 p-2"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {activeHomework?.length === 0 && !isAddingHomework && (
                            <p className="text-center text-sm text-zinc-500 py-4">No active homework.</p>
                        )}
                    </div>
                </section>

            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingHomework}
                onClose={() => setEditingHomework(null)}
                title="Edit Recommendation"
                description="Update the details or schedule for this habit."
                confirmLabel="Save Changes"
                cancelLabel="Cancel"
                onConfirm={handleSaveEdit}
            >
                <div className="space-y-4 py-2">
                    <Input
                        label="Title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <Input
                        label="Description"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                    />
                    <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Daily Reminder Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                type="time"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Frequency</label>
                            <select
                                value={editFreq}
                                onChange={(e) => setEditFreq(e.target.value)}
                                className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="Daily">Daily</option>
                                <option value="2x Daily">2x Daily</option>
                                <option value="Morning/Night">Morning/Night</option>
                                <option value="As Needed">As Needed</option>
                                <option value="Acute (3x/day)">Acute (3x/day)</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Once">Once</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Category</label>
                            <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value as any)}
                                className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="relief">Relief & Recovery</option>
                                <option value="movement">Movement & Mobility</option>
                                <option value="lifestyle">Lifestyle & Wellness</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>

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
                                    <a
                                        href={`https://maps.google.com/?q=${encodeURIComponent(practitionerDetails.address)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-500 transition-colors"
                                    >
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{practitionerDetails.address}</span>
                                    </a>
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
                            <Input type="time" value={editApptTime} onChange={e => setEditApptTime(e.target.value)} />
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
        </div>
    );
}
