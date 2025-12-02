import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Practitioner } from "../db/db";
import { Button } from "../components/ui/Button";
import { BodyRegionSelector, type BodyStatus, REGIONS } from "../components/BodyMap/BodyRegionSelector";
import { ArrowLeft, Play, User } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { SignaturePad, type SignaturePadRef } from "../components/SignaturePad";
import { useToast } from "../components/ui/Toast";
import { Modal } from "../components/ui/Modal";
import { AddPractitionerModal } from "../components/Practitioner/AddPractitionerModal";
import { PatientQRModal } from "../components/Profile/PatientQRModal";
import { QrCode } from "lucide-react";

import { EditView, type FormData } from "./Profile";

export default function Intake() {
    const navigate = useNavigate();
    const location = useLocation();
    const appointmentId = location.state?.appointmentId;
    const { intakeData, activePractitioner, clearIntakeData } = useAppStore();

    // Initialize with existing data if returning from session
    const [bodyStatus, setBodyStatus] = useState<Record<string, BodyStatus>>(intakeData?.bodyMap || {});
    const [bodyNotes, setBodyNotes] = useState<Record<string, string>>(intakeData?.bodyNotes || {});
    const [bodyLevels, setBodyLevels] = useState<Record<string, number>>(intakeData?.bodyLevels || {});
    const [bodyBadges, setBodyBadges] = useState<Record<string, string[]>>(intakeData?.bodyBadges || {});
    const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(
        activePractitioner ? { ...activePractitioner } as Practitioner : null
    );
    const [notes, setNotes] = useState(intakeData?.notes || "");

    const user = useLiveQuery(() => db.users.get("me"));

    const [step, setStep] = useState<"intake" | "review">("intake");
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [showAddPractitionerModal, setShowAddPractitionerModal] = useState(false);
    const [showPractitionerAlert, setShowPractitionerAlert] = useState(false);
    const [showProfileEditModal, setShowProfileEditModal] = useState(false);
    const [showMissingDetailsAlert, setShowMissingDetailsAlert] = useState(false);
    const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [missingDetailsParts, setMissingDetailsParts] = useState<string[]>([]);
    const sigPadRef = useRef<SignaturePadRef>(null);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        photo: "",
        email: "",
        phone: "",
        address: "",
        primaryComplaints: [] as string[],
        contraindications: [] as string[],
        preferences: [] as string[],
        height: "",
        weight: "",
        dateOfBirth: "",
        occupation: "",
        activityLevel: "Moderate",
        bodyHistory: [] as string[],
        medications: [] as string[],
        allergies: [] as string[],
        mobilityStatus: [] as string[],
        physicalActivities: [] as string[],
        diet: [] as string[],
        supplements: [] as string[],
        hydration: "",
        insurance: [] as string[]
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                photo: user.photo || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                primaryComplaints: user.primaryComplaints || [],
                contraindications: user.contraindications || [],
                preferences: user.preferences || [],
                height: user.height || "",
                weight: user.weight || "",
                dateOfBirth: user.dateOfBirth || "",
                occupation: user.occupation || "",
                activityLevel: user.activityLevel || "Moderate",
                bodyHistory: user.bodyHistory || [],
                medications: user.medications || [],
                allergies: user.allergies || [],
                mobilityStatus: user.mobilityStatus || [],
                physicalActivities: user.physicalActivities || [],
                diet: user.diet || [],
                supplements: user.supplements || [],
                hydration: user.hydration || "",
                insurance: Array.isArray(user.insurance) ? user.insurance : (user.insurance ? [user.insurance] : [])
            });
        }
    }, [user]);

    const practitioners = useLiveQuery(() => db.practitioners.orderBy('order').toArray());

    const { toast } = useToast();

    useEffect(() => {
        // Check if there is existing intake data when the component mounts
        if (intakeData && (Object.keys(intakeData.bodyMap).length > 0 || intakeData.notes)) {
            setShowResumeModal(true);
        } else if (appointmentId) {
            // If starting from an appointment, try to find it and pre-fill
            db.appointments.get(appointmentId).then(appt => {
                if (appt) {
                    db.practitioners.get(appt.practitionerId).then(p => {
                        if (p) {
                            setSelectedPractitioner(p);
                            toast(`Starting session with ${p.name}`, "info");
                        }
                    });
                }
            });
        }
    }, [appointmentId, intakeData]);

    const handleResume = () => {
        setShowResumeModal(false);
        toast("Resumed previous session intake.", "info");
    };

    const handleStartNew = () => {
        clearIntakeData();
        setBodyStatus({});
        setBodyNotes({});
        setBodyLevels({});
        setBodyBadges({});
        setNotes("");
        setSelectedPractitioner(null);
        setShowResumeModal(false);
        toast("Started a new session intake.", "success");
    };

    const handleStartClick = () => {
        console.log("Checking requirements. User:", user);

        if (!selectedPractitioner) {
            setShowPractitionerAlert(true);
            return;
        }

        // Validate Profile
        if (!user || !user.name || !user.dateOfBirth) {
            console.log("Profile incomplete:", { name: user?.name, dob: user?.dateOfBirth });
            setShowProfileEditModal(true);
            return;
        }

        // Validate Body Details
        const activeRegions = Object.entries(bodyStatus)
            .filter(([_, status]) => status === 'issue' || status === 'watch')
            .map(([part]) => part);

        if (activeRegions.length === 0) {
            setShowNoSelectionAlert(true);
            return;
        }

        const missingDetails = activeRegions.filter(part => {
            const hasBadges = bodyBadges[part] && bodyBadges[part].length > 0;
            const hasNotes = bodyNotes[part] && bodyNotes[part].trim().length > 0;
            return !hasBadges && !hasNotes;
        });

        if (missingDetails.length > 0) {
            setMissingDetailsParts(missingDetails);
            setShowMissingDetailsAlert(true);
            return;
        }

        setStep("review");
    };

    const handleSaveProfile = async () => {
        try {
            await db.users.put({
                id: "me",
                name: formData.name,
                photo: formData.photo,
                primaryComplaints: formData.primaryComplaints,
                contraindications: formData.contraindications,
                preferences: formData.preferences,
                height: formData.height,
                weight: formData.weight,
                dateOfBirth: formData.dateOfBirth,
                occupation: formData.occupation,
                activityLevel: formData.activityLevel as 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Athlete',
                bodyHistory: formData.bodyHistory,
                medications: formData.medications,
                allergies: formData.allergies,
                mobilityStatus: formData.mobilityStatus,
                physicalActivities: formData.physicalActivities,
                diet: formData.diet,
                supplements: formData.supplements,
                hydration: formData.hydration,
                insurance: formData.insurance,
                pin: user?.pin || null,
                biometricEnabled: user?.biometricEnabled || false,
                theme: user?.theme || "dark",
                email: formData.email,
                phone: formData.phone,
                address: formData.address
            });
            setShowProfileEditModal(false);
            toast("Profile updated successfully", "success");
            // Automatically proceed if valid? Or let user click again? 
            // Let's let them click again or just stay there. The modal closing is enough feedback.
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast("Failed to update profile", "error");
        }
    };

    const handleConfirmStart = async () => {
        if (!selectedPractitioner) return;

        // Get signature (currently unused in QR flow, but good to have ready)
        // const signature = sigPadRef.current?.getTrimmedCanvas().toDataURL("image/png") || null;

        // Update global store with current intake data so it's included in the QR code
        useAppStore.getState().updateIntakeData({
            bodyMap: bodyStatus,
            bodyNotes: bodyNotes,
            bodyLevels: bodyLevels,
            bodyBadges: bodyBadges,
            notes: notes
        });

        // Also update signature if possible, or just rely on the fact that we're showing the QR code now
        // The PatientQRModal pulls from `intakeData` in the store.
        // We might need to manually inject the signature into the payload in PatientQRModal if it's not in the store type yet.
        // For now, let's just show the modal. The signature is less critical for the *start* than the intake data.

        setShowQRModal(true);
    };

    // Auto-select first practitioner if available and none selected
    if (practitioners && practitioners.length > 0 && !selectedPractitioner) {
        setSelectedPractitioner(practitioners[0]);
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Session Intake</h1>
            </div>

            <Modal
                isOpen={showResumeModal}
                onClose={() => { /* Prevent closing by clicking outside to force choice? Or just default to resume? Let's default to resume if they click out */ setShowResumeModal(false); }}
                title="Resume Session?"
                description="You have an unfinished session intake in progress. Would you like to resume it or start over?"
                confirmLabel="Resume Session"
                cancelLabel="Start New"
                onConfirm={handleResume}
                onCancel={handleStartNew}
            />

            <Modal
                isOpen={showPractitionerAlert}
                onClose={() => setShowPractitionerAlert(false)}
                title="Practitioner Required"
                description="Please select a practitioner to continue with the session intake."
                confirmLabel="OK"
                onConfirm={() => setShowPractitionerAlert(false)}
            />

            <Modal
                isOpen={showNoSelectionAlert}
                onClose={() => setShowNoSelectionAlert(false)}
                title="No Area Selected"
                description="Please select at least one area of concern to continue."
                confirmLabel="OK"
                onConfirm={() => setShowNoSelectionAlert(false)}
            />

            <Modal
                isOpen={showMissingDetailsAlert}
                onClose={() => setShowMissingDetailsAlert(false)}
                title="Missing Details"
                description={`Please add at least one detail (e.g., Pain, Stiffness) for the following areas: ${missingDetailsParts.map(id => REGIONS.find(r => r.id === id)?.label).join(", ")}.`}
                confirmLabel="OK"
                onConfirm={() => setShowMissingDetailsAlert(false)}
            />

            <Modal
                isOpen={showProfileEditModal}
                onClose={() => setShowProfileEditModal(false)}
                title="Complete Your Profile"
                description="Please provide your details to ensure the best session experience."
                className="max-w-2xl" // Make it wider
            >
                <div className="max-h-[70vh] overflow-y-auto pr-2">
                    <EditView
                        formData={formData}
                        setFormData={setFormData}
                        handleSave={handleSaveProfile}
                    />
                </div>
            </Modal>

            <div className="flex-1 space-y-8">
                {step === "intake" ? (
                    <>
                        {/* Client Profile Section */}
                        <section className="mb-8">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">1. Client Profile</h2>
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                        {user?.photo ? (
                                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-bold text-zinc-400">
                                                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : <User className="w-6 h-6" />}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">{user?.name || "Guest User"}</h3>
                                        <p className="text-sm text-zinc-500">
                                            {user?.dateOfBirth ? `${new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()} years old` : "Age not set"}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setShowProfileEditModal(true)}>
                                    Edit
                                </Button>
                            </div>
                        </section>

                        {/* Practitioner Selection - Cards */}
                        <section>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">2. Select Practitioner</h2>
                            {practitioners && practitioners.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {practitioners.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => setSelectedPractitioner(p)}
                                                className={`
                                                    relative p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]
                                                    ${selectedPractitioner?.id === p.id
                                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`
                                                        w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                                                        ${selectedPractitioner?.id === p.id
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}
                                                    `}>
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                                                        <p className="text-xs text-zinc-500">{p.role}</p>
                                                    </div>
                                                </div>
                                                {selectedPractitioner?.id === p.id && (
                                                    <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center px-2">
                                        <p className="text-xs text-zinc-500">
                                            Manage your team in <span className="font-bold cursor-pointer hover:text-emerald-500" onClick={() => navigate('/team')}>Team Settings</span>.
                                        </p>
                                        <button
                                            onClick={() => setShowAddPractitionerModal(true)}
                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full"
                                        >
                                            + Add New
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                    <p className="text-zinc-500 mb-4">No practitioners found.</p>
                                    <Button onClick={() => setShowAddPractitionerModal(true)}>Add Practitioner</Button>
                                </div>
                            )}

                            <AddPractitionerModal
                                isOpen={showAddPractitionerModal}
                                onClose={() => setShowAddPractitionerModal(false)}
                                onAdded={(newPractitioner) => {
                                    setSelectedPractitioner(newPractitioner);
                                    toast(`Added ${newPractitioner.name} to your team.`, "success");
                                }}
                            />
                        </section>

                        {/* Question 3 */}
                        <section className="space-y-4 pb-4">
                            <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                                3. Tap areas of concern
                            </h2>
                            <BodyRegionSelector
                                value={bodyStatus}
                                onChange={(part, status) => setBodyStatus(prev => ({ ...prev, [part]: status }))}
                                mode="simple"
                            />
                        </section>

                        {/* Dynamic Body Notes */}
                        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                                4. Details for Selected Areas
                            </h2>
                            <div className="grid gap-4">
                                {Object.entries(bodyStatus).some(([_, status]) => status === 'issue' || status === 'watch') ? (
                                    Object.entries(bodyStatus)
                                        .filter(([_, status]) => status === 'issue' || status === 'watch')
                                        .map(([partId, status]) => {
                                            const region = REGIONS.find(r => r.id === partId);
                                            if (!region) return null;
                                            return (
                                                <div key={partId} className="space-y-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${status === 'issue' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                            {region.label}
                                                        </label>
                                                        <span className="text-xs font-bold text-zinc-500">
                                                            Pain Level: {bodyLevels[partId] || 0}/10
                                                        </span>
                                                    </div>

                                                    {/* Intensity Slider */}
                                                    <div className="px-2">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="10"
                                                            step="1"
                                                            value={bodyLevels[partId] || 0}
                                                            onChange={(e) => setBodyLevels(prev => ({ ...prev, [partId]: parseInt(e.target.value) }))}
                                                            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-emerald-500"
                                                        />
                                                        <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                                            <span>None</span>
                                                            <span>Moderate</span>
                                                            <span>Severe</span>
                                                        </div>
                                                    </div>

                                                    {/* Badges */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {["Pain", "Stiffness", "Numbness", "Tingling", "Weakness", "Spasm", "Limited ROM", "Swelling"].map(badge => {
                                                            const isSelected = (bodyBadges[partId] || []).includes(badge);
                                                            return (
                                                                <button
                                                                    key={badge}
                                                                    onClick={() => {
                                                                        setBodyBadges(prev => {
                                                                            const current = prev[partId] || [];
                                                                            return {
                                                                                ...prev,
                                                                                [partId]: isSelected
                                                                                    ? current.filter(b => b !== badge)
                                                                                    : [...current, badge]
                                                                            };
                                                                        });
                                                                    }}
                                                                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${isSelected
                                                                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                                                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50'
                                                                        }`}
                                                                >
                                                                    {badge}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <input
                                                        type="text"
                                                        value={bodyNotes[partId] || ""}
                                                        onChange={(e) => setBodyNotes(prev => ({ ...prev, [partId]: e.target.value }))}
                                                        placeholder={`Specifics for ${region.label}...`}
                                                        className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                </div>
                                            );
                                        })
                                ) : (
                                    <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                        <p className="text-sm text-zinc-500">Select an area above to add details.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Question 5: Notes */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                                5. Notes for Practitioner
                            </h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Type or dictate notes here..."
                                className="w-full h-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </section>
                    </>
                ) : (
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-3xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Review & Sign</h2>
                            <Button variant="ghost" onClick={() => setStep("intake")} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                                Edit Intake
                            </Button>
                        </div>

                        {/* Digital Document Preview */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden space-y-8">
                            {/* Header */}
                            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
                                <h1 className="text-2xl font-serif text-emerald-600 dark:text-emerald-500 mb-2">Intake Summary</h1>
                                <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                                    <span>Date: {new Date().toLocaleDateString()}</span>
                                    <span>Practitioner: {selectedPractitioner?.name}</span>
                                </div>
                            </div>

                            {/* Body Areas */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Areas of Concern</h3>
                                {Object.entries(bodyStatus).filter(([_, s]) => s === 'issue' || s === 'watch').length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(bodyStatus)
                                            .filter(([_, status]) => status === 'issue' || status === 'watch')
                                            .map(([partId, status]) => {
                                                const region = REGIONS.find(r => r.id === partId);
                                                const note = bodyNotes[partId];
                                                return (
                                                    <div key={partId} className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                                                        <div className="w-full">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-zinc-900 dark:text-zinc-200">{region?.label}</span>
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${status === 'issue' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                                    {status}
                                                                </span>
                                                            </div>
                                                            {(bodyLevels[partId] !== undefined || (bodyBadges[partId] && bodyBadges[partId].length > 0)) && (
                                                                <div className="flex flex-wrap gap-2 mb-2">
                                                                    {bodyLevels[partId] !== undefined && (
                                                                        <span className="text-xs font-bold text-zinc-500">Pain Level: {bodyLevels[partId]}/10</span>
                                                                    )}
                                                                    {bodyBadges[partId]?.map(badge => (
                                                                        <span key={badge} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                                                            {badge}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {note && <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">"{note}"</p>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-500 italic">No specific areas marked.</p>
                                )}
                            </div>

                            <hr className="border-zinc-200 dark:border-zinc-800" />

                            {/* Notes */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Notes for Practitioner</h3>
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                                    {notes || "No notes added."}
                                </p>
                            </div>

                            <hr className="border-zinc-200 dark:border-zinc-800" />

                            {/* Signature Section */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-200">Sign to Start Session</h3>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Client Initials</label>
                                    <SignaturePad ref={sigPadRef} />
                                    <div className="mt-2">
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Signed by: <span className="font-medium text-zinc-900 dark:text-zinc-100">{user?.name || "Guest"}</span>
                                        </p>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-4 text-center">
                                        By signing, you confirm that the information provided is accurate.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg z-10">
                {step === "intake" ? (
                    <>
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full shadow-xl shadow-primary/20 text-lg h-auto min-h-[3.5rem] py-3"
                            onClick={handleStartClick}
                        >
                            Review & Sign <Play className="ml-2 w-5 h-5 fill-current flex-shrink-0" />
                        </Button>
                        <p className="text-center text-xs text-zinc-500 mt-3">
                            Review your information before starting
                        </p>
                    </>
                ) : (
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => setStep("intake")} className="flex-1 h-auto min-h-[3.5rem]">
                            Back
                        </Button>
                        <Button
                            variant="primary"
                            size="lg"
                            className="flex-[2] shadow-xl shadow-primary/20 text-lg h-auto min-h-[3.5rem] py-3 leading-tight"
                            onClick={handleConfirmStart}
                        >
                            Check In (Show QR) <QrCode className="ml-2 w-5 h-5 flex-shrink-0" />
                        </Button>
                    </div>
                )}
            </div>

            <PatientQRModal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                user={user}
            />
        </div>
    );
}
