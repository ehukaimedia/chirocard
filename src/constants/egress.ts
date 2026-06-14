/**
 * The complete list of third parties this app may contact, and why.
 *
 * This is the single source of truth for the data-egress boundary
 * (docs/playgrounds/specs/data-egress-boundary.html). It drives both the
 * Content-Security-Policy connect-src allowlist and the Privacy page's
 * "Third-Party Services" section, so documentation and enforcement cannot drift.
 *
 * Health records never appear here — they stay in IndexedDB. Every entry below
 * is either opt-in (analytics) or fired only by an explicit user action
 * (address search).
 */

export interface EgressEntry {
    /** Connectable origin, for the CSP connect-src/script-src allowlist. */
    readonly origin: string;
    /** Human-readable purpose, shown verbatim on the Privacy page. */
    readonly purpose: string;
    /** Whether this egress requires explicit opt-in consent. */
    readonly consentGated: boolean;
}

export const EGRESS_ALLOWLIST: readonly EgressEntry[] = [
    {
        origin: "https://www.googletagmanager.com",
        purpose: "Anonymous usage analytics (Google Tag Manager / GA4). Opt-in only; no health records or practitioner names are sent.",
        consentGated: true,
    },
    {
        origin: "https://photon.komoot.io",
        purpose: "Address search for clinic lookup (OpenStreetMap / Photon). Sends only the typed address text; no device location.",
        consentGated: false,
    },
] as const;
