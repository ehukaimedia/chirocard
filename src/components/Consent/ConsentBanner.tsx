import { useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, setConsent } from "../../lib/consent";
import { loadAnalytics } from "../../utils/analytics";

/**
 * Opt-in analytics banner. Shown once while consent is "unset". Health data is
 * never affected by this choice — it only governs anonymous usage analytics,
 * which load lazily on "Allow" (see src/utils/analytics.ts).
 */
export function ConsentBanner() {
    const [visible, setVisible] = useState(() => getConsent() === "unset");

    if (!visible) return null;

    const choose = (granted: boolean) => {
        setConsent(granted ? "granted" : "denied");
        if (granted) loadAnalytics();
        setVisible(false);
    };

    return (
        <div
            role="dialog"
            aria-label="Analytics consent"
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md
                       rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800
                       shadow-xl p-4"
        >
            <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">
                Your health records stay on this device. May we collect{" "}
                <strong>anonymous</strong> usage analytics to improve the app? No personal or health
                data is ever sent.{" "}
                <Link to="/privacy" className="text-emerald-600 dark:text-emerald-400 underline">
                    Learn more
                </Link>
            </p>
            <div className="mt-3 flex gap-2 justify-end">
                <button
                    type="button"
                    onClick={() => choose(false)}
                    className="px-4 py-2 text-sm font-medium rounded-xl text-zinc-600 dark:text-zinc-300
                               hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                    Decline
                </button>
                <button
                    type="button"
                    onClick={() => choose(true)}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 text-white
                               hover:bg-emerald-700 transition-colors"
                >
                    Allow
                </button>
            </div>
        </div>
    );
}
