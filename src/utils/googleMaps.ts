/**
 * Extracts a potential business name or search query from a Google Maps share link.
 * Supports:
 * - https://www.google.com/maps/place/Business+Name/@lat,lon,zoom...
 * - https://maps.app.goo.gl/short-id (These will need manual resolution or browser tool, but we can't do that. For now focus on long links)
 * - https://www.google.com/maps/search/Query...
 */
export function extractPlaceFromGoogleLink(url: string): string | null {
    if (!url) return null;

    // If it's a multi-line text block, assume first line is the name
    if (url.includes('\n')) {
        return url.split('\n')[0].trim();
    }

    try {
        const decodedUrl = decodeURIComponent(url);

        // Match long format: /maps/place/Name/@...
        const placeMatch = decodedUrl.match(/\/maps\/place\/([^/@]+)/);
        if (placeMatch && placeMatch[1]) {
            return placeMatch[1].replace(/\+/g, ' ');
        }

        // Match search format: /maps/search/Query/@...
        const searchMatch = decodedUrl.match(/\/maps\/search\/([^/@]+)/);
        if (searchMatch && searchMatch[1]) {
            return searchMatch[1].replace(/\+/g, ' ');
        }

        return null;
    } catch (e) {
        console.error("Failed to parse Google link:", e);
        return null;
    }
}

/**
 * Resolves a short Google Maps link (maps.app.goo.gl) to extract a business name.
 * Uses allorigins.win as a CORS proxy.
 */
export async function resolveGoogleShortLink(url: string): Promise<string | null> {
    if (!url.includes("maps.app.goo.gl")) return null;

    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) return null;

        const data = await response.json();
        const html = data.contents as string;

        // Helper to decode HTML entities (minimal set for business names)
        const decodeHTMLEntities = (str: string) => {
            return str
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
        };

        const cleanName = (name: string) => {
            // Remove " - Google Maps" suffix
            let cleaned = name.replace(/\s*-\s*Google Maps$/, "").trim();
            // Split by bullet separator if it exists (e.g. "Name · Address")
            if (cleaned.includes(" · ")) {
                cleaned = cleaned.split(" · ")[0].trim();
            }
            return decodeHTMLEntities(cleaned);
        };

        // Try to extract from <title>
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        if (titleMatch && titleMatch[1]) {
            const title = cleanName(titleMatch[1]);
            if (title && title !== "Google Maps") {
                return title;
            }
        }

        // Try to extract from og:title (more flexible regex)
        const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["'](.*?)["']/i) ||
            html.match(/<meta[^>]+content=["'](.*?)["'][^>]+property=["']og:title["']/i);
        if (ogTitleMatch && ogTitleMatch[1]) {
            const ogTitle = cleanName(ogTitleMatch[1]);
            if (ogTitle && ogTitle !== "Google Maps") {
                return ogTitle;
            }
        }

        // Try to extract from itemprop="name" (common in Google Maps HTML)
        const itempropMatch = html.match(/<meta[^>]+itemprop=["']name["'][^>]+content=["'](.*?)["']/i) ||
            html.match(/<meta[^>]+content=["'](.*?)["'][^>]+itemprop=["']name["']/i);
        if (itempropMatch && itempropMatch[1]) {
            const itemName = cleanName(itempropMatch[1]);
            if (itemName && itemName !== "Google Maps") {
                return itemName;
            }
        }

        return null;
    } catch (e) {
        console.error("Failed to resolve short link:", e);
        return null;
    }
}
