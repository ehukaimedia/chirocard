import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Session } from "../db/db";
import { Button } from "../components/ui/Button";
import { SessionCard } from "../components/Dashboard/SessionCard";
import { Modal } from "../components/ui/Modal";
import { ArrowLeft, History as HistoryIcon, Search } from "lucide-react";
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
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <HistoryIcon className="w-6 h-6" />
                        Session History
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Your complete record of body work sessions.
                    </p>
                </div>
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
