import pako from "pako";

/**
 * Compresses a JSON object into a base64 encoded string.
 */
export function compressData(data: any): string {
    try {
        const jsonString = JSON.stringify(data);
        const compressed = pako.deflate(jsonString);
        // Convert Uint8Array to binary string
        let binary = '';
        const len = compressed.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(compressed[i]);
        }
        // Base64 encode
        return btoa(binary);
    } catch (e) {
        console.error("Compression failed", e);
        return "";
    }
}

/**
 * Decompresses a base64 encoded string back into a JSON object.
 */
export function decompressData(base64: string): any {
    try {
        // Decode base64
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        // Decompress
        const decompressed = pako.inflate(bytes, { to: 'string' });
        return JSON.parse(decompressed);
    } catch (e) {
        console.error("Decompression failed", e);
        return null;
    }
}
