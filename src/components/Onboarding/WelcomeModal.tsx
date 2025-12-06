import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { ArrowRight, Smartphone, BookOpen, Activity, ShieldCheck, Hand, Brain } from "lucide-react";
import { EditView, type FormData } from "../../pages/Profile";
import { useToast } from "../ui/Toast";

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
    const navigate = useNavigate();
    const user = useLiveQuery(() => db.users.get("me"));
    const [showForm, setShowForm] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const { toast } = useToast();

    // Reset view when reopened
    if (isOpen === false && showForm === true) {
        setTimeout(() => setShowForm(false), 300);
    }

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
            onClose();
            toast("Profile created successfully!", "success");
            navigate("/profile");
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast("Failed to update profile", "error");
        }
    };

    const handleDismiss = () => {
        localStorage.setItem("welcome_dismissed", "true");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleDismiss}
            title={showForm ? "Complete Your Profile" : "Holistic User Guide"}
            description={showForm ? "Please provide your details to ensure the best session experience." : "Master your Digital Bodywork Passport & Journal."}
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
                <div className="space-y-6 mt-4">
                    {/* Intro / Chiro Meaning */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                    <Hand className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Chiro = Hand</h3>
                                <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
                                    "Chiro" means <strong>"hand"</strong>. ChiroCard is your personalized journal for holistic body care that keeps track of all hands-on bodywork.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-5">
                        {/* 1. Bodywork Passport (Profile) */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">1. Bodywork Passport (Profile)</h3>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                    Your <strong>Profile</strong> is your Bodywork Passport. It contains your health context and identity. Carry it to every practitioner to check in and share your story.
                                </p>
                            </div>
                        </div>

                        {/* 2. Bodywork Journal */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                    <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">2. Bodywork Journal</h3>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                    This entire app is your Journal. It tracks your complete history: <strong>Practitioner Sessions</strong>, <strong>Personal Routines</strong>, and <strong>Notes</strong>.
                                </p>
                            </div>
                        </div>

                        {/* 3. Collaborative Care */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">3. Collaborative Care</h3>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                    Start a session and <strong>hand your device</strong> to your practitioner. They log their notes directly into your journal, keeping your history complete.
                                </p>
                            </div>
                        </div>

                        {/* 4. ChiroCard Brain */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="p-2 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-full">
                                    <Brain className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">4. ChiroCard Brain</h3>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                    Your data backup primarily secures your personal records. Additionally, it provides a structured format that you can optionally use with AI models.
                                </p>
                            </div>
                        </div>

                        {/* 5. Local-First Privacy */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                    <ShieldCheck className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">5. Local-First Privacy</h3>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                    You are the database. Your health records live on your phone, not in the cloud. You have 100% ownership and control.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 mt-6">
                        <div className="flex flex-col gap-3">
                            <Button
                                size="lg"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                                onClick={handleCompleteProfile}
                            >
                                Complete BodyWork Passport <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDismiss}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 w-full"
                            >
                                Enter App
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
