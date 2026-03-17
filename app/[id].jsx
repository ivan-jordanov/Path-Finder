import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { fetchSession } from '../db/database';
import StatsBar from '../components/StatsBar';
import { formatDate } from '../utils/formatters';
import { shareGpx } from '../utils/gpx';
import theme from '../constants/theme';
import { AppleMaps, GoogleMaps } from 'expo-maps';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const isIOS = Platform.OS === 'ios';
  const ActiveMapView = isIOS ? AppleMaps.View : GoogleMaps.View;

  useEffect(() => {
    (async () => {
      try {
        // coords are embedded in the session row as a parsed array
        const s = await fetchSession(Number(id));
        setSession(s);
        if (s) {
          navigation.setOptions({
            title: s.title && s.title.length > 0 ? s.title : 'Route Detail',
          });
        }
      } catch (err) {
        console.error('Failed to load route detail:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-parchment">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-parchment px-8">
        <Text className="text-base text-ink-light text-center">Route not found.</Text>
      </View>
    );
  }

  const coords = session.coords ?? [];

  const cameraPosition =
    coords.length > 0
      ? (() => {
          const lats = coords.map((w) => w.latitude);
          const lons = coords.map((w) => w.longitude);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);
          const latSpan = Math.max(maxLat - minLat, 0.0001);
          const lonSpan = Math.max(maxLon - minLon, 0.0001);
          const maxSpan = Math.max(latSpan, lonSpan);

          let zoom = 16;
          if (maxSpan > 1) zoom = 9;
          else if (maxSpan > 0.5) zoom = 10;
          else if (maxSpan > 0.2) zoom = 11;
          else if (maxSpan > 0.1) zoom = 12;
          else if (maxSpan > 0.05) zoom = 13;
          else if (maxSpan > 0.02) zoom = 14;
          else if (maxSpan > 0.01) zoom = 15;

          return {
            coordinates: {
              latitude: (minLat + maxLat) / 2,
              longitude: (minLon + maxLon) / 2,
            },
            zoom,
          };
        })()
      : undefined;

  const validPolylineCoordinates = coords
    .map((point) => ({
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
    }))
    .filter(
      (point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    );

  const polylines =
    validPolylineCoordinates.length > 1
      ? [
          {
            id: `route-${session.id}`,
            coordinates: validPolylineCoordinates,
            color: theme.routeColor,
            width: 5,
          },
        ]
      : [];

  const detailMapUiSettings = isIOS
    ? {}
    : {
        scrollGesturesEnabled: false,
        zoomGesturesEnabled: false,
        rotationGesturesEnabled: false,
        tiltGesturesEnabled: false,
        mapToolbarEnabled: false,
      };

  const avgSpeed = session.duration > 0 ? session.distance / session.duration : 0;

  const handleShare = async () => {
    setSharing(true);
    try {
      // session.coords is already the parsed array — gpx.js reads it directly
      await shareGpx(session);
    } catch (err) {
      Alert.alert('Share Failed', err.message || 'Could not share this route.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-parchment" bounces={false}>
      {/* ── Map ── */}
      <View className="relative">
        <ActiveMapView
          style={{ width: '100%', height: 288 }}
          cameraPosition={cameraPosition}
          polylines={polylines}
          uiSettings={detailMapUiSettings}
        />
      </View>

      {/* ── Header ── */}
      <View className="px-4 pt-4 pb-1">
        <Text className="text-xl font-bold text-ink mb-1" numberOfLines={2}>
          {session.title && session.title.length > 0 ? session.title : 'Unnamed Route'}
        </Text>
        <Text className="text-[13px] text-ink-muted">{formatDate(session.started_at)}</Text>
      </View>

      {/* ── Stats ── */}
      <StatsBar
        distance={session.distance}
        duration={session.duration}
        speed={avgSpeed}
      />

      {/* ── GPS point count ── */}
      <Text className="text-xs text-ink-muted text-center mt-1 mb-5">
        {coords.length} GPS points recorded
      </Text>

      {/* ── Export GPX ── */}
      <Pressable
        onPress={handleShare}
        disabled={sharing || coords.length === 0}
        className={`mx-4 py-3.5 rounded-2xl items-center mb-10 ${
          coords.length === 0 ? 'bg-sand' : 'bg-forest active:opacity-80'
        }`}
      >
        <Text className="text-white font-bold text-[15px]">
          {sharing ? 'Preparing\u2026' : '\u2b06  Export GPX'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
