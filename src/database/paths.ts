/**
 * Platform-specific paths for Cursor database
 */

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Get the Cursor database path based on the current platform
 */
export function getCursorDatabasePath(): string {
  const platform = process.platform;
  const homeDir = os.homedir();

  let dbPath: string;

  switch (platform) {
    case 'darwin': // macOS
      dbPath = path.join(
        homeDir,
        'Library',
        'Application Support',
        'Cursor',
        'User',
        'globalStorage',
        'state.vscdb'
      );
      break;

    case 'win32': // Windows
      const appData = process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');
      dbPath = path.join(appData, 'Cursor', 'User', 'globalStorage', 'state.vscdb');
      break;

    case 'linux': // Linux
      dbPath = path.join(homeDir, '.config', 'Cursor', 'User', 'globalStorage', 'state.vscdb');
      break;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return dbPath;
}

/**
 * Check if the Cursor database exists
 */
export function databaseExists(): boolean {
  const dbPath = getCursorDatabasePath();
  return fs.existsSync(dbPath);
}

/**
 * Get the database file size in MB
 */
export function getDatabaseSize(): number {
  const dbPath = getCursorDatabasePath();
  if (!fs.existsSync(dbPath)) {
    return 0;
  }
  const stats = fs.statSync(dbPath);
  return Math.round(stats.size / (1024 * 1024));
}

