import { useState } from "react";
import { db } from "../../db/db";
import { importDB, exportDB } from "dexie-export-import";
import { Button } from "../ui/Button";
import { Download, Upload, RefreshCw } from "lucide-react";

import { generateAIExport } from "../../utils/aiExportUtils";

import { useToast } from "../ui/Toast";

export const DataManagement = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const { toast } = useToast();

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
            toast('Full system backup downloaded successfully.', 'success');
        } catch {
            /* Error handled by toast */
            toast('Export failed. Please try again.', 'error');
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
            toast('AI Context export downloaded successfully.', 'success');
        } catch {
            /* Error handled by toast */
            toast('AI Export failed.', 'error');
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!confirm("WARNING: This will overwrite your current data with the backup. Are you sure?")) {
            return;
        }

        let emergencyBackup: Blob | null = null;

        try {
            setIsImporting(true);

            // Step 1: Validate format BEFORE any destructive operation
            const fileText = await file.text();
            let backupData: { formatName?: string; data?: { databaseName?: string } };
            try {
                backupData = JSON.parse(fileText);
                if (
                    !backupData ||
                    typeof backupData !== 'object' ||
                    backupData.formatName !== 'dexie' ||
                    backupData.data?.databaseName !== db.name
                ) {
                    throw new Error('Not a valid ChiroCard backup');
                }
            } catch {
                toast('Invalid backup file. Please select a valid ChiroCard backup.', 'error');
                return;
            }

            // Step 2: Create emergency backup before destructive operations
            let hasData = false;
            try { hasData = (await db.users.count()) > 0; } catch { /* ignore */ }
            try {
                emergencyBackup = await exportDB(db);
            } catch {
                if (hasData) {
                    toast('Could not create a safety backup of your existing data. Please download a backup manually before restoring.', 'error');
                    return;
                }
                // DB is empty — safe to proceed without backup
            }

            // Step 3: Destructive import (importDB creates its own connection; no db.open() needed)
            await db.delete();
            await importDB(file, { progressCallback: () => true });
            toast('Data restored successfully! Reloading...', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch {
            // Step 4: Attempt recovery if we have an emergency backup
            if (emergencyBackup) {
                try {
                    await importDB(emergencyBackup);
                    toast('Import failed, but your previous data was recovered. Reloading...', 'success');
                    setTimeout(() => window.location.reload(), 1500);
                } catch {
                    toast('Import failed and recovery was unsuccessful. Your data may be lost. Please contact support.', 'error');
                }
            } else {
                toast('Import failed. File may be corrupt.', 'error');
            }
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
