import '../global.css';

import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { TrackingProvider } from '../context/TrackingContext';
import { initDatabase } from '../db/database';
import theme from '../constants/theme';

const headerStyle     = { backgroundColor: theme.primary };
const headerTintColor = '#FFFFFF';
const headerTitleStyle = { fontWeight: '700', fontSize: 17 };

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('Database initialisation failed:', err);
        setDbReady(true);
      });
  }, []);

  if (!dbReady) {
    return (
      <View className="flex-1 items-center justify-center bg-parchment">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <TrackingProvider>
      <Stack
        screenOptions={{
          headerStyle,
          headerTintColor,
          headerTitleStyle,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'PathFinder', headerShown: false }}
        />
        <Stack.Screen
          name="history"
          options={{ title: 'History', headerBackTitle: 'Map' }}
        />
        <Stack.Screen
          name="[id]"
          options={{ title: 'Route Detail', headerBackTitle: 'History' }}
        />
      </Stack>
    </TrackingProvider>
  );
}
