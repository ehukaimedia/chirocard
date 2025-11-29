/// <reference types="google.maps" />
import { useState, useRef, useEffect, type RefObject } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";
import { useGoogleMapsScript } from "../../hooks/useGoogleMapsScript";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { Input } from "./Input";
import { MapPin } from "lucide-react";
import { useToast } from "./Toast";

interface PlacesAutocompleteProps {
    onSelect: (place: google.maps.places.PlaceResult) => void;
    defaultValue?: string;
    placeholder?: string;
    label?: string;
    className?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PlacesAutocomplete({
    onSelect,
    defaultValue = "",
    placeholder = "Search for a place...",
    label,
    className,
    onChange
}: PlacesAutocompleteProps) {
    const { isLoaded, loadError } = useGoogleMapsScript();

    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here if needed */
        },
        debounce: 300,
        defaultValue,
        initOnMount: isLoaded,
    });

    // Update value if defaultValue changes externally
    useEffect(() => {
        if (defaultValue && defaultValue !== value) {
            setValue(defaultValue, false);
        }
    }, [defaultValue]);

    const ref = useRef<HTMLDivElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useOnClickOutside(ref as RefObject<HTMLElement>, () => {
        setShowSuggestions(false);
        clearSuggestions();
    });

    const { toast } = useToast();
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const placesServiceRef = useRef<HTMLDivElement>(null);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        setShowSuggestions(true);
        onChange?.(e);
    };

    const handleSelect = async (suggestion: { place_id: string; description: string }) => {
        console.log("Selected suggestion:", suggestion);
        setValue(suggestion.description, false);
        clearSuggestions();
        setShowSuggestions(false);
        setIsLoadingDetails(true);
        toast("Fetching details...", "info");

        try {
            // Try using the new Places API (Place class)
            if (google.maps.places.Place) {
                const place = new google.maps.places.Place({ id: suggestion.place_id });
                await place.fetchFields({
                    fields: ['displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'location']
                });

                const result = {
                    name: place.displayName,
                    formatted_address: place.formattedAddress,
                    formatted_phone_number: place.nationalPhoneNumber,
                    website: place.websiteURI,
                    geometry: { location: place.location }
                } as any; // Cast to any to match expected PlaceResult shape roughly

                console.log("Places API (New) result:", result);
                setIsLoadingDetails(false);
                onSelect(result);
                toast("Practitioner details auto-filled!", "success");
                return;
            }

            // Fallback to legacy PlacesService if Place class is missing (shouldn't happen on modern versions)
            if (!placesServiceRef.current) {
                console.error("PlacesService ref not found");
                setIsLoadingDetails(false);
                return;
            }

            const placesService = new google.maps.places.PlacesService(placesServiceRef.current);
            placesService.getDetails(
                {
                    placeId: suggestion.place_id,
                    fields: ["name", "formatted_address", "formatted_phone_number", "website", "geometry", "address_components"],
                },
                (place, status) => {
                    console.log("Places Details result:", place, status);
                    setIsLoadingDetails(false);
                    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                        onSelect(place);
                        toast("Practitioner details auto-filled!", "success");
                    } else {
                        console.error("Places Details fetch failed:", status);
                        toast(`Failed to fetch details: ${status}`, "error");
                    }
                }
            );
        } catch (error: any) {
            console.error("Error fetching place details:", error);
            setIsLoadingDetails(false);
            toast(`Error: ${error.message || "Unknown error"}`, "error");
        }
    };

    if (loadError) return <Input label={label} placeholder="Error loading Google Maps" disabled />;
    if (!isLoaded) return <Input label={label} placeholder="Loading..." disabled />;

    return (
        <div ref={ref} className="relative">
            <Input
                label={label}
                value={value}
                onChange={handleInput}
                disabled={!ready || isLoadingDetails}
                placeholder={isLoadingDetails ? "Fetching details..." : placeholder}
                className={className}
                autoComplete="off"
            />
            <div ref={placesServiceRef} className="hidden" />

            {showSuggestions && status === "OK" && (
                <ul className="absolute z-50 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
                    {data.map((suggestion) => (
                        <li
                            key={suggestion.place_id}
                            onClick={() => handleSelect(suggestion)}
                            className="px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-start gap-3 transition-colors"
                        >
                            <MapPin className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    {suggestion.structured_formatting.main_text}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {suggestion.structured_formatting.secondary_text}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
