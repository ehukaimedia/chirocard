/**
 * Single source of truth for the user's analytics-consent choice.
 *
 * ChiroCard is local-first: health records never leave the device. Off-device
 * behavioral telemetry (Google Tag Manager / GA4) is OPT-IN only — nothing is
 * loaded or sent until the user explicitly grants consent here.
 *
 * State is persisted in localStorage so the choice survives reloads. The
 * analytics loader (`src/utils/analytics.ts`) reads `hasConsent()` and never
 * runs while the state is "unset" or "denied".
 */

export type ConsentState = "unset" | "granted" | "denied";

const STORAGE_KEY = "cc_analytics_consent";

export function getConsent(): ConsentState {
    if (typeof localStorage === "undefined") return "unset";
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : "unset";
}

export function setConsent(state: Exclude<ConsentState, "unset">): void {
    try {
        localStorage.setItem(STORAGE_KEY, state);
    } catch {
        /* storage unavailable (private mode) — treat as session-only */
    }
}

export function hasConsent(): boolean {
    return getConsent() === "granted";
}
