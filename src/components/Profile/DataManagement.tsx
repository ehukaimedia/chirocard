import { useState } from "react";
import { db } from "../../db/db";
import { importDB, exportDB } from "dexie-export-import";
import { Button } from "../ui/Button";
import { Download, Upload, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

import { generateAIExport } from "../../utils/aiExportUtils";

export const DataManagement = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            // Use dexie-export-import for a full database backup
            const blob = await exportDB(db);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chirocard_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            setMessage({ type: 'success', text: 'Full system backup downloaded successfully.' });
        } catch (error) {
            console.error("Export failed:", error);
            setMessage({ type: 'error', text: 'Export failed. Please try again.' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleAIExport = async () => {
        try {
            const aiData = await generateAIExport();
            const blob = new Blob([JSON.stringify(aiData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chirocard_brain_export_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            setMessage({ type: 'success', text: 'AI Context export downloaded successfully.' });
        } catch (error) {
            console.error("AI Export failed:", error);
            setMessage({ type: 'error', text: 'AI Export failed.' });
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!confirm("WARNING: This will overwrite your current data with the backup. Are you sure?")) {
            return;
        }

        try {
            setIsImporting(true);
            await db.delete(); // Clear current DB to avoid conflicts
            await db.open(); // Re-open
            await importDB(file, {
                progressCallback: (progress) => {
                    console.log("Importing: " + (progress.completedRows / (progress.totalRows ?? 1)) * 100 + "%");
                    return true;
                }
            });
            setMessage({ type: 'success', text: 'Data restored successfully! Reloading...' });
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Import failed:", error);
            setMessage({ type: 'error', text: 'Import failed. File may be corrupt.' });
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <section className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <RefreshCw className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900">ChiroCard Brain</h3>
                    <p className="text-sm text-zinc-500">Manage your data and AI insights.</p>
                </div>
            </div>

            <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h4 className="text-sm font-semibold text-indigo-900 mb-1">Dual-Purpose Data</h4>
                <p className="text-xs text-indigo-700 leading-relaxed">
                    Your data backup primarily secures your personal records. Additionally, it provides a structured format that you can optionally use with AI models to gain intelligent insights, spot patterns, and better understand your health journey.
                </p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Backup</label>
                    <Button
                        variant="outline"
                        className="w-full justify-start h-12 border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        <Download className="w-4 h-4 mr-3 text-zinc-400" />
                        {isExporting ? "Exporting..." : "Download Backup"}
                    </Button>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Includes: Profile, Medical History, All Sessions, Practitioners, & Bodywork Routines.
                    </p>
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-10 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={handleAIExport}
                    >
                        <Download className="w-4 h-4 mr-3" />
                        Download AI Context (JSON)
                    </Button>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Restore</label>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={isImporting}
                        />
                        <Button
                            variant="outline"
                            className="w-full justify-start h-12 border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium"
                            disabled={isImporting}
                        >
                            <Upload className="w-4 h-4 mr-3 text-zinc-400" />
                            {isImporting ? "Restoring..." : "Restore from Backup"}
                        </Button>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        <span className="text-rose-500 font-medium">Warning:</span> This will replace all current data.
                    </p>
                </div>
            </div>
        </section>
    );
};
