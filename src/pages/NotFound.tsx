import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-6">
            <div className="text-center space-y-6 max-w-sm">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                    <SearchX className="w-10 h-10 text-zinc-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Page Not Found</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        The page you are looking for doesn't exist or has been moved.
                    </p>
                </div>
                <Button onClick={() => navigate("/")} className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>
        </div>
    );
}
