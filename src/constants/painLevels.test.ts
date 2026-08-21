import { describe, it, expect } from 'vitest'
import { painLevelClass, PAIN_LEVEL_CLASSES } from './painLevels'

describe('painLevelClass', () => {
    it('clamps to the 0–10 token ramp', () => {
        expect(painLevelClass(-3)).toBe(PAIN_LEVEL_CLASSES[0])
        expect(painLevelClass(0)).toBe(PAIN_LEVEL_CLASSES[0])
        expect(painLevelClass(10)).toBe(PAIN_LEVEL_CLASSES[10])
        expect(painLevelClass(99)).toBe(PAIN_LEVEL_CLASSES[10])
    })

    it('uses dark text on pale steps and light text on severe reds', () => {
        expect(PAIN_LEVEL_CLASSES[2]).toContain('text-sky-950')
        expect(PAIN_LEVEL_CLASSES[4]).toContain('text-amber-950')
        expect(PAIN_LEVEL_CLASSES[7]).toContain('text-white')
        expect(PAIN_LEVEL_CLASSES[10]).toContain('text-white')
    })
})
