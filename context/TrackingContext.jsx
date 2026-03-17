import React, { createContext, useContext, useReducer, useCallback } from 'react';

const TrackingContext = createContext(null);

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------
const initialState = {
  isTracking: false,  // a session is open (started but not yet saved)
  sessionId: null,
  startedAt: null,
  coords: [],          // { latitude, longitude, altitude, timestamp }[]
  distance: 0,         // total metres
  elapsedSeconds: 0,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function trackingReducer(state, action) {
  switch (action.type) {
    case 'START':
      return {
        ...initialState,
        isTracking: true,
        sessionId: action.sessionId,
        startedAt: action.startedAt,
      };

    case 'ADD_COORD':
      return {
        ...state,
        coords: [...state.coords, action.coord],
        distance: state.distance + (action.delta ?? 0),
      };

    case 'TICK':
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };

    case 'STOP':
      return { ...state, isTracking: false };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function TrackingProvider({ children }) {
  const [state, dispatch] = useReducer(trackingReducer, initialState);

  const startTracking = useCallback((sessionId) => {
    dispatch({ type: 'START', sessionId, startedAt: Date.now() });
  }, []);

  const addCoord = useCallback((coord, delta) => {
    dispatch({ type: 'ADD_COORD', coord, delta });
  }, []);

  const tick = useCallback(() => {
    dispatch({ type: 'TICK' });
  }, []);

  const stopTracking = useCallback(() => {
    dispatch({ type: 'STOP' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <TrackingContext.Provider
      value={{
        ...state,
        startTracking,
        addCoord,
        tick,
        stopTracking,
        reset,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) {
    throw new Error('useTracking must be used within a <TrackingProvider>');
  }
  return ctx;
}
