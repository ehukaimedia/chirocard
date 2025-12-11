import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { clsx } from "clsx";
import { db, useLiveQuery, type Practitioner } from "../../db/db";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Plus, Trash2, GripVertical, Pencil, X } from "lucide-react-native";
import { useToast } from "../ui/Toast";
import { AddPractitionerModal } from "./AddPractitionerModal";

export function PractitionerManager({ onSelect }: { onSelect?: (p: Practitioner) => void }) {
    // Fetch and sort by order using our custom hook
    const practitioners = useLiveQuery(() => db.practitioners.toArray());
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPractitioners = practitioners?.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // In React Native reordering without a library is tricky.
    // We will just list them for now.

    // We can use local state if we want optimistic updates but useLiveQuery usually is fast enough for low data volumes.
    // However, the web version used local state `items` to manage reorder drag state.
    // We will simplify and just render `practitioners`.

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Practitioner>>({
        role: "Chiropractor"
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { toast } = useToast();

    const handleSave = async () => {
        if (!formData.name) return;

        try {
            if (editingId) {
                await db.practitioners.update(editingId, formData);
                toast("Practitioner updated successfully", "success");
            }
            // Add is handled by AddPractitionerModal usually, but if we reuse this form:

            setIsEditing(false);
            setEditingId(null);
            setFormData({ role: "Chiropractor" });
        } catch (error) {
            console.error("Failed to save:", error);
            toast("Failed to save. Please try again.", "error");
        }
    };

    const handleEdit = (p: Practitioner) => {
        setFormData(p);
        setEditingId(p.id);
        setIsEditing(true);
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const confirmDelete = async () => {
        if (deleteId) {
            await db.practitioners.delete(deleteId);
            setDeleteId(null);
        }
    };

    return (
        <View className="flex-1">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-medium text-zinc-900 dark:text-zinc-100">My Team</Text>
                {!isEditing && (
                    <Button size="sm" variant="outline" onPress={() => setIsAddModalOpen(true)}>
                        <Text className="text-zinc-900 dark:text-zinc-100 flex-row items-center">
                            + Add
                        </Text>
                    </Button>
                )}
            </View>

            {isEditing ? (
                <Card className="p-4 space-y-4 border-emerald-500/20">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-semibold text-zinc-900 dark:text-zinc-100">
                            Edit Practitioner
                        </Text>
                        <Button variant="ghost" size="icon" onPress={() => setIsEditing(false)}>
                            <X size={16} className="text-zinc-500" />
                        </Button>
                    </View>

                    <View className="gap-4">
                        <Input
                            label="Practitioner Name"
                            placeholder="Dr. Smith"
                            value={formData.name || ""}
                            onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
                        />

                        {/* Simplified Role Input for now */}
                        <Input
                            label="Role"
                            value={formData.role}
                            onChangeText={text => setFormData(p => ({ ...p, role: text as any }))}
                        />

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
                    </View>

                    <Button onPress={handleSave}>Save Changes</Button>
                </Card>
            ) : (
                <>
                    <View className="mb-4">
                        <Input
                            placeholder="Search practitioners..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <ScrollView className="space-y-3">
                        {filteredPractitioners?.map((p) => (
                            <Pressable
                                key={p.id}
                                onPress={() => onSelect?.(p)}
                                className={clsx(
                                    "p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 flex-row items-center justify-between",
                                    onSelect && 'active:bg-emerald-50 dark:active:bg-emerald-900/10 active:border-emerald-500'
                                )}
                            >
                                <View className="flex-row items-center gap-4 flex-1">
                                    <View className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                        <Text className="text-lg font-bold text-zinc-500">{p.name.charAt(0)}</Text>
                                    </View>
                                    <View>
                                        <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{p.name}</Text>
                                        <Text className="text-sm text-zinc-500">{p.role}</Text>
                                    </View>
                                </View>

                                {!onSelect && (
                                    <View className="flex-row gap-1">
                                        <Pressable
                                            onPress={(e) => { e.stopPropagation(); handleEdit(p); }}
                                            className="p-3"
                                        >
                                            <Pencil size={20} className="text-zinc-400" />
                                        </Pressable>
                                        <Pressable
                                            onPress={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                                            className="p-3"
                                        >
                                            <Trash2 size={20} className="text-zinc-400" />
                                        </Pressable>
                                    </View>
                                )}
                            </Pressable>
                        ))}

                        {filteredPractitioners?.length === 0 && (
                            <Text className="text-center text-sm text-zinc-500 py-4">
                                {searchQuery ? "No matching practitioners found." : "No practitioners added yet."}
                            </Text>
                        )}
                    </ScrollView>
                </>
            )}

            <AddPractitionerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdded={() => { }}
            />

            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Remove Practitioner?"
                description="This will remove this practitioner from your team."
                confirmLabel="Remove"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={confirmDelete}
            />
        </View>
    );
}
