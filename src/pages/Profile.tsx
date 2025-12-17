import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDataStore } from "../store/useDataStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ArrowLeft, Save, Edit2, AlertTriangle, Target, Heart, X, Activity, Printer, Camera, Trash2, User, Shield } from "lucide-react";

import { TagInput } from "../components/ui/TagInput";
import { AddressAutocomplete } from "../components/ui/AddressAutocomplete";

import { useToast } from "../components/ui/Toast";
import { trackEvent } from "../utils/analytics";


export default function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, saveUser } = useDataStore();

    const [isEditing, setIsEditing] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);

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
        if (user && !isEditing) {
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
    }, [user, location.state, isEditing]);

    const { toast } = useToast();

    const handleSave = async () => {
        // Validation
        const requiredFields = [
            { key: 'name', label: 'Name' },
            { key: 'dateOfBirth', label: 'Date of Birth' }
        ];

        const missingFieldsList = requiredFields.filter(field => !formData[field.key as keyof typeof formData]);

        if (missingFieldsList.length > 0) {
            setMissingFields(missingFieldsList.map(f => f.key));
            console.log("Validation failed. Missing:", missingFieldsList);
            toast(`Please fill in required fields: ${missingFieldsList.map(f => f.label).join(', ')}`, "error");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setMissingFields([]);

        try {
            await saveUser({
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
            trackEvent('update_profile');
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast("Failed to update profile", "error");
        }
    };





    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-24">
            {/* Top Navigation Bar */}
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 min-h-[64px] h-auto bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 hidden md:flex items-center px-6 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 z-50 print:hidden">
                <Button variant="ghost" onClick={() => navigate("/")} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Dashboard
                </Button>
            </nav>

            {/* Header Content */}
            <div className="md:mt-16 mb-8 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Bodywork Profile</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your personal health data and preferences.</p>
                </div>
                <div className="flex gap-3 items-center">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print / PDF
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
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
                        missingFields={missingFields}
                    />
                ) : (
                    <PassportView user={user || undefined} />
                )}
            </div>


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
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">MY BODYWORK PASSPORT</p>
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
                                    {user?.dateOfBirth ? (() => {
                                        const birthDate = new Date(user.dateOfBirth);
                                        const ageDifMs = Date.now() - birthDate.getTime();
                                        const ageDate = new Date(ageDifMs); // miliseconds from epoch
                                        return Math.abs(ageDate.getUTCFullYear() - 1970);
                                    })() : "--"}
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
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-200">MY BODY</h3>
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
        <div className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm rounded-none md:rounded-2xl pb-32">
            <div className="p-5 space-y-6">
                {/* Advisory Alert */}
                <div className="bg-white dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 flex items-start gap-3 shadow-sm">
                    <Shield className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-zinc-700 dark:text-emerald-300">
                        <p className="font-bold text-base mb-1 text-emerald-800 dark:text-emerald-400">Complete Profile</p>
                        <p className="mb-2 leading-relaxed">Fill out your details for better results. Data is stored locally.</p>
                        <p className="text-xs font-bold opacity-80 flex items-center gap-1.5 uppercase tracking-wide text-emerald-700">
                            <Shield className="w-3.5 h-3.5" />
                            Secure & Private
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide"><span className="text-red-600 font-black">*</span> Required</p>
                </div>

                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Your Name <span className="text-red-600">*</span></label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData((prev: FormData) => ({ ...prev, name: e.target.value }))}
                            placeholder="Jane Doe"
                            required
                            error={missingFields.includes('name')}
                            className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white h-12 text-base font-medium rounded-xl px-4 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                            autoComplete="name"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Date of Birth <span className="text-red-600">*</span></label>
                        <Input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={e => setFormData((prev: FormData) => ({ ...prev, dateOfBirth: e.target.value }))}
                            required
                            error={missingFields.includes('dateOfBirth')}
                            className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white h-12 text-base font-medium rounded-xl px-4 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                        />
                    </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Profile Photo</label>
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {formData.photo ? (
                                <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-zinc-300" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('photo-upload')?.click()}
                                className="bg-white border-zinc-300 dark:border-zinc-600 h-10 text-sm font-bold px-4 text-zinc-700 shadow-sm"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Upload
                            </Button>
                            {formData.photo && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFormData(prev => ({ ...prev, photo: "" }))}
                                    className="text-red-600 hover:text-red-700 font-medium h-8"
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
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

                <div className="grid grid-cols-1 gap-5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Email</label>
                        <Input
                            value={formData.email}
                            onChange={e => setFormData((prev: FormData) => ({ ...prev, email: e.target.value }))}
                            placeholder="jane@example.com"
                            className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white h-12 text-base font-medium rounded-xl px-4 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                            autoComplete="email"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Phone</label>
                        <Input
                            value={formData.phone}
                            onChange={e => {
                                const formatted = formatPhoneNumber(e.target.value);
                                setFormData((prev: FormData) => ({ ...prev, phone: formatted }));
                            }}
                            placeholder="(555) 123-4567"
                            className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white h-12 text-base font-medium rounded-xl px-4 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                            autoComplete="tel"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Address</label>
                    <AddressAutocomplete
                        value={formData.address}
                        onSelect={(addr) => setFormData(prev => ({ ...prev, address: addr }))}
                        onChange={(addr) => setFormData(prev => ({ ...prev, address: addr }))}
                        placeholder="123 Wellness Way..."
                        className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white h-12 text-base font-medium rounded-xl px-4 shadow-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Insurance</label>
                    <TagInput
                        label="Insurance Provider"
                        value={formData.insurance}
                        onChange={(tags) => setFormData(prev => ({ ...prev, insurance: tags }))}
                        placeholder="Add Provider..."
                    />
                </div>

                <div className="flex justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="inline-flex rounded-lg border border-zinc-300 dark:border-zinc-700 p-1 bg-white dark:bg-zinc-900/50 shadow-sm">
                        <button
                            type="button"
                            onClick={() => unitSystem !== 'imperial' && toggleUnitSystem()}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unitSystem === 'imperial' ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                        >
                            Imperial
                        </button>
                        <button
                            type="button"
                            onClick={() => unitSystem !== 'metric' && toggleUnitSystem()}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unitSystem === 'metric' ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                        >
                            Metric
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Height</label>
                        <Input
                            value={formData.height}
                            onChange={e => setFormData((prev: FormData) => ({ ...prev, height: e.target.value }))}
                            placeholder={unitSystem === 'imperial' ? "5'10" : "178"}
                            className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white h-12 text-base font-medium rounded-xl px-4 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Weight</label>
                        <Input
                            value={formData.weight}
                            onChange={e => setFormData((prev: FormData) => ({ ...prev, weight: e.target.value }))}
                            placeholder={unitSystem === 'imperial' ? "165" : "75"}
                            className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white h-12 text-base font-medium rounded-xl px-4 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                        />
                    </div>
                </div>

                <div className="space-y-5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Activity Level</label>
                        <div className="relative">
                            <select
                                className="w-full h-12 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 text-base font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none shadow-sm"
                                value={formData.activityLevel}
                                onChange={e => setFormData((prev: FormData) => ({ ...prev, activityLevel: e.target.value }))}
                            >
                                {['Sedentary', 'Light', 'Moderate', 'Active', 'Athlete'].map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Occupation</label>
                        <Input
                            value={formData.occupation}
                            onChange={e => setFormData((prev: FormData) => ({ ...prev, occupation: e.target.value }))}
                            placeholder="e.g. Desk Worker"
                            className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white h-12 text-base font-medium rounded-xl px-4 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                            autoComplete="organization-title"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Physical Activities</label>
                    <TagInput
                        label="Activities"
                        value={formData.physicalActivities}
                        onChange={(tags) => setFormData(prev => ({ ...prev, physicalActivities: tags }))}
                        placeholder="Add Activity..."
                        suggestions={commonActivities}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Diet</label>
                        <TagInput
                            label="Diet"
                            value={formData.diet}
                            onChange={(tags) => setFormData(prev => ({ ...prev, diet: tags }))}
                            placeholder="Add Diet..."
                            suggestions={commonDiets}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Supplements</label>
                        <TagInput
                            label="Supplements"
                            value={formData.supplements}
                            onChange={(tags) => setFormData(prev => ({ ...prev, supplements: tags }))}
                            placeholder="Add Supplement..."
                            suggestions={commonSupplements}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Medications</label>
                        <TagInput
                            label="Medications"
                            value={formData.medications}
                            onChange={(tags) => setFormData(prev => ({ ...prev, medications: tags }))}
                            placeholder="e.g. Blood Thinners"
                            suggestions={commonMedications}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Allergies</label>
                        <TagInput
                            label="Allergies"
                            value={formData.allergies}
                            onChange={(tags) => setFormData(prev => ({ ...prev, allergies: tags }))}
                            placeholder="e.g. Latex, Nuts"
                            suggestions={commonAllergies}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Hydration</label>
                    <Input
                        value={formData.hydration}
                        onChange={e => setFormData((prev: FormData) => ({ ...prev, hydration: e.target.value }))}
                        placeholder="e.g. 2L/day"
                        className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white h-12 text-base font-medium rounded-xl px-4 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Body History (Surgeries, Accidents)</label>
                    <TagInput
                        label="Body History"
                        value={formData.bodyHistory}
                        onChange={(tags) => setFormData(prev => ({ ...prev, bodyHistory: tags }))}
                        placeholder="Add History..."
                        suggestions={commonBodyHistory}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Mobility & ROM Status</label>
                    <TagInput
                        label="Mobility"
                        value={formData.mobilityStatus}
                        onChange={(tags) => setFormData(prev => ({ ...prev, mobilityStatus: tags }))}
                        placeholder="e.g. Limited Right Shoulder Flexion"
                        suggestions={commonMobility}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Primary Complaints</label>
                    <TagInput
                        label="Complaints"
                        value={formData.primaryComplaints}
                        onChange={(tags) => setFormData(prev => ({ ...prev, primaryComplaints: tags }))}
                        placeholder="e.g. Lower Back Pain, Sciatica"
                        suggestions={commonComplaints}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Areas to Avoid (Contraindications)</label>
                    <TagInput
                        label="Contraindications"
                        value={formData.contraindications}
                        onChange={(tags) => setFormData(prev => ({ ...prev, contraindications: tags }))}
                        placeholder="e.g. No deep tissue on calves"
                        suggestions={commonContraindications}
                    />
                </div>

                <div className="space-y-1.5 pb-8">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider ml-1">Preferences</label>
                    <TagInput
                        label="Preferences"
                        value={formData.preferences}
                        onChange={(tags) => setFormData(prev => ({ ...prev, preferences: tags }))}
                        placeholder="e.g. Lighter pressure, Scalp massage"
                        suggestions={commonPreferences}
                    />
                </div>

                <Button
                    size="lg"
                    onClick={handleSave}
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-emerald-500/20 rounded-xl bg-emerald-600 hover:bg-emerald-500 mb-8"
                >
                    <Save className="w-5 h-5 mr-2" /> Save Changes
                </Button>

            </div>
        </div>
    );
};
