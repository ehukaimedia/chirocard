import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { useLiveQuery, db } from '@/db/db';
import { BodyRegionSelector } from '@/components/BodyMap/BodyRegionSelector';
import { IntakeProfileSection } from '@/components/Intake/IntakeProfileSection';
import { Button } from '@/components/ui/Button';
import { GuardModal } from '@/components/Session/GuardModal';
import { ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react-native';
import clsx from 'clsx';

export default function IntakeScreen() {
    const router = useRouter();
    const { currentSession, startSession, updateSession, setMode } = useAppStore();
    const [step, setStep] = useState<'form' | 'review'>('form');
    const [showGuard, setShowGuard] = useState(false);
    const [agreement, setAgreement] = useState<string | null>(null);

    // Profile Check
    const user = useLiveQuery(async () => {
        try { return await db.users.get('me'); } catch { return null; }
    });

    useEffect(() => {
        // Ensure session exists
        if (!currentSession) startSession();
    }, [currentSession]);

    // Redirect if profile incomplete logic could go here, 
    // but maybe better to verify on "Next" press to avoid abrupt redirects on load?
    // Let's do it on "Review" press.

    const handleReview = () => {
        if (!user || !user.name || !user.dateOfBirth) {
            Alert.alert("Profile Incomplete", "Please complete your profile details before starting a session.", [
                { text: "Go to Profile", onPress: () => router.push('/profile/edit') }
            ]);
            return;
        }

        const hasIssues = Object.values(currentSession?.bodyMap || {}).some(s => s === 'issue' || s === 'watch');
        if (!hasIssues && !currentSession?.clientNotes) {
            Alert.alert("Intake Incomplete", "Please select at least one area of concern or add a note.");
            return;
        }

        setStep('review');
    };

    const handleStart = () => {
        if (!agreement) {
            Alert.alert("Agreement Required", "Please tap to agree and sign the intake.");
            return;
        }
        updateSession({ userSignature: agreement });
        setShowGuard(true);
    };

    const handleUnlock = () => {
        setShowGuard(false);
        setMode('execution'); // Or 'session' mode
        router.replace('/session');
    };

    if (step === 'review') {
        const issueAreas = Object.keys(currentSession?.bodyMap || {}).filter(k => currentSession?.bodyMap[k] === 'issue');

        return (
            <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-black">
                <View className="flex-row items-center p-4 border-b border-zinc-200 dark:border-zinc-800 mb-2">
                    <TouchableOpacity onPress={() => setStep('form')} className="p-2">
                        <ArrowLeft className="text-zinc-900 dark:text-zinc-100" size={24} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-2 text-zinc-900 dark:text-zinc-100">Review & Confirm</Text>
                </View>

                <ScrollView className="flex-1 p-4">
                    <IntakeProfileSection />

                    <View className="mt-6 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <Text className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Areas of Concern</Text>
                        {issueAreas.length === 0 ? (
                            <Text className="text-zinc-500 italic">No specific areas selected.</Text>
                        ) : (
                            issueAreas.map(part => (
                                <View key={part} className="flex-row items-center justify-between mb-2">
                                    <Text className="text-zinc-900 dark:text-zinc-100 font-medium capitalize">{part}</Text>
                                    <View className="bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 rounded">
                                        <Text className="text-rose-600 dark:text-rose-400 text-xs font-bold">ISSUE</Text>
                                    </View>
                                </View>
                            ))
                        )}

                        <Text className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-4 mb-2">Notes</Text>
                        <Text className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg italic">
                            {currentSession?.clientNotes || "No notes provided."}
                        </Text>
                    </View>

                    <View className="mt-8 bg-zinc-100 dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 items-center">
                        <Text className="text-zinc-500 text-center text-sm mb-4">
                            I verify the above information is accurate.
                        </Text>

                        <TouchableOpacity
                            onPress={() => setAgreement(prev => prev ? null : `Digitally Agreed • ${new Date().toLocaleString()}`)}
                            className={clsx(
                                "w-full py-4 rounded-xl flex-row items-center justify-center border-2",
                                agreement
                                    ? "bg-emerald-500 border-emerald-600 shadow-lg shadow-emerald-500/20"
                                    : "bg-white dark:bg-zinc-800 border-dashed border-zinc-300 dark:border-zinc-700"
                            )}
                        >
                            {agreement ? (
                                <>
                                    <CheckCircle size={20} className="text-white mr-2" />
                                    <Text className="text-white font-bold text-lg">Agreed & Signed</Text>
                                </>
                            ) : (
                                <Text className="text-zinc-400 font-medium text-lg">Tap to Sign</Text>
                            )}
                        </TouchableOpacity>
                        <Text className="mt-2 text-xs text-zinc-400 uppercase">Signed by: {user?.name || "Guest"}</Text>
                    </View>

                    <View className="h-24" />
                </ScrollView>

                <View className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                    <Button onPress={handleStart} variant="primary" disabled={!agreement}>
                        Start Session
                    </Button>
                </View>

                <GuardModal
                    isOpen={showGuard}
                    onCancel={() => setShowGuard(false)}
                    onUnlock={handleUnlock}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-black">
            <View className="flex-row items-center p-4 border-b border-zinc-200 dark:border-zinc-800 mb-2">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ArrowLeft className="text-zinc-900 dark:text-zinc-100" size={24} />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-2 text-zinc-900 dark:text-zinc-100">Session Intake</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                <Text className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">1. Client Profile</Text>
                <Text className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">1. Client Profile</Text>
                <IntakeProfileSection />

                <Text className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mt-6 mb-2">2. Areas of Concern</Text>
                <View className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden h-[400px]">
                    <BodyRegionSelector
                        value={currentSession?.bodyMap || {}}
                        // We use dummy functions for levels/notes in this simplified view if needed, 
                        // but BodyRegionSelector handles internal selection state well if we pass onChange properly
                        onChange={(part, status) => {
                            if (!currentSession) return;
                            updateSession({
                                bodyMap: { ...currentSession.bodyMap, [part]: status }
                            });
                        }}
                        onLevelChange={(part, level) => {
                            if (!currentSession) return;
                            updateSession({
                                bodyLevels: { ...currentSession.bodyLevels, [part]: level }
                            });
                        }}
                    />
                </View>

                <Text className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mt-6 mb-2">3. Notes</Text>
                <TextInput
                    value={currentSession?.clientNotes || ''}
                    onChangeText={(t) => updateSession({ clientNotes: t })}
                    placeholder="Describe your pain or goals for today..."
                    multiline
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 min-h-[120px] text-zinc-900 dark:text-zinc-100 text-lg"
                    style={{ textAlignVertical: 'top' }}
                />

                <View className="h-32" />
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-black/80 blur-lg border-t border-zinc-200 dark:border-zinc-800">
                <Button onPress={handleReview} variant="primary">
                    Review & Confirm <ArrowRight size={18} className="ml-2 text-white" />
                </Button>
            </View>
        </SafeAreaView>
    );
}
