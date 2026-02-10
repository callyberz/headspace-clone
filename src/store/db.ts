import Database from "better-sqlite3";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

function getDataDir(): string {
  const platform = process.platform;
  const home = process.env.HOME ?? process.env.USERPROFILE ?? "";

  if (platform === "darwin") {
    return join(home, "Library", "Application Support", "hs-meditate");
  }
  if (platform === "win32") {
    return join(process.env.APPDATA ?? join(home, "AppData", "Roaming"), "hs-meditate");
  }
  // Linux / others: XDG_DATA_HOME or ~/.local/share
  const xdgData = process.env.XDG_DATA_HOME ?? join(home, ".local", "share");
  return join(xdgData, "hs-meditate");
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dataDir = getDataDir();
  mkdirSync(dataDir, { recursive: true });

  const dbPath = join(dataDir, "history.db");
  db = new Database(dbPath);

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      duration_seconds INTEGER NOT NULL,
      planned_duration INTEGER NOT NULL,
      meditation_type TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0
    );
  `);

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
