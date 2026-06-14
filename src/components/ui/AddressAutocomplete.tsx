import React, { useState, useEffect, useRef } from "react";
import { Input, type InputProps } from "./Input";
import { MapPin, Loader2 } from "lucide-react";
import { searchPlaces, type PlaceResult } from "../../services/places";

interface AddressAutocompleteProps extends Omit<InputProps, 'onChange' | 'onSelect' | 'value'> {
    value?: string;
    onSelect: (address: string, placeDetails?: PlaceResult) => void;
    onChange?: (value: string) => void;
}

export function AddressAutocomplete({ value, onSelect, onChange, className, ...props }: AddressAutocompleteProps) {
    const [query, setQuery] = useState(value || "");
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value !== undefined && value !== query) {
            setQuery(value);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Note: device geolocation is intentionally NOT requested. Address search
    // sends only the typed text to Photon — no GPS coordinates leave the device.

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const abortController = new AbortController();
        const timer = setTimeout(async () => {
            if (query.length >= 3 && isSearching) {
                try {
                    const places = await searchPlaces(query, abortController.signal);
                    setResults(places);
                    setShowResults(true);
                } catch {
                    // Request was aborted or failed silently
                } finally {
                    setIsSearching(false);
                }
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            abortController.abort();
        };
    }, [query, isSearching]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setIsSearching(true);
        if (onChange) onChange(val);
    };

    const handleSelect = (place: PlaceResult) => {
        const fullAddress = place.display_name;
        setQuery(fullAddress);
        setShowResults(false);
        onSelect(fullAddress, place);
        if (onChange) onChange(fullAddress);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <Input
                    {...props}
                    value={query}
                    onChange={handleInput}
                    className={className}
                    autoComplete="off"
                />
                {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    </div>
                )}
            </div>

            {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {results.length > 0 ? (
                        results.map((place) => (
                            <button
                                key={place.place_id}
                                type="button"
                                onClick={() => handleSelect(place)}
                                className="w-full p-3 text-left border-b border-zinc-100 dark:border-zinc-700 flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors last:border-0"
                            >
                                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                        {place.name || place.display_name?.split(',')[0] || place.display_name}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 truncate">
                                        {place.display_name}
                                    </span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-3 text-sm text-zinc-500 dark:text-zinc-400 italic">
                            No locations found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
