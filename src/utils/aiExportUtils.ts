import { db, type Practitioner, type Session, type BodyworkRoutine, type PostSessionEntry } from "../db/db";

/**
 * Generates a "Smart Export" JSON object optimized for AI analysis.
 * It cleans the data, formats dates, and adds context.
 */
export const generateAIExport = async () => {
    // 1. Fetch all raw data
    const [
        userProfile,
        practitioners,
        sessions,
        homework
    ] = await Promise.all([
        db.users.get('me'),
        db.practitioners.toArray(),
        db.sessions.orderBy('date').reverse().toArray(),
        db.homework.toArray()
    ]);

    // 2. Helper to format dates
    const formatDate = (timestamp: number | undefined) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 3. Clean & Format Data

    // User Profile
    const cleanProfile = userProfile ? {
        name: userProfile.name,
        biometrics: {
            height: userProfile.height,
            weight: userProfile.weight,
            age: userProfile.dateOfBirth ? new Date().getFullYear() - new Date(userProfile.dateOfBirth).getFullYear() : "Unknown",
            activityLevel: userProfile.activityLevel,
            occupation: userProfile.occupation
        },
        healthContext: {
            primaryComplaints: userProfile.primaryComplaints,
            contraindications: userProfile.contraindications,
            preferences: userProfile.preferences,
            bodyHistory: userProfile.bodyHistory,
            medications: userProfile.medications,
            allergies: userProfile.allergies,
            mobilityStatus: userProfile.mobilityStatus
        },
        lifestyle: {
            diet: userProfile.diet,
            hydration: userProfile.hydration,
            supplements: userProfile.supplements,
            physicalActivities: userProfile.physicalActivities
        }
    } : "No profile data found.";

    // Practitioners (Lookup Map)
    const practitionerMap = new Map(practitioners.map((p: Practitioner) => [p.id, p]));
    const cleanPractitioners = practitioners.map((p: Practitioner) => ({
        name: p.name,
        role: p.role,
        clinic: p.clinicName
    }));

    // Sessions (The Core Data)
    const cleanSessions = sessions.map((s: Session) => {
        const practitioner = practitionerMap.get(s.practitionerId);
        return {
            date: formatDate(s.date),
            practitioner: practitioner ? `${practitioner.name} (${practitioner.role})` : s.practitionerName,
            notes: s.notes,
            // Summarize body status
            bodyStatus: s.bodyMap ? Object.entries(s.bodyMap)
                .filter(([, status]) => status !== 'normal')
                .map(([part, status]) => `${part}: ${status}`) : [],
            // Pain Levels
            painLevels: s.bodyLevels,
            // Treatment Notes
            treatment: s.treatmentNotes,
            // Post-session logs
            journal: s.postSessionLog?.map((log: PostSessionEntry) => ({
                date: formatDate(log.timestamp),
                type: log.type,
                content: log.content
            }))
        };
    });

    // Homework / Habits
    const cleanHomework = homework.map((h: BodyworkRoutine) => ({
        title: h.title,
        description: h.description,
        frequency: h.frequency,
        category: h.category,
        status: h.status,
        lastCompleted: formatDate(h.lastCompletedAt)
    }));

    // 4. Construct the Final AI Context Object
    const aiContext = {
        system_instruction: "This is a ChiroCard Health Passport export. It contains the user's bodywork history, medical context, and session logs. Your goal is to analyze this data to find patterns, correlations between treatments and relief, and suggest insights. Pay attention to the 'Sessions' array to see how the user's body has responded over time.",
        generated_at: formatDate(Date.now()),
        user_profile: cleanProfile,
        care_team: cleanPractitioners,
        active_homework_and_habits: cleanHomework,
        session_history: cleanSessions
    };

    return aiContext;
};
