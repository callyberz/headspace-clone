import React from "react";
import { render } from "ink";
import App from "../ui/App.js";
import { ThemeProvider } from "../ui/ThemeContext.js";
import { insertSession } from "../store/history.js";
import { type BreathingPattern } from "../engine/patterns.js";

export function breatheCommand(durationSeconds: number, pattern?: BreathingPattern): void {
  const startedAt = new Date().toISOString();

  render(
    <ThemeProvider>
      <App
        duration={durationSeconds}
        type="Breath Awareness"
        pattern={pattern}
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
      />
    </ThemeProvider>,
  );
}
