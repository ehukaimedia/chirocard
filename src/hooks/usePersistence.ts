import { useEffect, useState } from 'react';

export type PersistenceStatus = 'unknown' | 'granted' | 'denied';

export function usePersistence(): PersistenceStatus {
    const [status, setStatus] = useState<PersistenceStatus>('unknown');

    useEffect(() => {
        async function initPersistence() {
            if (!navigator.storage || !navigator.storage.persist) {
                setStatus('denied');
                return;
            }

            try {
                let persisted = await navigator.storage.persisted();
                if (!persisted) {
                    persisted = await navigator.storage.persist();
                }
                setStatus(persisted ? 'granted' : 'denied');
            } catch {
                setStatus('denied');
            }
        }
        initPersistence();
    }, []);

    return status;
}
