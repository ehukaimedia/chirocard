import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Modal } from "../ui/Modal";
import { Check, ChevronLeft, Stethoscope, Users, Plus } from "lucide-react-native";
import { useLiveQuery, db, type Practitioner } from "../../db/db";
import * as Crypto from 'expo-crypto';
// import { useAppStore } from "../../store/useAppStore"; // Store not ported yet
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface GuardModalProps {
    isOpen: boolean;
    onUnlock: () => void;
    // Store update function would be passed here or used from store
}

// Mock store for now
const useAppStore = () => ({
    updateSession: (data: any) => console.log("Session updated", data)
});

export function GuardModal({ isOpen, onUnlock }: GuardModalProps) {
    const { updateSession } = useAppStore();
    const practitioners = useLiveQuery(() => db.practitioners.toArray());
    const [view, setView] = useState<'select' | 'add'>('select');
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPractitioners = practitioners?.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // New Practitioner Form State
    const [formData, setFormData] = useState<Partial<Practitioner>>({
        role: "Chiropractor"
    });

    const handleSelectPractitioner = (practitioner: Practitioner) => {
        updateSession({
            practitionerId: practitioner.id,
            practitionerName: practitioner.name,
            practitionerClass: practitioner.role
        });
        onUnlock();
    };

    const handleAddPractitioner = async () => {
        if (!formData.name?.trim()) return;

        try {
            const count = await db.practitioners.count();
            const id = Crypto.randomUUID();
            const newPractitioner: Practitioner = {
                id,
                name: formData.name,
                role: formData.role as "Chiropractor" | "Massage Therapist" | "Physical Therapist" | "Acupuncturist" | "Other" || "Chiropractor",
                clinicName: formData.clinicName || "",
                email: formData.email || "",
                phone: formData.phone || "",
                address: formData.address || "",
                website: formData.website || "",
                order: count + 1
            };

            await db.practitioners.add(newPractitioner);
            handleSelectPractitioner(newPractitioner);

            // Reset form
            setFormData({ role: "Chiropractor" });
            setView('select');
        } catch (e) {
            console.error("GuardModal add error:", e);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                // Guardian: prevent closing without selection? 
                // For now allow close
            }}
            title={view === 'select' ? "Select Practitioner" : "Add New Practitioner"}
            description={view === 'select'
                ? "Who will be performing the session?"
                : "Search for a practitioner or enter details manually."}
            hideFooter={true}
        >
            <View className="py-4">
                {view === 'select' ? (
                    <View className="gap-4">
                        {/* Search Input */}
                        <Input
                            placeholder="Search practitioners..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                        {/* List Existing Practitioners */}
                        <ScrollView className="max-h-[300px]">
                            {filteredPractitioners?.map((p) => (
                                <Pressable
                                    key={p.id}
                                    onPress={() => handleSelectPractitioner(p)}
                                    className="w-full flex-row items-center p-4 bg-zinc-50 dark:bg-zinc-800/50 active:bg-emerald-50 dark:active:bg-emerald-900/20 border border-zinc-200 dark:border-zinc-700 rounded-xl mb-2"
                                >
                                    <View className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-full flex items-center justify-center shadow-sm">
                                        <Stethoscope size={20} className="text-emerald-600 dark:text-emerald-400" />
                                    </View>
                                    <View className="ml-4 flex-1">
                                        <Text className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</Text>
                                        <Text className="text-xs text-zinc-500">{p.role}</Text>
                                    </View>
                                    <View className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50">
                                        <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                                    </View>
                                </Pressable>
                            ))}

                            {filteredPractitioners?.length === 0 && (
                                <View className="items-center py-8">
                                    <Users size={48} className="text-zinc-300 mb-3" />
                                    <Text className="text-zinc-500">No practitioners found.</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Add New Button */}
                        <Button
                            variant="outline"
                            className="w-full py-6 border-dashed"
                            onPress={() => setView('add')}
                        >
                            <Plus size={20} className="mr-2 text-zinc-900 dark:text-zinc-100" />
                            <Text className="text-zinc-900 dark:text-zinc-100">Add New Practitioner</Text>
                        </Button>
                    </View>
                ) : (
                    <View className="gap-4">
                        <Input
                            label="Practitioner Name"
                            placeholder="Dr. Smith"
                            value={formData.name || ""}
                            onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
                        />

                        <View className="space-y-2">
                            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</Text>
                            <Input
                                value={formData.role}
                                onChangeText={text => setFormData(p => ({ ...p, role: text as any }))}
                            />
                        </View>

                        <Input
                            label="Clinic Name"
                            placeholder="Wellness Center"
                            value={formData.clinicName || ""}
                            onChangeText={text => setFormData(prev => ({ ...prev, clinicName: text }))}
                        />

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Input label="Phone" value={formData.phone} onChangeText={t => setFormData(p => ({ ...p, phone: t }))} />
                            </View>
                            <View className="flex-1">
                                <Input label="Email" value={formData.email} onChangeText={t => setFormData(p => ({ ...p, email: t }))} />
                            </View>
                        </View>

                        <Input label="Address" value={formData.address} onChangeText={t => setFormData(p => ({ ...p, address: t }))} />
                        <Input label="Website" value={formData.website} onChangeText={t => setFormData(p => ({ ...p, website: t }))} />

                        <View className="flex-row gap-3 pt-4">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onPress={() => setView('select')}
                            >
                                <ChevronLeft size={16} className="mr-2 text-zinc-900 dark:text-zinc-100" />
                                <Text className="text-zinc-900 dark:text-zinc-100">Back</Text>
                            </Button>
                            <Button
                                className="flex-1"
                                onPress={handleAddPractitioner}
                                disabled={!formData.name?.trim()}
                            >
                                Add & Select
                            </Button>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
}
