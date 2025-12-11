import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { GuardModal } from '@/components/Session/GuardModal';
import { Plus, Clock, ChevronRight, Activity, User, Settings } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const [isGuardOpen, setIsGuardOpen] = useState(false);

  // Store
  const currentSession = useAppStore(state => state.currentSession);
  const startSession = useAppStore(state => state.startSession);

  const handleStartSession = () => {
    startSession(); // Initialize in store
    router.replace('/session'); // Navigate
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-black">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Welcome back,</Text>
            <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dr. User</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} className="bg-zinc-200 dark:bg-zinc-800 p-2 rounded-full">
            <Settings size={20} className="text-zinc-900 dark:text-zinc-100" />
          </TouchableOpacity>
        </View>

        {/* Active Session Banner */}
        {currentSession && (
          <TouchableOpacity
            onPress={() => router.push('/session')}
            className="mb-6 bg-emerald-500 rounded-2xl p-4 shadow-lg shadow-emerald-500/20"
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-white/20 p-2 rounded-full">
                <Activity size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">Session in Progress</Text>
                <Text className="text-emerald-100">
                  {currentSession.practitionerName ? `with ${currentSession.practitionerName}` : 'Tap to continue...'}
                </Text>
              </View>
              <ChevronRight color="white" size={24} />
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions Grid */}
        <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">Quick Actions</Text>
        <View className="flex-row gap-3 mb-8">
          {/* Start Session Card */}
          <Link href="/intake" asChild>
            <TouchableOpacity
              className="flex-1 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[140px] justify-between"
            >
              <View className="bg-indigo-100 dark:bg-indigo-900/30 w-10 h-10 rounded-full items-center justify-center">
                <User size={20} className="text-indigo-600 dark:text-indigo-400" />
              </View>
              <View>
                <Text className="text-zinc-900 dark:text-zinc-100 font-bold text-lg mb-1">New Session</Text>
                <Text className="text-zinc-500 dark:text-zinc-400 text-xs">Log a new practice</Text>
              </View>
            </TouchableOpacity>
          </Link>

          {/* History Card */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/history')}
            className="flex-1 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[140px] justify-between"
          >
            <View className="bg-orange-100 dark:bg-orange-900/30 w-10 h-10 rounded-full items-center justify-center">
              <Clock size={20} className="text-orange-600 dark:text-orange-400" />
            </View>
            <View>
              <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">History</Text>
              <Text className="text-zinc-500 text-xs">View past records</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Activity (Placeholder) */}
        <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">Recent Activity</Text>
        <View className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
          <Text className="text-zinc-400 text-center py-4">No recent sessions found.</Text>
        </View>

      </ScrollView>

      <GuardModal
        isOpen={isGuardOpen}
        onUnlock={() => {
          setIsGuardOpen(false);
          handleStartSession();
        }}
      // Pass practitioner info here if needed
      />
    </SafeAreaView>
  );
}


