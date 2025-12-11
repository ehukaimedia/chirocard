import React from 'react';
import { View, Text } from 'react-native';
import { useLiveQuery, db } from '@/db/db';
import { User, Ruler, Weight, Activity } from 'lucide-react-native';

export function IntakeProfileSection() {
    const user = useLiveQuery(async () => {
        try { return await db.users.get('me'); } catch { return null; }
    });

    if (!user) return (
        <View className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <Text className="text-zinc-500 text-center">Loading profile...</Text>
        </View>
    );

    return (
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center gap-3 mb-4">
                <View className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full">
                    <User size={20} className="text-zinc-600 dark:text-zinc-400" />
                </View>
                <View>
                    <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">{user.name}</Text>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400">{user.occupation || "No occupation"}</Text>
                </View>
            </View>

            <View className="flex-row justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <View className="items-center">
                    <View className="flex-row items-center gap-1 mb-1">
                        <Ruler size={14} className="text-emerald-500" />
                        <Text className="text-xs font-medium text-zinc-400 uppercase">Height</Text>
                    </View>
                    <Text className="font-bold text-zinc-700 dark:text-zinc-300">{user.height || "--"}</Text>
                </View>
                <View className="w-px bg-zinc-100 dark:bg-zinc-800" />
                <View className="items-center">
                    <View className="flex-row items-center gap-1 mb-1">
                        <Weight size={14} className="text-blue-500" />
                        <Text className="text-xs font-medium text-zinc-400 uppercase">Weight</Text>
                    </View>
                    <Text className="font-bold text-zinc-700 dark:text-zinc-300">{user.weight || "--"}</Text>
                </View>
                <View className="w-px bg-zinc-100 dark:bg-zinc-800" />
                <View className="items-center">
                    <View className="flex-row items-center gap-1 mb-1">
                        <Activity size={14} className="text-orange-500" />
                        <Text className="text-xs font-medium text-zinc-400 uppercase">Activity</Text>
                    </View>
                    <Text className="font-bold text-zinc-700 dark:text-zinc-300">{user.activityLevel || "--"}</Text>
                </View>
            </View>
        </View>
    );
}
