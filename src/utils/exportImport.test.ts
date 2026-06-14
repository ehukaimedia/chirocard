import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { exportDB, importDB } from 'dexie-export-import'
import { describe, it, expect, beforeEach } from 'vitest'
import { ChiroCardDB } from '../db/db'

// dexie-export-import (used by Settings / DataManagement) is the user's ONLY
// backup path — the Privacy page tells users they are responsible for backups.
// A broken export or a silent partial import means permanent data loss.

describe('export / import round-trip', () => {
    beforeEach(async () => {
        await Dexie.delete('ChiroCardDB')
    })

    it('export -> wipe -> import restores the data', async () => {
        const db = new ChiroCardDB()
        await db.open()
        await db.journal.add({ id: 'j1', date: 1, content: 'felt good', createdAt: 1 })
        await db.routines.add({
            id: 'r1',
            title: 'Stretch',
            frequency: 'daily',
            category: 'movement',
            isCompletedToday: false,
            status: 'active',
            createdAt: 1,
        })
        const blob = await exportDB(db)
        db.close()

        // Simulate a new device / cleared storage, then restore from the backup.
        await Dexie.delete('ChiroCardDB')
        const restored = await importDB(blob)

        const journal = await restored.table('journal').toArray()
        const routines = await restored.table('routines').toArray()
        expect(journal).toHaveLength(1)
        expect(journal[0].content).toBe('felt good')
        expect(routines).toHaveLength(1)
        expect(routines[0].title).toBe('Stretch')
        restored.close()
    })

    it('rejects a corrupted backup cleanly (no silent partial restore)', async () => {
        const badBlob = new Blob(['{ this is not a valid dexie export }'], {
            type: 'application/json',
        })
        await expect(importDB(badBlob)).rejects.toBeTruthy()
    })

    it('rejects an empty backup file cleanly', async () => {
        const emptyBlob = new Blob([''], { type: 'application/json' })
        await expect(importDB(emptyBlob)).rejects.toBeTruthy()
    })
})
