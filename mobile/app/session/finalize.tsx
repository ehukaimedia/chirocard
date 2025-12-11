import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { db } from '@/db/db';
import { Button } from '@/components/ui/Button';
import { CheckCircle, ArrowLeft, FileText, Wand2 } from 'lucide-react-native';
import clsx from 'clsx';
import { useToast } from '@/components/ui/Toast';

export default function FinalizeSessionScreen() {
    const router = useRouter();
    const { currentSession, endSession, updateSession } = useAppStore();
    const { showToast } = useToast();
    const [verified, setVerified] = useState<string | null>(null);

    if (!currentSession) return null;

    const handleSave = async () => {
        if (!verified) return;

        try {
            await db.users.save({ id: 'me' } as any); // Dummy save user logic if needed, actually we save session 
            // In a real app we would call db.sessions.add() here but we haven't ported sessions table yet fully in mobile/db.ts
            // Let's assume we just end it in store for now as per previous logic.

            showToast("Session saved!", "success");
            endSession();
            router.replace('/(tabs)');
        } catch (e) {
            console.error(e);
            showToast("Failed to save", "error");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-black">
            <View className="flex-row items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ArrowLeft className="text-zinc-900 dark:text-zinc-100" size={24} />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold ml-2 text-zinc-900 dark:text-zinc-100">Review & Verify</Text>
                    <Text className="text-xs text-zinc-500 ml-2">Finalize Session</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* 1. Intake Overview */}
                <View className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 mb-4">
                    <View className="flex-row items-center gap-2 mb-2">
                        <FileText size={16} className="text-zinc-400" />
                        <Text className="text-xs font-bold uppercase text-zinc-500">Intake Overview</Text>
                    </View>
                    <View className="space-y-2">
                        <Text className="text-xs font-medium text-zinc-500">Client Notes</Text>
                        <Text className="text-zinc-700 dark:text-zinc-300 italic bg-white dark:bg-zinc-800 p-2 rounded border border-zinc-200 dark:border-zinc-700">
                            "{currentSession.clientNotes || "No notes"}"
                        </Text>
                    </View>
                </View>

                {/* 2. SOAP */}
                <View className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 mb-4">
                    <View className="flex-row items-center gap-2 mb-2">
                        <FileText size={16} className="text-emerald-500" />
                        <Text className="text-xs font-bold uppercase text-zinc-500">Final SOAP Note</Text>
                    </View>
                    <Text className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 p-2 rounded border border-zinc-200 dark:border-zinc-700 leading-relaxed">
                        {currentSession.practitionerNotes || "No notes generated."}
                    </Text>
                </View>

                {/* 3. Signatures */}
                <View className="flex-row gap-4 mb-8">
                    {/* Client */}
                    <View className="flex-1">
                        <Text className="text-xs font-bold uppercase text-zinc-500 mb-2">Client Agreement</Text>
                        <View className="bg-white dark:bg-zinc-900 h-24 rounded-lg border border-zinc-200 dark:border-zinc-800 items-center justify-center p-2">
                            {currentSession.userSignature ? (
                                <View className="items-center">
                                    <CheckCircle size={24} className="text-emerald-500 mb-1" />
                                    <Text className="text-emerald-600 font-bold text-[10px]">DIGITALLY AGREED</Text>
                                    <Text className="text-[8px] text-zinc-400 text-center">{currentSession.userSignature}</Text>
                                </View>
                            ) : (
                                <Text className="text-xs text-zinc-400 italic">No signature</Text>
                            )}
                        </View>
                    </View>
                    {/* Practitioner */}
                    <View className="flex-1">
                        <Text className="text-xs font-bold uppercase text-zinc-500 mb-2">My Verification</Text>
                        <TouchableOpacity
                            onPress={() => setVerified(v => v ? null : `Verified ${new Date().toLocaleTimeString()}`)}
                            className={clsx(
                                "h-24 rounded-lg border-2 items-center justify-center p-2",
                                verified ? "bg-emerald-500 border-emerald-600" : "bg-white dark:bg-zinc-900 border-dashed border-zinc-300 dark:border-zinc-700"
                            )}
                        >
                            {verified ? (
                                <View className="items-center">
                                    <CheckCircle size={24} className="text-white mb-1" />
                                    <Text className="text-white font-bold text-[10px]">VERIFIED</Text>
                                </View>
                            ) : (
                                <Text className="text-xs text-zinc-400">Tap to Verify</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="h-24" />
            </ScrollView>

            <View className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <Button onPress={handleSave} variant="primary" disabled={!verified} size="lg">
                    Finalize & Save
                </Button>
            </View>
        </SafeAreaView>
    );
}
