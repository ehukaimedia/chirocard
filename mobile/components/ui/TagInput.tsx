import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import clsx from 'clsx';

interface TagInputProps {
    label?: string;
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    suggestions?: string[];
}

export function TagInput({ label, value = [], onChange, placeholder, suggestions }: TagInputProps) {
    const [text, setText] = useState("");

    const handleSubmit = () => {
        if (!text.trim()) return;

        // Split by comma if user typed multiple
        const newTags = text.split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0 && !value.includes(t));

        if (newTags.length > 0) {
            onChange([...value, ...newTags]);
        }
        setText("");
    };

    const removeTag = (indexToRemove: number) => {
        onChange(value.filter((_, index) => index !== indexToRemove));
    };

    return (
        <View className="mb-4">
            {label && <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">{label}</Text>}

            <View className="flex-row items-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 px-3 py-2">
                <TextInput
                    className="flex-1 text-base text-zinc-900 dark:text-zinc-100 min-h-[40px]" // Min height for tap target
                    value={text}
                    onChangeText={setText}
                    onSubmitEditing={handleSubmit}
                    blurOnSubmit={false} // Keep keyboard up to add more
                    placeholder={placeholder || "Type and press return..."}
                    placeholderTextColor="#a1a1aa"
                    returnKeyType="done"
                />
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!text.trim()}
                    className={clsx("ml-2 p-1", !text.trim() && "opacity-50")}
                >
                    <Text className="text-emerald-500 font-bold">Add</Text>
                </TouchableOpacity>
            </View>

            {/* Chips Container */}
            <View className="flex-row flex-wrap gap-2 mt-2">
                {value.map((tag, index) => (
                    <TouchableOpacity
                        key={`${tag}-${index}`}
                        onPress={() => removeTag(index)}
                        className="flex-row items-center bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700"
                    >
                        <Text className="text-sm text-zinc-700 dark:text-zinc-300 mr-1">{tag}</Text>
                        <X size={14} className="text-zinc-500" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Suggestions (Simple implementation) */}
            {suggestions && text.length > 0 && (
                <ScrollView horizontal className="mt-2" showsHorizontalScrollIndicator={false}>
                    {suggestions
                        .filter(s => s.toLowerCase().includes(text.toLowerCase()) && !value.includes(s))
                        .map(s => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => {
                                    onChange([...value, s]);
                                    setText("");
                                }}
                                className="mr-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800"
                            >
                                <Text className="text-emerald-700 dark:text-emerald-400 text-xs">+ {s}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            )}
        </View>
    );
}
