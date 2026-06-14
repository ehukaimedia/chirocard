import { describe, it, expect, beforeEach } from 'vitest'
import { getConsent, setConsent, hasConsent } from './consent'

describe('consent', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('defaults to "unset" when nothing is stored', () => {
        expect(getConsent()).toBe('unset')
        expect(hasConsent()).toBe(false)
    })

    it('persists granted consent', () => {
        setConsent('granted')
        expect(getConsent()).toBe('granted')
        expect(hasConsent()).toBe(true)
    })

    it('persists denied consent and is not granted', () => {
        setConsent('denied')
        expect(getConsent()).toBe('denied')
        expect(hasConsent()).toBe(false)
    })

    it('treats an unrecognized stored value as "unset"', () => {
        localStorage.setItem('cc_analytics_consent', 'maybe')
        expect(getConsent()).toBe('unset')
        expect(hasConsent()).toBe(false)
    })
})
