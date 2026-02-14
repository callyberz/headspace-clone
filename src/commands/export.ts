import { getAllSessions, type Session } from "../store/history.js";

function sessionToCSVRow(session: Session): string {
  return [
    session.id,
    session.started_at,
    session.completed_at ?? "",
    session.duration_seconds,
    session.planned_duration,
    session.meditation_type,
    session.completed ? "true" : "false",
  ].join(",");
}

function toCSV(sessions: Session[]): string {
  const header = "id,started_at,completed_at,duration_seconds,planned_duration,meditation_type,completed";
  const rows = sessions.map(sessionToCSVRow);
  return [header, ...rows].join("\n");
}

function toJSON(sessions: Session[]): string {
  return JSON.stringify(
    sessions.map((s) => ({
      ...s,
      completed: Boolean(s.completed),
    })),
    null,
    2,
  );
}

export function exportCommand(format: string): void {
  const sessions = getAllSessions();

  if (format === "csv") {
    console.log(toCSV(sessions));
  } else {
    console.log(toJSON(sessions));
  }
}
