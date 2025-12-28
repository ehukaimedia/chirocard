import { useState, useMemo } from "react";
import { Modal } from "../ui/Modal";
import { UserPlus, Users, Check, ChevronLeft, Stethoscope, Briefcase, PlusCircle, Hospital } from "lucide-react";
import { type Practitioner } from "../../db/db";
import { useDataStore } from "../../store/useDataStore";
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
    const { practitioners, savePractitioner } = useDataStore();
    // const practitioners = useLiveQuery(() => db.practitioners.toArray());
    const [view, setView] = useState<'select' | 'add'>('select');

    // New Practitioner Form State
    const [formData, setFormData] = useState<Partial<Practitioner>>({
        role: "Chiropractor"
    });

    // Group practitioners by clinic
    const groupedPractitioners = useMemo(() => {
        const groups: Record<string, Practitioner[]> = {};
        if (!practitioners) return groups;
        practitioners.forEach(p => {
            const clinic = p.clinicName || "Private Practice";
            if (!groups[clinic]) groups[clinic] = [];
            groups[clinic].push(p);
        });
        return groups;
    }, [practitioners]);

    const handleSelectPractitioner = (practitioner: Partial<Practitioner>) => {
        const isUnknown = !practitioner.name || practitioner.name === "Unknown Practitioner";
        updateSession({
            practitionerId: practitioner.id || `staff-${practitioner.clinicName || "private"}`,
            practitionerName: isUnknown ? "Staff" : practitioner.name!,
            practitionerClass: practitioner.role || "Chiropractor"
        });
        onUnlock();
    };

    const handleAddPractitioner = async () => {
        if (!formData.name?.trim() && !formData.clinicName?.trim()) return;

        const count = (practitioners || []).length;
        const id = crypto.randomUUID();
        const newPractitioner: Practitioner = {
            id,
            name: formData.name || "",
            role: formData.role as any || "Chiropractor",
            clinicName: formData.clinicName || "",
            email: formData.email || "",
            phone: formData.phone || "",
            address: formData.address || "",
            website: formData.website || "",
            order: count + 1
        };

        await savePractitioner(newPractitioner);
        handleSelectPractitioner(newPractitioner);
        resetState();
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
                    <div className="space-y-6">
                        {/* List Existing Clinics & Practitioners */}
                        <div className="space-y-6 max-h-[450px] overflow-y-auto px-1 pr-2">
                            {Object.entries(groupedPractitioners).map(([clinic, staff]) => (
                                <div key={clinic} className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">
                                        <Hospital className="w-3.5 h-3.5 text-emerald-500" />
                                        {clinic}
                                    </h4>

                                    <div className="grid gap-2">
                                        {/* Always include a "Staff" option for this clinic */}
                                        <button
                                            onClick={() => handleSelectPractitioner({ clinicName: clinic, name: "", role: staff[0]?.role || "Chiropractor" })}
                                            className="w-full flex items-center p-3.5 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl transition-all group active:scale-[0.98]"
                                        >
                                            <div className="w-9 h-9 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <div className="ml-3 text-left flex-1">
                                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Our Staff</h3>
                                                <p className="text-[10px] text-zinc-500 font-medium">Any available practitioner</p>
                                            </div>
                                            <Check className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>

                                        {/* List Named Practitioners for this clinic */}
                                        {staff.filter(p => p.name && p.name !== "Unknown Practitioner").map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleSelectPractitioner(p)}
                                                className="w-full flex items-center p-3.5 bg-white dark:bg-zinc-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 border border-zinc-100 dark:border-zinc-800 rounded-2xl transition-all group active:scale-[0.98]"
                                            >
                                                <div className="w-9 h-9 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                    <Stethoscope className="w-4 h-4" />
                                                </div>
                                                <div className="ml-3 text-left flex-1">
                                                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{p.name}</h3>
                                                    <p className="text-[10px] text-zinc-500 font-medium">{p.role}</p>
                                                </div>
                                                <Check className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}

                                        {/* Quick "Add Name" for this clinic */}
                                        <button
                                            onClick={() => {
                                                setFormData({ clinicName: clinic, role: staff[0]?.role });
                                                setView('add');
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors w-fit"
                                        >
                                            <PlusCircle className="w-3.5 h-3.5" />
                                            ADD PRACTITIONER NAME
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {practitioners?.length === 0 && (
                                <div className="text-center py-8 text-zinc-500">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No clinics or staff found.</p>
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
                                disabled={!formData.name?.trim() && !formData.clinicName?.trim()}
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
