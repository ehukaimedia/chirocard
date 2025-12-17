import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { PractitionerManager } from "../components/Practitioner/PractitionerManager";
import { ArrowLeft } from "lucide-react";

export default function Team() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24 flex flex-col">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 min-h-[64px] h-auto bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 z-50">
                <Button variant="ghost" onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </nav>

            {/* Header Content */}
            <div className="mt-[calc(4rem+env(safe-area-inset-top))] mb-8 pt-6">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Care Team</h1>
                <p className="text-sm text-zinc-500 mt-1">Manage your trusted practitioners and contacts.</p>
            </div>

            <div className="flex-1">
                <PractitionerManager />
            </div>
        </div>
    );
}
