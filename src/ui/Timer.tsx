import React from "react";
import { Box, Text } from "ink";

interface TimerProps {
  remainingSeconds: number;
}

export default function Timer({ remainingSeconds }: TimerProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const display = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <Box justifyContent="space-between" width="100%">
      <Text dimColor>{display} remaining</Text>
      <Text dimColor>q to quit</Text>
    </Box>
  );
}
