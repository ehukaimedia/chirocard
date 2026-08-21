import { describe, it, expect, vi, beforeEach } from 'vitest'

const getUser = vi.fn()
const init = vi.fn()

vi.mock('../db/storage', () => ({
    database: {
        init: (...args: unknown[]) => init(...args),
        get: () => ({
            getUser: (...args: unknown[]) => getUser(...args),
            saveUser: vi.fn(),
            getPractitioners: vi.fn(),
            savePractitioner: vi.fn(),
            deletePractitioner: vi.fn(),
            getSessions: vi.fn(),
            getSession: vi.fn(),
            saveSession: vi.fn(),
            deleteSession: vi.fn(),
            getAppointments: vi.fn(),
            saveAppointment: vi.fn(),
            deleteAppointment: vi.fn(),
            getRoutines: vi.fn(),
            saveRoutine: vi.fn(),
            deleteRoutine: vi.fn(),
            getRoutineCompletions: vi.fn(),
            saveRoutineCompletion: vi.fn(),
            deleteRoutineCompletion: vi.fn(),
            getJournalEntries: vi.fn(),
            saveJournalEntry: vi.fn(),
            deleteJournalEntry: vi.fn(),
            clearDatabase: vi.fn(),
        }),
    },
}))

describe('useDataStore.initialize', () => {
    beforeEach(() => {
        vi.resetModules()
        getUser.mockReset()
        init.mockReset()
        init.mockResolvedValue(undefined)
        getUser.mockResolvedValue({ id: 'me', name: 'Ada' })
    })

    it('loads only the user profile, not the full record set', async () => {
        const { useDataStore } = await import('./useDataStore')
        await useDataStore.getState().initialize()

        expect(init).toHaveBeenCalledTimes(1)
        expect(getUser).toHaveBeenCalledTimes(1)
        expect(useDataStore.getState().initialized).toBe(true)
        expect(useDataStore.getState().user?.name).toBe('Ada')
        expect(useDataStore.getState().sessions).toEqual([])
    })

    it('coalesces concurrent initialize calls', async () => {
        let resolveUser!: (value: { id: string; name: string }) => void
        getUser.mockImplementation(() => new Promise((resolve) => {
            resolveUser = resolve
        }))

        const { useDataStore } = await import('./useDataStore')
        const first = useDataStore.getState().initialize()
        await vi.waitFor(() => expect(getUser).toHaveBeenCalled())
        const second = useDataStore.getState().initialize()
        resolveUser({ id: 'me', name: 'Ada' })
        await Promise.all([first, second])

        expect(init).toHaveBeenCalledTimes(1)
        expect(getUser).toHaveBeenCalledTimes(1)
    })

    it('does not re-fetch after a successful init', async () => {
        const { useDataStore } = await import('./useDataStore')
        await useDataStore.getState().initialize()
        await useDataStore.getState().initialize()
        expect(getUser).toHaveBeenCalledTimes(1)
    })
})
