import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setConsent } from '../lib/consent'

// GATE-1 of the data-egress boundary: with consent unset/denied, NO analytics
// loads and NO event is sent. analytics.ts reads import.meta.env.VITE_GTM_ID at
// module load and keeps a module-level "injected" flag, so each test stubs the
// env and re-imports the module fresh via vi.resetModules().

function removeInjectedScripts() {
    document.querySelectorAll('script[src*="googletagmanager.com"]').forEach((s) => s.remove())
}

describe('analytics — consent-gated (GATE-1)', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.resetModules()
        removeInjectedScripts()
        window.dataLayer = []
    })

    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it('trackEvent is a no-op when consent is unset', async () => {
        vi.stubEnv('VITE_GTM_ID', 'GTM-TEST')
        const { trackEvent } = await import('./analytics')
        window.dataLayer = []
        trackEvent('begin_session', { type: 'new' })
        expect(window.dataLayer.length).toBe(0)
    })

    it('trackEvent is a no-op when consent is denied', async () => {
        vi.stubEnv('VITE_GTM_ID', 'GTM-TEST')
        setConsent('denied')
        const { trackEvent } = await import('./analytics')
        window.dataLayer = []
        trackEvent('complete_session')
        expect(window.dataLayer.length).toBe(0)
    })

    it('trackEvent pushes the event only after consent is granted', async () => {
        vi.stubEnv('VITE_GTM_ID', 'GTM-TEST')
        setConsent('granted')
        const { trackEvent } = await import('./analytics')
        window.dataLayer = []
        trackEvent('complete_session')
        expect(window.dataLayer).toContainEqual({ event: 'complete_session' })
    })

    it('loadAnalytics does NOT inject GTM without consent', async () => {
        vi.stubEnv('VITE_GTM_ID', 'GTM-TEST')
        const { loadAnalytics } = await import('./analytics')
        loadAnalytics()
        expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull()
    })

    it('loadAnalytics injects the GTM container (from env) once consent is granted', async () => {
        vi.stubEnv('VITE_GTM_ID', 'GTM-TEST')
        setConsent('granted')
        const { loadAnalytics } = await import('./analytics')
        loadAnalytics()
        const script = document.querySelector('script[src*="googletagmanager.com"]')
        expect(script).not.toBeNull()
        expect(script?.getAttribute('src')).toContain('id=GTM-TEST')
    })

    it('does not inject when VITE_GTM_ID is unset, even with consent', async () => {
        vi.stubEnv('VITE_GTM_ID', '')
        setConsent('granted')
        const { loadAnalytics } = await import('./analytics')
        loadAnalytics()
        expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull()
    })
})
