import { useState, useEffect } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let loadPromise: Promise<void> | null = null;

export function useGoogleMapsScript() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);

    useEffect(() => {
        if ((window as any).google?.maps?.places) {
            setIsLoaded(true);
            return;
        }

        if (!loadPromise) {
            loadPromise = new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
                script.async = true;
                script.defer = true;
                script.onload = () => resolve();
                script.onerror = (err) => reject(err);
                document.head.appendChild(script);
            });
        }

        loadPromise
            .then(() => setIsLoaded(true))
            .catch((err) => setLoadError(err));
    }, []);

    return { isLoaded, loadError };
}
