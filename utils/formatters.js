/**
 * Formats a distance in meters to a human-readable string.
 * Shows metres below 1 km, kilometres above.
 *
 * @param {number} meters
 * @returns {string}
 */
export function formatDistance(meters) {
  if (meters == null || isNaN(meters)) return '0 m';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Formats a duration in seconds to HH:MM:SS.
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (seconds == null || isNaN(seconds)) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/**
 * Formats an average speed in m/s to km/h string.
 *
 * @param {number} metersPerSecond
 * @returns {string}
 */
export function formatSpeed(metersPerSecond) {
  if (metersPerSecond == null || isNaN(metersPerSecond)) return '0.0 km/h';
  return `${(metersPerSecond * 3.6).toFixed(1)} km/h`;
}

/**
 * Formats a Unix timestamp (ms) to a locale date-time string.
 *
 * @param {number} timestamp - milliseconds since epoch
 * @returns {string}
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString();
}
