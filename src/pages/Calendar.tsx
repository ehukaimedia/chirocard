import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Appointment, type Homework } from "../db/db";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle, Plus, Trash2 } from "lucide-react";
import { PractitionerManager } from "../components/Practitioner/PractitionerManager";

export default function Calendar() {
    const navigate = useNavigate();
    const appointments = useLiveQuery(() => db.appointments.orderBy("date").toArray());
    const allHomework = useLiveQuery(() => db.homework.toArray());

    const activeHomework = allHomework?.filter(h => h.status === 'active' || !h.status) || [];
    const pendingHomework = allHomework?.filter(h => h.status === 'pending') || [];

    const [isAddingAppt, setIsAddingAppt] = useState(false);
    const [isAddingHomework, setIsAddingHomework] = useState(false);

    // Appointment Form State
    const [apptDate, setApptDate] = useState("");
    const [apptTime, setApptTime] = useState("");
    const [selectedPractitioner, setSelectedPractitioner] = useState<{ id: string, name: string } | null>(null);

    // Homework Form State
    const [homeworkTitle, setHomeworkTitle] = useState("");
    const [homeworkDesc, setHomeworkDesc] = useState("");

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

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Schedule & Habits</h1>
            </div>

            <div className="space-y-8 max-w-md mx-auto">

                {/* Pending Recommendations Review */}
                {pendingHomework.length > 0 && (
                    <section className="space-y-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                            <h2 className="text-lg font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                                <Plus className="w-5 h-5" /> New Recommendations
                            </h2>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                Your practitioner has added new recommendations. Review and schedule them to add to your daily routine.
                            </p>
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
                                                    // This is a bit hacky for inline update, but works for the activation flow
                                                    // Ideally we'd have local state for each item, but for now we'll just pass the value to activate
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

                {/* Appointments Section */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" /> Upcoming Appointments
                        </h2>
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
                        {appointments?.map((appt: Appointment) => (
                            <Card key={appt.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{appt.practitionerName}</p>
                                    <p className="text-sm text-zinc-500">
                                        {new Date(appt.date).toLocaleDateString()} at {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <button onClick={() => deleteItem('appointment', appt.id)} className="text-zinc-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </Card>
                        ))}
                        {appointments?.length === 0 && !isAddingAppt && (
                            <p className="text-center text-sm text-zinc-500 py-4">No upcoming appointments.</p>
                        )}
                    </div>
                </section>

                {/* Homework Section */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Daily Homework
                        </h2>
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

                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteItem('homework', hw.id); }}
                                    className="text-zinc-400 hover:text-red-500 p-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {activeHomework?.length === 0 && !isAddingHomework && (
                            <p className="text-center text-sm text-zinc-500 py-4">No active homework.</p>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}
