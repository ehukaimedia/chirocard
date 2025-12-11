import React from 'react';
import { View, ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function Card({ className, children, ...props }: ViewProps) {
    return (
        <View
            className={twMerge(
                "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </View>
    );
}
