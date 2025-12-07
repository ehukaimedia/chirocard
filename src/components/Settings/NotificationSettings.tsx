import { Bell, Clock } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/Button";

export function NotificationSettings() {
    const { notificationSettings, updateNotificationSettings } = useAppStore();
    const { toast } = useToast();

    const requestPermission = async () => {
        if (!("Notification" in window)) {
            toast("This browser does not support desktop notifications", "error");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            toast("Notifications enabled!", "success");
            new Notification("ChiroCard Notifications Enabled", {
                body: "You will now receive reminders for your routines and journaling.",
                icon: "/icon-192x192.png"
            });
        } else if (permission === "denied") {
            toast("Notifications blocked. Please enable them in your browser settings.", "error");
        }
    };

    const testNotification = () => {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            new Notification("Test Notification", {
                body: "This is a test notification from ChiroCard.",
                icon: "/icon-192x192.png"
            });
            toast("Test notification sent!", "success");
        } else {
            toast("Please enable notifications fully first.", "info");
            requestPermission();
        }
    };

    return (
        <section className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                    <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900">Notifications</h2>
                    <p className="text-sm text-zinc-500">Manage your reminders and alerts</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Master Switch */}
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-zinc-900">Enable Notifications</label>
                        <p className="text-xs text-zinc-500">Allow ChiroCard to send you reminders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={notificationSettings.enabled}
                            onChange={(e) => updateNotificationSettings({ enabled: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                    </label>
                </div>

                {notificationSettings.enabled && (
                    <div className="space-y-6 pt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-4">
                        {/* Browser Permission Status */}
                        <div className="bg-zinc-50 rounded-xl p-4 flex items-center justify-between">
                            <div className="text-sm">
                                <span className="text-zinc-500">Browser Permission: </span>
                                <span className={`font-medium ${('Notification' in window) && Notification.permission === 'granted' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {('Notification' in window) && Notification.permission === 'granted' ? 'Active' : 'Required'}
                                </span>
                            </div>
                            {(!('Notification' in window) || Notification.permission !== 'granted') && (
                                <Button size="sm" variant="secondary" onClick={requestPermission}>
                                    Enable Now
                                </Button>
                            )}
                            {('Notification' in window) && Notification.permission === 'granted' && (
                                <Button size="sm" variant="ghost" onClick={testNotification}>
                                    Test
                                </Button>
                            )}
                        </div>

                        {/* Routine Reminders */}
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-zinc-900">Routine Reminders</label>
                                <p className="text-xs text-zinc-500">Get notified when it's time for your bodywork routines</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.routineRemindersEnabled}
                                    onChange={(e) => updateNotificationSettings({ routineRemindersEnabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* Journal Reminder */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-zinc-900">Daily Journal Reminder</label>
                                    <p className="text-xs text-zinc-500">Remind me to log my day if I haven't already</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.journalReminderEnabled}
                                        onChange={(e) => updateNotificationSettings({ journalReminderEnabled: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            {notificationSettings.journalReminderEnabled && (
                                <div className="flex items-center gap-3 pl-4 border-l-2 border-emerald-100">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                    <input
                                        type="time"
                                        value={notificationSettings.journalReminderTime}
                                        onChange={(e) => updateNotificationSettings({ journalReminderTime: e.target.value })}
                                        className="h-9 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                                    />
                                    <span className="text-xs text-zinc-500">Best time for check-in</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
