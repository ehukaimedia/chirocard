import { type Session } from "../../db/db";
import { Card } from "../ui/Card";
import { REGIONS } from "../BodyMap/BodyRegionSelector";
import { Calendar, User, Activity, FileText, ArrowRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

interface SessionCardProps {
    session: Session;
    onDelete?: (id: string, e: React.MouseEvent) => void;
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
    // Extract treated areas
    const treatedAreas = session.bodyMap
        ? Object.entries(session.bodyMap)
            .filter(([_, status]) => status === 'addressed' || status === 'issue')
            .map(([id]) => REGIONS.find(r => r.id === id)?.label)
            .filter(Boolean)
        : [];

    // Extract recommendations count
    const recCount = session.recommendations?.length || 0;

    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="p-5 flex flex-col gap-4">
                {/* Header: Date & Practitioner */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-500 border border-emerald-500/20">
                            <span className="text-xs font-bold uppercase">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-lg font-bold leading-none">{new Date(session.date).getDate()}</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">{session.practitionerName}</h4>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                                    {session.practitionerClass}
                                </span>
                            </div>
                        </div>
                    </div>

                    {onDelete && (
                        <button
                            onClick={(e) => onDelete(session.id, e)}
                            className="text-zinc-400 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100"
                            title="Delete Record"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Body: Details */}
                <div className="space-y-3">
                    {/* Treated Areas */}
                    {treatedAreas.length > 0 && (
                        <div className="flex items-start gap-2">
                            <Activity className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                            <div className="flex flex-wrap gap-1.5">
                                {treatedAreas.map((area, i) => (
                                    <span key={i} className="text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                        {area}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations / Notes */}
                    {(recCount > 0 || session.notes) && (
                        <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                {recCount > 0 && (
                                    <span className="mr-2 text-emerald-600 dark:text-emerald-500 font-medium">
                                        {recCount} Recommendation{recCount !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {session.notes && (
                                    <span className="italic truncate line-clamp-1">
                                        "{session.notes}"
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Action */}
            <Link to={`/session/${session.id}`} className="block bg-zinc-50 dark:bg-zinc-950/50 px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Session Record</span>
                <ArrowRight className="w-4 h-4 text-emerald-500 transform group-hover:translate-x-1 transition-transform" />
            </Link>
        </Card>
    );
}
