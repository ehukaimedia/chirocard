import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Practitioner } from "../../db/db";
import { trackEvent } from "../../utils/analytics";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { AddressAutocomplete } from "../ui/AddressAutocomplete";
import { Modal } from "../ui/Modal";
import { Plus, Trash2, GripVertical, Pencil, X } from "lucide-react";
import { Reorder } from "framer-motion";
import { useToast } from "../ui/Toast";

export function PractitionerManager({ onSelect }: { onSelect?: (p: Practitioner) => void }) {
    // Fetch and sort by order
    const practitioners = useLiveQuery(() => db.practitioners.orderBy('order').toArray());
    const [items, setItems] = useState<Practitioner[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Practitioner>>({
        role: "Chiropractor"
    });
    const { toast } = useToast();

    // Sync local state with DB state when DB changes, but only if not currently dragging (simplified)
    useEffect(() => {
        if (practitioners) {
            setItems(practitioners);
        }
    }, [practitioners]);

    const handleReorder = (newOrder: Practitioner[]) => {
        setItems(newOrder);
        // Update order in DB using a transaction for consistency
        db.transaction('rw', db.practitioners, async () => {
            for (let i = 0; i < newOrder.length; i++) {
                const item = newOrder[i];
                if (item.order !== i) {
                    await db.practitioners.update(item.id, { order: i });
                }
            }
        }).catch(console.error);
    };

    const handleSave = async () => {
        if (!formData.name) return;

        const practitionerData = {
            name: formData.name,
            role: formData.role as "Chiropractor" | "Massage Therapist" | "Physical Therapist" | "Acupuncturist" | "Other",
            clinicName: formData.clinicName || "",
            email: formData.email || "",
            phone: formData.phone || "",
            address: formData.address || "",
            website: formData.website || "",
        };

        try {
            if (editingId) {
                await db.practitioners.update(editingId, practitionerData);
                toast("Practitioner updated successfully", "success");
            } else {
                const count = await db.practitioners.count();
                await db.practitioners.add({
                    ...practitionerData,
                    id: crypto.randomUUID(),
                    order: count // Add to end
                });
                trackEvent('add_practitioner', { name: practitionerData.name, category: practitionerData.role });
            }

            setIsEditing(false);
            setEditingId(null);
            setFormData({ role: "Chiropractor" });
            toast("Practitioner saved successfully", "success");
        } catch (error) {
            console.error("Failed to save practitioner:", error);
            toast("Failed to save practitioner. Please try again.", "error");
        }
    };

    const handleEdit = (p: Practitioner, e: React.MouseEvent) => {
        e.stopPropagation();
        setFormData(p);
        setEditingId(p.id);
        setIsEditing(true);
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.practitioners.delete(deleteId);
            setDeleteId(null);
        }
    };

    const startAdd = () => {
        setFormData({ role: "Chiropractor" });
        setEditingId(null);
        setIsEditing(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">My Team</h3>
                {!isEditing && (
                    <Button size="sm" variant="outline" onClick={startAdd}>
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                )}
            </div>

            {isEditing && (
                <Card className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 border-emerald-500/20">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {editingId ? "Edit Practitioner" : "Add Practitioner"}
                        </h4>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        <Input
                            label="Practitioner Name"
                            placeholder="Dr. Smith"
                            value={formData.name || ""}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
                            <select
                                className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm"
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

                        <div className="pt-2">
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
                            />
                        </div>

                        <Input
                            label="Website"
                            placeholder="https://..."
                            value={formData.website || ""}
                            onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button className="flex-1" onClick={handleSave}>Save Practitioner</Button>
                    </div>
                </Card>
            )}

            {!isEditing && items.length > 0 ? (
                <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3">
                    {items.map((p) => (
                        <Reorder.Item key={p.id} value={p}>
                            <div
                                onClick={() => onSelect?.(p)}
                                className={`
                                    p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 
                                    flex items-center justify-between transition-colors select-none min-h-[4.5rem]
                                    ${onSelect ? 'cursor-pointer hover:border-primary hover:bg-primary/5' : ''}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    {!onSelect && (
                                        <div className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 p-2 -ml-2">
                                            <GripVertical className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                        <span className="text-lg font-bold text-zinc-500">{p.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{p.name}</p>
                                        <p className="text-sm text-zinc-500">{p.role}</p>
                                    </div>
                                </div>

                                {!onSelect && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => handleEdit(p, e)}
                                            className="p-3 text-zinc-400 hover:text-emerald-500 transition-colors"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(p.id, e)}
                                            className="p-3 text-zinc-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            ) : (
                !isEditing && (
                    <p className="text-center text-sm text-zinc-500 py-4">
                        No practitioners added yet. Add one to get started.
                    </p>
                )
            )}

            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Remove Practitioner?"
                description="This will remove this practitioner from your team. Past sessions with them will be preserved."
                confirmLabel="Remove"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={confirmDelete}
            />
        </div>
    );
}
