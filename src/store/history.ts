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

export interface TimePeriodStats {
  count: number;
  totalSeconds: number;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getSessionsInRange(startISO: string, endISO: string): TimePeriodStats {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(*) as count, COALESCE(SUM(duration_seconds), 0) as totalSeconds
       FROM sessions WHERE started_at >= ? AND started_at < ?`
    )
    .get(startISO, endISO) as TimePeriodStats;
  return row;
}

export function getSessionsToday(): TimePeriodStats {
  const now = new Date();
  const start = startOfDay(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return getSessionsInRange(start.toISOString(), end.toISOString());
}

export function getSessionsYesterday(): TimePeriodStats {
  const now = new Date();
  const end = startOfDay(now);
  const start = new Date(end);
  start.setDate(start.getDate() - 1);
  return getSessionsInRange(start.toISOString(), end.toISOString());
}

export function getSessionsThisWeek(): TimePeriodStats {
  const now = new Date();
  const today = startOfDay(now);
  const dayOfWeek = today.getDay();
  const start = new Date(today);
  start.setDate(start.getDate() - dayOfWeek);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return getSessionsInRange(start.toISOString(), end.toISOString());
}

function getDistinctSessionDays(): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT DISTINCT date(started_at, 'localtime') as day
       FROM sessions ORDER BY day DESC`
    )
    .all() as { day: string }[];
  return rows.map((r) => r.day);
}

export function getCurrentStreak(): number {
  const days = getDistinctSessionDays();
  if (days.length === 0) return 0;

  const today = startOfDay(new Date());
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Streak must include today or yesterday to be "current"
  if (days[0] !== todayStr && days[0] !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + "T00:00:00");
    const curr = new Date(days[i] + "T00:00:00");
    const diffMs = prev.getTime() - curr.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getLongestStreak(): number {
  const days = getDistinctSessionDays();
  if (days.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + "T00:00:00");
    const curr = new Date(days[i] + "T00:00:00");
    const diffMs = prev.getTime() - curr.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      current++;
    } else {
      current = 1;
    }
    if (current > longest) longest = current;
  }
  return longest;
}
