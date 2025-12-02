import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { Button } from "../ui/Button";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function IntakeProfileSection() {
    const user = useLiveQuery(() => db.users.get("me"));
    const navigate = useNavigate();

    const calculateAge = (dob?: string) => {
        if (!dob) return "Age not set";
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970) + " years old";
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                    {user?.photo ? (
                        <img src={user.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <User className="w-6 h-6" />
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                        {user?.name || "Guest User"}
                    </h3>
                    <p className="text-sm text-zinc-500">
                        {calculateAge(user?.dateOfBirth)}
                    </p>
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
                className="rounded-full px-6"
            >
                Edit
            </Button>
        </div>
    );
}
