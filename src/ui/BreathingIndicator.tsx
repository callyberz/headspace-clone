import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { useTheme } from "./ThemeContext.js";
import { type BreathingPattern, BUILTIN_PATTERNS } from "../engine/patterns.js";

const DEFAULT_PATTERN = BUILTIN_PATTERNS[0]; // 4-4-4

function getPhase(
  elapsed: number,
  pattern: BreathingPattern,
): { label: string; progress: number; phaseName: string } {
  const position = elapsed % pattern.cycleMs;
  let acc = 0;
  for (const phase of pattern.phases) {
    if (position < acc + phase.durationMs) {
      return {
        label: phase.label,
        progress: (position - acc) / phase.durationMs,
        phaseName: phase.name,
      };
    }
    acc += phase.durationMs;
  }
  // Fallback to last phase
  const last = pattern.phases[pattern.phases.length - 1];
  return { label: last.label, progress: 1, phaseName: last.name };
}

const BAR_WIDTH = 20;

interface BreathingIndicatorProps {
  pattern?: BreathingPattern;
  paused?: boolean;
}

export default function BreathingIndicator({ pattern, paused }: BreathingIndicatorProps) {
  const theme = useTheme();
  const activePattern = pattern ?? DEFAULT_PATTERN;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, [paused]);

  const { label, progress, phaseName } = getPhase(elapsed, activePattern);

  let filled: number;
  let color: string;

  if (phaseName === "inhale") {
    filled = Math.round(progress * BAR_WIDTH);
    color = theme.primary;
  } else if (phaseName === "exhale") {
    filled = Math.round((1 - progress) * BAR_WIDTH);
    color = theme.primary;
  } else {
    // hold phases
    filled = BAR_WIDTH;
    color = theme.secondary;
  }

  const empty = BAR_WIDTH - filled;

  return (
    <Box flexDirection="column">
      <Text dimColor>{label}</Text>
      <Text>
        <Text color={color}>{theme.barFill.repeat(filled)}</Text>
        <Text dimColor>{theme.barEmpty.repeat(empty)}</Text>
      </Text>
    </Box>
  );
}
