import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";

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
  inhale: "Breathe in",
  hold: "Hold",
  exhale: "Breathe out",
};

const BAR_WIDTH = 20;
const FILL = "━";
const EMPTY = "─";

function breathBar(phase: Phase, progress: number): { filled: number; color: string } {
  if (phase === "inhale") {
    return { filled: Math.round(progress * BAR_WIDTH), color: "cyan" };
  } else if (phase === "hold") {
    return { filled: BAR_WIDTH, color: "blue" };
  } else {
    return { filled: Math.round((1 - progress) * BAR_WIDTH), color: "cyan" };
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
  const { filled, color } = breathBar(phase, progress);
  const empty = BAR_WIDTH - filled;

  return (
    <Box flexDirection="column">
      <Text dimColor>{label}</Text>
      <Text>
        <Text color={color}>{FILL.repeat(filled)}</Text>
        <Text dimColor>{EMPTY.repeat(empty)}</Text>
      </Text>
    </Box>
  );
}
