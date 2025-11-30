import { useState } from "react";
import { db, type Practitioner } from "../../db/db";
import { Input } from "../ui/Input";
import { PlacesAutocomplete } from "../ui/PlacesAutocomplete";
import { Modal } from "../ui/Modal";

interface AddPractitionerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdded: (practitioner: Practitioner) => void;
}

export function AddPractitionerModal({ isOpen, onClose, onAdded }: AddPractitionerModalProps) {
    const [formData, setFormData] = useState<Partial<Practitioner>>({
        role: "Chiropractor"
    });

    const handleSave = async () => {
        if (!formData.name) return;

        try {
            const count = await db.practitioners.count();
            const newPractitioner: Practitioner = {
                id: crypto.randomUUID(),
                name: formData.name,
                role: formData.role as "Chiropractor" | "Massage Therapist" | "Physical Therapist" | "Acupuncturist" | "Other",
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
        } catch (error) {
            console.error("Failed to save practitioner:", error);
            alert("Failed to save practitioner. Please try again.");
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
            <div className="space-y-4 py-2">
                <PlacesAutocomplete
                    label="Name / Search Google Maps"
                    placeholder="Search for a practitioner or clinic..."
                    defaultValue={formData.name || ""}
                    onSelect={(place) => {
                        const address = place.formatted_address || "";
                        const phone = place.formatted_phone_number || "";
                        const website = place.website || "";
                        const name = place.name || "";
                        const types = place.types || [];

                        let role: "Chiropractor" | "Massage Therapist" | "Physical Therapist" | "Acupuncturist" | "Other" = "Other";

                        if (types.includes("chiropractor")) {
                            role = "Chiropractor";
                        } else if (types.includes("physiotherapist") || types.includes("physical_therapist")) {
                            role = "Physical Therapist";
                        } else if (types.includes("spa") || types.includes("health") || name.toLowerCase().includes("massage")) {
                            role = "Massage Therapist";
                        } else if (name.toLowerCase().includes("acupuncture")) {
                            role = "Acupuncturist";
                        }

                        setFormData(prev => ({
                            ...prev,
                            name: name,
                            address: address,
                            phone: phone,
                            website: website,
                            clinicName: name,
                            role: role
                        }));
                    }}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
                    <select
                        className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm text-zinc-900 dark:text-zinc-100"
                        value={formData.role}
                        onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    >
                        <option value="Chiropractor">Chiropractor</option>
                        <option value="Massage Therapist">Massage Therapist</option>
                        <option value="Physical Therapist">Physical Therapist</option>
                        <option value="Acupuncturist">Acupuncturist</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <Input
                    label="Clinic Name"
                    placeholder="Wellness Center"
                    value={formData.clinicName || ""}
                    onChange={e => setFormData(prev => ({ ...prev, clinicName: e.target.value }))}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Phone"
                        placeholder="(555) 123-4567"
                        value={formData.phone || ""}
                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                    <Input
                        label="Email"
                        placeholder="dr@example.com"
                        value={formData.email || ""}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                </div>

                <Input
                    label="Address"
                    placeholder="123 Healing Way"
                    value={formData.address || ""}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />

                <Input
                    label="Website"
                    placeholder="https://..."
                    value={formData.website || ""}
                    onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                />
            </div>
        </Modal>
    );
}
