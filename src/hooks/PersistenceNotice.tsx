import { useState } from "react";
import { usePersistence } from "./usePersistence";

export function PersistenceNotice() {
    const status = usePersistence();
    const [dismissed, setDismissed] = useState(false);

    if (status !== "denied" || dismissed) return null;

    return (
        <div
            role="status"
            className="px-4 py-3 bg-amber-50 text-amber-950 text-sm text-center border-b border-amber-200"
        >
            This browser may clear your health record if storage is low.{" "}
            Export a backup from Settings.
            <button
                type="button"
                className="ml-3 font-medium underline"
                onClick={() => setDismissed(true)}
            >
                Dismiss
            </button>
        </div>
    );
}
