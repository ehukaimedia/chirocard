import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Database, CloudOff } from "lucide-react";
import { EGRESS_ALLOWLIST } from "../constants/egress";

export default function Privacy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6 pb-24">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 z-50">
                <Button variant="ghost" onClick={() => navigate("/")} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" />
                    Back to App
                </Button>
            </nav>

            {/* Header */}
            <div className="mt-[calc(4rem+env(safe-area-inset-top))] mb-12 pt-6 max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">Privacy Policy</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Last updated: December 6, 2025</p>
                <p className="text-lg text-zinc-600 dark:text-zinc-300 mt-6 leading-relaxed">
                    At ChiroCard, we believe your health data belongs to you. That's why we built a
                    <strong> Local-First</strong> application that prioritizes your privacy above all else.
                </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-12">

                {/* Core Principles */}
                <section className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl w-fit mb-4">
                            <Database className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">Data Stored Locally</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            Your journal entries, profile, and session history are stored directly on your device using IndexedDB. We do not host a central database of your records.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl w-fit mb-4">
                            <CloudOff className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">No Cloud Sync</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            Because we don't sync your data to the cloud, we cannot see, sell, or share your personal health information. Your health records never leave your device — the only data that ever leaves is optional, opt-in usage analytics and clinic address lookups, and neither includes your health records.
                        </p>
                    </div>
                </section>

                {/* Detailed Sections */}
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <h3>1. Information We Collect</h3>
                    <p>
                        We do not collect personal information for our own use. The app collects data effectively only for <strong>your use</strong>.
                        When you use the app, you input sensitive health data (Name, Date of Birth, Body Metrics, Session Notes). This data remains
                        strictly on your local device.
                    </p>

                    <h3>2. Data Backup & Loss</h3>
                    <p>
                        Since your data is local, <strong>you are responsible for backing it up</strong>.
                        If you delete the app, confirm "Clear Site Data" in your browser, or lose your device, your data may be lost permanently.
                        We provide an "Export JSON" feature in Settings &gt; Data Management to help you create your own backups.
                    </p>

                    <h3>3. Third-Party Services</h3>
                    <p>
                        This is the complete, exhaustive set of third parties the app can contact —
                        generated from the same allowlist the app enforces, so it cannot drift.
                        Nothing below ever receives your health records:
                    </p>
                    <ul>
                        {EGRESS_ALLOWLIST.map((service) => (
                            <li key={service.origin}>
                                <strong>
                                    {service.origin.replace("https://", "")}
                                    {service.consentGated ? " (opt-in only)" : ""}:
                                </strong>{" "}
                                {service.purpose}
                            </li>
                        ))}
                    </ul>

                    <h3>4. Communications</h3>
                    <p>
                        The app runs entirely client-side. We do not have a server that sends emails or push notifications from the cloud.
                        Any notifications you receive (e.g., Reminders) are scheduled locally on your device's operating system.
                    </p>

                    <h3>5. Changes to This Policy</h3>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                    </p>

                    <h3>Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:aloha@ehukaimedia.com">aloha@ehukaimedia.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
