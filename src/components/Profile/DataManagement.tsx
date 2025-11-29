import { useState } from "react";
import { db } from "../../db/db";
import { exportDB, importDB } from "dexie-export-import";
import { Button } from "../ui/Button";
import { Download, Upload, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export const DataManagement = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const blob = await exportDB(db);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chirocard_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            setMessage({ type: 'success', text: 'Backup downloaded successfully.' });
        } catch (error) {
            console.error("Export failed:", error);
            setMessage({ type: 'error', text: 'Export failed. Please try again.' });
        } finally {
            setIsExporting(false);
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
        <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <RefreshCw className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Data Management</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Backup your passport or switch devices.</p>
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Backup</label>
                    <Button
                        variant="outline"
                        className="w-full justify-start border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-transparent"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isExporting ? "Exporting..." : "Download Backup"}
                    </Button>
                    <p className="text-[10px] text-zinc-500 mt-2">
                        <strong>Includes:</strong> Profile, Medical History, All Sessions, Practitioners, & Homework.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Restore</label>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isImporting}
                        />
                        <Button
                            variant="outline"
                            className="w-full justify-start border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-transparent"
                            disabled={isImporting}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {isImporting ? "Restoring..." : "Restore from Backup"}
                        </Button>
                    </div>
                    <p className="text-[10px] text-zinc-500">Warning: This will replace all current data.</p>
                </div>
            </div>
        </div>
    );
};
