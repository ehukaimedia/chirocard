import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { ArrowLeft, Save, Edit2, AlertTriangle, Target, Heart, X, Activity, Info, Printer, Camera, Trash2, User, Shield } from "lucide-react";

import { TagInput } from "../components/ui/TagInput";
import { PlacesAutocomplete } from "../components/ui/PlacesAutocomplete";
import { useToast } from "../components/ui/Toast";
import { PatientQRModal } from "../components/Profile/PatientQRModal";
import { QrCode } from "lucide-react";

export default function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useLiveQuery(() => db.users.get("me"));
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
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

            // Auto-enable edit mode if requested AND fields are missing
            if (location.state?.editMode) {
                const requiredFields = ['name', 'dateOfBirth', 'height', 'weight', 'phone'];
                const isComplete = requiredFields.every(field => user[field as keyof typeof user]);
                if (!isComplete) {
                    setIsEditing(true);
                }
            }
        }
    }, [user, location.state]);

    const { toast } = useToast();

    const handleSave = async () => {
        // Validation
        const requiredFields = [
            { key: 'name', label: 'Name' },
            { key: 'dateOfBirth', label: 'Date of Birth' },
            { key: 'height', label: 'Height' },
            { key: 'weight', label: 'Weight' },
            { key: 'phone', label: 'Phone' }
        ];

        const missingFields = requiredFields.filter(field => !formData[field.key as keyof typeof formData]);

        if (missingFields.length > 0) {
            toast(`Please fill in required fields: ${missingFields.map(f => f.label).join(', ')}`, "error");
            return;
        }

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
            setIsEditing(false);
            toast("Profile updated successfully", "success");
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast("Failed to update profile", "error");
        }
    };



    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 pb-24">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 hidden md:flex items-center px-6 z-50 print:hidden">
                <Button variant="ghost" onClick={() => navigate("/")} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Dashboard
                </Button>
            </nav>

            {/* Header Content */}
            <div className="md:mt-16 mb-8 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Bodywork Profile</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage your personal health data and preferences.</p>
                </div>

                <div className="flex gap-3 items-center flex-wrap sm:flex-nowrap">
                    {!isEditing && (
                        <>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setIsQRModalOpen(true)}
                                className="whitespace-nowrap bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 border-0 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] px-4"
                            >
                                <QrCode className="w-4 h-4 mr-2" />
                                Show My Card
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.print()}
                                className="whitespace-nowrap border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors px-4"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print / PDF
                            </Button>
                        </>
                    )}
                    <Button
                        variant={isEditing ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className={isEditing
                            ? "whitespace-nowrap text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            : "whitespace-nowrap border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors px-4"}
                    >
                        {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4 mr-2" />}
                        {isEditing ? "Cancel" : "Edit"}
                    </Button>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0.5cm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="max-w-md mx-auto">
                {isEditing ? (
                    <EditView
                        formData={formData}
                        setFormData={setFormData}
                        handleSave={handleSave}
                    />
                ) : (
                    <PassportView user={user} />
                )}
            </div>

            <PatientQRModal
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                user={user}
            />
        </div>
    );
}

import { type UserProfile } from "../db/db";

export interface FormData {
    name: string;
    photo: string;
    email: string;
    phone: string;
    address: string;
    primaryComplaints: string[];
    contraindications: string[];
    preferences: string[];
    height: string;
    weight: string;
    dateOfBirth: string;
    occupation: string;
    activityLevel: string;
    bodyHistory: string[];
    medications: string[];
    allergies: string[];
    mobilityStatus: string[];
    physicalActivities: string[];
    diet: string[];
    supplements: string[];
    hydration: string;
    insurance: string[];
}

const PassportView = ({ user }: { user: UserProfile | undefined }) => {
    console.log("PassportView user:", user);
    return (
        <div className="space-y-6">
            {/* ID Card Header */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">DIGITAL BODYWORK PASSPORT</p>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-16 w-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                                {user?.photo ? (
                                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl font-bold text-zinc-400">
                                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : <User className="w-8 h-8" />}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight mb-1">{user?.name || "Guest User"}</h2>
                            </div>
                        </div>

                        {/* Vitals Grid */}
                        <div className="flex gap-6 text-sm">
                            <div>
                                <p className="text-zinc-500 text-xs uppercase">Height</p>
                                <p className="text-zinc-200 font-medium">{user?.height || "--"}</p>
                            </div>
                            <div>
                                <p className="text-zinc-500 text-xs uppercase">Weight</p>
                                <p className="text-zinc-200 font-medium">{user?.weight || "--"}</p>
                            </div>
                            <div>
                                <p className="text-zinc-500 text-xs uppercase">Age</p>
                                <p className="text-zinc-200 font-medium">
                                    {user?.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : "--"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-zinc-800/50 px-3 py-1 rounded-lg border border-zinc-700/50 inline-block mb-2">
                            <p className="text-zinc-400 text-xs uppercase">Activity</p>
                            <p className="text-emerald-400 font-bold">{user?.activityLevel || "Moderate"}</p>
                        </div>
                        <div>
                            <p className="text-zinc-500 text-xs uppercase">Occupation</p>
                            <p className="text-zinc-300 font-medium max-w-[120px] truncate">{user?.occupation || "--"}</p>
                        </div>
                    </div>
                </div>

                {/* Lifestyle: Physical Activities, Diet, Hydration, Supplements */}
                {(user?.physicalActivities?.length || user?.diet?.length || user?.supplements?.length || user?.hydration) && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-4">
                        {user?.physicalActivities && user.physicalActivities.length > 0 && (
                            <div>
                                <p className="text-zinc-500 text-xs uppercase mb-1">Physical Activities</p>
                                <div className="flex flex-wrap gap-2">
                                    {user.physicalActivities.map((activity, i) => (
                                        <span key={i} className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-2 py-0.5 rounded">
                                            {activity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {user?.diet && user.diet.length > 0 && (
                                <div>
                                    <p className="text-zinc-500 text-xs uppercase mb-1">Diet</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.diet.map((item, i) => (
                                            <span key={i} className="text-xs text-lime-400 bg-lime-950/30 border border-lime-900/50 px-2 py-0.5 rounded">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {user?.supplements && user.supplements.length > 0 && (
                                <div>
                                    <p className="text-zinc-500 text-xs uppercase mb-1">Supplements</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.supplements.map((item, i) => (
                                            <span key={i} className="text-xs text-orange-400 bg-orange-950/30 border border-orange-900/50 px-2 py-0.5 rounded">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {user?.hydration && (
                                <div className="col-span-2">
                                    <p className="text-zinc-500 text-xs uppercase mb-1">Hydration</p>
                                    <p className="text-cyan-400 font-medium text-sm">{user.hydration}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Contact Info */}
                {(user?.email || user?.phone || user?.address || user?.insurance) && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/50 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {user.email && (
                            <div>
                                <p className="text-zinc-500 text-xs uppercase">Email</p>
                                <p className="text-zinc-300 text-sm truncate">{user.email}</p>
                            </div>
                        )}
                        {user.phone && (
                            <div>
                                <p className="text-zinc-500 text-xs uppercase">Phone</p>
                                <p className="text-zinc-300 text-sm">{user.phone}</p>
                            </div>
                        )}
                        {user.address && (
                            <div>
                                <p className="text-zinc-500 text-xs uppercase">Address</p>
                                <p className="text-zinc-300 text-sm truncate">{user.address}</p>
                            </div>
                        )}
                        {(() => {
                            const insuranceList = Array.isArray(user.insurance) ? user.insurance : (user.insurance ? [user.insurance] : []);
                            if (insuranceList.length === 0) return null;

                            return (
                                <div className="md:col-span-3">
                                    <p className="text-zinc-500 text-xs uppercase mb-1">Insurance</p>
                                    <div className="flex flex-wrap gap-2">
                                        {insuranceList.map((item, i) => (
                                            <span key={i} className="text-xs text-zinc-300 bg-zinc-800/50 border border-zinc-700/50 px-2 py-0.5 rounded">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Clinical & Safety Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Critical Alerts - Contraindications & Allergies */}
                <div className="bg-rose-50 dark:bg-rose-950/30 rounded-2xl p-6 border border-rose-200 dark:border-rose-900/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-500" />
                        </div>
                        <h3 className="text-xl font-bold text-rose-900 dark:text-rose-200">Safety Alerts</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-rose-700 dark:text-rose-400 uppercase font-bold tracking-wider mb-2">Areas to Avoid</p>
                            <div className="flex flex-wrap gap-2">
                                {user?.contraindications && user.contraindications.length > 0 ? (
                                    user.contraindications.map((item: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-rose-900 dark:text-rose-200 font-medium text-sm">
                                            {item}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-rose-600/50 dark:text-rose-400/50 italic text-sm">None listed</p>
                                )}
                            </div>
                        </div>

                        {(user?.allergies && user.allergies.length > 0) || (user?.medications && user.medications.length > 0) ? (
                            <div className="pt-4 border-t border-rose-200 dark:border-rose-500/20">
                                <p className="text-xs text-rose-700 dark:text-rose-400 uppercase font-bold tracking-wider mb-2">Meds & Allergies</p>
                                <div className="flex flex-wrap gap-2">
                                    {user?.allergies?.map((item: string, i: number) => (
                                        <span key={`alg-${i}`} className="px-3 py-1.5 bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-rose-900 dark:text-rose-200 font-medium text-sm">
                                            Allergy: {item}
                                        </span>
                                    ))}
                                    {user?.medications?.map((item: string, i: number) => (
                                        <span key={`med-${i}`} className="px-3 py-1.5 bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-rose-900 dark:text-rose-200 font-medium text-sm">
                                            Med: {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Mobility & Medical History */}
                <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-700/20 rounded-lg">
                            <Activity className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-200">My Body Journal</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Mobility & ROM</p>
                            <div className="flex flex-wrap gap-2">
                                {user?.mobilityStatus && user.mobilityStatus.length > 0 ? (
                                    user.mobilityStatus.map((item: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-300 font-medium text-sm">
                                            {item}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-zinc-500 dark:text-zinc-600 italic text-sm">No mobility issues noted</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Body History</p>
                            <div className="flex flex-wrap gap-2">
                                {user?.bodyHistory && user.bodyHistory.length > 0 ? (
                                    user.bodyHistory.map((item: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-300 font-medium text-sm">
                                            {item}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-zinc-500 dark:text-zinc-600 italic text-sm">No history listed</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Focus Areas - Complaints */}
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                        <Target className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200">Focus Areas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {user?.primaryComplaints && user.primaryComplaints.length > 0 ? (
                        user.primaryComplaints.map((item: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-amber-900 dark:text-amber-200 font-medium text-sm">
                                {item}
                            </span>
                        ))
                    ) : (
                        <p className="text-amber-600/50 dark:text-amber-400/50 italic">No specific complaints</p>
                    )}
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-4 uppercase font-bold tracking-wider">Prioritize These Areas</p>
            </div>

            {/* Preferences */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-900/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                        <Heart className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200">Preferences</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {user?.preferences && user.preferences.length > 0 ? (
                        user.preferences.map((item: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg text-blue-900 dark:text-blue-200 font-medium text-sm">
                                {item}
                            </span>
                        ))
                    ) : (
                        <p className="text-blue-600/50 dark:text-blue-400/50 italic">No preferences listed</p>
                    )}
                </div>
            </div>

            {/* Data Management */}

        </div>
    );
}

export const EditView = ({ formData, setFormData, handleSave, missingFields = [] }: {
    formData: FormData,
    setFormData: React.Dispatch<React.SetStateAction<FormData>>,
    handleSave: () => void,
    missingFields?: string[]
}) => {
    const formatPhoneNumber = (value: string) => {
        const phoneNumber = value.replace(/[^\d]/g, '');
        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 4) return phoneNumber;
        if (phoneNumberLength < 7) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        }
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    };

    const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>('imperial');

    const toggleUnitSystem = () => {
        const newSystem = unitSystem === 'imperial' ? 'metric' : 'imperial';
        setUnitSystem(newSystem);

        // Convert Height
        if (formData.height) {
            let newHeight = formData.height;
            if (newSystem === 'metric') {
                // Imperial -> Metric (5'10" -> 178 cm)
                const match = formData.height.match(/(\d+)'(\d+)"/);
                if (match) {
                    const feet = parseInt(match[1]);
                    const inches = parseInt(match[2]);
                    const totalInches = (feet * 12) + inches;
                    newHeight = `${Math.round(totalInches * 2.54)} cm`;
                } else {
                    // If it's just a number (e.g., "70"), assume inches and convert
                    const inches = parseFloat(formData.height.replace(/[^\d.]/g, ''));
                    if (!isNaN(inches)) {
                        newHeight = `${Math.round(inches * 2.54)} cm`;
                    }
                }
            } else {
                // Metric -> Imperial (178 cm -> 5'10")
                const cm = parseFloat(formData.height.replace(/[^\d.]/g, ''));
                if (!isNaN(cm)) {
                    const totalInches = cm / 2.54;
                    const feet = Math.floor(totalInches / 12);
                    const inches = Math.round(totalInches % 12);
                    newHeight = `${feet}'${inches}"`;
                }
            }
            setFormData(prev => ({ ...prev, height: newHeight }));
        }

        // Convert Weight
        if (formData.weight) {
            let newWeight = formData.weight;
            const val = parseFloat(formData.weight.replace(/[^\d.]/g, ''));
            if (!isNaN(val)) {
                if (newSystem === 'metric') {
                    // lbs -> kg
                    newWeight = `${Math.round(val * 0.453592)} kg`;
                } else {
                    // kg -> lbs
                    newWeight = `${Math.round(val * 2.20462)} lbs`;
                }
            }
            setFormData(prev => ({ ...prev, weight: newWeight }));
        }
    };

    const formatHeight = (value: string) => {
        if (unitSystem === 'metric') {
            const digits = value.replace(/[^\d]/g, '');
            if (!digits) return "";
            return `${digits} cm`;
        }
        // Imperial
        const digits = value.replace(/[^\d]/g, '');
        if (!digits) return value;
        if (digits.length === 1) return digits;
        if (digits.length >= 2) {
            return `${digits[0]}'${digits.slice(1, 3)}"`;
        }
        return value;
    };

    const formatWeight = (value: string) => {
        const digits = value.replace(/[^\d.]/g, '');
        if (!digits) return "";
        return `${digits} ${unitSystem === 'imperial' ? 'lbs' : 'kg'}`;
    };

    const commonDiets = ["Vegan", "Vegetarian", "Keto", "Paleo", "Gluten-Free", "Dairy-Free", "Pescatarian", "Whole30", "Mediterranean"];
    const commonSupplements = ["Vitamin D", "Magnesium", "Omega-3", "Multivitamin", "Probiotics", "Zinc", "Iron", "B12", "Creatine", "Protein Powder"];
    const commonActivities = ["Yoga", "Running", "Weightlifting", "CrossFit", "Swimming", "Cycling", "Pilates", "Hiking", "Martial Arts", "Dance", "Surfing"];
    const commonMobility = ["Limited ROM", "Hyper-mobile", "Stiffness", "Joint Pain", "Good Flexibility", "Tight Hamstrings", "Tight Hips", "Shoulder Impingement"];
    const commonComplaints = ["Lower Back Pain", "Neck Pain", "Sciatica", "Headaches", "Shoulder Tension", "Hip Pain", "Knee Pain", "Plantar Fasciitis", "Carpal Tunnel"];
    const commonContraindications = ["Recent Surgery", "Inflammation", "Varicose Veins", "Pregnancy", "Skin Infection", "Fever", "Blood Clots", "Fracture", "Open Wounds"];
    const commonPreferences = ["Deep Tissue", "Light Pressure", "Medium Pressure", "No Talking", "Focus on Neck", "Focus on Back", "Scalp Massage", "Foot Massage", "Aromatherapy", "Heat Therapy"];
    const commonBodyHistory = ["Surgery", "Fracture", "Sprain", "Dislocation", "Car Accident", "Sports Injury", "Chronic Pain", "Arthritis", "Scoliosis"];
    const commonMedications = ["Blood Thinners", "Pain Killers", "Anti-inflammatory", "Muscle Relaxers", "Blood Pressure", "Thyroid", "Insulin", "Antibiotics"];
    const commonAllergies = ["Latex", "Nuts", "Oils", "Scents", "Lotion", "Dust", "Pollen", "Shellfish", "Dairy", "Gluten"];

    return (
        <Card className="p-6 space-y-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">

            {/* Advisory Alert */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-700 dark:text-emerald-300">
                    <p className="font-medium mb-1">Complete Profile Recommended</p>
                    <p className="mb-2">Please fill out as much information as possible for a more productive session.</p>
                    <p className="text-xs opacity-80 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Your data is stored locally and securely on your device.
                    </p>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">How to add items</p>
                    <p>Type and press <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-700 rounded text-xs font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-700 rounded text-xs font-mono">Comma</kbd> to add items.</p>
                </div>
            </div>
            <div className="flex justify-end">
                <p className="text-xs text-zinc-500 dark:text-zinc-400"><span className="text-red-500">*</span> Required</p>
            </div>
            <Input
                label="Your Name"
                value={formData.name}
                onChange={e => setFormData((prev: FormData) => ({ ...prev, name: e.target.value }))}
                placeholder="Jane Doe"
                required
                error={missingFields.includes('name')}
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                autoComplete="name"
            />

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Profile Photo</label>
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                        {formData.photo ? (
                            <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-8 h-8 text-zinc-400" />
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                            className="border-zinc-200 dark:border-zinc-700"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Upload Photo
                        </Button>
                        {formData.photo && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFormData(prev => ({ ...prev, photo: "" }))}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                            </Button>
                        )}
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setFormData(prev => ({ ...prev, photo: reader.result as string }));
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Email"
                    value={formData.email}
                    onChange={e => setFormData((prev: FormData) => ({ ...prev, email: e.target.value }))}
                    placeholder="jane@example.com"
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                    autoComplete="email"
                />
                <Input
                    label="Phone"
                    value={formData.phone}
                    onChange={e => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setFormData((prev: FormData) => ({ ...prev, phone: formatted }));
                    }}
                    placeholder="(555) 123-4567"
                    required
                    error={missingFields.includes('phone')}
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                    autoComplete="tel"
                />
            </div>
            <PlacesAutocomplete
                label="Address"
                defaultValue={formData.address}
                onSelect={(place) => {
                    setFormData((prev: FormData) => ({
                        ...prev,
                        address: place.formatted_address || ""
                    }));
                }}
                onChange={e => setFormData((prev: FormData) => ({ ...prev, address: e.target.value }))}
                placeholder="123 Wellness Way, Healing City, HC 90210"
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
            />
            <TagInput
                label="Insurance Provider & Policy #"
                value={formData.insurance}
                onChange={(tags) => setFormData(prev => ({ ...prev, insurance: tags }))}
                placeholder="e.g. Blue Cross #123456789"
            />

            <div className="flex justify-end mb-1">
                <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-50 dark:bg-zinc-900/50">
                    <button
                        type="button"
                        onClick={() => unitSystem !== 'imperial' && toggleUnitSystem()}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${unitSystem === 'imperial' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                    >
                        Imperial (ft/lbs)
                    </button>
                    <button
                        type="button"
                        onClick={() => unitSystem !== 'metric' && toggleUnitSystem()}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${unitSystem === 'metric' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                    >
                        Metric (cm/kg)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label={`Height (${unitSystem === 'imperial' ? 'ft/in' : 'cm'})`}
                    value={formData.height}
                    onChange={e => setFormData((prev: FormData) => ({ ...prev, height: e.target.value }))}
                    onBlur={e => {
                        const formatted = formatHeight(e.target.value);
                        setFormData((prev: FormData) => ({ ...prev, height: formatted }));
                    }}
                    placeholder={unitSystem === 'imperial' ? "5'10" : "178"}
                    required
                    error={missingFields.includes('height')}
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
                <Input
                    label={`Weight (${unitSystem === 'imperial' ? 'lbs' : 'kg'})`}
                    value={formData.weight}
                    onChange={e => setFormData((prev: FormData) => ({ ...prev, weight: e.target.value }))}
                    onBlur={e => {
                        const formatted = formatWeight(e.target.value);
                        setFormData((prev: FormData) => ({ ...prev, weight: formatted }));
                    }}
                    placeholder={unitSystem === 'imperial' ? "165" : "75"}
                    required
                    error={missingFields.includes('weight')}
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    type="date"
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData((prev: FormData) => ({ ...prev, dateOfBirth: e.target.value }))}
                    required
                    error={missingFields.includes('dateOfBirth')}
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                    autoComplete="bday"
                />
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Activity Level</label>
                    <select
                        className="w-full h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={formData.activityLevel}
                        onChange={e => setFormData((prev: FormData) => ({ ...prev, activityLevel: e.target.value }))}
                    >
                        {['Sedentary', 'Light', 'Moderate', 'Active', 'Athlete'].map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Input
                label="Occupation (Affects posture/stress)"
                value={formData.occupation}
                onChange={e => setFormData((prev: FormData) => ({ ...prev, occupation: e.target.value }))}
                placeholder="e.g. Desk Worker, Nurse, Construction"
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                autoComplete="organization-title"
            />

            <TagInput
                label="Physical Activities"
                value={formData.physicalActivities}
                onChange={(tags) => setFormData(prev => ({ ...prev, physicalActivities: tags }))}
                placeholder="e.g. Yoga, Running"
                suggestions={commonActivities}
            />

            <div className="grid grid-cols-2 gap-4">
                <TagInput
                    label="Diet"
                    value={formData.diet}
                    onChange={(tags) => setFormData(prev => ({ ...prev, diet: tags }))}
                    placeholder="e.g. Vegan"
                    suggestions={commonDiets}
                />
                <TagInput
                    label="Supplements"
                    value={formData.supplements}
                    onChange={(tags) => setFormData(prev => ({ ...prev, supplements: tags }))}
                    placeholder="e.g. Vitamin D"
                    suggestions={commonSupplements}
                />
            </div>
            <Input
                label="Hydration"
                value={formData.hydration}
                onChange={e => setFormData((prev: FormData) => ({ ...prev, hydration: e.target.value }))}
                placeholder="e.g. 2L/day"
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
            />

            <TagInput
                label="Body History (Surgeries, Accidents)"
                value={formData.bodyHistory}
                onChange={(tags) => setFormData(prev => ({ ...prev, bodyHistory: tags }))}
                placeholder="e.g. ACL Reconstruction 2018"
                suggestions={commonBodyHistory}
            />

            <div className="grid grid-cols-2 gap-4">
                <TagInput
                    label="Medications"
                    value={formData.medications}
                    onChange={(tags) => setFormData(prev => ({ ...prev, medications: tags }))}
                    placeholder="e.g. Blood Thinners"
                    suggestions={commonMedications}
                />
                <TagInput
                    label="Allergies"
                    value={formData.allergies}
                    onChange={(tags) => setFormData(prev => ({ ...prev, allergies: tags }))}
                    placeholder="e.g. Latex, Nut Oils"
                    suggestions={commonAllergies}
                />
            </div>

            <TagInput
                label="Mobility & ROM Status"
                value={formData.mobilityStatus}
                onChange={(tags) => setFormData(prev => ({ ...prev, mobilityStatus: tags }))}
                placeholder="e.g. Limited Right Shoulder Flexion"
                suggestions={commonMobility}
            />

            <TagInput
                label="Primary Complaints"
                value={formData.primaryComplaints}
                onChange={(tags) => setFormData(prev => ({ ...prev, primaryComplaints: tags }))}
                placeholder="e.g. Lower Back Pain, Sciatica"
                suggestions={commonComplaints}
            />

            <TagInput
                label="Areas to Avoid (Contraindications)"
                value={formData.contraindications}
                onChange={(tags) => setFormData(prev => ({ ...prev, contraindications: tags }))}
                placeholder="e.g. No deep tissue on calves"
                suggestions={commonContraindications}
            />

            <TagInput
                label="Preferences"
                value={formData.preferences}
                onChange={(tags) => setFormData(prev => ({ ...prev, preferences: tags }))}
                placeholder="e.g. Lighter pressure, Scalp massage"
                suggestions={commonPreferences}
            />

            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> Save Profile
            </Button>
        </Card>
    );
};
