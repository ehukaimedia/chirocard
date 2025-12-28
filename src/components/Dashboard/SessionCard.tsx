import { type Session } from "../../db/db";
import { GlassCard } from "../ui/GlassCard";
import { REGIONS } from "../BodyMap/BodyRegionSelector";
import { Activity, FileText, ArrowRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";


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

    // Calculate Max Pain Level
    const maxPainLevel = session.bodyLevels
        ? Math.max(...Object.values(session.bodyLevels), 0)
        : 0;

    // Extract unique badges
    const allBadges = session.bodyBadges
        ? Array.from(new Set(Object.values(session.bodyBadges).flat()))
        : [];
    const displayBadges = allBadges.slice(0, 3);
    const moreBadgesCount = allBadges.length - 3;

    return (
        <GlassCard variant="default" className="group relative overflow-hidden transition-all hover:shadow-glass active:scale-[0.99] p-0 border-glass-border">
            <div className="p-5 flex flex-col gap-4">
                {/* Header: Date & Practitioner */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/20 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-lg font-black leading-none">{new Date(session.date).getDate()}</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-glass-text text-lg tracking-tight">{session.practitionerName}</h4>
                            <div className="flex items-center gap-2 text-xs text-glass-text-secondary">
                                <span className="bg-glass-100 px-2 py-0.5 rounded-full border border-glass-border font-medium">
                                    {session.practitionerClass}
                                </span>
                            </div>
                        </div>
                    </div>

                    {onDelete && (
                        <button
                            onClick={(e) => onDelete(session.id, e)}
                            className="bg-red-50 text-red-400 hover:text-red-500 hover:bg-red-100 transition-colors p-2 rounded-full opacity-0 group-hover:opacity-100"
                            title="Delete Record"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Key Metrics Row */}
                {(maxPainLevel > 0 || displayBadges.length > 0) && (
                    <div className="flex flex-wrap gap-2 items-center">
                        {maxPainLevel > 0 && (
                            <span className={`
                                px-2.5 py-1 rounded-lg text-xs font-bold border
                                ${maxPainLevel >= 7 ? 'bg-red-50 text-red-600 border-red-100' :
                                    maxPainLevel >= 4 ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                        'bg-blue-50 text-blue-600 border-blue-100'}
                            `}>
                                Pain: {maxPainLevel}/10
                            </span>
                        )}
                        {displayBadges.map(badge => (
                            <span key={badge} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-glass-100 text-glass-text-secondary border border-glass-border">
                                {badge}
                            </span>
                        ))}
                        {moreBadgesCount > 0 && (
                            <span className="text-xs text-glass-text-secondary opacity-60">+{moreBadgesCount}</span>
                        )}
                    </div>
                )}

                {/* Body: Details */}
                <div className="space-y-3">
                    {/* Treated Areas */}
                    {treatedAreas.length > 0 && (
                        <div className="flex items-start gap-2">
                            <Activity className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
                            <div className="flex flex-wrap gap-1.5">
                                {treatedAreas.map((area, i) => (
                                    <span key={i} className="text-xs font-bold text-glass-text-secondary bg-glass-100 px-2 py-0.5 rounded-md">
                                        {area}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations / Notes */}
                    {(recCount > 0 || session.notes) && (
                        <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
                            <div className="text-sm text-glass-text-secondary line-clamp-2">
                                {recCount > 0 && (
                                    <span className="mr-2 text-primary font-bold">
                                        {recCount} Recs
                                    </span>
                                )}
                                {session.notes && (
                                    <span className="italic opacity-80">
                                        "{session.notes}"
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Action */}
            <Link to={`/session/${session.id}/report`} className="block bg-glass-100/50 px-5 py-3 border-t border-glass-border flex justify-between items-center hover:bg-glass-100 transition-colors">
                <span className="text-[10px] text-glass-text-secondary font-bold uppercase tracking-widest">View Report</span>
                <ArrowRight className="w-4 h-4 text-primary transform group-hover:translate-x-1 transition-transform" />
            </Link>
        </GlassCard>
    );
}
