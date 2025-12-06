import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { REGIONS } from "../components/BodyMap/BodyRegionSelector";
import { Info, AlertTriangle, ChevronLeft, History, Printer, Calendar, Check, Clock, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { Modal } from "../components/ui/Modal";
import { useAppStore } from "../store/useAppStore";
import { useNavigate } from "react-router-dom";
import { BodyworkRoutineModal, type BodyworkRoutineData } from "../components/Shared/BodyworkRoutineModal";
import type { PostSessionEntry, BodyworkRoutine } from "../db/db";

export default function SessionReport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { resumeSession } = useAppStore();
    const session = useLiveQuery(() => id ? db.sessions.get(id) : undefined, [id]);
    const user = useLiveQuery(() => db.users.get("me"));
    const [addedRecs, setAddedRecs] = useState<Set<number>>(new Set());

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecIndex, setEditingRecIndex] = useState<number | null>(null);
    const [modalInitialValues, setModalInitialValues] = useState<BodyworkRoutineData | undefined>(undefined);

    // Post-Session Data State
    const [journalEntry, setJournalEntry] = useState("");
    const [isAddingEntry, setIsAddingEntry] = useState(false);
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
    const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleAddJournalEntry = async () => {
        if (!session || !journalEntry.trim()) return;
        try {
            let updatedLog;

            if (editingEntryId) {
                // Update existing entry
                updatedLog = session.postSessionLog?.map((entry: PostSessionEntry) =>
                    entry.id === editingEntryId
                        ? { ...entry, content: journalEntry }
                        : entry
                );
            } else {
                // Create new entry
                const newEntry = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    author: 'user' as const,
                    type: 'journal' as const,
                    content: journalEntry
                };
                updatedLog = session.postSessionLog ? [...session.postSessionLog, newEntry] : [newEntry];
            }

            await db.sessions.update(session.id, {
                postSessionLog: updatedLog
            });
            setJournalEntry("");
            setIsAddingEntry(false);
            setEditingEntryId(null);
        } catch (error) {
            console.error("Failed to save journal entry:", error);
        }
    };

    const handleEditEntry = (entry: PostSessionEntry) => {
        setJournalEntry(entry.content);
        setEditingEntryId(entry.id);
        setIsAddingEntry(true);
    };

    const handleDeleteClick = (entryId: string) => {
        setDeletingEntryId(entryId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!session || !session.postSessionLog || !deletingEntryId) return;
        try {
            const updatedLog = session.postSessionLog.filter((e: PostSessionEntry) => e.id !== deletingEntryId);
            await db.sessions.update(session.id, {
                postSessionLog: updatedLog
            });
            setIsDeleteModalOpen(false);
            setDeletingEntryId(null);
        } catch (error) {
            console.error("Failed to delete entry:", error);
        }
    };

    const handleAddToCalendar = (rec: BodyworkRoutine, index: number) => {
        setEditingRecIndex(index);
        setModalInitialValues({
            title: rec.title,
            description: rec.description || "",
            category: rec.category,
            daysOfWeek: rec.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
            reminderTimes: [] // Explicitly ignoring legacy reminder times as requested
        });
        setIsModalOpen(true);
    };

    const handleConfirmAdd = async (data: BodyworkRoutineData) => {
        if (editingRecIndex === null) return;

        try {
            await db.routines.add({
                title: data.title,
                description: data.description || "",
                frequency: data.daysOfWeek.length === 7 ? "daily" : "custom",
                daysOfWeek: data.daysOfWeek,
                reminderTimes: data.reminderTimes,
                isCompletedToday: false,
                category: data.category || 'relief',
                status: 'active',
                id: crypto.randomUUID(),
                createdAt: Date.now()
            });

            setAddedRecs(prev => {
                const next = new Set(prev);
                next.add(editingRecIndex);
                return next;
            });
            setIsModalOpen(false);
            setEditingRecIndex(null);
        } catch (error) {
            console.error("Failed to add to calendar:", error);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-white p-6 flex items-center justify-center print:hidden">
                <p className="text-zinc-500">Loading report...</p>
            </div>
        );
    }

    // Process body map data
    const treatedAreas = session.bodyMap
        ? Object.entries(session.bodyMap)
            .filter(([, status]) => status !== 'normal')
            .map(([id, status]) => ({
                label: REGIONS.find(r => r.id === id)?.label || id,
                status,
                notes: session.treatmentNotes?.[id] || session.bodyNotes?.[id],
                level: session.bodyLevels?.[id],
                badges: session.bodyBadges?.[id],
                practitionerLevel: session.practitionerLevels?.[id],
                practitionerBadges: session.practitionerBadges?.[id]
            }))
        : [];

    console.log("Post Session Log:", session.postSessionLog);

    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8 max-w-[210mm] mx-auto print:p-0 print:max-w-none">
            {/* Top Navigation Bar - Hidden when printing */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-8 z-50 print:hidden">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => window.location.href = "/"}
                        className="text-zinc-500 hover:text-zinc-900 font-medium text-sm flex items-center gap-2 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Return to Dashboard
                    </button>
                    <div className="h-4 w-px bg-zinc-200"></div>
                    <button
                        onClick={() => window.location.href = "/journal"}
                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        <History className="w-4 h-4" />
                        View Journal
                    </button>
                </div>
            </nav>

            {/* Print Controls - Hidden when printing */}
            <div className="mb-8 flex justify-between items-center print:hidden mt-16">
                <h1 className="text-2xl font-bold">Session Report</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (session) {
                                resumeSession(session);
                                navigate("/guest-session");
                            }
                        }}
                        className="bg-white border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors font-medium flex items-center gap-2 shadow-sm"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Session
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2 shadow-sm shadow-emerald-900/10"
                    >
                        <Printer className="w-4 h-4" />
                        Print / Save as PDF
                    </button>
                </div>
            </div>

            {/* Report Content */}
            <div className="space-y-8">
                {/* Header */}
                <header className="border-b-2 border-zinc-100 pb-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <img src="/chirocard-icon.png" alt="ChiroCard Icon" className="w-10 h-10 rounded-xl shadow-sm" />
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                                <span className="text-emerald-600">Chiro</span>Card<span className="text-emerald-600">.</span>
                            </h1>
                        </div>
                        <p className="text-[.65rem] text-zinc-400 tracking-[0.2em] font-medium uppercase mt-0.5">The Bodywork Journal</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-zinc-500 mb-1">Session Date</p>
                        <p className="text-xl font-bold text-zinc-900">
                            {new Date(session.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </header>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Patient */}
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 print:border-zinc-200">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Client</p>
                        <p className="text-lg font-bold text-zinc-900 mb-1">{user?.name || "Guest Client"}</p>
                        <div className="text-sm text-zinc-600 space-y-0.5">
                            {user?.email && <p>{user.email}</p>}
                            {user?.phone && <p>{user.phone}</p>}
                        </div>
                    </div>

                    {/* Practitioner */}
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 print:border-emerald-200">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Practitioner</p>
                        <p className="text-lg font-bold text-zinc-900 mb-1">{session.practitionerName}</p>
                        <p className="text-emerald-700 font-medium text-sm mb-1">{session.practitionerClass}</p>
                    </div>
                </div>

                {/* Patient Intake Context (if available) */}
                {(user?.primaryComplaints?.length || user?.contraindications?.length) && (
                    <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Info className="w-4 h-4" /> Client Context
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {user.primaryComplaints && user.primaryComplaints.length > 0 && (
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Primary Complaints:</span>
                                    <p className="text-sm text-zinc-700">{user.primaryComplaints.join(", ")}</p>
                                </div>
                            )}
                            {user.contraindications && user.contraindications.length > 0 && (
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Contraindications:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {user.contraindications.map((c: string, i: number) => (
                                            <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 flex items-center gap-1 w-fit">
                                                <AlertTriangle className="w-3 h-3" /> {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Services, Modalities & Findings Grid */}
                {((session.serviceTags?.length ?? 0) > 0 || (session.modalityTags?.length ?? 0) > 0 || (session.findingTags?.length ?? 0) > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 break-inside-avoid">
                        {/* Services & Modalities */}
                        {((session.serviceTags?.length ?? 0) > 0 || (session.modalityTags?.length ?? 0) > 0) && (
                            <section>
                                <div className="flex items-center gap-4 mb-4">
                                    <h2 className="text-lg font-bold text-zinc-900">Services & Modalities</h2>
                                    <div className="h-px bg-zinc-200 flex-1"></div>
                                </div>
                                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4">
                                    {(session.serviceTags?.length ?? 0) > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Services</p>
                                            <div className="flex flex-wrap gap-2">
                                                {session.serviceTags?.map((tag: string) => (
                                                    <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {(session.modalityTags?.length ?? 0) > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Modalities</p>
                                            <div className="flex flex-wrap gap-2">
                                                {session.modalityTags?.map((tag: string) => (
                                                    <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Clinical Findings */}
                        {(session.findingTags?.length ?? 0) > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-4">
                                    <h2 className="text-lg font-bold text-zinc-900">Clinical Findings</h2>
                                    <div className="h-px bg-zinc-200 flex-1"></div>
                                </div>
                                <div className="bg-white border border-zinc-200 rounded-xl p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {session.findingTags?.map((tag: string) => (
                                            <span key={tag} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100 font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* Bodywork Log */}
                <section>
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-lg font-bold text-zinc-900">Bodywork Log</h2>
                        <div className="h-px bg-zinc-200 flex-1"></div>
                    </div>

                    {treatedAreas.length > 0 ? (
                        <div className="space-y-3">
                            {treatedAreas.map((area, i) => (
                                <div key={i} className="bg-white border border-zinc-200 rounded-lg p-3 break-inside-avoid">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-zinc-900">{area.label}</h3>
                                            {(area.level !== undefined || (area.badges && area.badges.length > 0)) && (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {area.level !== undefined && (
                                                        <span className="text-xs font-bold text-zinc-500">Pain Level: {area.level}/10</span>
                                                    )}
                                                    {area.badges?.map(badge => (
                                                        <span key={badge} className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200">
                                                            {badge}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded font-medium uppercase tracking-wide ${area.status === 'issue' ? 'bg-red-50 text-red-700 border border-red-100' :
                                            area.status === 'addressed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}>
                                            {area.status === 'issue' ? 'Client Concern' : area.status === 'addressed' ? 'Treated' : area.status === 'watch' ? 'Monitor' : area.status}
                                        </span>
                                    </div>
                                    {area.notes && (
                                        <p className="text-sm text-zinc-600 italic mb-2">"{area.notes}"</p>
                                    )}

                                    {/* Practitioner Assessment in Report */}
                                    {(area.practitionerLevel !== undefined || (area.practitionerBadges && area.practitionerBadges.length > 0)) && (
                                        <div className="mt-2 pt-2 border-t border-zinc-100">
                                            <p className="text-[10px] uppercase text-emerald-600 font-bold mb-1">Practitioner Findings</p>
                                            <div className="flex flex-wrap gap-2">
                                                {area.practitionerLevel !== undefined && (
                                                    <span className="text-xs font-bold text-zinc-500">Level: {area.practitionerLevel}/10</span>
                                                )}
                                                {area.practitionerBadges?.map(badge => (
                                                    <span key={badge} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 italic">No specific body areas logged.</p>
                    )}
                </section>

                {/* Session Notes */}
                {session.notes && (
                    <section className="break-inside-avoid">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-lg font-bold text-zinc-900">Session Notes</h2>
                            <div className="h-px bg-zinc-200 flex-1"></div>
                        </div>
                        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                            {session.notes}
                        </div>
                    </section>
                )}

                {/* Recommendations */}
                {session.recommendations && session.recommendations.length > 0 && (
                    <section className="break-inside-avoid">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-lg font-bold text-zinc-900">Recommendations</h2>
                            <div className="h-px bg-zinc-200 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {session.recommendations.map((rec: BodyworkRoutine, i: number) => (
                                <div key={i} className="bg-white border border-zinc-200 rounded-lg p-3 flex items-start gap-3">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${rec.category === 'relief' ? 'bg-blue-500' :
                                        rec.category === 'movement' ? 'bg-emerald-500' :
                                            rec.category === 'lifestyle' ? 'bg-purple-500' : 'bg-zinc-500'
                                        }`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-zinc-900 text-sm">{rec.title}</h3>
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">{rec.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-medium bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">{rec.frequency}</span>
                                            {rec.description && <span className="text-xs text-zinc-500">• {rec.description}</span>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCalendar(rec, i)}
                                        disabled={addedRecs.has(i)}
                                        className={`
                                            flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                            ${addedRecs.has(i)
                                                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 print:hidden'}
                                        `}
                                    >
                                        {addedRecs.has(i) ? (
                                            <>
                                                <Check className="w-3 h-3" /> Added
                                            </>
                                        ) : (
                                            <>
                                                <Calendar className="w-3 h-3" /> Add to Calendar
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}



                {/* Signatures */}
                <section className="pt-8 break-inside-avoid">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-lg font-bold text-zinc-900">Verification</h2>
                        <div className="h-px bg-zinc-200 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                        {/* Patient Sig */}
                        <div>
                            <div className="min-h-[6rem] border-b border-zinc-300 mb-2 flex items-end pb-2">
                                {session.userSignature ? (
                                    session.userSignature.startsWith('data:image') ? (
                                        <img src={session.userSignature} alt="Client Signature" className="max-h-20 max-w-full object-contain" />
                                    ) : (
                                        <div className="font-serif italic text-lg text-zinc-700 leading-tight pb-1">
                                            {session.userSignature}
                                        </div>
                                    )
                                ) : (
                                    <span className="text-zinc-300 text-sm italic">Pending Agreement</span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-zinc-900">{user?.name || "Client"}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Client Agreement</p>
                        </div>

                        {/* Practitioner Sig */}
                        <div>
                            <div className="min-h-[6rem] border-b border-zinc-300 mb-2 flex items-end pb-2">
                                {session.signatureBase64 ? (
                                    session.signatureBase64.startsWith('data:image') ? (
                                        <img src={session.signatureBase64} alt="Practitioner Signature" className="max-h-20 max-w-full object-contain" />
                                    ) : (
                                        <div className="font-serif italic text-lg text-zinc-700 leading-tight pb-1">
                                            {session.signatureBase64}
                                        </div>
                                    )
                                ) : (
                                    <span className="text-zinc-300 text-sm italic">Pending Verification</span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-zinc-900">{session.practitionerName}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Practitioner Verification</p>
                        </div>
                    </div>
                </section>

                {/* Body Response Journal */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-lg font-bold text-zinc-900">Body Response Journal</h2>
                        <div className="h-px bg-zinc-200 flex-1"></div>
                    </div>

                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-blue-900">Journal & Updates</h3>
                                <p className="text-xs text-blue-600 mt-0.5">
                                    Track your body's response or add corrections.
                                </p>
                            </div>
                            {!isAddingEntry && (
                                <button
                                    onClick={() => setIsAddingEntry(true)}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors print:hidden"
                                >
                                    Add Entry
                                </button>
                            )}
                        </div>

                        {/* Entry Form */}
                        {isAddingEntry && (
                            <div className="mb-6 bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                                <textarea
                                    value={journalEntry}
                                    onChange={(e) => setJournalEntry(e.target.value)}
                                    placeholder="How are you feeling? Any updates?"
                                    className="w-full min-h-[80px] p-2 mb-2 rounded border border-zinc-200 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setIsAddingEntry(false);
                                            setJournalEntry("");
                                            setEditingEntryId(null);
                                        }}
                                        className="text-xs font-medium text-zinc-600 hover:text-zinc-800 px-3 py-1.5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddJournalEntry}
                                        disabled={!journalEntry.trim()}
                                        className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {editingEntryId ? "Update Entry" : "Post Entry"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Log Stream */}
                        <div className="space-y-4">
                            {session.postSessionLog && session.postSessionLog.filter((e: PostSessionEntry) => e.type === 'journal' || e.type === 'correction' || e.type === 'addendum').length > 0 ? (
                                session.postSessionLog
                                    .filter((e: PostSessionEntry) => e.type === 'journal' || e.type === 'correction' || e.type === 'addendum')
                                    .sort((a: PostSessionEntry, b: PostSessionEntry) => b.timestamp - a.timestamp)
                                    .map((entry: PostSessionEntry) => (
                                        <div key={entry.id} className="relative pl-4 border-l-2 border-blue-200 group">
                                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-blue-400"></div>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs font-bold uppercase tracking-wider ${entry.type === 'correction' || entry.type === 'addendum' ? 'text-amber-600' : 'text-blue-700'
                                                    }`}>
                                                    {entry.type === 'journal' ? 'Journal Entry' : 'Correction / Addendum'}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-zinc-400">
                                                        {new Date(entry.timestamp).toLocaleString(undefined, {
                                                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                                        })}
                                                    </span>
                                                    <button
                                                        onClick={() => handleEditEntry(entry)}
                                                        className="text-zinc-400 hover:text-blue-500 transition-colors print:hidden"
                                                        title="Edit Entry"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(entry.id)}
                                                        className="text-zinc-400 hover:text-red-500 transition-colors print:hidden"
                                                        title="Delete Entry"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{entry.content}</p>
                                        </div>
                                    ))
                            ) : (
                                !isAddingEntry && (
                                    <p className="text-sm text-zinc-500 italic text-center py-4">No journal entries yet.</p>
                                )
                            )}
                        </div>
                    </div>
                </section>

                {/* Session History (Update Logs) */}
                {session.postSessionLog && session.postSessionLog.some((e: PostSessionEntry) => e.type !== 'journal' && e.type !== 'correction' && e.type !== 'addendum') && (
                    <section className="break-inside-avoid pt-4 border-t border-zinc-100">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Session History</h3>
                        <div className="space-y-2">
                            {session.postSessionLog
                                .filter((e: PostSessionEntry) => e.type !== 'journal' && e.type !== 'correction' && e.type !== 'addendum')
                                .sort((a: PostSessionEntry, b: PostSessionEntry) => b.timestamp - a.timestamp)
                                .map((entry: PostSessionEntry) => (
                                    <div key={entry.id} className="flex items-center gap-2 text-xs text-zinc-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{entry.content}</span>
                                        <span className="text-zinc-400">• {new Date(entry.timestamp).toLocaleString()}</span>
                                    </div>
                                ))}
                        </div>
                    </section>
                )}
            </div>
            {/* Footer */}
            <footer className="pt-8 border-t border-zinc-100 text-center">
                <p className="text-[10px] text-zinc-400">
                    Disclaimer: This is a user-owned personal log and does not replace the official legal health documentation maintained by the provider.
                    Generated by ChiroCard on {new Date().toLocaleDateString()}.
                </p>
            </footer>

            {/* Add to Bodywork Routine Modal */}
            <BodyworkRoutineModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmAdd}
                initialValues={modalInitialValues}
                title="Add to Bodywork Routine"
                description="Customize this recommendation for your calendar."
                confirmLabel="Add Routine"
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Entry"
                description="Are you sure you want to delete this journal entry? This cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleConfirmDelete}
                variant="danger"
            />
        </div>
    );
}
