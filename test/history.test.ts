import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Database from "better-sqlite3";

// Mock getDb to use an in-memory database
let testDb: Database.Database;

vi.mock("../src/store/db.js", () => ({
  getDb: () => testDb,
}));

// Import after mock is set up
const {
  insertSession,
  getTotalSessions,
  getTotalTime,
  getRecentSessions,
  getCurrentStreak,
  getLongestStreak,
  getSessionsToday,
  getSessionsYesterday,
  getSessionsThisWeek,
} = await import("../src/store/history.js");

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

// Helper: create a session params object for a given local date
function sessionOn(year: number, month: number, day: number, durationSeconds = 300) {
  return {
    started_at: new Date(year, month, day, 10, 0, 0).toISOString(),
    duration_seconds: durationSeconds,
    planned_duration: durationSeconds,
    meditation_type: "breathe" as const,
    completed: true,
  };
}

describe("getCurrentStreak", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0)); // June 15, 2025 noon
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 when no sessions exist", () => {
    expect(getCurrentStreak()).toBe(0);
  });

  it("returns 1 when only today has a session", () => {
    insertSession(sessionOn(2025, 5, 15));
    expect(getCurrentStreak()).toBe(1);
  });

  it("returns streak for consecutive days ending today", () => {
    insertSession(sessionOn(2025, 5, 13)); // 3 days ago
    insertSession(sessionOn(2025, 5, 14)); // 2 days ago
    insertSession(sessionOn(2025, 5, 15)); // today
    expect(getCurrentStreak()).toBe(3);
  });

  it("starts streak from yesterday if no session today", () => {
    insertSession(sessionOn(2025, 5, 13));
    insertSession(sessionOn(2025, 5, 14)); // yesterday
    expect(getCurrentStreak()).toBe(2);
  });

  it("returns 0 when most recent session is older than yesterday", () => {
    insertSession(sessionOn(2025, 5, 10));
    expect(getCurrentStreak()).toBe(0);
  });

  it("stops at first gap in consecutive days", () => {
    insertSession(sessionOn(2025, 5, 11)); // gap on June 12
    insertSession(sessionOn(2025, 5, 13));
    insertSession(sessionOn(2025, 5, 14));
    insertSession(sessionOn(2025, 5, 15));
    expect(getCurrentStreak()).toBe(3);
  });

  it("counts multiple sessions on the same day as one day", () => {
    insertSession(sessionOn(2025, 5, 15));
    insertSession({ ...sessionOn(2025, 5, 15), started_at: new Date(2025, 5, 15, 14, 0, 0).toISOString() });
    insertSession(sessionOn(2025, 5, 14));
    expect(getCurrentStreak()).toBe(2);
  });
});

describe("getLongestStreak", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 when no sessions exist", () => {
    expect(getLongestStreak()).toBe(0);
  });

  it("returns 1 for a single session", () => {
    insertSession(sessionOn(2025, 5, 10));
    expect(getLongestStreak()).toBe(1);
  });

  it("finds longest streak even if not current", () => {
    // Old streak of 4 days
    insertSession(sessionOn(2025, 5, 1));
    insertSession(sessionOn(2025, 5, 2));
    insertSession(sessionOn(2025, 5, 3));
    insertSession(sessionOn(2025, 5, 4));
    // Gap, then current streak of 2
    insertSession(sessionOn(2025, 5, 14));
    insertSession(sessionOn(2025, 5, 15));
    expect(getLongestStreak()).toBe(4);
  });

  it("returns current streak when it is the longest", () => {
    insertSession(sessionOn(2025, 5, 12));
    insertSession(sessionOn(2025, 5, 13));
    insertSession(sessionOn(2025, 5, 14));
    insertSession(sessionOn(2025, 5, 15));
    expect(getLongestStreak()).toBe(4);
  });
});

describe("getSessionsToday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns zero counts when no sessions exist", () => {
    expect(getSessionsToday()).toEqual({ count: 0, totalSeconds: 0 });
  });

  it("counts only today's sessions", () => {
    insertSession(sessionOn(2025, 5, 14, 100)); // yesterday
    insertSession(sessionOn(2025, 5, 15, 200)); // today
    insertSession(sessionOn(2025, 5, 15, 300)); // today
    const result = getSessionsToday();
    expect(result.count).toBe(2);
    expect(result.totalSeconds).toBe(500);
  });
});

describe("getSessionsYesterday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns zero counts when no sessions exist", () => {
    expect(getSessionsYesterday()).toEqual({ count: 0, totalSeconds: 0 });
  });

  it("counts only yesterday's sessions", () => {
    insertSession(sessionOn(2025, 5, 13, 100)); // two days ago
    insertSession(sessionOn(2025, 5, 14, 200)); // yesterday
    insertSession(sessionOn(2025, 5, 15, 300)); // today
    const result = getSessionsYesterday();
    expect(result.count).toBe(1);
    expect(result.totalSeconds).toBe(200);
  });
});

describe("getSessionsThisWeek", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // June 18, 2025 is a Wednesday (getDay() = 3)
    vi.setSystemTime(new Date(2025, 5, 18, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns zero counts when no sessions exist", () => {
    expect(getSessionsThisWeek()).toEqual({ count: 0, totalSeconds: 0 });
  });

  it("counts sessions within the current week (Sun-Sat)", () => {
    // Week starts Sunday June 15 for Wednesday June 18
    insertSession(sessionOn(2025, 5, 14, 100)); // Saturday before — excluded
    insertSession(sessionOn(2025, 5, 15, 200)); // Sunday — included
    insertSession(sessionOn(2025, 5, 18, 300)); // Wednesday (today) — included
    insertSession(sessionOn(2025, 5, 21, 150)); // Saturday — included
    insertSession(sessionOn(2025, 5, 22, 400)); // next Sunday — excluded
    const result = getSessionsThisWeek();
    expect(result.count).toBe(3);
    expect(result.totalSeconds).toBe(650);
  });
});
