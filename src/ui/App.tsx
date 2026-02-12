import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput, useApp } from "ink";
import BreathingIndicator from "./BreathingIndicator.js";
import Timer from "./Timer.js";
import SessionComplete from "./SessionComplete.js";
import { formatDuration } from "../utils/format.js";

type Stage = "intro" | "active" | "complete";

interface AppProps {
  duration: number;
  type: string;
  onComplete?: (elapsedSeconds: number) => void;
  onBack?: () => void;
}

export default function App({ duration, type, onComplete, onBack }: AppProps) {
  const { exit } = useApp();
  const [stage, setStage] = useState<Stage>("intro");
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (stage !== "active") return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStage("complete");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage]);

  const handleInput = useCallback(
    (_input: string, key: { return: boolean; escape: boolean }) => {
      if (stage === "intro" && key.return) {
        setStage("active");
      }
      if (stage === "active" && key.escape) {
        onBack ? onBack() : exit();
      }
    },
    [stage, exit, onBack],
  );

  useInput(handleInput);

  useEffect(() => {
    if (stage === "complete" && onComplete) {
      onComplete(duration - remaining);
    }
  }, [stage]);

  if (stage === "complete") {
    return <SessionComplete duration={duration} type={type} onBack={onBack} />;
  }

  if (stage === "intro") {
    return (
      <Box flexDirection="column" gap={1} paddingX={2} paddingY={1}>
        <Text>
          {type} — {formatDuration(duration)}
        </Text>
        <Box flexDirection="column" paddingLeft={2}>
          <Text dimColor>1. Sit comfortably</Text>
          <Text dimColor>2. Notice your breath</Text>
          <Text dimColor>3. When your mind wanders, gently return</Text>
        </Box>
        <Text dimColor>[Press ENTER to start · Esc back]</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1} paddingX={2} paddingY={1}>
      <Text>
        {type}
      </Text>
      <Text dimColor>Follow the rhythm. Let thoughts pass.</Text>
      <Box flexDirection="column" gap={1}>
        <BreathingIndicator />
        <Timer remainingSeconds={remaining} />
      </Box>
      <Text dimColor>[Esc back]</Text>
    </Box>
  );
}
