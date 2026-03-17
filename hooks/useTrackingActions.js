import { useCallback, useEffect, useRef } from 'react';
import { useTracking } from '../context/TrackingContext';
import { insertSession, finaliseSession, fetchSession, deleteSession } from '../db/database';
import { haversineDistance } from '../utils/haversine';
import { shareGpx } from '../utils/gpx';
import { TIMER_TICK_INTERVAL } from '../constants/tracking';

/**
 * Provides action handlers that wire together the TrackingContext,
 * the SQLite database and the timer tick.
 */
export function useTrackingActions() {
  const tracking = useTracking();
  const tickRef = useRef(null);

  // Clean up the ticker when the component unmounts
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const _startTick = useCallback(() => {
    if (tickRef.current) return; // already running
    tickRef.current = setInterval(() => tracking.tick(), TIMER_TICK_INTERVAL);
  }, [tracking]);

  const _stopTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTracking = useCallback(async () => {
    try {
      const sessionId = await insertSession(Date.now());
      tracking.startTracking(sessionId);
      _startTick();
    } catch (err) {
      console.error('Failed to start tracking session:', err);
      // Stop any partial tick that may have started
      _stopTick();
    }
  }, [tracking, _startTick, _stopTick]);

  /**
   * Abort the current session — stops the clock, deletes the in-progress DB row,
   * and resets all tracking state. Nothing is kept.
   */
  const discardTracking = useCallback(async () => {
    _stopTick();
    const { sessionId } = tracking;
    tracking.stopTracking();
    const normalizedSessionId = Number(sessionId);
    if (Number.isFinite(normalizedSessionId) && normalizedSessionId > 0) {
      try {
        await deleteSession(normalizedSessionId);
      } catch (err) {
        console.error('Failed to delete discarded session:', err);
      }
    }
    tracking.reset();
  }, [tracking, _stopTick]);

  /**
   * Finalise and persist the current session.
   * @param {string} [title] - Optional user-supplied route name.
   * @returns {number|null} The saved session id.
   */
  const stopTracking = useCallback(
    async (title = '') => {
      _stopTick();
      const { sessionId, coords, distance, elapsedSeconds } = tracking;
      tracking.stopTracking();

      const normalizedSessionId = Number(sessionId);

      if (!Number.isFinite(normalizedSessionId) || normalizedSessionId <= 0) {
        tracking.reset();
        return null;
      }

      try {
        await finaliseSession(normalizedSessionId, Date.now(), title, distance, elapsedSeconds, coords);
        tracking.reset();
        return normalizedSessionId;
      } catch (err) {
        console.error('Failed to finalise tracking session:', err);
        tracking.reset();
        return null;
      }
    },
    [tracking, _stopTick]
  );

  /**
   * Fetch a saved session from the DB and open the system share sheet as GPX.
   * @param {number} sessionId
   */
  const shareRoute = useCallback(async (sessionId) => {
    try {
      const session = await fetchSession(sessionId);
      if (!session) throw new Error('Session not found');
      await shareGpx(session);
    } catch (err) {
      console.error('Failed to share route:', err);
      throw err;
    }
  }, []);

  /**
   * Should be called from useLocation's onLocation callback while tracking.
   * @param {import('expo-location').LocationObject} location
   */
  const handleNewLocation = useCallback(
    (location) => {
      if (!tracking.isTracking) return;

      if (!location?.coords) return;
      const { latitude, longitude, altitude } = location.coords;
      const timestamp = location.timestamp;

      if (latitude == null || longitude == null) return;

      let delta = 0;
      const prev = tracking.coords[tracking.coords.length - 1];
      if (prev) {
        delta = haversineDistance(
          prev.latitude,
          prev.longitude,
          latitude,
          longitude
        );
      }

      tracking.addCoord({ latitude, longitude, altitude, timestamp }, delta);
    },
    [tracking]
  );

  return {
    startTracking,
    stopTracking,
    discardTracking,
    shareRoute,
    handleNewLocation,
  };
}
