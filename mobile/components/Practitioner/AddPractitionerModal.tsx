import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { db, type Practitioner } from "../../db/db";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";
import * as Crypto from 'expo-crypto';
import * as Location from 'expo-location';
import { searchPlaces, type PlaceResult } from "../../services/places";
import { MapPin } from "lucide-react-native";
import { AddressAutocomplete } from "../ui/AddressAutocomplete";

interface AddPractitionerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdded: (practitioner: Practitioner) => void;
}

export function AddPractitionerModal({ isOpen, onClose, onAdded }: AddPractitionerModalProps) {
    const [formData, setFormData] = useState<Partial<Practitioner>>({
        role: "Chiropractor"
    });
    const { toast } = useToast();

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchDebounce, setSearchDebounce] = useState<any>();
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | undefined>();

    // Get location on open
    React.useEffect(() => {
        if (isOpen) {
            (async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    // Permission denied, just ignore and use global search
                    return;
                }

                try {
                    const location = await Location.getCurrentPositionAsync({});
                    setUserLocation({
                        lat: location.coords.latitude,
                        lon: location.coords.longitude
                    });
                } catch (e) {
                    console.log("Could not get location", e);
                }
            })();
        }
    }, [isOpen]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.length < 3) {
            setResults([]);
            return;
        }

        if (searchDebounce) clearTimeout(searchDebounce);
        const timeout = setTimeout(async () => {
            setIsSearching(true);
            const places = await searchPlaces(text, userLocation);
            setResults(places);
            setIsSearching(false);
        }, 500);
        setSearchDebounce(timeout);
    };

    const selectPlace = (place: PlaceResult) => {
        // Autofill logic
        const addr = place.address;
        const fullAddress = [
            addr.house_number,
            addr.road,
            addr.city || addr.suburb,
            addr.state,
            addr.postcode
        ].filter(Boolean).join(", ");

        setFormData(prev => ({
            ...prev,
            clinicName: place.name || prev.clinicName,
            address: fullAddress,
            website: "" // Nominatim doesn't provide website usually
        }));

        setResults([]);
        setSearchQuery("");
        toast("Autofilled from " + (place.name || "map"), "success");
    };

    const handleSave = async () => {
        if (!formData.name) return;

        try {
            const count = await db.practitioners.count();
            const newPractitioner: Practitioner = {
                id: Crypto.randomUUID(),
                name: formData.name,
                role: formData.role as "Chiropractor" | "Massage Therapist" | "Physical Therapist" | "Acupuncturist" | "Other" || "Chiropractor",
                clinicName: formData.clinicName || "",
                email: formData.email || "",
                phone: formData.phone || "",
                address: formData.address || "",
                website: formData.website || "",
                order: count // Add to end
            };

            await db.practitioners.add(newPractitioner);

            onAdded(newPractitioner);
            onClose();
            setFormData({ role: "Chiropractor" }); // Reset form
            toast("Practitioner added successfully", "success");
        } catch (error) {
            console.error("Failed to save practitioner:", error);
            toast("Failed to save practitioner. Please try again.", "error");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Practitioner"
            description="Add a new practitioner to your team."
            confirmLabel="Save Practitioner"
            cancelLabel="Cancel"
            onConfirm={handleSave}
            onCancel={onClose}
        >
            <View className="space-y-4 py-2">
                {/* Place Search - Overlay style or inline? Inline is simpler for scrolling */}
                <AddressAutocomplete
                    label="Autofill from Map (Optional)"
                    placeholder="Search clinic (e.g. Mayo Clinic)"
                    onSelect={(addr, place) => {
                        setFormData(prev => ({
                            ...prev,
                            address: addr,
                            clinicName: place?.name || prev.clinicName
                        }));
                        if (place?.name) toast("Autofilled: " + place.name, "success");
                    }}
                />

                <View className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-2" />

                <Input
                    label="Practitioner Name"
                    placeholder="Dr. Smith"
                    value={formData.name || ""}
                    onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
                />

                <View className="space-y-2">
                    <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</Text>
                    <View className="h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 justify-center">
                        <Input
                            value={formData.role}
                            onChangeText={text => setFormData(p => ({ ...p, role: text as any }))}
                            placeholder="Chiropractor"
                            className="border-0 bg-transparent h-full px-0"
                            containerClassName="space-y-0"
                        />
                    </View>
                </View>

                <Input
                    label="Clinic Name"
                    placeholder="Wellness Center"
                    value={formData.clinicName || ""}
                    onChangeText={text => setFormData(prev => ({ ...prev, clinicName: text }))}
                />

                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Input
                            label="Phone"
                            placeholder="(555) 123-4567"
                            value={formData.phone || ""}
                            onChangeText={text => setFormData(prev => ({ ...prev, phone: text }))}
                        />
                    </View>
                    <View className="flex-1">
                        <Input
                            label="Email"
                            placeholder="dr@example.com"
                            value={formData.email || ""}
                            onChangeText={text => setFormData(prev => ({ ...prev, email: text }))}
                        />
                    </View>
                </View>

                {/* Manual Address Input (if user wants to edit after autofill) */}
                <Input
                    label="Address"
                    placeholder="123 Healing Way"
                    value={formData.address || ""}
                    onChangeText={text => setFormData(prev => ({ ...prev, address: text }))}
                />

                <Input
                    label="Website"
                    placeholder="https://..."
                    value={formData.website || ""}
                    onChangeText={text => setFormData(prev => ({ ...prev, website: text }))}
                />
        </Modal>
    );
}
