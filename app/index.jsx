import React, { useCallback, useRef, useState } from 'react';
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
import { AppleMaps, GoogleMaps } from 'expo-maps';

const DEFAULT_COORDINATES = {
  latitude: 42.6977,
  longitude: 23.3219,
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isTracking, coords, distance, elapsedSeconds } = useTracking();
  const { startTracking, stopTracking, discardTracking, handleNewLocation } = useTrackingActions();
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [initialCenter, setInitialCenter] = useState(null);
  const hasInitialCenterRef = useRef(false);

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

  if (permissionStatus === 'denied') return <PermissionDenied />;

  const cameraPosition =
    isTracking && coords.length > 0
      ? {
          coordinates: {
            latitude: coords[coords.length - 1].latitude,
            longitude: coords[coords.length - 1].longitude,
          },
          zoom: 16,
        }
      : initialCenter
      ? {
          coordinates: initialCenter,
          zoom: 15,
        }
      : {
          coordinates: DEFAULT_COORDINATES,
          zoom: 12,
        };

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
            id: 'active-route',
            coordinates: validPolylineCoordinates,
            color: theme.routeColor,
            width: 5,
          },
        ]
      : [];
  
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  const ActiveMapView = isIOS ? AppleMaps.View : GoogleMaps.View;

  const mapUiSettings = isIOS
    ? {
        myLocationButtonEnabled: true,
      }
    : {
        myLocationButtonEnabled: true,
        mapToolbarEnabled: false,
      };

  const avgSpeed = elapsedSeconds > 0 ? distance / elapsedSeconds : 0;

  const handleSave = async (title) => {
    setSaveModalVisible(false);
    await stopTracking(title);
  };

  // Dynamic top offset so stats bar clears the status bar on Android
  const statsTop =
    (isAndroid ? StatusBar.currentHeight ?? 24 : 0) + 16;

  return (
    <View className="flex-1 bg-parchment">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <ActiveMapView
        style={{ flex: 1 }}
        cameraPosition={cameraPosition}
        polylines={polylines}
        properties={{
          isMyLocationEnabled: permissionStatus === 'granted',
        }}
        uiSettings={mapUiSettings}
      />

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


