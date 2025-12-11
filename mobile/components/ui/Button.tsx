import React from 'react';
import { Text, Pressable, PressableProps, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends PressableProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    className?: string;
    textClassName?: string;
    children: React.ReactNode;
    isLoading?: boolean;
}

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    textClassName,
    children,
    isLoading,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "flex-row items-center justify-center rounded-xl transition-all active:opacity-80";

    const variants = {
        primary: "bg-emerald-600",
        secondary: "bg-zinc-100 dark:bg-zinc-800",
        outline: "border border-zinc-200 dark:border-zinc-700 bg-transparent",
        ghost: "bg-transparent",
        danger: "bg-red-500",
    };

    const sizes = {
        sm: "h-8 px-3",
        md: "h-12 px-4",
        lg: "h-14 px-6",
        icon: "h-10 w-10 p-0",
    };

    const textBaseStyles = "font-medium text-center";
    const textVariants = {
        primary: "text-white",
        secondary: "text-zinc-900 dark:text-zinc-100",
        outline: "text-zinc-900 dark:text-zinc-100",
        ghost: "text-zinc-900 dark:text-zinc-100",
        danger: "text-white",
    };

    return (
        <Pressable
            className={twMerge(
                baseStyles,
                variants[variant],
                sizes[size],
                disabled && "opacity-50",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#10b981' : 'white'} />
            ) : (
                typeof children === 'string' ? (
                    <Text className={twMerge(textBaseStyles, textVariants[variant], textClassName)}>
                        {children}
                    </Text>
                ) : children
            )}
        </Pressable>
    );
}
