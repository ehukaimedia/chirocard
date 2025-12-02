import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { ArrowRight, ShieldCheck, Activity, FileText } from "lucide-react";
import { EditView, type FormData } from "../../pages/Profile";
import { useToast } from "../ui/Toast";

export function WelcomeModal() {
    const navigate = useNavigate();
    const user = useLiveQuery(() => db.users.get("me"));
    const [isOpen, setIsOpen] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const { toast } = useToast();

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
        // Check if already dismissed
        const dismissed = localStorage.getItem("welcome_dismissed");
        if (dismissed) {
            setHasChecked(true);
            return;
        }

        // Only check once user data is loaded (or confirmed missing)
        const timer = setTimeout(() => {
            if (user === undefined) {
                setIsOpen(true);
            } else if (user && !user.name) {
                setIsOpen(true);
            }
            setHasChecked(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [user]);

    const handleCompleteProfile = () => {
        setShowForm(true);
    };

    const handleSaveProfile = async () => {
        // Validation
        const requiredFields = [
            { key: 'name', label: 'Name' },
            { key: 'dateOfBirth', label: 'Date of Birth' },
            { key: 'height', label: 'Height' },
            { key: 'weight', label: 'Weight' },
            { key: 'phone', label: 'Phone' }
        ];

        const missing = requiredFields.filter(field => !formData[field.key as keyof typeof formData]);

        if (missing.length > 0) {
            setMissingFields(missing.map(f => f.key));
            toast(`Please fill in required fields: ${missing.map(f => f.label).join(', ')}`, "error");
            return;
        }

        setMissingFields([]);

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

            localStorage.setItem("welcome_dismissed", "true");
            setIsOpen(false);
            toast("Profile created successfully!", "success");
            navigate("/profile");
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast("Failed to update profile", "error");
        }
    };

    const handleDismiss = () => {
        localStorage.setItem("welcome_dismissed", "true");
        setIsOpen(false);
    };

    if (!hasChecked && !isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleDismiss}
            title={showForm ? "Complete Your Profile" : "Welcome to ChiroCard"}
            description={showForm ? "Please provide your details to ensure the best session experience." : "The digital passport for your holistic health journey. Track bodywork sessions and monitor your self-improvement."}
            variant="default"
            className={showForm ? "sm:max-w-2xl" : "sm:max-w-lg"}
        >
            {showForm ? (
                <div className="max-h-[70vh] overflow-y-auto pr-2 -mx-2 px-2 mt-4">
                    <EditView
                        formData={formData}
                        setFormData={setFormData}
                        handleSave={handleSaveProfile}
                        missingFields={missingFields}
                    />
                </div>
            ) : (
                <div className="space-y-6 mt-2">
                    {/* Value Props Grid */}
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Digital Bodywork Passport</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                    Your complete bodywork journal in your pocket. Use it as a digital passport to check in with any hands-on holistic practitioner.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg shrink-0">
                                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Practitioner Kiosk</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                    Designed for all hands-on practitioners. Scan their screen to log sessions and track your progress.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg shrink-0">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Private & Local-First</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                    Your data lives on your device, not the cloud. You are the database.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 text-center">
                            To get started, let's set up your basic profile. It only takes a minute.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                size="lg"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                                onClick={handleCompleteProfile}
                            >
                                Create My Passport <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDismiss}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            >
                                I'll explore first
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
