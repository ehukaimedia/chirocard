/**
 * The complete list of third parties this app may contact, and why.
 *
 * The single source of truth for the data-egress boundary. The Privacy page
 * (src/pages/Privacy.tsx) renders its "Third-Party Services" list directly from
 * this array, so the user-facing disclosure cannot drift from the code. The
 * Content-Security-Policy in public/_headers is kept in sync by hand (a static
 * header file can't import this module) — see the note on EGRESS_ALLOWLIST below.
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

// IMPORTANT: this list is mirrored by the `connect-src` (and `script-src`)
// directives in `public/_headers`. Keep the two in sync by hand — if you add an
// origin here, add it to the CSP, and vice versa. (The Privacy page consumes this
// array directly, so its disclosure stays in sync automatically.)
// GA4 collects via regional hosts, so the CSP additionally allows the
// `*.google-analytics.com` / `*.analytics.google.com` wildcards of the canonical
// origin listed below.
export const EGRESS_ALLOWLIST: readonly EgressEntry[] = [
    {
        origin: "https://www.googletagmanager.com",
        purpose: "Anonymous usage analytics — Google Tag Manager loader. Opt-in only; no health records or practitioner names are sent.",
        consentGated: true,
    },
    {
        origin: "https://www.google-analytics.com",
        purpose: "Anonymous usage analytics — GA4 measurement collection (regional hosts under *.google-analytics.com / *.analytics.google.com). Opt-in only.",
        consentGated: true,
    },
    {
        origin: "https://photon.komoot.io",
        purpose: "Address search for clinic lookup (OpenStreetMap / Photon). Sends only the typed address text; no device location.",
        consentGated: false,
    },
] as const;
