import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { BodyRegionDetails } from './BodyRegionDetails';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import clsx from 'clsx';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function SessionFindings() {
    const { currentSession, updateSession } = useAppStore();
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    const { showToast } = useToast();

    if (!currentSession) return null;

    const activeBodyParts = Object.entries(currentSession.bodyMap || {})
        .filter(([, status]) => status === 'issue' || status === 'addressed' || status === 'watch')
        .map(([part]) => part);

    const toggleCard = (part: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedCards(prev => ({ ...prev, [part]: !prev[part] }));
    };

    const handleSmartCopy = (part: string) => {
        const clientLevel = currentSession.bodyLevels?.[part] || 0;
        updateSession({
            practitionerLevels: { ...currentSession.practitionerLevels, [part]: clientLevel }
        });
        showToast("Copied client findings", "success");
    };

    if (activeBodyParts.length === 0) {
        return (
            <View className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl items-center">
                <Text className="text-zinc-500">No active body regions selected.</Text>
                <Text className="text-zinc-400 text-xs mt-1">Tap the Body Map to add areas.</Text>
            </View>
        );
    }

    return (
        <View className="space-y-4">
            <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Findings & Treatment</Text>
                <Text className="text-xs text-zinc-500">{activeBodyParts.length} Areas Active</Text>
            </View>

            {activeBodyParts.map(part => {
                const hasClientData = (currentSession.bodyLevels?.[part] !== undefined) || currentSession.bodyNotes?.[part];
                const isExpanded = expandedCards[part] ?? true;

                return (
                    <View key={part} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        {/* Header */}
                        <TouchableOpacity
                            onPress={() => toggleCard(part)}
                            className="p-4 flex-row items-center justify-between bg-zinc-50/50 dark:bg-zinc-900"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className={clsx("w-3 h-3 rounded-full", hasClientData ? 'bg-red-500' : 'bg-emerald-500')} />
                                <Text className="font-bold text-zinc-900 dark:text-zinc-100 capitalize text-lg">
                                    {part.replace(/([A-Z])/g, ' $1').trim()}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                {hasClientData && (
                                    <View className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                                        <Text className="text-xs text-red-600 dark:text-red-400">
                                            Reported: {currentSession.bodyLevels?.[part]}/10
                                        </Text>
                                    </View>
                                )}
                                {isExpanded ?
                                    <ChevronUp size={20} className="text-zinc-400" /> :
                                    <ChevronDown size={20} className="text-zinc-400" />
                                }
                            </View>
                        </TouchableOpacity>

                        {/* Content */}
                        {isExpanded && (
                            <View className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800">
                                {/* Client Context */}
                                {hasClientData && (
                                    <View className="mt-4 bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-1 mr-2">
                                                <Text className="text-[10px] font-bold uppercase text-zinc-500 mb-1">Client Report</Text>
                                                <Text className="text-sm text-zinc-700 dark:text-zinc-300">
                                                    <Text className="font-medium">Pain: {currentSession.bodyLevels?.[part]}/10</Text>
                                                </Text>
                                                {currentSession.bodyNotes?.[part] && (
                                                    <Text className="text-sm text-zinc-500 italic mt-1">"{currentSession.bodyNotes[part]}"</Text>
                                                )}
                                            </View>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 px-2"
                                                textClassName="text-xs text-emerald-600 dark:text-emerald-400"
                                                onPress={() => handleSmartCopy(part)}
                                            >
                                                <Copy size={12} className="text-emerald-500 mr-1" /> Copy
                                            </Button>
                                        </View>
                                    </View>
                                )}

                                {/* Practitioner Input */}
                                <View className="mt-4">
                                    <Text className="text-xs font-bold uppercase text-zinc-500 mb-2">My Findings</Text>
                                    <BodyRegionDetails
                                        bodyPart={part}
                                        mode="practitioner"
                                        data={{
                                            level: currentSession.practitionerLevels?.[part] ?? currentSession.bodyLevels?.[part] ?? 0,
                                            notes: currentSession.treatmentNotes?.[part] || ""
                                        }}
                                        onChange={(data) => updateSession({
                                            practitionerLevels: { ...currentSession.practitionerLevels, [part]: data.level },
                                            treatmentNotes: { ...currentSession.treatmentNotes, [part]: data.notes }
                                        })}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
}
