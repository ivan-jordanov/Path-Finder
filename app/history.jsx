import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchSessions, deleteSession } from '../db/database';
import { formatDistance, formatDuration, formatDate } from '../utils/formatters';
import theme from '../constants/theme';

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  const handleDelete = (id) => {
    Alert.alert('Delete Route', 'This route will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSession(id);
          loadSessions();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-parchment">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-parchment px-8">
        <Text className="text-5xl mb-3">🗺️</Text>
        <Text className="text-lg font-bold text-ink text-center mb-1.5">
          No routes recorded yet
        </Text>
        <Text className="text-sm text-ink-muted text-center">
          Start tracking a path on the map screen.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.bg }}
      className="bg-parchment"
      contentContainerClassName="p-4 gap-3"
      data={sessions}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/${item.id}`)}
          onLongPress={() => handleDelete(item.id)}
          className="bg-white rounded-2xl p-4 border border-sand active:opacity-75"
          style={({ pressed }) => pressed && { opacity: 0.75 }}
        >
          {/* Title */}
          <Text className="text-base font-bold text-ink mb-0.5" numberOfLines={1}>
            {item.title && item.title.length > 0 ? item.title : 'Unnamed Route'}
          </Text>
          <Text className="text-xs text-ink-muted mb-3">
            {formatDate(item.started_at)}
          </Text>

          <View className="flex-row items-center">
            {/* Distance */}
            <View className="flex-1">
              <Text className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide mb-0.5">
                Distance
              </Text>
              <Text className="text-[15px] font-semibold text-ink">
                {formatDistance(item.distance)}
              </Text>
            </View>

            {/* Divider */}
            <View className="w-px h-7 bg-sand-light mx-3" />

            {/* Duration */}
            <View className="flex-1">
              <Text className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide mb-0.5">
                Duration
              </Text>
              <Text className="text-[15px] font-semibold text-ink">
                {formatDuration(item.duration)}
              </Text>
            </View>

            {/* Arrow */}
            <Text className="text-[22px] text-forest-light pl-2">›</Text>
          </View>
        </Pressable>
      )}
    />
  );
}
