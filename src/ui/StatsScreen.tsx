import React from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "./ThemeContext.js";
import {
  getTotalSessions,
  getTotalTime,
  getCurrentStreak,
  getLongestStreak,
  getSessionsToday,
  getSessionsYesterday,
  getSessionsThisWeek,
} from "../store/history.js";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

function pluralize(count: number, singular: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${singular}s`;
}

interface StatsScreenProps {
  onBack: () => void;
}

export default function StatsScreen({ onBack }: StatsScreenProps) {
  const theme = useTheme();
  const total = getTotalSessions();
  const totalTime = getTotalTime();
  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const today = getSessionsToday();
  const yesterday = getSessionsYesterday();
  const thisWeek = getSessionsThisWeek();

  useInput((_input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold>Practice Summary</Text>
      <Box marginTop={1} flexDirection="column">
        <Text>Total sessions:     <Text color={theme.primary}>{total}</Text></Text>
        <Text>Total time:         <Text color={theme.primary}>{formatTime(totalTime)}</Text></Text>
        <Text>Current streak:     <Text color={theme.primary}>{pluralize(currentStreak, "day")}</Text></Text>
        <Text>Longest streak:     <Text color={theme.primary}>{pluralize(longestStreak, "day")}</Text></Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text bold>Recent practice:</Text>
        <Text>Today:      {pluralize(today.count, "session")} ({formatTime(today.totalSeconds)})</Text>
        <Text>Yesterday:  {pluralize(yesterday.count, "session")} ({formatTime(yesterday.totalSeconds)})</Text>
        <Text>This week:  {pluralize(thisWeek.count, "session")} ({formatTime(thisWeek.totalSeconds)})</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>[Esc back]</Text>
      </Box>
    </Box>
  );
}
