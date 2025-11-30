/**
 * SQLite database connection using sqlite3 CLI (no native modules needed)
 */

import { execSync } from "child_process";
import { getCursorDatabasePath, databaseExists } from "./paths";

/**
 * Execute a SQL query using sqlite3 CLI and return JSON results
 */
export function query<T>(sql: string): T[] {
  if (!databaseExists()) {
    throw new Error(
      `Cursor database not found at: ${getCursorDatabasePath()}\n` +
        "Make sure Cursor is installed and has been used at least once."
    );
  }

  const dbPath = getCursorDatabasePath();

  try {
    // Use sqlite3 CLI with JSON output mode
    const result = execSync(
      `sqlite3 -json "${dbPath}" "${sql.replace(/"/g, '\\"')}"`,
      {
        encoding: "utf-8",
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large results
      }
    );

    if (!result || result.trim() === "") {
      return [];
    }

    return JSON.parse(result) as T[];
  } catch (error) {
    console.error("SQLite query error:", error);
    return [];
  }
}

/**
 * Get database connection - no-op for CLI approach
 */
export function getDatabase(): null {
  return null;
}

/**
 * Close database - no-op for CLI approach
 */
export function closeDatabase(): void {
  // No-op - CLI doesn't need connection management
}
