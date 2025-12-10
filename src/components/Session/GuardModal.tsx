import { useState } from "react";
import { Modal } from "../ui/Modal";
import { UserPlus, Users, Check, ChevronLeft, Stethoscope } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Practitioner } from "../../db/db";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface GuardModalProps {
    isOpen: boolean;
    onUnlock: () => void;
    onCancel: () => void;
}

export function GuardModal({ isOpen, onUnlock, onCancel }: GuardModalProps) {
    const { updateSession } = useAppStore();
    const practitioners = useLiveQuery(() => db.practitioners.toArray());
    const [view, setView] = useState<'select' | 'add'>('select');

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

        const count = await db.practitioners.count();
        const id = crypto.randomUUID();
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
    };

    const resetState = () => {
        setView('select');
        setFormData({ role: "Chiropractor" });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                resetState();
                onCancel();
            }}
            title={view === 'select' ? "Select Practitioner" : "Add New Practitioner"}
            description={view === 'select'
                ? "Who will be performing the session?"
                : "Search for a practitioner or enter details manually."}
            hideFooter={true}
        >
            <div className="py-4">
                {view === 'select' ? (
                    <div className="space-y-4">
                        {/* List Existing Practitioners */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {practitioners?.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelectPractitioner(p)}
                                    className="w-full flex items-center p-4 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="ml-4 text-left flex-1">
                                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                                        <p className="text-xs text-zinc-500">{p.role}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-100 dark:bg-emerald-900/50">
                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </button>
                            ))}

                            {practitioners?.length === 0 && (
                                <div className="text-center py-8 text-zinc-500">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No practitioners found.</p>
                                </div>
                            )}
                        </div>

                        {/* Add New Button */}
                        <Button
                            variant="outline"
                            className="w-full py-6 border-dashed"
                            onClick={() => setView('add')}
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Add New Practitioner
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Input
                            label="Practitioner Name"
                            placeholder="Dr. Smith"
                            value={formData.name || ""}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
                            <select
                                className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm text-zinc-900 dark:text-zinc-100"
                                value={formData.role}
                                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as "Chiropractor" | "Massage Therapist" | "Physical Therapist" | "Acupuncturist" | "Other" }))}
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

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={() => setView('select')}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleAddPractitioner}
                                disabled={!formData.name?.trim()}
                            >
                                Add & Select
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
