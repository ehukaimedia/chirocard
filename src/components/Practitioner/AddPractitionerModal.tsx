import { useState } from "react";
import { db, type Practitioner } from "../../db/db";
import { Input } from "../ui/Input";
import { AddressAutocomplete } from "../ui/AddressAutocomplete";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";

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
            <div className="space-y-6 py-2">
                <Input
                    label="Practitioner Name"
                    placeholder="Dr. Smith"
                    value={formData.name || ""}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-base h-12"
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
                    <div className="relative">
                        <select
                            className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-base text-zinc-900 dark:text-zinc-100 appearance-none"
                            value={formData.role}
                            onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as "Chiropractor" | "Massage Therapist" | "Physical Therapist" | "Acupuncturist" | "Other" }))}
                        >
                            <option value="Chiropractor">Chiropractor</option>
                            <option value="Massage Therapist">Massage Therapist</option>
                            <option value="Physical Therapist">Physical Therapist</option>
                            <option value="Acupuncturist">Acupuncturist</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <Input
                    label="Clinic Name"
                    placeholder="Wellness Center"
                    value={formData.clinicName || ""}
                    onChange={e => setFormData(prev => ({ ...prev, clinicName: e.target.value }))}
                    className="text-base h-12"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Phone"
                        placeholder="(555) 123-4567"
                        value={formData.phone || ""}
                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="text-base h-12"
                    />
                    <Input
                        label="Email"
                        placeholder="dr@example.com"
                        value={formData.email || ""}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="text-base h-12"
                    />
                </div>

                <AddressAutocomplete
                    label="Autofill Address (Search Clinic Name)"
                    placeholder="e.g. Mayo Clinic"
                    value={formData.address || ""}
                    onSelect={(addr, place) => {
                        setFormData(prev => ({
                            ...prev,
                            address: addr,
                            clinicName: place?.name || prev.clinicName
                        }));
                    }}
                    onChange={(addr) => setFormData(prev => ({ ...prev, address: addr }))}
                // AddressAutocomplete handles its own inputs, ideally it accepts className but if not, I'll update it later if needed. It usually uses Input.
                />

                <Input
                    label="Website"
                    placeholder="https://..."
                    value={formData.website || ""}
                    onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="text-base h-12"
                />

                {/* Spacer */}
                <div className="h-32 sm:hidden" />
            </div>
        </Modal>
    );
}
