/**
 * Location tracking and GPS parameters
 */

// Default Sofia, Bulgaria coordinates
export const DEFAULT_COORDINATES = {
  latitude: 42.6977,
  longitude: 23.3219,
};

// GPS location tracking settings
export const LOCATION_TRACKING_CONFIG = {
  // High accuracy for active tracking
  TIME_INTERVAL: 1000,          // Update every 1 second
  DISTANCE_INTERVAL: 2,          // Or when moved 2 metres
  ACCURACY_LEVEL: 'BestForNavigation', // expo-location.Accuracy
};

// Map region padding for route fitting
export const MAP_REGION_PADDING = 1.4;
export const MIN_COORD_DELTA = 0.002;

// Zoom control bounds
export const ZOOM_CONTROL_CONFIG = {
  MIN_DELTA: 0.0005,
  MAX_DELTA: 40,
  ZOOM_IN_FACTOR: 0.5,   // Multiply deltas by this to zoom in
  ZOOM_OUT_FACTOR: 2,    // Multiply deltas by this to zoom out
};

// Map view dimensions
export const MAP_HEIGHT = 288;
export const STATS_BAR_TOP_OFFSET = 16;

// Timer interval for elapsed time tracking (milliseconds)
export const TIMER_TICK_INTERVAL = 1000;
