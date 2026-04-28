import { useEffect, useState } from 'react';

export function usePersistence() {
    const [isPersisted, setIsPersisted] = useState(false);

    useEffect(() => {
        async function initPersistence() {
            if (!navigator.storage || !navigator.storage.persist) return;

            try {
                let persisted = await navigator.storage.persisted();
                if (!persisted) {
                    persisted = await navigator.storage.persist();
                }
                setIsPersisted(persisted);
                if (persisted) {
                    /* Persistence granted */
                } else {
                    /* Persistence not granted */
                }
            } catch {
                /* Persistence request failed */
            }
        }
        initPersistence();
    }, []);

    return isPersisted;
}
