import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import MapView, { PROVIDER_GOOGLE, Polyline, UrlTile } from 'react-native-maps';
import { MAPTILER_TILE_URL, MAPTILER_ATTRIBUTION } from '../constants/maptiler';
import { MAP_HEIGHT, MAP_REGION_PADDING, MIN_COORD_DELTA, ZOOM_CONTROL_CONFIG } from '../constants/tracking';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [viewRegion, setViewRegion] = useState(null);
  const isAndroid = Platform.OS === 'android';

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
        Alert.alert('Error', 'Failed to load route details');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation]);

  const coords = session?.coords ?? [];

  const baseRegion = useMemo(
    () =>
      coords.length > 0
        ? (() => {
            const lats = coords.map((w) => w.latitude);
            const lons = coords.map((w) => w.longitude);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);
            return {
              latitude: (minLat + maxLat) / 2,
              longitude: (minLon + maxLon) / 2,
              latitudeDelta: Math.max(maxLat - minLat, MIN_COORD_DELTA) * MAP_REGION_PADDING,
              longitudeDelta: Math.max(maxLon - minLon, MIN_COORD_DELTA) * MAP_REGION_PADDING,
            };
          })()
        : {
            latitude: 42.6977,
            longitude: 23.3219,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
    [coords]
  );

  useEffect(() => {
    setViewRegion(baseRegion);
  }, [baseRegion]);

  const handleZoom = useCallback((zoomIn) => {
    setViewRegion((prev) => {
      const current = prev ?? baseRegion;
      const factor = zoomIn ? ZOOM_CONTROL_CONFIG.ZOOM_IN_FACTOR : ZOOM_CONTROL_CONFIG.ZOOM_OUT_FACTOR;
      const nextLatDelta = Math.min(
        Math.max(current.latitudeDelta * factor, ZOOM_CONTROL_CONFIG.MIN_DELTA),
        ZOOM_CONTROL_CONFIG.MAX_DELTA
      );
      const nextLonDelta = Math.min(
        Math.max(current.longitudeDelta * factor, ZOOM_CONTROL_CONFIG.MIN_DELTA),
        ZOOM_CONTROL_CONFIG.MAX_DELTA
      );

      return {
        ...current,
        latitudeDelta: nextLatDelta,
        longitudeDelta: nextLonDelta,
      };
    });
  }, [baseRegion]);

  const validPolylineCoordinates = useMemo(
    () =>
      coords
        .map((point) => ({
          latitude: Number(point.latitude),
          longitude: Number(point.longitude),
        }))
        .filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude)),
    [coords]
  );

  const polylines = useMemo(
    () =>
      validPolylineCoordinates.length > 1
        ? [
            {
              id: `route-${session?.id}`,
              coordinates: validPolylineCoordinates,
              color: theme.routeColor,
              width: 5,
            },
          ]
        : [],
    [validPolylineCoordinates, session?.id]
  );

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      if (!session || !Array.isArray(session.coords) || session.coords.length === 0) {
        Alert.alert('No Data', 'No route points available to export.');
        setSharing(false);
        return;
      }
      await shareGpx(session);
    } catch (err) {
      Alert.alert('Share Failed', err.message || 'Could not share this route.');
    } finally {
      setSharing(false);
    }
  }, [session]);

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

  const avgSpeed = session.duration > 0 ? session.distance / session.duration : 0;

  return (
    <ScrollView className="flex-1 bg-parchment" bounces={false}>
      {/* ── Map ── */}
      <View className="relative">
        <MapView
          style={{ width: '100%', height: MAP_HEIGHT }}
          provider={isAndroid ? PROVIDER_GOOGLE : undefined}
          mapType={isAndroid ? 'none' : 'standard'}
          region={viewRegion ?? baseRegion}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
        >
          <UrlTile
            urlTemplate={MAPTILER_TILE_URL}
            maximumZ={19}
            zIndex={-1}
            tileSize={256}
            flipY={false}
            shouldReplaceMapContent={!isAndroid}
          />
          {polylines.length > 0 && (
            <Polyline
              coordinates={polylines[0].coordinates}
              strokeColor={theme.routeColor}
              strokeWidth={5}
              zIndex={1000}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </MapView>

        <View className="absolute right-3 top-3 bg-white/90 rounded-xl overflow-hidden border border-sand">
          <Pressable
            onPress={() => handleZoom(true)}
            className="px-3.5 py-2 active:bg-parchment-dark"
          >
            <Text className="text-base font-bold text-ink">+</Text>
          </Pressable>
          <View className="h-px bg-sand" />
          <Pressable
            onPress={() => handleZoom(false)}
            className="px-3.5 py-2 active:bg-parchment-dark"
          >
            <Text className="text-base font-bold text-ink">−</Text>
          </Pressable>
        </View>

        <Text className="absolute bottom-1.5 right-2 text-[9px] text-ink-muted bg-white/70 px-1 py-0.5 rounded">
          {MAPTILER_ATTRIBUTION}
        </Text>
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
