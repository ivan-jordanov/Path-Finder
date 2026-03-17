import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

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
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
    })();
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
            timeInterval: 1000,
            distanceInterval: 2,
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
