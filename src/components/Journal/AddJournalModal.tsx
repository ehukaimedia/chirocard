import { useState } from "react";
import { Modal } from "../ui/Modal";
import { db } from "../../db/db";

interface AddJournalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddJournalModal({ isOpen, onClose }: AddJournalModalProps) {
    const [content, setContent] = useState("");
    const [mood, setMood] = useState<'Great' | 'Good' | 'Okay' | 'Bad' | 'Awful' | null>(null);

    const handleSave = async () => {
        if (!content.trim()) return;

        await db.journal.add({
            id: crypto.randomUUID(),
            date: Date.now(),
            content: content,
            mood: mood || undefined,
            createdAt: Date.now()
        });

        setContent("");
        setMood(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="New Journal Entry"
            description="Record your thoughts, feelings, or progress."
            confirmLabel="Save Entry"
            cancelLabel="Cancel"
            onConfirm={handleSave}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        How are you feeling?
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['Great', 'Good', 'Okay', 'Bad', 'Awful'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMood(m as any)}
                                className={`
                                    px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                                    ${mood === m
                                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900'
                                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'}
                                `}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Notes
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write about your bodywork journey..."
                        className="w-full min-h-[150px] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                </div>
            </div>
        </Modal>
    );
}
