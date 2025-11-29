import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { ArrowLeft, Save, Edit2, AlertTriangle, Target, Heart, X, Activity } from "lucide-react";
import { DataManagement } from "../components/Profile/DataManagement";
import { useToast } from "../components/ui/Toast";

export default function Profile() {
    const navigate = useNavigate();
    const user = useLiveQuery(() => db.users.get("me"));
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        primaryComplaints: "",
        contraindications: "",
        preferences: "",
        height: "",
        weight: "",
        dateOfBirth: "",
        occupation: "",
        activityLevel: "Moderate",
        medicalHistory: "",
        medications: "",
        allergies: "",
        mobilityStatus: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                primaryComplaints: user.primaryComplaints?.join(", ") || "",
                contraindications: user.contraindications?.join(", ") || "",
                preferences: user.preferences?.join(", ") || "",
                height: user.height || "",
                weight: user.weight || "",
                dateOfBirth: user.dateOfBirth || "",
                occupation: user.occupation || "",
                activityLevel: user.activityLevel || "Moderate",
                medicalHistory: user.medicalHistory?.join(", ") || "",
                medications: user.medications?.join(", ") || "",
                allergies: user.allergies?.join(", ") || "",
                mobilityStatus: user.mobilityStatus?.join(", ") || ""
            });
        }
    }, [user]);

    const { toast } = useToast();

    const handleSave = async () => {
        try {
            await db.users.put({
                id: "me",
                name: formData.name,
                primaryComplaints: formData.primaryComplaints.split(",").map(s => s.trim()).filter(Boolean),
                contraindications: formData.contraindications.split(",").map(s => s.trim()).filter(Boolean),
                preferences: formData.preferences.split(",").map(s => s.trim()).filter(Boolean),
                height: formData.height,
                weight: formData.weight,
                dateOfBirth: formData.dateOfBirth,
                occupation: formData.occupation,
                activityLevel: formData.activityLevel as 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Athlete',
                medicalHistory: formData.medicalHistory.split(",").map(s => s.trim()).filter(Boolean),
                medications: formData.medications.split(",").map(s => s.trim()).filter(Boolean),
                allergies: formData.allergies.split(",").map(s => s.trim()).filter(Boolean),
                mobilityStatus: formData.mobilityStatus.split(",").map(s => s.trim()).filter(Boolean),
                pin: user?.pin || null,
                biometricEnabled: user?.biometricEnabled || false,
                theme: user?.theme || "dark"
            });
            setIsEditing(false);
            toast("Profile updated successfully", "success");
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast("Failed to update profile", "error");
        }
    };



    return (
        <div className="min-h-screen bg-zinc-950 p-6 pb-24">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold text-white">Bodywork Profile</h1>
                </div>
                <Button
                    variant={isEditing ? "ghost" : "outline"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className={isEditing ? "text-zinc-400" : "border-zinc-700 text-zinc-300"}
                >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4 mr-2" />}
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </div>

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
        </div>
    );
}

import { type UserProfile } from "../db/db";

interface FormData {
    name: string;
    primaryComplaints: string;
    contraindications: string;
    preferences: string;
    height: string;
    weight: string;
    dateOfBirth: string;
    occupation: string;
    activityLevel: string;
    medicalHistory: string;
    medications: string;
    allergies: string;
    mobilityStatus: string;
}

const PassportView = ({ user }: { user: UserProfile | undefined }) => (
    <div className="space-y-6">
        {/* ID Card Header */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Digital Passport</p>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-1">{user?.name || "Guest User"}</h2>
                    <p className="text-zinc-500 text-sm font-mono mb-4">ID: {user?.id === "me" ? "8829-1920-4492" : "UNKNOWN"}</p>

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
        </div>

        {/* Clinical & Safety Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Critical Alerts - Contraindications & Allergies */}
            <div className="bg-rose-950/30 rounded-2xl p-6 border border-rose-900/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-rose-500/20 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-rose-200">Safety Alerts</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-rose-400 uppercase font-bold tracking-wider mb-2">Contraindications</p>
                        <div className="flex flex-wrap gap-2">
                            {user?.contraindications && user.contraindications.length > 0 ? (
                                user.contraindications.map((item: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-200 font-medium text-sm">
                                        {item}
                                    </span>
                                ))
                            ) : (
                                <p className="text-rose-400/50 italic text-sm">None listed</p>
                            )}
                        </div>
                    </div>

                    {(user?.allergies && user.allergies.length > 0) || (user?.medications && user.medications.length > 0) ? (
                        <div className="pt-4 border-t border-rose-500/20">
                            <p className="text-xs text-rose-400 uppercase font-bold tracking-wider mb-2">Meds & Allergies</p>
                            <div className="flex flex-wrap gap-2">
                                {user?.allergies?.map((item: string, i: number) => (
                                    <span key={`alg-${i}`} className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-200 font-medium text-sm">
                                        Allergy: {item}
                                    </span>
                                ))}
                                {user?.medications?.map((item: string, i: number) => (
                                    <span key={`med-${i}`} className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-200 font-medium text-sm">
                                        Med: {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Mobility & Medical History */}
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-zinc-700/20 rounded-lg">
                        <Activity className="w-6 h-6 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-200">Clinical History</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Mobility & ROM</p>
                        <div className="flex flex-wrap gap-2">
                            {user?.mobilityStatus && user.mobilityStatus.length > 0 ? (
                                user.mobilityStatus.map((item: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 font-medium text-sm">
                                        {item}
                                    </span>
                                ))
                            ) : (
                                <p className="text-zinc-600 italic text-sm">No mobility issues noted</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Medical History</p>
                        <div className="flex flex-wrap gap-2">
                            {user?.medicalHistory && user.medicalHistory.length > 0 ? (
                                user.medicalHistory.map((item: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 font-medium text-sm">
                                        {item}
                                    </span>
                                ))
                            ) : (
                                <p className="text-zinc-600 italic text-sm">No history listed</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Focus Areas - Complaints */}
        <div className="bg-amber-950/30 rounded-2xl p-6 border border-amber-900/50">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Target className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-amber-200">Focus Areas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {user?.primaryComplaints && user.primaryComplaints.length > 0 ? (
                    user.primaryComplaints.map((item: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 font-medium text-sm">
                            {item}
                        </span>
                    ))
                ) : (
                    <p className="text-amber-400/50 italic">No specific complaints</p>
                )}
            </div>
            <p className="text-xs text-amber-400 mt-4 uppercase font-bold tracking-wider">Prioritize These Areas</p>
        </div>

        {/* Preferences */}
        <div className="bg-blue-950/30 rounded-2xl p-6 border border-blue-900/50">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Heart className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-blue-200">Preferences</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {user?.preferences && user.preferences.length > 0 ? (
                    user.preferences.map((item: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200 font-medium text-sm">
                            {item}
                        </span>
                    ))
                ) : (
                    <p className="text-blue-400/50 italic">No preferences listed</p>
                )}
            </div>
        </div>

        {/* Data Management */}
        <DataManagement />
    </div>
);

const EditView = ({ formData, setFormData, handleSave }: { formData: FormData, setFormData: React.Dispatch<React.SetStateAction<FormData>>, handleSave: () => void }) => (
    <Card className="p-6 space-y-6 bg-zinc-900 border-zinc-800">
        <Input
            label="Your Name"
            value={formData.name}
            onChange={e => setFormData((prev: FormData) => ({ ...prev, name: e.target.value }))}
            placeholder="Jane Doe"
            className="bg-zinc-950 border-zinc-800"
        />

        <div className="grid grid-cols-2 gap-4">
            <Input
                label="Height"
                value={formData.height}
                onChange={e => setFormData((prev: FormData) => ({ ...prev, height: e.target.value }))}
                placeholder="5'10"
                className="bg-zinc-950 border-zinc-800"
            />
            <Input
                label="Weight"
                value={formData.weight}
                onChange={e => setFormData((prev: FormData) => ({ ...prev, weight: e.target.value }))}
                placeholder="165 lbs"
                className="bg-zinc-950 border-zinc-800"
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Date of Birth</label>
                <input
                    type="date"
                    className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData((prev: FormData) => ({ ...prev, dateOfBirth: e.target.value }))}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Activity Level</label>
                <select
                    className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            className="bg-zinc-950 border-zinc-800"
        />

        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
                Medical History (Surgeries, Accidents)
            </label>
            <textarea
                className="w-full h-20 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="e.g. ACL Reconstruction 2018, Car Accident 2020"
                value={formData.medicalHistory}
                onChange={e => setFormData((prev: FormData) => ({ ...prev, medicalHistory: e.target.value }))}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                    Medications
                </label>
                <textarea
                    className="w-full h-20 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Blood Thinners"
                    value={formData.medications}
                    onChange={e => setFormData((prev: FormData) => ({ ...prev, medications: e.target.value }))}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                    Allergies
                </label>
                <textarea
                    className="w-full h-20 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Latex, Nut Oils"
                    value={formData.allergies}
                    onChange={e => setFormData((prev: FormData) => ({ ...prev, allergies: e.target.value }))}
                />
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
                Mobility & ROM Status
            </label>
            <textarea
                className="w-full h-20 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="e.g. Limited Right Shoulder Flexion, Tight Hamstrings"
                value={formData.mobilityStatus}
                onChange={e => setFormData((prev: FormData) => ({ ...prev, mobilityStatus: e.target.value }))}
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
                Primary Complaints (comma separated)
            </label>
            <textarea
                className="w-full h-24 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="e.g. Lower Back Pain, Sciatica, Neck Stiffness"
                value={formData.primaryComplaints}
                onChange={e => setFormData((prev: FormData) => ({ ...prev, primaryComplaints: e.target.value }))}
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
                Contraindications (What to avoid)
            </label>
            <textarea
                className="w-full h-24 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="e.g. No deep tissue on calves, Recent shoulder surgery"
                value={formData.contraindications}
                onChange={e => setFormData((prev: FormData) => ({ ...prev, contraindications: e.target.value }))}
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
                Preferences
            </label>
            <textarea
                className="w-full h-24 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="e.g. Lighter pressure, Focus on neck, Scalp massage"
                value={formData.preferences}
                onChange={e => setFormData((prev: FormData) => ({ ...prev, preferences: e.target.value }))}
            />
        </div>

        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Save Profile
        </Button>
    </Card>
);
