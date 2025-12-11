import React from 'react';
import { Modal as RNModal, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from './Button';
import { X } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    variant?: 'default' | 'danger';
    hideFooter?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    variant = 'default',
    hideFooter = false
}: ModalProps) {
    return (
        <RNModal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-black/50 justify-center items-center p-4"
            >
                <View className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800">
                    {/* Header */}
                    <View className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex-row justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                        <View className="flex-1 mr-4">
                            <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {title}
                            </Text>
                            {description && (
                                <Text className="text-sm text-zinc-500 mt-1">
                                    {description}
                                </Text>
                            )}
                        </View>
                        <Button
                            variant="ghost"
                            size="icon"
                            onPress={onClose}
                            className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800"
                        >
                            <X size={16} className="text-zinc-500" />
                        </Button>
                    </View>

                    {/* Body */}
                    <View className="p-4">
                        {children}
                    </View>

                    {/* Footer */}
                    {!hideFooter && (
                        <View className="p-4 bg-zinc-50 dark:bg-zinc-900/50 flex-row gap-3 border-t border-zinc-100 dark:border-zinc-800">
                            {(onCancel || cancelLabel) && (
                                <Button
                                    variant="outline"
                                    className="flex-1 bg-white dark:bg-zinc-800"
                                    onPress={onCancel || onClose}
                                >
                                    {cancelLabel || "Cancel"}
                                </Button>
                            )}
                            {(onConfirm || confirmLabel) && (
                                <Button
                                    variant={variant === 'danger' ? 'danger' : 'primary'}
                                    className="flex-1"
                                    onPress={onConfirm}
                                >
                                    {confirmLabel || "Confirm"}
                                </Button>
                            )}
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </RNModal>
    );
}
