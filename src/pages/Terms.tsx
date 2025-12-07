import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function Terms() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6 pb-24">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 z-50">
                <Button variant="ghost" onClick={() => navigate("/")} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" />
                    Back to App
                </Button>
            </nav>

            {/* Header */}
            <div className="mt-16 mb-12 pt-6 max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">Terms of Service</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Last updated: December 6, 2025</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">

                {/* Medical Disclaimer Alert */}
                <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">Medical Disclaimer</h3>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            ChiroCard is a journaling and tracking tool. <strong>It is not a medical device and does not provide medical advice.</strong> The content provided in this app is for informational purposes only and is not intended to substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                        </p>
                    </div>
                </div>

                {/* Terms Content */}
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <h3>1. Agreement to Terms</h3>
                    <p>
                        By accessing or using the ChiroCard application, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                    </p>

                    <h3>2. Use License</h3>
                    <p>
                        Permission is granted to download one copy of the materials (information or software) on ChiroCard for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                    </p>

                    <h3>3. User Data & Responsibility</h3>
                    <p>
                        You retain full ownership of your data. Because ChiroCard operates on a "Local-First" architecture, your data is stored on your device.
                        <strong> You are solely responsible for backing up your data.</strong> ChiroCard and Ehukai Media are not liable for any data loss, corruption, or inability to access your data due to device failure, app deletion, or browser storage clearing.
                    </p>

                    <h3>4. Limitations</h3>
                    <p>
                        In no event shall Ehukai Media or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use ChiroCard.
                    </p>

                    <h3>5. Accuracy of Materials</h3>
                    <p>
                        The materials appearing on ChiroCard could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its software are accurate, complete, or current.
                    </p>

                    <h3>6. Governing Law</h3>
                    <p>
                        These terms and conditions are governed by and construed in accordance with the laws of Hawaii and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                    </p>
                </div>
            </div>
        </div>
    );
}
