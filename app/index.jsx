import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTracking } from '../context/TrackingContext';
import { useLocation } from '../hooks/useLocation';
import { useTrackingActions } from '../hooks/useTrackingActions';
import StatsBar from '../components/StatsBar';
import PermissionDenied from '../components/PermissionDenied';
import SaveModal from '../components/SaveModal';
import theme from '../constants/theme';
import { DEFAULT_COORDINATES, MAP_HEIGHT, STATS_BAR_TOP_OFFSET } from '../constants/tracking';
import MapView, { PROVIDER_GOOGLE, Polyline, UrlTile } from 'react-native-maps';
import { MAPTILER_TILE_URL, MAPTILER_ATTRIBUTION } from '../constants/maptiler';



export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const { isTracking, coords, distance, elapsedSeconds } = useTracking();
  const { startTracking, stopTracking, discardTracking, handleNewLocation } = useTrackingActions();
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [initialCenter, setInitialCenter] = useState(null);
  const hasInitialCenterRef = useRef(false);
  const hasCenteredOnInitialLocationRef = useRef(false);

  const onLocation = useCallback(
    (loc) => {
      const current = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      if (!hasInitialCenterRef.current) {
        hasInitialCenterRef.current = true;
        setInitialCenter(current);
      }

      handleNewLocation(loc);
    },
    [handleNewLocation]
  );

  // Keep GPS subscription active so we can show the location dot and center initially.
  const { permissionStatus } = useLocation(true, onLocation);

  useEffect(() => {
    if (!initialCenter || hasCenteredOnInitialLocationRef.current || !mapRef.current) {
      return;
    }

    hasCenteredOnInitialLocationRef.current = true;
    mapRef.current.animateToRegion(
      {
        latitude: initialCenter.latitude,
        longitude: initialCenter.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      400
    );
  }, [initialCenter]);

  if (permissionStatus === 'denied') return <PermissionDenied />;

  const mapRegion =
    isTracking && coords.length > 0
      ? {
          latitude: coords[coords.length - 1].latitude,
          longitude: coords[coords.length - 1].longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }
      : initialCenter
      ? {
          latitude: initialCenter.latitude,
          longitude: initialCenter.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : {
          latitude: DEFAULT_COORDINATES.latitude,
          longitude: DEFAULT_COORDINATES.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

  const validPolylineCoordinates = useMemo(
    () =>
      coords
        .map((point) => ({
          latitude: Number(point.latitude),
          longitude: Number(point.longitude),
        }))
        .filter(
          (point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
        ),
    [coords]
  );

  const polylines = useMemo(() => {
    if (validPolylineCoordinates.length < 2) return [];
    return [
      {
        id: 'active-route',
        coordinates: validPolylineCoordinates,
        color: theme.routeColor,
        width: 5,
      },
    ];
  }, [validPolylineCoordinates]);
  
  const isAndroid = Platform.OS === 'android';

  const avgSpeed = elapsedSeconds > 0 ? distance / elapsedSeconds : 0;

  const handleSave = useCallback(
    (title) => {
      setSaveModalVisible(false);
      stopTracking(title);
    },
    [stopTracking]
  );

  // Dynamic top offset so stats bar clears the status bar on Android
  const statsTop =
    (isAndroid ? StatusBar.currentHeight ?? 24 : 0) + STATS_BAR_TOP_OFFSET;

  return (
    <View className="flex-1 bg-parchment">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={isAndroid ? PROVIDER_GOOGLE : undefined}
        mapType={isAndroid ? 'none' : 'standard'}
        initialRegion={mapRegion}
        showsUserLocation={permissionStatus === 'granted'}
        followsUserLocation={isTracking}
        showsMyLocationButton={permissionStatus === 'granted'}
        toolbarEnabled={false}
      >
        <UrlTile
          urlTemplate={MAPTILER_TILE_URL}
          maximumZ={19}
          zIndex={-1}
          tileSize={256}
          flipY={false}
          shouldReplaceMapContent
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

      <Text className="absolute bottom-36 right-2 text-[9px] text-ink-muted bg-white/70 px-1 py-0.5 rounded">
        {MAPTILER_ATTRIBUTION}
      </Text>

      {/* ── Stats overlay ── */}
      {isTracking && (
        <View className="absolute left-0 right-0" style={{ top: statsTop }}>
          <StatsBar distance={distance} duration={elapsedSeconds} speed={avgSpeed} />
        </View>
      )}

      {/* ── Bottom controls ── */}
      <SafeAreaView
        edges={['bottom']}
        className="absolute bottom-0 left-0 right-0 px-5 pt-3 items-center gap-2.5 bg-parchment/95 border-t border-sand"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        {!isTracking ? (
          <Pressable
            onPress={startTracking}
            className="w-full items-center py-4 rounded-2xl bg-forest active:opacity-80 shadow-md"
          >
            <Text className="text-white font-bold text-base">▶  Start Tracking</Text>
          </Pressable>
        ) : (
          <View className="w-full gap-2.5">
            <Pressable
              onPress={() => setSaveModalVisible(true)}
              className="w-full items-center py-3.5 rounded-xl bg-forest active:opacity-75"
            >
              <Text className="text-white font-bold text-[15px]">■  Stop & Save</Text>
            </Pressable>
            <Pressable
              onPress={discardTracking}
              className="w-full items-center py-3 rounded-xl border border-danger active:bg-danger/10"
            >
              <Text className="text-danger font-semibold text-[15px]">✕  Discard Trip</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={() => router.push('/history')}
          className="px-5 py-2 rounded-full active:bg-parchment-dark"
        >
          <Text className="text-ink-light font-semibold text-sm">📋  View History</Text>
        </Pressable>
      </SafeAreaView>

      {/* Save modal */}
      <SaveModal
        visible={saveModalVisible}
        onSave={handleSave}
        onCancel={() => setSaveModalVisible(false)}
      />
    </View>
  );
}


