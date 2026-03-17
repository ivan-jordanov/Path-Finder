export const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;

/**
 * MapTiler outdoor-v2 raster tile URL template.
 * react-native-maps UrlTile replaces {x}, {y}, {z} automatically.
 */
export const MAPTILER_TILE_URL = `https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY ?? ''}`;

/** Attribution text required by MapTiler ToS */
export const MAPTILER_ATTRIBUTION = '© MapTiler © OpenStreetMap contributors';

if (__DEV__ && !MAPTILER_API_KEY) {
	console.warn('EXPO_PUBLIC_MAPTILER_KEY is missing. Map tiles may fail to load.');
}
