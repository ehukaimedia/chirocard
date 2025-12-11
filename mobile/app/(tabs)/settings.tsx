import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLiveQuery, db } from '@/db/db';
import { User, Edit2, Shield, Activity } from 'lucide-react-native';
import clsx from 'clsx';

export default function SettingsScreen() {
    const router = useRouter();
    const user = useLiveQuery(async () => {
        try {
            return await db.users.get('me');
        } catch { return null; }
    });

    return (
        <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-black">
            <ScrollView className="flex-1 p-4">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Profile</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/profile/edit')}
                        className="bg-zinc-200 dark:bg-zinc-800 p-2.5 rounded-full"
                    >
                        <Edit2 size={20} className="text-zinc-900 dark:text-zinc-100" />
                    </TouchableOpacity>
                </View>

                {/* Passport Card */}
                <View className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-6 overflow-hidden relative">
                    {/* Decorative Blob */}
                    <View className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />

                    <Text className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">MY BODYWORK PASSPORT</Text>

                    <View className="flex-row items-center gap-4 mb-6">
                        <View className="h-16 w-16 rounded-full bg-zinc-800 border-2 border-zinc-700 items-center justify-center overflow-hidden">
                            {user?.photo ? (
                                <Image source={{ uri: user.photo }} className="w-full h-full" />
                            ) : (
                                <User size={32} color="#a1a1aa" />
                            )}
                        </View>
                        <View>
                            <Text className="text-2xl font-black text-white">{user?.name || "Guest User"}</Text>
                            <Text className="text-zinc-400 text-sm">{user?.occupation || "No occupation listed"}</Text>
                        </View>
                    </View>

                    {/* Vitals */}
                    <View className="flex-row gap-8 mb-4">
                        <View>
                            <Text className="text-zinc-500 text-xs uppercase mb-1">Height</Text>
                            <Text className="text-zinc-200 font-medium">{user?.height || "--"}</Text>
                        </View>
                        <View>
                            <Text className="text-zinc-500 text-xs uppercase mb-1">Weight</Text>
                            <Text className="text-zinc-200 font-medium">{user?.weight || "--"}</Text>
                        </View>
                        <View>
                            <Text className="text-zinc-500 text-xs uppercase mb-1">Age</Text>
                            <Text className="text-zinc-200 font-medium">
                                {user?.dateOfBirth ? (() => {
                                    try {
                                        const now = new Date();
                                        const parts = user.dateOfBirth.split('-');
                                        if (parts.length === 3) {
                                            // MM-DD-YYYY
                                            const dob = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                                            let age = now.getFullYear() - dob.getFullYear();
                                            const m = now.getMonth() - dob.getMonth();
                                            if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
                                                age--;
                                            }
                                            return isNaN(age) ? "--" : age;
                                        }
                                        return "--";
                                    } catch { return "--"; }
                                })() : "--"}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-zinc-500 text-xs uppercase mb-1">Activity</Text>
                            <Text className="text-emerald-400 font-bold">{user?.activityLevel || "Moderate"}</Text>
                        </View>
                    </View>
                </View>

                {/* Info Sections */}
                <InfoSection title="Physical Activities" tags={user?.physicalActivities} color="emerald" emptyText="No activities listed" />
                <InfoSection title="Dietary Preferences" tags={user?.diet} color="lime" emptyText="No dietary info" />
                <InfoSection title="Supplements" tags={user?.supplements} color="orange" emptyText="No supplements listed" />

                <View className="h-8" />

                {/* Safety / Alerts */}
                {(user?.contraindications?.length || 0) > 0 && (
                    <View className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-5 mb-4">
                        <View className="flex-row items-center gap-2 mb-3">
                            <Shield size={20} className="text-rose-600 dark:text-rose-400" />
                            <Text className="font-bold text-rose-900 dark:text-rose-200 text-lg">Safety Alerts</Text>
                        </View>
                        <View className="flex-row flex-wrap gap-2">
                            {user?.contraindications?.map((c, i) => (
                                <View key={i} className="bg-rose-100 dark:bg-rose-900/40 px-3 py-1 rounded-lg">
                                    <Text className="text-rose-800 dark:text-rose-200 font-medium">{c}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

function InfoSection({ title, tags, color, emptyText }: { title: string, tags?: string[], color: string, emptyText: string }) {
    if (!tags || tags.length === 0) return null;

    // Tailwind dynamic classes are tricky in nativewind/react-native without full safelist
    // We'll stick to a simple mapping or just use zinc for simplicity standard
    return (
        <View className="mb-6">
            <Text className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">{title}</Text>
            <View className="flex-row flex-wrap gap-2">
                {tags.map((t, i) => (
                    <View key={i} className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <Text className="text-zinc-700 dark:text-zinc-300 font-medium">{t}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
