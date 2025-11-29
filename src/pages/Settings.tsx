import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { DataManagement } from "../components/Profile/DataManagement";

export default function Settings() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 pb-24">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 z-50">
                <Button variant="ghost" onClick={() => navigate("/")} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Dashboard
                </Button>
            </nav>

            {/* Header Content */}
            <div className="mt-16 mb-8 pt-6">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
                <p className="text-sm text-zinc-500 mt-1">Manage your application preferences and data.</p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <DataManagement />
            </div>
        </div>
    );
}
