import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Session, type RoutineCompletion, type JournalEntry } from "../db/db";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { AddJournalModal } from "../components/Journal/AddJournalModal";

type JournalItem =
    | (Session & { type: 'session', sortDate: number })
    | (RoutineCompletion & { type: 'routine', sortDate: number })
    | (JournalEntry & { type: 'note', sortDate: number });

export default function Journal() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'sessions' | 'routines' | 'notes'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const sessions = useLiveQuery(() => db.sessions.orderBy('date').reverse().toArray());
    // We need to fetch routine completions and journal entries too
    const routineCompletions = useLiveQuery(() => db.routineCompletions.orderBy('completedAt').reverse().toArray());
    const journalEntries = useLiveQuery(() => db.journal.orderBy('date').reverse().toArray());

    // Combine and sort all items for the "All" view
    const allItems: JournalItem[] = [
        ...(sessions || []).map(s => ({ ...s, type: 'session' as const, sortDate: s.date })),
        ...(routineCompletions || []).map(r => ({ ...r, type: 'routine' as const, sortDate: r.completedAt })),
        ...(journalEntries || []).map(j => ({ ...j, type: 'note' as const, sortDate: j.date }))
    ].sort((a, b) => b.sortDate - a.sortDate);

    const filteredItems = allItems.filter(item => {
        if (activeTab === 'sessions' && item.type !== 'session') return false;
        if (activeTab === 'routines' && item.type !== 'routine') return false;
        if (activeTab === 'notes' && item.type !== 'note') return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (item.type === 'session') {
                return (item.practitionerName || "").toLowerCase().includes(query) ||
                    (item.notes || "").toLowerCase().includes(query);
            } else if (item.type === 'routine') {
                return (item.routineTitle || "").toLowerCase().includes(query);
            } else if (item.type === 'note') {
                return (item.content || "").toLowerCase().includes(query);
            }
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 pb-24">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 hidden md:flex items-center px-6 z-50">
                <Button variant="ghost" onClick={() => navigate("/")} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Dashboard
                </Button>
            </nav>

            <div className="md:mt-16 mb-8 pt-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Bodywork Journal</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Track your sessions, routines, and progress.</p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <BookOpen className="w-4 h-4 mr-2" /> New Entry
                    </Button>
                </div>

                {/* Search and Filter */}
                <div className="space-y-4 mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Search journal..."
                            className="pl-9 bg-white dark:bg-zinc-900"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['all', 'sessions', 'routines', 'notes'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as 'all' | 'sessions' | 'routines' | 'notes')}
                                className={`
                                    px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                    ${activeTab === tab
                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'}
                                `}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item: JournalItem) => (
                            <div key={`${item.type}-${item.id}`} className="relative pl-8 before:absolute before:left-3 before:top-8 before:bottom-0 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800 last:before:hidden">
                                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 z-10
                                    ${item.type === 'session' ? 'border-blue-500 text-blue-500' :
                                        item.type === 'routine' ? 'border-emerald-500 text-emerald-500' :
                                            'border-purple-500 text-purple-500'}
                                `}>
                                    <div className={`w-2 h-2 rounded-full ${item.type === 'session' ? 'bg-blue-500' :
                                        item.type === 'routine' ? 'bg-emerald-500' :
                                            'bg-purple-500'
                                        }`} />
                                </div>

                                <Card className="p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => {
                                    if (item.type === 'session') navigate(`/session/${item.id}`);
                                }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                {item.type === 'session' ? 'Session' : item.type === 'routine' ? 'Routine Completed' : 'Journal Entry'}
                                            </span>
                                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                                                {item.type === 'session' ? item.practitionerName :
                                                    item.type === 'routine' ? item.routineTitle :
                                                        new Date(item.date).toLocaleDateString()}
                                            </h3>
                                        </div>
                                        <span className="text-xs text-zinc-400">
                                            {new Date(item.sortDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {item.type === 'session' && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                            {item.notes}
                                        </p>
                                    )}
                                    {item.type === 'note' && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                                            {item.content}
                                        </p>
                                    )}
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-zinc-500">No entries found.</p>
                        </div>
                    )}
                </div>
            </div>

            <AddJournalModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}
