import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react-native';
import * as Crypto from 'expo-crypto'; // Native compatible UUID
import clsx from 'clsx';
// import { Picker } from '@react-native-picker/picker'; // Try to avoid extra deps if possible, use buttons for simple freq

export function SessionRecommendations() {
    const { currentSession, updateSession } = useAppStore();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState<'relief' | 'movement' | 'lifestyle' | 'custom'>('custom');
    const [freq, setFreq] = useState('Daily');

    if (!currentSession) return null;

    const handleAdd = () => {
        if (!title) return;
        const newRec = {
            id: Crypto.randomUUID(),
            title,
            description: desc,
            frequency: freq,
            category,
            isCompletedToday: false,
            status: 'pending' as const,
            createdAt: Date.now()
        };

        updateSession({
            recommendations: [...(currentSession.recommendations || []), newRec]
        });
        setTitle('');
        setDesc('');
    };

    const handleDelete = (id: string) => {
        updateSession({
            recommendations: (currentSession.recommendations || []).filter(r => r.id !== id)
        });
    };

    const suggestions = {
        relief: ["Cold Therapy", "Heat Therapy", "Rest", "Topical"],
        movement: ["Walk", "Run", "Yoga", "Stretch"],
        lifestyle: ["Hydrate", "Sleep", "Breathwork"],
        custom: []
    }[category] || [];

    return (
        <View className="space-y-4">
            <Text className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Recommendations</Text>

            <View className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                {/* Category Selector */}
                <View className="flex-row gap-2">
                    {(['relief', 'movement', 'lifestyle', 'custom'] as const).map(c => (
                        <TouchableOpacity
                            key={c}
                            onPress={() => setCategory(c)}
                            className={clsx(
                                "px-3 py-1.5 rounded-full border",
                                category === c
                                    ? "bg-zinc-800 border-zinc-900 dark:bg-zinc-700 dark:border-zinc-600"
                                    : "border-zinc-200 dark:border-zinc-700"
                            )}
                        >
                            <Text className={clsx("text-xs capitalize", category === c ? "text-white" : "text-zinc-500")}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Suggestions */}
                <View className="flex-row flex-wrap gap-2">
                    {suggestions.map(s => (
                        <TouchableOpacity
                            key={s}
                            onPress={() => setTitle(s)}
                            className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400"
                        >
                            <Text className="text-xs">+ {s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Inputs */}
                <TextInput
                    placeholder="Recommendation Title"
                    value={title}
                    onChangeText={setTitle}
                    className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
                />

                <View className="flex-row gap-2 overflow-x-auto">
                    {['Daily', '2x Daily', 'Weekly', 'Once'].map(f => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFreq(f)}
                            className={clsx(
                                "px-3 py-2 rounded-lg border flex-1 items-center",
                                freq === f ? "bg-emerald-500 border-emerald-600" : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                            )}
                        >
                            <Text className={clsx("text-xs", freq === f ? "text-white" : "text-zinc-500")}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    placeholder="Details (optional)"
                    value={desc}
                    onChangeText={setDesc}
                    className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 min-h-[60px]"
                    multiline
                />

                <Button onPress={handleAdd} disabled={!title}>
                    <Plus size={16} className="mr-2 text-white" /> Add
                </Button>
            </View>

            {/* List */}
            <View className="space-y-2">
                {currentSession.recommendations?.map(rec => (
                    <View key={rec.id} className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex-row justify-between items-center">
                        <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                                <View className={clsx("px-1.5 py-0.5 rounded text-[10px] uppercase font-bold",
                                    rec.category === 'relief' ? 'bg-blue-100 text-blue-700' :
                                        rec.category === 'movement' ? 'bg-emerald-100 text-emerald-700' :
                                            rec.category === 'lifestyle' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-700'
                                )}>
                                    <Text className="text-[10px] font-bold">{rec.category}</Text>
                                </View>
                                <Text className="font-medium text-zinc-900 dark:text-zinc-100">{rec.title}</Text>
                            </View>
                            <Text className="text-xs text-zinc-500">{rec.frequency} • {rec.description}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(rec.id)} className="p-2">
                            <Trash2 size={16} className="text-zinc-400" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
}
