import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { BodyRegionSelector } from '../components/BodyMap/BodyRegionSelector';
import { SessionFindings } from '../components/Session/SessionFindings';
import { SessionTags } from '../components/Session/SessionTags';
import { SessionRecommendations } from '../components/Session/SessionRecommendations';
import { Wand2, ArrowRight } from 'lucide-react-native';
import { useToast } from '@/components/ui/Toast';

export default function SessionScreen() {
    const router = useRouter();
    const { currentSession, updateSession } = useAppStore();
    const { showToast } = useToast();
    const [bodyMapMode, setBodyMapMode] = useState<boolean>(false);

    if (!currentSession) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-zinc-50 dark:bg-zinc-900">
                <Text className="text-zinc-500 mb-4">No active session</Text>
                <Button onPress={() => router.replace('/(tabs)')}>Return to Dashboard</Button>
            </SafeAreaView>
        );
    }

    const handleGenerateSOAP = () => {
        // Simple mock of the SOAP logic for now until we port the full utility
        const parts = Object.keys(currentSession.bodyMap).filter(p =>
            currentSession.bodyMap[p] === 'issue' || currentSession.bodyMap[p] === 'addressed'
        );

        let soap = `S: Client presents with ${parts.join(", ")}. Notes: ${currentSession.clientNotes || "none"}.\n\n`;
        soap += `O: Treated ${parts.join(", ")}.\n\n`;
        soap += `A: Tolerated treatment well.\n\n`;
        soap += `P: Continue care.`;

        updateSession({ practitionerNotes: soap });
        showToast("SOAP note generated!", "success");
    };

    const handleFinalize = () => {
        // In web this opens Review screen, here let's route to a finalize screen
        router.push('/session/finalize');
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <View className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex-row justify-between items-center bg-white dark:bg-zinc-900/80 blur-md sticky top-0 z-10">
                <View>
                    <Text className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Active Session</Text>
                    <Text className="text-zinc-400 text-xs">{currentSession.practitionerName}</Text>
                </View>
                <View className="bg-emerald-500/10 px-2 py-1 rounded">
                    <Text className="text-emerald-500 text-xs font-bold uppercase">Live</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">

                {/* 1. Body Map (Collapsible/Modal-like) */}
                <View className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-6">
                    <View className="p-4 flex-row justify-between items-center border-b border-zinc-100 dark:border-zinc-800">
                        <Text className="text-sm font-bold text-zinc-500 uppercase">Body Map</Text>
                        <TouchableOpacity onPress={() => setBodyMapMode(!bodyMapMode)}>
                            <Text className="text-emerald-500 text-xs font-medium">{bodyMapMode ? "Close Map" : "Edit Map"}</Text>
                        </TouchableOpacity>
                    </View>

                    {bodyMapMode && (
                        <View className="h-[400px]">
                            <BodyRegionSelector
                                value={currentSession.bodyMap || {}}
                                levels={{ ...(currentSession.bodyLevels || {}), ...(currentSession.practitionerLevels || {}) }}
                                onChange={(part, status) => {
                                    const newMap = { ...(currentSession.bodyMap || {}), [part]: status };
                                    updateSession({ bodyMap: newMap });
                                }}
                                onLevelChange={(part, level) => {
                                    // Default to practitioner level update in this mode
                                    const newLevels = { ...(currentSession.practitionerLevels || {}), [part]: level };
                                    updateSession({ practitionerLevels: newLevels });
                                }}
                            />
                        </View>
                    )}
                </View>

                {/* 2. Findings (Unified Cards) */}
                <SessionFindings />
                <View className="h-6" />

                {/* 3. Tags */}
                <SessionTags />
                <View className="h-6" />

                {/* 4. Recommendations */}
                <SessionRecommendations />
                <View className="h-6" />

                {/* 5. SOAP Generator */}
                <View className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Session Notes</Text>
                        <TouchableOpacity onPress={handleGenerateSOAP} className="flex-row items-center">
                            <Wand2 size={12} className="text-emerald-500 mr-1" />
                            <Text className="text-emerald-500 text-xs font-medium">Generate SOAP</Text>
                        </TouchableOpacity>
                    </View>
                    <Text className="text-zinc-700 dark:text-zinc-300 min-h-[100px] p-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-mono">
                        {currentSession.practitionerNotes || "No notes generated."}
                    </Text>
                </View>

                <View className="h-32" />
            </ScrollView>

            {/* Sticky Footer */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-zinc-950/90 blur-lg border-t border-zinc-200 dark:border-zinc-800">
                <Button onPress={handleFinalize} variant="primary" size="lg" className="shadow-xl shadow-emerald-500/20">
                    Finalize Session <ArrowRight size={20} className="ml-2 text-white" />
                </Button>
            </View>
        </SafeAreaView>
    );
}
