import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Full-screen message shown when the user has denied location permission.
 * Offers a shortcut to the device's app settings so they can re-enable it.
 */
export default function PermissionDenied() {
  const router = useRouter();
  const openSettings = () => Linking.openSettings();

  return (
    <View className="flex-1 items-center justify-center bg-parchment px-9">
      <Text className="text-[52px] mb-4">📍</Text>
      <Text className="text-xl font-bold text-ink text-center mb-2.5">
        Location Access Required
      </Text>
      <Text className="text-sm text-ink-muted text-center leading-[21px] mb-8">
        PathFinder needs access to your location to record and display your
        routes. Please grant permission in your device settings.
      </Text>
      <Pressable
        onPress={openSettings}
        className="bg-forest active:bg-forest-dark px-9 py-3.5 rounded-full"
      >
        <Text className="text-white font-bold text-base">Open Settings</Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace('/')}
        className="mt-3 bg-white border border-forest active:bg-parchment-dark px-9 py-3.5 rounded-full"
      >
        <Text className="text-forest font-bold text-base">Go to Main Menu</Text>
      </Pressable>
    </View>
  );
}
