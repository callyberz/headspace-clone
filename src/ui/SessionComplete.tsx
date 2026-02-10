import React, { useEffect } from "react";
import { Box, Text } from "ink";
import { useApp } from "ink";

interface SessionCompleteProps {
  duration: number;
  type: string;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function SessionComplete({
  duration,
  type,
}: SessionCompleteProps) {
  const { exit } = useApp();

  useEffect(() => {
    const timeout = setTimeout(() => {
      exit();
    }, 3000);
    return () => clearTimeout(timeout);
  }, [exit]);

  return (
    <Box flexDirection="column" gap={1} paddingX={2} paddingY={1}>
      <Text>Session complete.</Text>
      <Text dimColor>
        {type} — {formatDuration(duration)}
      </Text>
    </Box>
  );
}
