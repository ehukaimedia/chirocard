import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { clsx } from 'clsx';

interface BodyRegionDetailsProps {
    bodyPart: string;
    mode: 'client' | 'practitioner';
    data: {
        level: number;
        notes: string;
    };
    onChange: (data: { level: number; notes: string }) => void;
}

export function BodyRegionDetails({ bodyPart, mode, data, onChange }: BodyRegionDetailsProps) {
    const isPractitioner = mode === 'practitioner';

    return (
        <View className="space-y-3">
            {/* Level Selector */}
            <View>
                <Text className="text-xs font-bold uppercase text-zinc-500 mb-2">
                    {isPractitioner ? "Tenderness / Severity" : "Pain Level"} (0-10)
                </Text>
                <View className="flex-row flex-wrap gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const isSelected = data.level === num;
                        let colorClass = "bg-zinc-800 text-zinc-400 border-zinc-700";

                        if (isSelected) {
                            if (num === 0) colorClass = "bg-zinc-700 text-white border-zinc-600";
                            else if (num <= 3) colorClass = "bg-emerald-500 text-white border-emerald-600";
                            else if (num <= 6) colorClass = "bg-amber-500 text-white border-amber-600";
                            else colorClass = "bg-red-500 text-white border-red-600";
                        }

                        return (
                            <TouchableOpacity
                                key={num}
                                onPress={() => onChange({ ...data, level: num })}
                                className={clsx(
                                    "w-8 h-8 items-center justify-center rounded-lg border",
                                    colorClass
                                )}
                            >
                                <Text className={clsx("font-bold text-xs", isSelected ? "text-white" : "text-zinc-400")}>
                                    {num}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Notes Input */}
            <View>
                <Text className="text-xs font-bold uppercase text-zinc-500 mb-2">
                    {isPractitioner ? "Findings / Treatment Notes" : "Describe Sensation"}
                </Text>
                <TextInput
                    value={data.notes}
                    onChangeText={(text) => onChange({ ...data, notes: text })}
                    placeholder={isPractitioner ? "e.g. Muscle spasm, trigger point released..." : "e.g. Sharp pain when moving..."}
                    multiline
                    className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 min-h-[80px] text-zinc-900 dark:text-zinc-100 text-sm"
                    style={{ textAlignVertical: 'top' }}
                />
            </View>
        </View>
    );
}
