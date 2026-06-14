export interface PlaceResult {
    place_id: string;
    lat: string;
    lon: string;
    display_name: string;
    name?: string;
    address: {
        amenity?: string;
        shop?: string;
        office?: string;
        building?: string;
        house_number?: string;
        road?: string;
        suburb?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
}

interface PhotonFeature {
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: {
        osm_type: string;
        osm_id: number;
        name?: string;
        housenumber?: string;
        street?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
}

function toPlaceResult(feature: PhotonFeature): PlaceResult {
    const p = feature.properties;
    const streetPart = [p.housenumber, p.street].filter(Boolean).join(' ');
    const display_name = [p.name, streetPart, p.city, p.state, p.country]
        .filter(Boolean)
        .join(', ');
    return {
        place_id: `${p.osm_type}-${p.osm_id}`,
        lat: feature.geometry.coordinates[1].toString(),
        lon: feature.geometry.coordinates[0].toString(),
        display_name,
        name: p.name,
        address: {
            house_number: p.housenumber,
            road: p.street,
            city: p.city,
            state: p.state,
            postcode: p.postcode,
            country: p.country,
        },
    };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
    if (!query || query.length < 3) return [];

    try {
        // Only the typed query is sent — no device location/GPS (privacy boundary).
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en`;

        const response = await fetch(url, { signal });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json() as { features: PhotonFeature[] };
        return data.features.map(toPlaceResult);
    } catch {
        return [];
    }
}
