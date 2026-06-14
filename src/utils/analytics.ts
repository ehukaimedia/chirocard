import { hasConsent } from "../lib/consent";

/**
 * Consent-gated analytics. Google Tag Manager is loaded ONLY after the user
 * opts in (see src/lib/consent.ts), the container id comes from the build-time
 * env (`VITE_GTM_ID`) rather than being hardcoded, and `trackEvent` is a no-op
 * until consent is granted. Absent `VITE_GTM_ID`, analytics is simply off.
 *
 * Payloads are minimized: no record-derived identifiers (practitioner names,
 * routine titles) are sent — only non-identifying event names and categories.
 */

const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;
let injected = false;

declare global {
    interface Window {
        dataLayer: unknown[];
    }
}

/** Inject the GTM container exactly once. Call only after consent is granted. */
export function loadAnalytics(): void {
    if (injected || typeof window === "undefined" || !GTM_ID) return;
    if (!hasConsent()) return;
    injected = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
    document.head.appendChild(script);
}

export const trackEvent = (
    eventName: 'begin_session' | 'complete_session' | 'update_profile' | 'view_promotion' | 'generate_lead' | 'complete_routine' | 'print_report' | 'add_routine_to_calendar' | 'add_practitioner',
    params?: Record<string, string | number | boolean | undefined>
) => {
    if (!hasConsent()) return;
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
            event: eventName,
            ...params
        });
    }
};
