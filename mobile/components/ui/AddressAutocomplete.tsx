import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Input } from "./Input";
import { MapPin } from "lucide-react-native";
import { searchPlaces, type PlaceResult } from "../../services/places";
import * as Location from 'expo-location';

interface AddressAutocompleteProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onSelect: (address: string, placeDetails?: PlaceResult) => void;
    containerClassName?: string;
}

export function AddressAutocomplete({ label, placeholder, value, onSelect, containerClassName }: AddressAutocompleteProps) {
    const [query, setQuery] = useState(value || "");
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | undefined>();
    const [showResults, setShowResults] = useState(false);

    // Sync internal query if value changes externally
    useEffect(() => {
        if (value !== undefined && value !== query) {
            setQuery(value);
        }
    }, [value]);

    // Get location once on mount for better results
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    setUserLocation({
                        lat: location.coords.latitude,
                        lon: location.coords.longitude
                    });
                }
            } catch (e) {
                // Ignore location errors
            }
        })();
    }, []);

    const handleSearch = async (text: string) => {
        setQuery(text);
        if (text.length < 3) {
            setResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        // Debounce manual or just let it fly? Let's do a simple inline delay check or just run it. 
        // For better UX, we should debounce properly, but for this simple comp let's rely on the service being fast enough or user pausing.
        // Actually, let's debounce.

        // We'll use a local variable to avoid race conditions with closures if we used setTimeout directly without refs
        // But for simplicity in this "agent write", I'll just call it. 
        // *Self-correction*: The previous implementation used a proper timeout. I should do that.
    };

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 3 && isSearching) { // only search if flag set (user typing)
                setShowResults(true);
                const places = await searchPlaces(query, userLocation);
                setResults(places);
                setIsSearching(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query, isSearching, userLocation]);

    const handleChangeText = (text: string) => {
        setIsSearching(true); // Flag that we want to search
        setQuery(text);
        // Also call parent onSelect with just text if they want raw input? 
        // Or wait for selection? Usually address autocomplete allows raw text too.
        // But onSelect signature implies "final" selection. 
        // Let's assume parent manages "onChangeText" via `value` prop ref if needed? 
        // Actually, this component manages the input. We might need an `onChangeText` prop if we want to support raw entry.
        // For now, let's just update query.
    };

    const handleSelect = (place: PlaceResult) => {
        const addr = place.address;
        const fullAddress = [
            place.name !== addr.road ? place.name : null, // Include place name if it's a business
            addr.house_number,
            addr.road,
            addr.city || addr.suburb,
            addr.state,
            addr.postcode,
            addr.country !== 'United States' ? addr.country : null
        ].filter(Boolean).join(", ");

        setQuery(fullAddress);
        setShowResults(false);
        onSelect(fullAddress, place);
    };

    return (
        <View className={`z-50 relative ${containerClassName}`}>
            <Input
                label={label}
                placeholder={placeholder || "Search address..."}
                value={query}
                onChangeText={handleChangeText}
            />
            {isSearching && (
                <ActivityIndicator className="absolute right-3 top-9" size="small" color="#10b981" />
            )}

            {showResults && results.length > 0 && (
                <View className="absolute top-[70px] left-0 right-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 max-h-40 overflow-hidden">
                    {results.map((place) => (
                        <TouchableOpacity
                            key={place.place_id}
                            onPress={() => handleSelect(place)}
                            className="p-3 border-b border-zinc-100 dark:border-zinc-700 flex-row items-center gap-2"
                        >
                            <MapPin size={14} className="text-emerald-500" />
                            <Text className="text-sm text-zinc-900 dark:text-zinc-100 flex-1" numberOfLines={1}>
                                {place.display_name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}
