import { describe, it, expect, beforeEach, vi } from "vitest";
import Database from "better-sqlite3";

// Mock getDb to use an in-memory database
let testDb: Database.Database;

vi.mock("../src/store/db.js", () => ({
  getDb: () => testDb,
}));

// Import after mock is set up
const { insertSession, getTotalSessions, getTotalTime, getRecentSessions } =
  await import("../src/store/history.js");

function createTestDb(): Database.Database {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE sessions (
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

beforeEach(() => {
  testDb = createTestDb();
});

describe("insertSession", () => {
  it("inserts a session and returns its id", () => {
    const id = insertSession({
      started_at: "2025-01-01T00:00:00Z",
      duration_seconds: 300,
      planned_duration: 300,
      meditation_type: "breathe",
      completed: true,
    });
    expect(id).toBe(1);
  });

  it("increments ids for successive inserts", () => {
    const id1 = insertSession({
      started_at: "2025-01-01T00:00:00Z",
      duration_seconds: 300,
      planned_duration: 300,
      meditation_type: "breathe",
      completed: true,
    });
    const id2 = insertSession({
      started_at: "2025-01-01T00:05:00Z",
      duration_seconds: 600,
      planned_duration: 600,
      meditation_type: "break",
      completed: false,
    });
    expect(id2).toBe(id1 + 1);
  });

  it("stores completed as 1/0 integer", () => {
    insertSession({
      started_at: "2025-01-01T00:00:00Z",
      duration_seconds: 300,
      planned_duration: 300,
      meditation_type: "breathe",
      completed: true,
    });
    const row = testDb.prepare("SELECT completed FROM sessions WHERE id = 1").get() as { completed: number };
    expect(row.completed).toBe(1);
  });

  it("defaults completed_at to null", () => {
    insertSession({
      started_at: "2025-01-01T00:00:00Z",
      duration_seconds: 300,
      planned_duration: 300,
      meditation_type: "breathe",
      completed: false,
    });
    const row = testDb.prepare("SELECT completed_at FROM sessions WHERE id = 1").get() as { completed_at: string | null };
    expect(row.completed_at).toBeNull();
  });
});

describe("getTotalSessions", () => {
  it("returns 0 when no sessions exist", () => {
    expect(getTotalSessions()).toBe(0);
  });

  it("returns the correct count", () => {
    insertSession({ started_at: "2025-01-01T00:00:00Z", duration_seconds: 60, planned_duration: 60, meditation_type: "breathe", completed: true });
    insertSession({ started_at: "2025-01-01T00:01:00Z", duration_seconds: 120, planned_duration: 120, meditation_type: "break", completed: true });
    expect(getTotalSessions()).toBe(2);
  });
});

describe("getTotalTime", () => {
  it("returns 0 when no sessions exist", () => {
    expect(getTotalTime()).toBe(0);
  });

  it("sums duration_seconds across all sessions", () => {
    insertSession({ started_at: "2025-01-01T00:00:00Z", duration_seconds: 100, planned_duration: 100, meditation_type: "breathe", completed: true });
    insertSession({ started_at: "2025-01-01T00:02:00Z", duration_seconds: 200, planned_duration: 200, meditation_type: "break", completed: true });
    expect(getTotalTime()).toBe(300);
  });
});

describe("getRecentSessions", () => {
  it("returns empty array when no sessions exist", () => {
    expect(getRecentSessions()).toEqual([]);
  });

  it("returns sessions ordered by started_at DESC", () => {
    insertSession({ started_at: "2025-01-01T00:00:00Z", duration_seconds: 60, planned_duration: 60, meditation_type: "breathe", completed: true });
    insertSession({ started_at: "2025-01-02T00:00:00Z", duration_seconds: 120, planned_duration: 120, meditation_type: "break", completed: true });
    const sessions = getRecentSessions();
    expect(sessions).toHaveLength(2);
    expect(sessions[0].started_at).toBe("2025-01-02T00:00:00Z");
    expect(sessions[1].started_at).toBe("2025-01-01T00:00:00Z");
  });

  it("respects the limit parameter", () => {
    for (let i = 0; i < 5; i++) {
      insertSession({ started_at: `2025-01-0${i + 1}T00:00:00Z`, duration_seconds: 60, planned_duration: 60, meditation_type: "breathe", completed: true });
    }
    expect(getRecentSessions(3)).toHaveLength(3);
  });

  it("defaults to limit of 10", () => {
    for (let i = 0; i < 15; i++) {
      insertSession({ started_at: `2025-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`, duration_seconds: 60, planned_duration: 60, meditation_type: "breathe", completed: true });
    }
    expect(getRecentSessions()).toHaveLength(10);
  });
});
