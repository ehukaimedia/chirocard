import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { PractitionerManager } from "../components/Practitioner/PractitionerManager";
import { ArrowLeft } from "lucide-react";

export default function Team() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Care Team</h1>
            </div>

            <div className="flex-1">
                <PractitionerManager />
            </div>
        </div>
    );
}
