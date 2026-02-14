import { describe, it, expect, beforeEach, vi } from "vitest";
import Database from "better-sqlite3";

let testDb: Database.Database;

vi.mock("../src/store/db.js", () => ({
  getDb: () => testDb,
}));

const { exportCommand } = await import("../src/commands/export.js");
const { insertSession } = await import("../src/store/history.js");

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

describe("exportCommand", () => {
  it("outputs empty JSON array when no sessions", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    exportCommand("json");
    expect(spy).toHaveBeenCalledWith("[]");
    spy.mockRestore();
  });

  it("outputs CSV header only when no sessions", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    exportCommand("csv");
    const output = spy.mock.calls[0][0] as string;
    expect(output).toBe("id,started_at,completed_at,duration_seconds,planned_duration,meditation_type,completed");
    spy.mockRestore();
  });

  it("outputs sessions as JSON", () => {
    insertSession({
      started_at: "2025-01-01T00:00:00Z",
      completed_at: "2025-01-01T00:05:00Z",
      duration_seconds: 300,
      planned_duration: 300,
      meditation_type: "Breath Awareness",
      completed: true,
    });

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    exportCommand("json");
    const output = JSON.parse(spy.mock.calls[0][0] as string);
    expect(output).toHaveLength(1);
    expect(output[0].meditation_type).toBe("Breath Awareness");
    expect(output[0].completed).toBe(true);
    expect(output[0].duration_seconds).toBe(300);
    spy.mockRestore();
  });

  it("outputs sessions as CSV", () => {
    insertSession({
      started_at: "2025-01-01T00:00:00Z",
      completed_at: "2025-01-01T00:05:00Z",
      duration_seconds: 300,
      planned_duration: 300,
      meditation_type: "Breath Awareness",
      completed: true,
    });

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    exportCommand("csv");
    const output = spy.mock.calls[0][0] as string;
    const lines = output.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("id,started_at,completed_at,duration_seconds,planned_duration,meditation_type,completed");
    expect(lines[1]).toContain("Breath Awareness");
    expect(lines[1]).toContain("true");
    spy.mockRestore();
  });

  it("exports multiple sessions in descending order", () => {
    insertSession({
      started_at: "2025-01-01T00:00:00Z",
      duration_seconds: 60,
      planned_duration: 60,
      meditation_type: "Breath Awareness",
      completed: true,
    });
    insertSession({
      started_at: "2025-01-02T00:00:00Z",
      duration_seconds: 120,
      planned_duration: 120,
      meditation_type: "Mindful Break",
      completed: false,
    });

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    exportCommand("json");
    const output = JSON.parse(spy.mock.calls[0][0] as string);
    expect(output).toHaveLength(2);
    expect(output[0].started_at).toBe("2025-01-02T00:00:00Z");
    expect(output[1].started_at).toBe("2025-01-01T00:00:00Z");
    spy.mockRestore();
  });
});
