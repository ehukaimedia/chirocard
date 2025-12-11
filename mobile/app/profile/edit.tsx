import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import clsx from 'clsx';
import { useAppStore } from '@/store/useAppStore';
// Note: We'll use the store for 'user' data if we add it there, but currently store handles Sessions.
// We should update the store to sync user data too, or just read from DB directly here.
// For alignment with web app plan, let's read from DB directly but keep it reactive if possible.
import { db } from '@/db/db';
import { UserProfile } from '@/db/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button'; // Assuming we have this
import { TagInput } from '@/components/ui/TagInput';
import { useLiveQuery } from '@/db/db'; // Custom hook we made

export default function EditProfileScreen() {
    const router = useRouter();
    // Use live query to get current user data to pre-fill
    // In our mobile db.ts, 'me' might not exist yet, handling that.
    const user = useLiveQuery(async () => {
        try {
            // Need to check if db/table exists/ready? db adapter handles it.
            // mobile/db/db.ts adapter: db.getAllAsync('users') or similar?
            // Wait, our mobile `db.ts` is RAW SQLite, not Dexie.
            // We need to write the query manually: `SELECT * FROM users WHERE id = 'me'`
            // And helper to parse JSON fields.
            const result = await db.users.get('me');
            return result;
        } catch (e) {
            console.log("Error fetching user", e);
            return null;
        }
    });

    const [formData, setFormData] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const handleSave = async () => {
        try {
            await db.users.save({
                ...formData,
                id: 'me', // Ensure ID is me
            } as UserProfile);
            Alert.alert("Success", "Profile updated!");
            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to save profile.");
        }
    };

    // Helper to update fields
    const update = (key: keyof UserProfile, val: any) => {
        setFormData(prev => ({ ...prev, [key]: val }));
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-black">
            <Stack.Screen options={{ title: 'Edit Profile', presentation: 'modal' }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 p-4">
                    <Text className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Personal Info</Text>

                    <Input
                        label="Full Name"
                        value={formData.name || ''}
                        onChangeText={t => update('name', t)}
                        placeholder="Jane Doe"
                    />

                    {/* Date Formatting Logic */}
                    <Input
                        label="Date of Birth"
                        value={formData.dateOfBirth || ''}
                        onChangeText={(text) => {
                            // Simple masking for MM-DD-YYYY
                            let cleaned = text.replace(/\D/g, '');
                            if (cleaned.length > 8) cleaned = cleaned.substring(0, 8);

                            let formatted = cleaned;
                            if (cleaned.length > 4) {
                                formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
                            } else if (cleaned.length > 2) {
                                formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
                            }
                            update('dateOfBirth', formatted);
                        }}
                        placeholder="MM-DD-YYYY"
                        keyboardType="numeric"
                        maxLength={10}
                    />

                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Input
                                label="Height"
                                value={formData.height || ''}
                                onChangeText={t => update('height', t)}
                                placeholder="5'10"
                            />
                        </View>
                        <View className="flex-1">
                            <Input
                                label="Weight"
                                value={formData.weight || ''}
                                onChangeText={t => update('weight', t)}
                                placeholder="165 lbs"
                            />
                        </View>
                    </View>

                    <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Activity Level</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-4">
                        {['Sedentary', 'Light', 'Moderate', 'Active', 'Athlete'].map((level) => (
                            <TouchableOpacity
                                key={level}
                                onPress={() => update('activityLevel', level)}
                                className={clsx(
                                    "px-4 py-2 rounded-full border",
                                    formData.activityLevel === level
                                        ? "bg-emerald-500 border-emerald-600"
                                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                                )}
                            >
                                <Text className={clsx(
                                    "font-medium",
                                    formData.activityLevel === level ? "text-white" : "text-zinc-700 dark:text-zinc-300"
                                )}>
                                    {level}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Input
                        label="Occupation"
                        value={formData.occupation || ''}
                        onChangeText={t => update('occupation', t)}
                        placeholder="e.g. Desk Worker"
                    />

                    <Text className="text-xl font-bold mt-6 mb-4 text-zinc-900 dark:text-zinc-100">Lifestyle</Text>

                    <TagInput
                        label="Physical Activities"
                        value={formData.physicalActivities || []}
                        onChange={t => update('physicalActivities', t)}
                        suggestions={["Yoga", "Running", "Weightlifting", "Cycling"]}
                    />

                    <TagInput
                        label="Diet"
                        value={formData.diet || []}
                        onChange={t => update('diet', t)}
                        suggestions={["Vegan", "Keto", "Gluten-Free"]}
                    />

                    <TagInput
                        label="Supplements"
                        value={formData.supplements || []}
                        onChange={t => update('supplements', t)}
                        suggestions={["Vitamin D", "Magnesium", "Omega-3"]}
                    />

                    <Text className="text-xl font-bold mt-6 mb-4 text-zinc-900 dark:text-zinc-100">Body History</Text>

                    <TagInput
                        label="Surgeries / Injuries"
                        value={formData.bodyHistory || []}
                        onChange={t => update('bodyHistory', t)}
                        placeholder="e.g. ACL Surgery 2020"
                    />

                    <TagInput
                        label="Contraindications (Avoid)"
                        value={formData.contraindications || []}
                        onChange={t => update('contraindications', t)}
                        suggestions={["Deep Tissue", "Neck Manipulation"]}
                    />

                    <View className="h-10" />
                    <Button onPress={handleSave} variant="primary">Save Profile</Button>
                    <View className="h-20" />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
