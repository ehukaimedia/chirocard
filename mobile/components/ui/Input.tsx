import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export function Input({ label, error, className, containerClassName, ...props }: InputProps) {
    return (
        <View className={twMerge("space-y-2", containerClassName)}>
            {label && (
                <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {label}
                </Text>
            )}
            <TextInput
                className={twMerge(
                    "h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 text-zinc-900 dark:text-zinc-100",
                    error && "border-red-500",
                    className
                )}
                placeholderTextColor="#a1a1aa"
                {...props}
            />
            {error && <Text className="text-xs text-red-500">{error}</Text>}
        </View>
    );
}
