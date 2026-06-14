import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { describe, it, expect, beforeEach } from 'vitest'
import { ChiroCardDB } from './db'

// The v17 upgrade (db.ts) converts routines from auto-increment numeric ids to
// string UUIDs and rewrites routineCompletions.routineId. A bug here corrupts a
// patient's only copy of their record, so this is the highest-value gate.

// Pre-v17 schema: same keyPaths as v17 (the upgrade migrates numeric id VALUES
// under the existing `id` keyPath to UUIDs — it does not change the keyPath,
// which IndexedDB forbids).
const LEGACY_STORES_V16 = {
    users: 'id',
    practitioners: 'id, name, role, order',
    sessions: 'id, date, practitionerId',
    bodyLogs: '++id, timestamp, status',
    appointments: '++id, date, practitionerId, status',
    routines: 'id, isCompletedToday, status',
    routineCompletions: 'id, routineId, date, completedAt',
    journal: 'id, date',
}

async function seedLegacyDb() {
    const legacy = new Dexie('ChiroCardDB')
    legacy.version(16).stores(LEGACY_STORES_V16)
    await legacy.open()
    // A legacy routine whose `id` field holds a NUMBER (what the upgrade detects).
    const numericId = 12345
    await legacy.table('routines').add({
        id: numericId,
        title: 'Ice Lower Back',
        frequency: 'daily',
        category: 'relief',
        isCompletedToday: false,
        status: 'active',
        createdAt: 1,
    })
    await legacy.table('routineCompletions').add({
        id: 'comp-1',
        routineId: String(numericId),
        routineTitle: 'Ice Lower Back',
        completedAt: 1,
        date: '2026-01-01',
    })
    await legacy.table('users').add({ id: 'me', name: 'Pat' })
    legacy.close()
    return { numericId }
}

describe('Dexie v17 migration (numeric routine ids -> UUIDs)', () => {
    beforeEach(async () => {
        // Dexie captures the indexedDB factory at import, so reassigning the
        // global won't reset it — delete the named DB between tests instead.
        await Dexie.delete('ChiroCardDB')
    })

    it('upgrades legacy numeric routine ids to string UUIDs without losing data', async () => {
        const { numericId } = await seedLegacyDb()

        const db = new ChiroCardDB()
        await db.open()

        const routines = await db.routines.toArray()
        expect(routines).toHaveLength(1)
        const r = routines[0]
        expect(typeof r.id).toBe('string')
        expect(r.id).not.toBe(String(numericId))
        // Non-id fields are preserved through the migration.
        expect(r.title).toBe('Ice Lower Back')
        expect(r.status).toBe('active')
        expect(r.category).toBe('relief')

        // The completion's foreign key was rewritten to the new UUID.
        const comps = await db.routineCompletions.toArray()
        expect(comps).toHaveLength(1)
        expect(comps[0].routineId).toBe(r.id)

        // Unrelated tables are untouched.
        const user = await db.users.get('me')
        expect(user?.name).toBe('Pat')

        db.close()
    })

    it('is idempotent: reopening does not re-migrate or change the UUID', async () => {
        await seedLegacyDb()

        const first = new ChiroCardDB()
        await first.open()
        const idAfterMigration = (await first.routines.toArray())[0].id
        first.close()

        const second = new ChiroCardDB()
        await second.open()
        const routines = await second.routines.toArray()
        expect(routines).toHaveLength(1)
        expect(routines[0].id).toBe(idAfterMigration)
        second.close()
    })

    it('a fresh v17 database starts empty with no migration error', async () => {
        const db = new ChiroCardDB()
        await db.open()
        expect(await db.routines.count()).toBe(0)
        expect(db.verno).toBe(17)
        db.close()
    })
})
