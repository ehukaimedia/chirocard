import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SERVICE_TAGS, FINDING_TAGS } from '@/db/db';
import clsx from 'clsx';
import { useAppStore } from '@/store/useAppStore';

export function SessionTags() {
    const { currentSession, updateSession } = useAppStore();

    if (!currentSession) return null;

    const toggleService = (tag: string) => {
        const tags = currentSession.serviceTags || [];
        if (tags.includes(tag)) {
            updateSession({ serviceTags: tags.filter(t => t !== tag) });
        } else {
            updateSession({ serviceTags: [...tags, tag] });
        }
    };

    const toggleModality = (tag: string) => {
        const tags = currentSession.modalityTags || [];
        if (tags.includes(tag)) {
            updateSession({ modalityTags: tags.filter(t => t !== tag) });
        } else {
            updateSession({ modalityTags: [...tags, tag] });
        }
    };

    const toggleFinding = (tag: string) => {
        const tags = currentSession.findingTags || [];
        if (tags.includes(tag)) {
            updateSession({ findingTags: tags.filter(t => t !== tag) });
        } else {
            updateSession({ findingTags: [...tags, tag] });
        }
    };

    return (
        <View className="space-y-6">
            {/* Services */}
            <View>
                <Text className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Services Performed</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    <View className="flex-col gap-2">
                        {Object.entries(SERVICE_TAGS).filter(([k]) => k !== 'Modalities').map(([category, tags]) => (
                            <View key={category} className="flex-row flex-wrap gap-2 mr-4">
                                {tags.map(tag => {
                                    const isSelected = currentSession.serviceTags?.includes(tag);
                                    return (
                                        <TouchableOpacity
                                            key={tag}
                                            onPress={() => toggleService(tag)}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-full border",
                                                isSelected
                                                    ? "bg-emerald-500 border-emerald-600"
                                                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                            )}
                                        >
                                            <Text className={clsx("text-xs font-medium", isSelected ? "text-white" : "text-zinc-500")}>
                                                {tag}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Modalities */}
            <View>
                <Text className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Modalities Used</Text>
                <View className="flex-row flex-wrap gap-2">
                    {SERVICE_TAGS['Modalities'].map(tag => {
                        const isSelected = currentSession.modalityTags?.includes(tag);
                        return (
                            <TouchableOpacity
                                key={tag}
                                onPress={() => toggleModality(tag)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-full border",
                                    isSelected
                                        ? "bg-blue-500 border-blue-600"
                                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                )}
                            >
                                <Text className={clsx("text-xs font-medium", isSelected ? "text-white" : "text-zinc-500")}>
                                    {tag}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Findings */}
            <View>
                <Text className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Clinical Findings</Text>
                <View className="flex-row flex-wrap gap-2">
                    {Object.values(FINDING_TAGS).flat().map(tag => {
                        const isSelected = currentSession.findingTags?.includes(tag);
                        return (
                            <TouchableOpacity
                                key={tag}
                                onPress={() => toggleFinding(tag)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-full border",
                                    isSelected
                                        ? "bg-amber-500 border-amber-600"
                                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                )}
                            >
                                <Text className={clsx("text-xs font-medium", isSelected ? "text-white" : "text-zinc-500")}>
                                    {tag}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}
