import { REGIONS } from "../components/BodyMap/BodyRegionSelector";

/**
 * Generates a digestible JSON object for AI analysis from a session object.
 * Resolves IDs to natural labels and formats dates.
 */
export function generateDigestibleExport(session: any, user: any) {
    if (!session) return null;

    // Helper to get natural body part name
    const getBodyPartName = (id: string) => REGIONS.find(r => r.id === id)?.label || id;

    // Helper to get natural status
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'issue': return 'Client Concern';
            case 'addressed': return 'Treated';
            case 'watch': return 'Monitor';
            default: return status;
        }
    };

    // 1. Session Metadata
    const metadata = {
        sessionId: session.id,
        date: new Date(session.date).toLocaleDateString(),
        practitioner: {
            name: session.practitionerName,
            role: session.practitionerClass
        },
        client: {
            name: user?.name || "Guest",
            primaryComplaints: user?.primaryComplaints || [],
            contraindications: user?.contraindications || []
        }
    };

    // 2. Bodywork Log (The Core Data)
    const bodyworkLog = Object.entries(session.bodyMap || {})
        .filter(([_, status]) => status !== 'normal')
        .map(([partId, status]) => {
            const partName = getBodyPartName(partId);
            const statusLabel = getStatusLabel(status as string);

            return {
                bodyPart: partName,
                status: statusLabel,
                clientInput: {
                    painLevel: session.bodyLevels?.[partId] || null,
                    symptoms: session.bodyBadges?.[partId] || [],
                    note: session.bodyNotes?.[partId] || null
                },
                practitionerAssessment: {
                    findings: session.practitionerBadges?.[partId] || [], // These are already natural names now
                    severityLevel: session.practitionerLevels?.[partId] || null,
                    treatmentNote: session.treatmentNotes?.[partId] || null
                }
            };
        });

    // 3. Recommendations
    const recommendations = session.recommendations?.map((rec: any) => ({
        title: rec.title,
        category: rec.category,
        frequency: rec.frequency,
        description: rec.description,
        reminderTimes: rec.reminderTimes
    })) || [];

    // 4. Session Notes
    const sessionNotes = session.notes || null;

    // 5. Post-Session Journal
    const journal = session.postSessionLog?.map((entry: any) => ({
        type: entry.type,
        content: entry.content,
        timestamp: new Date(entry.timestamp).toLocaleString()
    })) || [];

    return {
        metadata,
        bodyworkLog,
        sessionNotes,
        recommendations,
        journal
    };
}
