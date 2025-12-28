import { useState, useEffect } from "react";
import { type Practitioner } from "../../db/db";
import { useDataStore } from "../../store/useDataStore";
import { trackEvent } from "../../utils/analytics";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { AddressAutocomplete } from "../ui/AddressAutocomplete";
import { Modal } from "../ui/Modal";
import { Plus, Trash2, GripVertical, Pencil, X, Hospital } from "lucide-react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { useToast } from "../ui/Toast";
import { getPlaceDetails, type GooglePlace } from "../../services/places";
import { PlaceSearchModal } from "./PlaceSearchModal";

export function PractitionerManager({ onSelect }: { onSelect?: (p: Practitioner) => void }) {
    // Fetch and sort by order
    const { practitioners, savePractitioner, deletePractitioner } = useDataStore();
    // const practitioners = useLiveQuery(() => db.practitioners.orderBy('order').toArray());
    const [items, setItems] = useState<Practitioner[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Practitioner>>({});
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const { toast } = useToast();
    const [userLoc, setUserLoc] = useState<{ lat: number; lon: number } | undefined>();

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                (err) => console.log("Geo error:", err)
            );
        }
    }, []);

    // Sync local state with DB state when DB changes, but only if not currently dragging (simplified)
    useEffect(() => {
        if (practitioners) {
            setItems(practitioners);
        }
    }, [practitioners]);

    const handleReorder = (newOrder: Practitioner[]) => {
        setItems(newOrder);
        // Update order in DB
        newOrder.forEach((item, i) => {
            if (item.order !== i) {
                savePractitioner({ ...item, order: i }).catch(console.error);
            }
        });
    };

    const handleSave = async () => {
        if (!formData.name && !formData.clinicName) return;

        const practitionerData = {
            name: formData.name || "",
            role: formData.role as "Chiropractor" | "Massage Therapist" | "Physical Therapist" | "Acupuncturist" | "Other",
            clinicName: formData.clinicName || "",
            email: formData.email || "",
            phone: formData.phone || "",
            address: formData.address || "",
            website: formData.website || "",
        };

        try {
            if (editingId) {
                const existing = practitioners.find(p => p.id === editingId);
                if (existing) {
                    await savePractitioner({ ...existing, ...practitionerData });
                }
                toast("Practitioner updated successfully", "success");
            } else {
                const count = practitioners.length;
                await savePractitioner({
                    ...practitionerData,
                    id: crypto.randomUUID(),
                    order: count
                } as Practitioner);
                trackEvent('add_practitioner', { name: practitionerData.name, category: practitionerData.role });
            }

            setIsEditing(false);
            setEditingId(null);
            setFormData({});
            toast("Practitioner saved successfully", "success");
        } catch (error) {
            console.error("Failed to save practitioner:", error);
            toast("Failed to save practitioner. Please try again.", "error");
        }
    };

    const handlePlaceSelect = async (place: GooglePlace) => {
        setIsSearchModalOpen(false);
        toast(`Fetching details for ${place.displayName.text}...`, "info");

        try {
            const details = await getPlaceDetails(place.id);
            if (details) {
                setFormData(prev => ({
                    ...prev,
                    clinicName: details.displayName.text,
                    address: details.formattedAddress,
                    phone: details.nationalPhoneNumber || prev.phone,
                    website: details.websiteUri || prev.website
                }));
                toast("Auto-filled details from Google", "success");
            }
        } catch (error) {
            console.error("Failed to fetch place details:", error);
            setFormData(prev => ({ ...prev, clinicName: place.displayName.text, address: place.formattedAddress }));
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
            await deletePractitioner(deleteId);
            setDeleteId(null);
        }
    };

    const startAdd = () => {
        setFormData({});
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
                <Card className="overflow-hidden border-emerald-500/20 shadow-xl rounded-3xl">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
                            {editingId ? "Edit Practitioner" : "Add Practitioner"}
                        </h4>
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="p-6 space-y-8 bg-zinc-50/50 dark:bg-zinc-950/50">
                        {/* Step 1: Specialty Selection */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px]">1</span>
                                Who are you adding?
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {["Chiropractor", "Massage Therapist", "Physical Therapist", "Acupuncturist", "Other"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFormData(prev => ({ ...prev, role: type as any }))}
                                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${formData.role === type
                                            ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-emerald-500/50"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Details (Unrolls after Step 1) */}
                        <AnimatePresence>
                            {formData.role && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px]">2</span>
                                                Clinic Details
                                            </label>

                                            <div className="p-1 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 mb-6">
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-14 rounded-xl border-emerald-500/20 dark:border-emerald-500/10 bg-white dark:bg-zinc-900 text-emerald-500 hover:text-emerald-600 font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] group shadow-sm hover:shadow-md"
                                                    onClick={() => setIsSearchModalOpen(true)}
                                                >
                                                    <Hospital className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                    Find Clinic via Google
                                                </Button>
                                            </div>

                                            <div className="grid gap-4">
                                                <Input
                                                    label="Clinic / Business Name"
                                                    placeholder="Clinic name"
                                                    value={formData.clinicName || ""}
                                                    onChange={e => setFormData(prev => ({ ...prev, clinicName: e.target.value }))}
                                                />

                                                <Input
                                                    label="Practitioner Name"
                                                    placeholder="Practitioner name"
                                                    value={formData.name || ""}
                                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input
                                                        label="Phone"
                                                        placeholder="Phone number"
                                                        value={formData.phone || ""}
                                                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                    />
                                                    <Input
                                                        label="Email"
                                                        placeholder="Email address"
                                                        value={formData.email || ""}
                                                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                    />
                                                </div>

                                                <AddressAutocomplete
                                                    label="Manual Address Search"
                                                    placeholder="Search address..."
                                                    value={formData.address || ""}
                                                    onSelect={(addr, place) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            address: addr,
                                                            clinicName: place?.displayName.text || prev.clinicName
                                                        }));
                                                    }}
                                                    onChange={(addr) => setFormData(prev => ({ ...prev, address: addr }))}
                                                />

                                                <Input
                                                    label="Website"
                                                    placeholder="https://..."
                                                    value={formData.website || ""}
                                                    onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button className="w-full h-12 rounded-xl text-base font-bold shadow-lg" onClick={handleSave}>
                                                Save Practitioner
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                                        <span className="text-lg font-bold text-zinc-500">{(p.clinicName || p.name || "S").charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                                            {p.clinicName || (p.name && p.name !== "Unknown Practitioner" ? p.name : "Staff")}
                                        </p>
                                        <p className="text-sm text-zinc-500">
                                            {p.clinicName ? (p.name && p.name !== "Unknown Practitioner" ? p.name : "Staff") : "Staff"} • {p.role}
                                        </p>
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

            <PlaceSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSelect={handlePlaceSelect}
                userLocation={userLoc}
            />

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
        </div >
    );
}
