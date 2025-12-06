export const trackEvent = (
    eventName: 'begin_session' | 'complete_session' | 'update_profile' | 'view_promotion' | 'generate_lead' | 'complete_routine' | 'print_report' | 'add_routine_to_calendar' | 'add_practitioner',
    params?: Record<string, any>
) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
            event: eventName,
            ...params
        });
    } else {
        console.warn(`[Analytics] dataLayer not found. Event dropped: ${eventName}`, params);
    }
};

declare global {
    interface Window {
        dataLayer: any[];
    }
}
