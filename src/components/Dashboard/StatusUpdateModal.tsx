import { useState, useEffect } from "react";
import { useDataStore } from "../../store/useDataStore";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface StatusUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StatusUpdateModal({ isOpen, onClose }: StatusUpdateModalProps) {
    const { user, saveUser } = useDataStore();
    // const user = useLiveQuery(() => db.users.get("me"));
    const [statusText, setStatusText] = useState("");

    useEffect(() => {
        if (user?.primaryComplaints) {
            queueMicrotask(() => {
                setStatusText(user.primaryComplaints.join(", "));
            });
        }
    }, [user, isOpen]);

    const handleSave = async () => {
        if (!user) return;

        // Split by comma, trim whitespace, and filter out empty strings
        const newComplaints = statusText
            .split(",")
            .map(s => s.trim())
            .filter(s => s.length > 0);

        await saveUser({
            ...user,
            primaryComplaints: newComplaints
        });

        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Update Status"
            description="Update your current primary complaints or focus areas. Separate multiple items with commas."
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Current Status / Active Focus
                    </label>
                    <textarea
                        id="status"
                        value={statusText}
                        onChange={(e) => setStatusText(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                        rows={3}
                        placeholder="e.g. Lower Back Pain, Neck Stiffness"
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Save Update
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
