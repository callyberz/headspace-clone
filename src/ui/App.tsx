import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput, useApp } from "ink";
import BreathingIndicator from "./BreathingIndicator.js";
import Timer from "./Timer.js";
import SessionComplete from "./SessionComplete.js";

type Stage = "intro" | "active" | "complete";

interface AppProps {
  duration: number;
  type: string;
  onComplete?: (elapsedSeconds: number) => void;
}

export default function App({ duration, type, onComplete }: AppProps) {
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
    (input: string, key: { return: boolean }) => {
      if (stage === "intro" && key.return) {
        setStage("active");
      }
      if (stage === "active" && input === "q") {
        exit();
      }
    },
    [stage, exit],
  );

  useInput(handleInput);

  useEffect(() => {
    if (stage === "complete" && onComplete) {
      onComplete(duration - remaining);
    }
  }, [stage]);

  if (stage === "complete") {
    return <SessionComplete duration={duration} type={type} />;
  }

  if (stage === "intro") {
    return (
      <Box flexDirection="column" gap={1} paddingX={2} paddingY={1}>
        <Text>
          Meditation is simpler than you think:
        </Text>
        <Box flexDirection="column" paddingLeft={2}>
          <Text dimColor>1. Sit comfortably</Text>
          <Text dimColor>2. Notice your breath</Text>
          <Text dimColor>3. When your mind wanders, gently return</Text>
        </Box>
        <Text dimColor>[Press ENTER to start]</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1} paddingX={2} paddingY={1}>
      <Text>
        {type}
      </Text>
      <Box flexDirection="column" gap={1}>
        <BreathingIndicator />
        <Timer remainingSeconds={remaining} />
      </Box>
    </Box>
  );
}
