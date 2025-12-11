import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function HistoryScreen() {
    return (
        <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-black">
            <View className="p-4">
                <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">History</Text>
                <Text className="text-zinc-500">Past sessions will appear here.</Text>
            </View>
        </SafeAreaView>
    );
}
