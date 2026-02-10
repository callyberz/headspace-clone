import React, { useState, useEffect } from "react";
import { Text } from "ink";

const INHALE_MS = 4000;
const HOLD_MS = 4000;
const EXHALE_MS = 4000;
const CYCLE_MS = INHALE_MS + HOLD_MS + EXHALE_MS;

type Phase = "inhale" | "hold" | "exhale";

function getPhase(elapsed: number): { phase: Phase; progress: number } {
  const position = elapsed % CYCLE_MS;

  if (position < INHALE_MS) {
    return { phase: "inhale", progress: position / INHALE_MS };
  } else if (position < INHALE_MS + HOLD_MS) {
    return { phase: "hold", progress: (position - INHALE_MS) / HOLD_MS };
  } else {
    return {
      phase: "exhale",
      progress: (position - INHALE_MS - HOLD_MS) / EXHALE_MS,
    };
  }
}

const phaseLabels: Record<Phase, string> = {
  inhale: "Breathe in...",
  hold: "Hold...",
  exhale: "Breathe out...",
};

function dots(phase: Phase, progress: number): string {
  if (phase === "inhale") {
    const count = 1 + Math.floor(progress * 3);
    return "●".repeat(count);
  } else if (phase === "hold") {
    return "●●●●";
  } else {
    const count = 4 - Math.floor(progress * 3);
    return "●".repeat(Math.max(count, 1));
  }
}

export default function BreathingIndicator() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const { phase, progress } = getPhase(elapsed);
  const label = phaseLabels[phase];
  const visual = dots(phase, progress);

  return (
    <Text>
      <Text dimColor>{label.padEnd(20)}</Text>
      <Text color="cyan">{visual}</Text>
    </Text>
  );
}
