import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { LOCATION_TRACKING_CONFIG } from '../constants/tracking';

/**
 * Custom hook for requesting location permissions and subscribing to
 * high-accuracy location updates.
 *
 * @param {boolean} enabled - Whether location tracking should be active.
 * @param {(location: Location.LocationObject) => void} onLocation - Callback
 *   invoked on every new location fix.
 * @returns {{ permissionStatus: string|null, error: string|null }}
 */
export function useLocation(enabled, onLocation) {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [error, setError] = useState(null);
  const subscriptionRef = useRef(null);

  // Request permission once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!cancelled) setPermissionStatus(status);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Start / stop the subscriber when `enabled` or permission changes
  useEffect(() => {
    if (!enabled || permissionStatus !== 'granted') {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: LOCATION_TRACKING_CONFIG.TIME_INTERVAL,
            distanceInterval: LOCATION_TRACKING_CONFIG.DISTANCE_INTERVAL,
          },
          (loc) => {
            if (!cancelled) onLocation(loc);
          }
        );

        if (cancelled) {
          sub.remove();
        } else {
          subscriptionRef.current = sub;
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();

    return () => {
      cancelled = true;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [enabled, permissionStatus, onLocation]);

  return { permissionStatus, error };
}
