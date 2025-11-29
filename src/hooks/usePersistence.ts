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
                    console.log("Storage persistence enabled.");
                } else {
                    console.log("Storage persistence not granted by browser.");
                }
            } catch (error) {
                console.error("Error requesting persistence:", error);
            }
        }
        initPersistence();
    }, []);

    return isPersisted;
}
