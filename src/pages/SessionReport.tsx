import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { REGIONS } from "../components/BodyMap/BodyRegionSelector";
import { Info, AlertTriangle } from "lucide-react";

export default function SessionReport() {
    const { id } = useParams();
    const session = useLiveQuery(() => id ? db.sessions.get(id) : undefined, [id]);
    const user = useLiveQuery(() => db.users.get("me"));

    if (!session) {
        return (
            <div className="min-h-screen bg-white p-6 flex items-center justify-center print:hidden">
                <p className="text-zinc-500">Loading report...</p>
            </div>
        );
    }

    // Process body map data
    const treatedAreas = session.bodyMap
        ? Object.entries(session.bodyMap)
            .filter(([_, status]) => status !== 'normal')
            .map(([id, status]) => ({
                label: REGIONS.find(r => r.id === id)?.label || id,
                status,
                notes: session.treatmentNotes?.[id] || session.bodyNotes?.[id]
            }))
        : [];

    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8 max-w-[210mm] mx-auto print:p-0 print:max-w-none">
            {/* Print Controls - Hidden when printing */}
            <div className="mb-8 flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold">Session Report Preview</h1>
                <button
                    onClick={() => window.print()}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print / Save as PDF
                </button>
            </div>

            {/* Report Content */}
            <div className="space-y-8">
                {/* Header */}
                <header className="border-b-2 border-zinc-100 pb-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <img src="/chirocard-icon.png" alt="ChiroCard Icon" className="w-10 h-10 rounded-xl shadow-sm" />
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                                <span className="text-emerald-600">Chiro</span>Card<span className="text-emerald-600">.</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">The Digital Body Work Passport</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-zinc-500 mb-1">Session Date</p>
                        <p className="text-xl font-bold text-zinc-900">
                            {new Date(session.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </header>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Patient */}
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 print:border-zinc-200">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Client</p>
                        <p className="text-lg font-bold text-zinc-900 mb-1">{user?.name || "Guest Client"}</p>
                        <div className="text-sm text-zinc-600 space-y-0.5">
                            {user?.email && <p>{user.email}</p>}
                            {user?.phone && <p>{user.phone}</p>}
                        </div>
                    </div>

                    {/* Practitioner */}
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 print:border-emerald-200">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Practitioner</p>
                        <p className="text-lg font-bold text-zinc-900 mb-1">{session.practitionerName}</p>
                        <p className="text-emerald-700 font-medium text-sm mb-1">{session.practitionerClass}</p>
                    </div>
                </div>

                {/* Patient Intake Context (if available) */}
                {(user?.primaryComplaints?.length || user?.contraindications?.length) && (
                    <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Info className="w-4 h-4" /> Client Context
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {user.primaryComplaints && user.primaryComplaints.length > 0 && (
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Primary Complaints:</span>
                                    <p className="text-sm text-zinc-700">{user.primaryComplaints.join(", ")}</p>
                                </div>
                            )}
                            {user.contraindications && user.contraindications.length > 0 && (
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Contraindications:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {user.contraindications.map((c: string, i: number) => (
                                            <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 flex items-center gap-1 w-fit">
                                                <AlertTriangle className="w-3 h-3" /> {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Bodywork Log */}
                <section>
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-lg font-bold text-zinc-900">Bodywork Log</h2>
                        <div className="h-px bg-zinc-200 flex-1"></div>
                    </div>

                    {treatedAreas.length > 0 ? (
                        <div className="space-y-3">
                            {treatedAreas.map((area, i) => (
                                <div key={i} className="bg-white border border-zinc-200 rounded-lg p-3 break-inside-avoid">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-zinc-900">{area.label}</h3>
                                        <span className={`text-xs px-2 py-1 rounded font-medium uppercase tracking-wide ${area.status === 'issue' ? 'bg-red-50 text-red-700 border border-red-100' :
                                            area.status === 'addressed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}>
                                            {area.status}
                                        </span>
                                    </div>
                                    {area.notes && (
                                        <p className="text-sm text-zinc-600 italic">"{area.notes}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 italic">No specific body areas logged.</p>
                    )}
                </section>

                {/* Session Notes */}
                {session.notes && (
                    <section className="break-inside-avoid">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-lg font-bold text-zinc-900">Session Notes</h2>
                            <div className="h-px bg-zinc-200 flex-1"></div>
                        </div>
                        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                            {session.notes}
                        </div>
                    </section>
                )}

                {/* Recommendations */}
                {session.recommendations && session.recommendations.length > 0 && (
                    <section className="break-inside-avoid">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-lg font-bold text-zinc-900">Recommendations</h2>
                            <div className="h-px bg-zinc-200 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {session.recommendations.map((rec: any, i: number) => (
                                <div key={i} className="bg-white border border-zinc-200 rounded-lg p-3 flex items-start gap-3">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${rec.category === 'relief' ? 'bg-blue-500' :
                                        rec.category === 'movement' ? 'bg-emerald-500' :
                                            rec.category === 'lifestyle' ? 'bg-purple-500' : 'bg-zinc-500'
                                        }`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-zinc-900 text-sm">{rec.title}</h3>
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">{rec.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-medium bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">{rec.frequency}</span>
                                            {rec.description && <span className="text-xs text-zinc-500">• {rec.description}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Signatures */}
                <section className="pt-8 break-inside-avoid">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-lg font-bold text-zinc-900">Authorization</h2>
                        <div className="h-px bg-zinc-200 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                        {/* Patient Sig */}
                        <div>
                            <div className="h-24 border-b border-zinc-300 mb-2 flex items-end pb-2">
                                {session.userSignature ? (
                                    <img src={session.userSignature} alt="Client Signature" className="max-h-20 max-w-full object-contain" />
                                ) : (
                                    <span className="text-zinc-300 text-sm italic">Signed digitally</span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-zinc-900">{user?.name || "Client"}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Client Signature</p>
                        </div>

                        {/* Practitioner Sig */}
                        <div>
                            <div className="h-24 border-b border-zinc-300 mb-2 flex items-end pb-2">
                                {session.signatureBase64 ? (
                                    <img src={session.signatureBase64} alt="Practitioner Signature" className="max-h-20 max-w-full object-contain" />
                                ) : (
                                    <span className="text-zinc-300 text-sm italic">Signed digitally</span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-zinc-900">{session.practitionerName}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Practitioner Signature</p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="pt-8 border-t border-zinc-100 text-center">
                    <p className="text-[10px] text-zinc-400">
                        Disclaimer: This is a user-owned personal record and does not replace the official legal medical record maintained by the provider.
                        Generated by ChiroCard on {new Date().toLocaleDateString()}.
                    </p>
                </footer>
            </div>
        </div>
    );
}
