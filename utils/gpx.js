import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

/**
 * Builds a GPX XML string from a session.
 * Coords are stored on session.coords (already a parsed array).
 *
 * @param {{ title?: string, started_at: number, coords: object[] }} session
 * @returns {string} GPX XML
 */
export function buildGpx(session) {
  const name = session.title || `PathFinder Route ${new Date(session.started_at).toLocaleDateString()}`;
  const waypoints = (session.coords ?? []).filter((wp) => {
    const lat = Number(wp?.latitude);
    const lon = Number(wp?.longitude);
    return Number.isFinite(lat) && Number.isFinite(lon);
  });

  const trkpts = waypoints
    .map((wp) => {
      const lat = Number(wp.latitude);
      const lon = Number(wp.longitude);
      const ele = wp.altitude != null ? `\n        <ele>${wp.altitude.toFixed(1)}</ele>` : '';
      const time = `\n        <time>${new Date(wp.timestamp).toISOString()}</time>`;
      return `      <trkpt lat="${lat.toFixed(7)}" lon="${lon.toFixed(7)}">${ele}${time}\n      </trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="PathFinder"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(name)}</name>
    <time>${new Date(session.started_at).toISOString()}</time>
  </metadata>
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Writes GPX to a temp file and opens the share sheet.
 * Coords are already embedded in session.coords.
 *
 * @param {{ title?: string, started_at: number, id: number, coords: object[] }} session
 */
export async function shareGpx(session) {
  if (!session || !Array.isArray(session.coords) || session.coords.length === 0) {
    throw new Error('No route points available to export.');
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }

  const gpxContent = buildGpx(session);
  const filename = `pathfinder_route_${session.id}.gpx`;
  const fileUri = FileSystem.cacheDirectory + filename;

  await FileSystem.writeAsStringAsync(fileUri, gpxContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/gpx+xml',
    dialogTitle: 'Export Route as GPX',
    UTI: 'com.topografix.gpx',
  });
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
