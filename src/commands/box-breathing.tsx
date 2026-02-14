import React, { useState, useEffect, useCallback } from "react";
import { render, Box, Text, useInput, useApp } from "ink";
import BoxBreathingViz, { getCycleMs } from "../ui/BoxBreathingViz.js";
import { ThemeProvider, useTheme } from "../ui/ThemeContext.js";
import { insertSession } from "../store/history.js";
import { type BreathingPattern } from "../engine/patterns.js";

type Stage = "intro" | "active" | "complete";

interface BoxBreathingAppProps {
  rounds: number;
  pattern?: BreathingPattern;
  onComplete: (durationSeconds: number) => void;
  onBack?: () => void;
}

export function BoxBreathingApp({ rounds, pattern, onComplete, onBack }: BoxBreathingAppProps) {
  const { exit } = useApp();
  const theme = useTheme();
  const [stage, setStage] = useState<Stage>("intro");
  const [currentRound, setCurrentRound] = useState(1);
  const [startTime, setStartTime] = useState<number>(0);
  const [paused, setPaused] = useState(false);
  const [pausedDuration, setPausedDuration] = useState(0);
  const [pauseStart, setPauseStart] = useState<number>(0);

  const cycleMs = getCycleMs(pattern);

  useEffect(() => {
    if (stage !== "active" || paused) return;

    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startTime - pausedDuration;
      const completedRounds = Math.floor(elapsedMs / cycleMs);
      if (completedRounds >= rounds) {
        clearInterval(interval);
        const elapsed = Math.round(elapsedMs / 1000);
        onComplete(elapsed);
        setStage("complete");
      } else {
        setCurrentRound(completedRounds + 1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [stage, startTime, rounds, onComplete, paused, pausedDuration, cycleMs]);

  // Auto-exit after 3s only when launched via CLI (no onBack)
  useEffect(() => {
    if (stage === "complete" && !onBack) {
      const timeout = setTimeout(() => {
        exit();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [stage, exit, onBack]);

  const handleInput = useCallback(
    (input: string, key: { return: boolean; escape: boolean }) => {
      if (stage === "intro" && key.return) {
        setStartTime(Date.now());
        setStage("active");
      }
      if (stage === "active" && (input === " " || input === "p")) {
        setPaused((prev) => {
          if (!prev) {
            // Pausing
            setPauseStart(Date.now());
          } else {
            // Resuming
            setPausedDuration((d) => d + (Date.now() - pauseStart));
          }
          return !prev;
        });
      }
      if (key.escape) {
        if (stage === "active" || stage === "complete") {
          onBack ? onBack() : exit();
        }
        if (stage === "intro") {
          onBack ? onBack() : exit();
        }
      }
    },
    [stage, exit, onBack, pauseStart],
  );

  useInput(handleInput);

  if (stage === "complete") {
    const totalSeconds = rounds * (cycleMs / 1000);
    return (
      <Box flexDirection="column" gap={1} paddingX={2} paddingY={1}>
        <Text>Session complete.</Text>
        <Text dimColor>
          Box Breathing — {rounds} rounds ({totalSeconds}s)
        </Text>
        <Text dimColor>Take a moment before moving on.</Text>
        {onBack && (
          <Text dimColor>[Esc back to menu]</Text>
        )}
      </Box>
    );
  }

  if (stage === "intro") {
    return (
      <Box flexDirection="column" gap={1} paddingX={2} paddingY={1}>
        <Text>Box Breathing — {rounds} rounds</Text>
        <Box flexDirection="column" paddingLeft={2}>
          <Text dimColor>1. Breathe in for 4 seconds</Text>
          <Text dimColor>2. Hold for 4 seconds</Text>
          <Text dimColor>3. Breathe out for 4 seconds</Text>
          <Text dimColor>4. Hold for 4 seconds</Text>
        </Box>
        <Text dimColor>[Press ENTER to start · Esc back]</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1} paddingX={2} paddingY={1}>
      <Text>Box Breathing</Text>
      {paused ? (
        <Text bold color={theme.warning}>PAUSED</Text>
      ) : (
        <Text dimColor>Follow the dot around the box.</Text>
      )}
      <BoxBreathingViz round={currentRound} totalRounds={rounds} pattern={pattern} paused={paused} />
      <Text dimColor>[Space pause · Esc back]</Text>
    </Box>
  );
}

export function boxBreathingCommand(rounds: number): void {
  const startedAt = new Date().toISOString();
  const cycleMs = getCycleMs();
  const totalDuration = rounds * (cycleMs / 1000);

  render(
    <ThemeProvider>
      <BoxBreathingApp
        rounds={rounds}
        onComplete={(elapsed) => {
          insertSession({
            started_at: startedAt,
            completed_at: new Date().toISOString(),
            duration_seconds: elapsed,
            planned_duration: totalDuration,
            meditation_type: "Box Breathing",
            completed: elapsed >= totalDuration,
          });
        }}
      />
    </ThemeProvider>,
  );
}
