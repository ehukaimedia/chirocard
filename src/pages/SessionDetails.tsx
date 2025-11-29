import { useParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ArrowLeft, Calendar, User, Activity, FileText, CheckCircle } from "lucide-react";
import { REGIONS } from "../components/BodyMap/BodyRegionSelector";

export default function SessionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const session = useLiveQuery(() => id ? db.sessions.get(id) : undefined, [id]);

    if (!session) {
        return (
            <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 flex items-center justify-center">
                <p className="text-zinc-500">Loading session...</p>
            </div>
        );
    }

    // Process body map data
    const treatedAreas = session.bodyMap
        ? Object.entries(session.bodyMap)
            .filter(([_, status]) => status === 'addressed' || status === 'issue')
            .map(([id, status]) => ({
                label: REGIONS.find(r => r.id === id)?.label || id,
                status,
                notes: session.treatmentNotes?.[id] || session.bodyNotes?.[id]
            }))
        : [];

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Session Details</h1>
                    <p className="text-sm text-zinc-500">
                        {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="space-y-6 max-w-2xl mx-auto">
                {/* Practitioner Info */}
                <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{session.practitionerName}</h2>
                            <p className="text-zinc-500">{session.practitionerClass}</p>
                        </div>
                    </div>
                </Card>

                {/* Session Notes */}
                {session.notes && (
                    <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-500" />
                            Session Notes
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {session.notes}
                        </p>
                    </Card>
                )}

                {/* Treated Areas */}
                {treatedAreas.length > 0 && (
                    <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-500" />
                            Treated Areas
                        </h3>
                        <div className="space-y-4">
                            {treatedAreas.map((area, i) => (
                                <div key={i} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 pb-4 last:pb-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{area.label}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${area.status === 'issue'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            }`}>
                                            {area.status}
                                        </span>
                                    </div>
                                    {area.notes && (
                                        <p className="text-sm text-zinc-500 italic">"{area.notes}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Recommendations */}
                {session.recommendations && session.recommendations.length > 0 && (
                    <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            Recommendations
                        </h3>
                        <div className="space-y-3">
                            {session.recommendations.map((rec, i) => (
                                <div key={i} className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{rec.title}</h4>
                                        <span className="text-xs text-zinc-400 uppercase tracking-wider">{rec.frequency}</span>
                                    </div>
                                    {rec.description && (
                                        <p className="text-sm text-zinc-500">{rec.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
