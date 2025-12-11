import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import clsx from 'clsx';
import { type BodyStatus } from '../../db/types';

interface BodyRegionSelectorProps {
    value: Record<string, BodyStatus>;
    levels?: Record<string, number>;
    onChange: (part: string, status: BodyStatus) => void;
    onLevelChange?: (part: string, level: number) => void;
    readOnly?: boolean;
    mode?: 'simple' | 'detailed';
}

export const REGIONS = [
    { id: "head", label: "Head" },
    { id: "neck", label: "Neck" },
    { id: "l-shoulder", label: "L Shoulder" },
    { id: "r-shoulder", label: "R Shoulder" },
    { id: "upper-back", label: "Upper Back" },
    { id: "lower-back", label: "Lower Back" },
    { id: "chest", label: "Chest" },
    { id: "abdominals", label: "Abs" },
    { id: "l-arm", label: "L Arm" },
    { id: "r-arm", label: "R Arm" },
    { id: "l-hip", label: "L Hip" },
    { id: "r-hip", label: "R Hip" },
    { id: "l-leg", label: "L Leg" },
    { id: "r-leg", label: "R Leg" },
    { id: "l-foot", label: "L Foot" },
    { id: "r-foot", label: "R Foot" },
];

export function BodyRegionSelector({
    value,
    levels = {},
    onChange,
    onLevelChange,
    readOnly = false,
    mode = 'detailed'
}: BodyRegionSelectorProps) {

    const getBackgroundColor = (level: number) => {
        if (level === 0) return "bg-sky-100 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800";

        // Simple mapping for native wind classes since dynamic RGB is harder with utility classes alone
        // We could use inline styles for precise RGB matching if needed, but classes are cleaner for MVP
        if (level <= 2) return "bg-sky-200 dark:bg-sky-800 border-sky-300";
        if (level <= 4) return "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200";
        if (level <= 6) return "bg-orange-200 dark:bg-orange-800 border-orange-300";
        if (level <= 8) return "bg-red-200 dark:bg-red-800 border-red-300";
        return "bg-red-500 border-red-600";
    };

    const getTextColor = (level: number) => {
        if (level === 0) return "text-sky-700 dark:text-sky-300";
        if (level > 8) return "text-white";
        return "text-zinc-900 dark:text-zinc-100";
    };

    const handleToggle = (partId: string) => {
        if (readOnly) return;

        const current = value[partId] || "normal";
        let next: BodyStatus = "normal";

        if (mode === 'simple') {
            next = current === 'issue' ? 'normal' : 'issue';
        } else {
            if (current === "normal") next = "issue";
            else if (current === "issue") next = "watch";
            else if (current === "watch") next = "addressed";
            else next = "normal";
        }

        onChange(partId, next);

        // Reset level to 0 if deselected
        if (next === 'normal' && onLevelChange) {
            onLevelChange(partId, 0);
        }
    };

    return (
        <View className="flex-row flex-wrap justify-between gap-2">
            {REGIONS.map((region) => {
                const level = levels[region.id] || 0;
                const status = value[region.id] || 'normal';

                // Base style for normal
                let containerClass = "w-[48%] h-14 rounded-xl border-2 items-center justify-center mb-1";
                let textClass = "font-medium text-sm";

                if (status === 'normal') {
                    containerClass = clsx(containerClass, "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800");
                    textClass = clsx(textClass, "text-zinc-600 dark:text-zinc-400");
                } else {
                    // Active Status
                    containerClass = clsx(containerClass, getBackgroundColor(level));
                    textClass = clsx(textClass, getTextColor(level));
                }

                return (
                    <TouchableOpacity
                        key={region.id}
                        onPress={() => handleToggle(region.id)}
                        disabled={readOnly}
                        className={containerClass}
                    >
                        <Text className={textClass}>
                            {region.label}
                            {status !== 'normal' && level > 0 ? ` (${level})` : ''}
                        </Text>
                        {status !== 'normal' && (
                            <Text className={clsx("text-[10px] uppercase font-bold opacity-70", getTextColor(level))}>
                                {status}
                            </Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
