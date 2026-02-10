import { getDb } from "./db.js";

export interface Session {
  id: number;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number;
  planned_duration: number;
  meditation_type: string;
  completed: number;
}

export interface InsertSessionParams {
  started_at: string;
  completed_at?: string | null;
  duration_seconds: number;
  planned_duration: number;
  meditation_type: string;
  completed: boolean;
}

export function insertSession(params: InsertSessionParams): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO sessions (started_at, completed_at, duration_seconds, planned_duration, meditation_type, completed)
    VALUES (@started_at, @completed_at, @duration_seconds, @planned_duration, @meditation_type, @completed)
  `);
  const result = stmt.run({
    started_at: params.started_at,
    completed_at: params.completed_at ?? null,
    duration_seconds: params.duration_seconds,
    planned_duration: params.planned_duration,
    meditation_type: params.meditation_type,
    completed: params.completed ? 1 : 0,
  });
  return Number(result.lastInsertRowid);
}

export function getRecentSessions(limit = 10): Session[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?")
    .all(limit) as Session[];
}

export function getTotalSessions(): number {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as count FROM sessions").get() as { count: number };
  return row.count;
}

export function getTotalTime(): number {
  const db = getDb();
  const row = db
    .prepare("SELECT COALESCE(SUM(duration_seconds), 0) as total FROM sessions")
    .get() as { total: number };
  return row.total;
}
