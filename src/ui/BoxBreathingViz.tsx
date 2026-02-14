import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { useTheme } from "./ThemeContext.js";
import { type BreathingPattern, BUILTIN_PATTERNS } from "../engine/patterns.js";

const DEFAULT_BOX_PATTERN = BUILTIN_PATTERNS[3]; // 4-4-4-4

const TICK_MS = 100;

function getPhaseAndProgress(
  elapsed: number,
  pattern: BreathingPattern,
): { phaseName: string; label: string; progress: number; phaseIndex: number } {
  const position = elapsed % pattern.cycleMs;
  let acc = 0;
  for (let i = 0; i < pattern.phases.length; i++) {
    const phase = pattern.phases[i];
    if (position < acc + phase.durationMs) {
      return {
        phaseName: phase.name,
        label: phase.label,
        progress: (position - acc) / phase.durationMs,
        phaseIndex: i,
      };
    }
    acc += phase.durationMs;
  }
  const last = pattern.phases[pattern.phases.length - 1];
  return {
    phaseName: last.name,
    label: last.label,
    progress: 1,
    phaseIndex: pattern.phases.length - 1,
  };
}

// Box dimensions
const BOX_W = 20;
const BOX_H = 6;

function buildBox(phaseIndex: number, progress: number, dot: string): string[] {
  const lines: string[] = [];
  const innerW = BOX_W - 2;
  const innerH = BOX_H - 2;

  // Map phase index to perimeter position (works for 4-phase patterns)
  let dotRow = -1;
  let dotCol = -1;

  if (phaseIndex === 0) {
    // Left edge, moving bottom to top
    const row = Math.round((1 - progress) * (innerH - 1));
    dotRow = row + 1;
    dotCol = 0;
  } else if (phaseIndex === 1) {
    // Top edge, moving left to right
    const col = Math.round(progress * (innerW - 1));
    dotRow = 0;
    dotCol = col + 1;
  } else if (phaseIndex === 2) {
    // Right edge, moving top to bottom
    const row = Math.round(progress * (innerH - 1));
    dotRow = row + 1;
    dotCol = BOX_W - 1;
  } else {
    // Bottom edge, moving right to left
    const col = Math.round((1 - progress) * (innerW - 1));
    dotRow = BOX_H - 1;
    dotCol = col + 1;
  }

  for (let r = 0; r < BOX_H; r++) {
    let row = "";
    for (let c = 0; c < BOX_W; c++) {
      if (r === dotRow && c === dotCol) {
        row += dot;
      } else if (r === 0 && c === 0) {
        row += "╭";
      } else if (r === 0 && c === BOX_W - 1) {
        row += "╮";
      } else if (r === BOX_H - 1 && c === 0) {
        row += "╰";
      } else if (r === BOX_H - 1 && c === BOX_W - 1) {
        row += "╯";
      } else if (r === 0 || r === BOX_H - 1) {
        row += "─";
      } else if (c === 0 || c === BOX_W - 1) {
        row += "│";
      } else {
        row += " ";
      }
    }
    lines.push(row);
  }

  return lines;
}

interface BoxBreathingVizProps {
  round: number;
  totalRounds: number;
  pattern?: BreathingPattern;
  paused?: boolean;
}

export default function BoxBreathingViz({ round, totalRounds, pattern, paused }: BoxBreathingVizProps) {
  const theme = useTheme();
  const activePattern = pattern ?? DEFAULT_BOX_PATTERN;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + TICK_MS);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [paused]);

  const { label, progress, phaseIndex } = getPhaseAndProgress(elapsed, activePattern);
  const boxLines = buildBox(phaseIndex, progress, theme.dot);

  // Direction arrows based on phase index
  const labelLeft = phaseIndex === 0 ? "↑ " : "  ";
  const labelRight = phaseIndex === 2 ? " ↓" : "  ";
  const labelTop = phaseIndex === 1 ? "→" : " ";
  const labelBottom = phaseIndex === 3 ? "←" : " ";

  const midRow = Math.floor(BOX_H / 2);

  return (
    <Box flexDirection="column">
      <Text bold color={theme.primary}>{label}</Text>
      <Text> {" ".repeat(Math.floor(BOX_W / 2))}{labelTop}</Text>
      {boxLines.map((line, i) => (
        <Text key={i}>
          {i === midRow ? labelLeft : "  "}
          <Text color={theme.primary}>{line}</Text>
          {i === midRow ? labelRight : "  "}
        </Text>
      ))}
      <Text> {" ".repeat(Math.floor(BOX_W / 2))}{labelBottom}</Text>
      <Text dimColor>Round {round} of {totalRounds}</Text>
    </Box>
  );
}

export function getCycleMs(pattern?: BreathingPattern): number {
  return (pattern ?? DEFAULT_BOX_PATTERN).cycleMs;
}
