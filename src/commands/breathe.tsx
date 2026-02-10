import React from "react";
import { render } from "ink";
import App from "../ui/App.js";
import { insertSession } from "../store/history.js";

export function breatheCommand(durationSeconds: number): void {
  const startedAt = new Date().toISOString();

  render(
    <App
      duration={durationSeconds}
      type="Breath Awareness"
      onComplete={(elapsed) => {
        insertSession({
          started_at: startedAt,
          completed_at: new Date().toISOString(),
          duration_seconds: elapsed,
          planned_duration: durationSeconds,
          meditation_type: "Breath Awareness",
          completed: elapsed >= durationSeconds,
        });
      }}
    />,
  );
}
