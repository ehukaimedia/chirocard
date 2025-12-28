const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Usage Capping Logic
 * To stay within Google's free thresholds (approx 10,000/mo).
 */
const USAGE_LIMIT = 9500; // Safety margin
const USAGE_KEY = 'google_places_usage_count';
const MONTH_KEY = 'google_places_usage_month';

function checkUsage(): boolean {
    const currentMonth = new Date().getMonth();
    const storedMonth = localStorage.getItem(MONTH_KEY);

    if (storedMonth === null || parseInt(storedMonth) !== currentMonth) {
        localStorage.setItem(MONTH_KEY, currentMonth.toString());
        localStorage.setItem(USAGE_KEY, '0');
        return true;
    }

    const count = parseInt(localStorage.getItem(USAGE_KEY) || '0');
    return count < USAGE_LIMIT;
}

function incrementUsage() {
    const count = parseInt(localStorage.getItem(USAGE_KEY) || '0');
    localStorage.setItem(USAGE_KEY, (count + 1).toString());
}

export interface GooglePlace {
    id: string;
    displayName: {
        text: string;
    };
    formattedAddress: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    types?: string[];
    location: {
        latitude: number;
        longitude: number;
    };
    editorialSummary?: {
        text: string;
    };
}

/**
 * Searches for places using Google Places API (New) Text Search.
 */
export async function searchPlaces(query: string, location?: { lat: number; lon: number }): Promise<GooglePlace[]> {
    if (!API_KEY) {
        console.warn("Google Maps API Key missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.");
        return [];
    }
    if (!query || query.length < 2) return [];
    if (!checkUsage()) {
        console.warn("Google Places usage limit reached for this month.");
        return [];
    }

    try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.types'
            },
            body: JSON.stringify({
                textQuery: query,
                locationBias: location ? {
                    circle: {
                        center: { latitude: location.lat, longitude: location.lon },
                        radius: 10000 // 10km bias
                    }
                } : undefined
            })
        });

        if (!response.ok) throw new Error('Google Places search failed');
        incrementUsage();
        const data = await response.json();
        return data.places || [];
    } catch (error) {
        console.error("Google Places search error:", error);
        return [];
    }
}

/**
 * Fetches detailed information for a specific place.
 */
export async function getPlaceDetails(placeId: string): Promise<GooglePlace | null> {
    if (!API_KEY) return null;
    if (!checkUsage()) return null;

    try {
        const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY,
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,rating,userRatingCount,editorialSummary,types,location'
            }
        });

        if (!response.ok) throw new Error('Google Place details failed');
        incrementUsage();
        return await response.json();
    } catch (error) {
        console.error("Google Place details error:", error);
        return null;
    }
}

/**
 * Searches for nearby practitioners based on location.
 */
export async function searchNearby(location: { lat: number; lon: number }, radiusKm: number = 5): Promise<GooglePlace[]> {
    if (!API_KEY) return [];
    if (!checkUsage()) return [];

    try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.types'
            },
            body: JSON.stringify({
                includedTypes: ["chiropractor", "physiotherapist", "massage"],
                locationRestriction: {
                    circle: {
                        center: { latitude: location.lat, longitude: location.lon },
                        radius: radiusKm * 1000
                    }
                }
            })
        });

        if (!response.ok) throw new Error('Google Nearby search failed');
        incrementUsage();
        const data = await response.json();
        return data.places || [];
    } catch (error) {
        console.error("Google Nearby search error:", error);
        return [];
    }
}
