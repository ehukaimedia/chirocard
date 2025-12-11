import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('info');

    // Simple fade animation could be added here

    const toast = useCallback((msg: string, t: ToastType = 'info') => {
        setMessage(msg);
        setType(t);
        setVisible(true);
        setTimeout(() => setVisible(false), 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {visible && (
                <View className="absolute top-12 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
                    <View className={`p-4 rounded-2xl shadow-lg border border-white/10 flex-row items-center justify-center ${type === 'success' ? 'bg-emerald-600' :
                            type === 'error' ? 'bg-red-500' : 'bg-zinc-800'
                        }`}>
                        <Text className="text-white font-medium text-center">{message}</Text>
                    </View>
                </View>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}
