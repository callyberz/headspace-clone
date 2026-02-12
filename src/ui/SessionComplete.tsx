import React, { useEffect } from "react";
import { Box, Text, useInput, useApp } from "ink";
import { formatDuration } from "../utils/format.js";

interface SessionCompleteProps {
  duration: number;
  type: string;
  onBack?: () => void;
}

export default function SessionComplete({
  duration,
  type,
  onBack,
}: SessionCompleteProps) {
  const { exit } = useApp();

  // Auto-exit after 3s only when launched via CLI (no onBack)
  useEffect(() => {
    if (onBack) return;
    const timeout = setTimeout(() => {
      exit();
    }, 3000);
    return () => clearTimeout(timeout);
  }, [exit, onBack]);

  useInput((_input, key) => {
    if (key.escape) {
      onBack ? onBack() : exit();
    }
  });

  return (
    <Box flexDirection="column" gap={1} paddingX={2} paddingY={1}>
      <Text>Session complete.</Text>
      <Text dimColor>
        {type} — {formatDuration(duration)}
      </Text>
      <Text dimColor>Take a moment before moving on.</Text>
      {onBack && (
        <Text dimColor>[Esc back to menu]</Text>
      )}
    </Box>
  );
}
