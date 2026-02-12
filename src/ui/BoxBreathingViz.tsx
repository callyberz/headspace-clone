import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";

const PHASE_DURATION_MS = 4000;
const TICK_MS = 100;

type Phase = "inhale" | "hold-top" | "exhale" | "hold-bottom";

const PHASES: Phase[] = ["inhale", "hold-top", "exhale", "hold-bottom"];
const CYCLE_MS = PHASES.length * PHASE_DURATION_MS;

const phaseLabels: Record<Phase, string> = {
  inhale: "Breathe in",
  "hold-top": "Hold",
  exhale: "Breathe out",
  "hold-bottom": "Hold",
};

function getPhaseAndProgress(elapsed: number): { phase: Phase; progress: number } {
  const position = elapsed % CYCLE_MS;
  const phaseIndex = Math.min(Math.floor(position / PHASE_DURATION_MS), PHASES.length - 1);
  const phaseElapsed = position - phaseIndex * PHASE_DURATION_MS;
  return { phase: PHASES[phaseIndex], progress: phaseElapsed / PHASE_DURATION_MS };
}

// Box dimensions
const BOX_W = 20;
const BOX_H = 6;

function buildBox(phase: Phase, progress: number): string[] {
  const dot = "●";
  const lines: string[] = [];

  // Build the box frame
  // Top:    ╭──────────────────╮
  // Sides:  │                  │  (BOX_H - 2 inner rows)
  // Bottom: ╰──────────────────╯

  const innerW = BOX_W - 2;
  const innerH = BOX_H - 2;

  // Calculate dot position on perimeter
  // Perimeter order: inhale = left side bottom-to-top, hold-top = top left-to-right,
  //                  exhale = right side top-to-bottom, hold-bottom = bottom right-to-left
  let dotRow = -1;
  let dotCol = -1;

  if (phase === "inhale") {
    // Left edge, moving bottom to top (row = innerH-1 down to 0, col = 0)
    const row = Math.round((1 - progress) * (innerH - 1));
    dotRow = row + 1; // +1 for top border
    dotCol = 0;
  } else if (phase === "hold-top") {
    // Top edge, moving left to right
    const col = Math.round(progress * (innerW - 1));
    dotRow = 0;
    dotCol = col + 1; // +1 for left border
  } else if (phase === "exhale") {
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

  // Build each row
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
}

export default function BoxBreathingViz({ round, totalRounds }: BoxBreathingVizProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + TICK_MS);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const { phase, progress } = getPhaseAndProgress(elapsed);
  const label = phaseLabels[phase];
  const boxLines = buildBox(phase, progress);

  // Add phase labels on sides
  const labelLeft = phase === "inhale" ? "↑ " : "  ";
  const labelRight = phase === "exhale" ? " ↓" : "  ";
  const labelTop = phase === "hold-top" ? "→" : " ";
  const labelBottom = phase === "hold-bottom" ? "←" : " ";

  const midRow = Math.floor(BOX_H / 2);

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">{label}</Text>
      <Text> {" ".repeat(Math.floor(BOX_W / 2))}{labelTop}</Text>
      {boxLines.map((line, i) => (
        <Text key={i}>
          {i === midRow ? labelLeft : "  "}
          <Text color="cyan">{line}</Text>
          {i === midRow ? labelRight : "  "}
        </Text>
      ))}
      <Text> {" ".repeat(Math.floor(BOX_W / 2))}{labelBottom}</Text>
      <Text dimColor>Round {round} of {totalRounds}</Text>
    </Box>
  );
}

export { CYCLE_MS };
