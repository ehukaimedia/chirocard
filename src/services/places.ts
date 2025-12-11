export interface PlaceResult {
    place_id: number;
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

export async function searchPlaces(query: string, location?: { lat: number; lon: number }): Promise<PlaceResult[]> {
    if (!query || query.length < 3) return [];

    try {
        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;

        if (location) {
            // Create a roughly 100km viewbox (1 degree is approx 111km)
            const delta = 1.0;
            const viewbox = [
                location.lon - delta, // left
                location.lat + delta, // top
                location.lon + delta, // right
                location.lat - delta  // bottom
            ].join(',');
            url += `&viewbox=${viewbox}&bounded=1`;
        }

        const response = await fetch(
            url,
            {
                headers: {
                    'User-Agent': 'ChiroCardWebApp/1.0'
                }
            }
        );

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        return data as PlaceResult[];
    } catch (error) {
        console.error("Place search failed:", error);
        return [];
    }
}
