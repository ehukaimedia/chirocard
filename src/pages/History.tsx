import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Session } from "../db/db";

import { SessionCard } from "../components/Dashboard/SessionCard";
import { Modal } from "../components/ui/Modal";
import { ChevronLeft, History as HistoryIcon, Search } from "lucide-react";
import { Input } from "../components/ui/Input";

export default function History() {
    const navigate = useNavigate();
    const sessions = useLiveQuery(() => db.sessions.orderBy("date").reverse().toArray());
    const [searchTerm, setSearchTerm] = useState("");
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

    const filteredSessions = sessions?.filter(session =>
        session.practitionerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.practitionerClass.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 hidden md:flex items-center px-6 z-50">
                <button
                    onClick={() => navigate("/")}
                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Return to Dashboard
                </button>
            </nav>

            {/* Header Content */}
            <div className="md:mt-16 mb-8 pt-6">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <HistoryIcon className="w-6 h-6" />
                    Session History
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Your complete record of body work sessions.
                </p>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                    placeholder="Search by practitioner or notes..."
                    className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Session List */}
            <div className="space-y-4 max-w-md mx-auto">
                {filteredSessions?.map((session: Session) => (
                    <SessionCard
                        key={session.id}
                        session={session}
                        onDelete={handleDeleteClick}
                    />
                ))}

                {filteredSessions?.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-zinc-500">No sessions found.</p>
                    </div>
                )}
            </div>

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
