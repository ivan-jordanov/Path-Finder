import * as SQLite from 'expo-sqlite';

const DB_NAME = 'pathfinder.db';

// Module-level reference — populated once by initDatabase(), then used directly
// by every function below without any further async guard.
let db = null;

// Helper to get the DB instance, throwing if it's not ready
function getDb() {
  if (!db) throw new Error("Database not initialised. Call initDatabase() first.");
  return db;
}

/**
 * Must be called ONCE at app startup (in the root layout).
 * Every other exported function assumes `db` is already set.
 */
export async function initDatabase() {
  if (db) return;
  db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS sessions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    DEFAULT '',
      started_at INTEGER NOT NULL,
      ended_at   INTEGER,
      distance   REAL    DEFAULT 0,
      duration   INTEGER DEFAULT 0,
      coords     TEXT    DEFAULT '[]'
    );
  `);
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

/** Insert a new in-progress session row and return its id. */
export async function insertSession(startedAt) {
  const result = await getDb().runAsync(
    'INSERT INTO sessions (started_at) VALUES (?)',
    startedAt
  );
  return result.lastInsertRowId;
}

/**
 * Finalise a session: persist title, stats, and the full coords array.
 *
 * @param {number}   id
 * @param {number}   endedAt   - Unix ms
 * @param {string}   title
 * @param {number}   distance  - metres
 * @param {number}   duration  - seconds
 * @param {object[]} coords    - raw array from TrackingContext
 */
export async function finaliseSession(id, endedAt, title, distance, duration, coords) {
  await getDb().runAsync(
    'UPDATE sessions SET ended_at=?, title=?, distance=?, duration=?, coords=? WHERE id=?',
    endedAt,
    title || '',
    distance,
    duration,
    JSON.stringify(coords ?? []),
    id
  );
}

/**
 * Fetch all completed sessions for the History list.
 * Coords are intentionally excluded here — only fetched on the detail screen.
 */
export async function fetchSessions() {
  return getDb().getAllAsync(
    'SELECT id, title, started_at, ended_at, distance, duration FROM sessions WHERE ended_at IS NOT NULL ORDER BY started_at DESC'
  );
}

/**
 * Fetch one session including its parsed coords array.
 * @param {number} id
 * @returns {object|null}
 */
export async function fetchSession(id) {
  const row = await getDb().getFirstAsync('SELECT * FROM sessions WHERE id=?', id);
  if (!row) return null;
  return { ...row, coords: JSON.parse(row.coords ?? '[]') };
}

/** Delete a session permanently. */
export async function deleteSession(id) {
  await getDb().runAsync('DELETE FROM sessions WHERE id=?', id);
}
