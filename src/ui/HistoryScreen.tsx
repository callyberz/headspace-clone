import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { getAllSessions, type Session } from "../store/history.js";
import { useTheme } from "./ThemeContext.js";

const PAGE_SIZE = 10;

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

interface HistoryScreenProps {
  onBack: () => void;
}

export default function HistoryScreen({ onBack }: HistoryScreenProps) {
  const theme = useTheme();
  const sessions = getAllSessions();
  const [page, setPage] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const totalPages = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE));
  const pageStart = page * PAGE_SIZE;
  const pageSessions = sessions.slice(pageStart, pageStart + PAGE_SIZE);

  useInput((_input, key) => {
    if (key.escape) {
      onBack();
    } else if (key.upArrow) {
      setSelectedIndex((i) => (i <= 0 ? pageSessions.length - 1 : i - 1));
    } else if (key.downArrow) {
      setSelectedIndex((i) => (i >= pageSessions.length - 1 ? 0 : i + 1));
    } else if (key.leftArrow && page > 0) {
      setPage((p) => p - 1);
      setSelectedIndex(0);
    } else if (key.rightArrow && page < totalPages - 1) {
      setPage((p) => p + 1);
      setSelectedIndex(0);
    }
  });

  if (sessions.length === 0) {
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Text bold>Session History</Text>
        <Box marginTop={1}>
          <Text dimColor>No sessions yet. Start meditating!</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>[Esc back]</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold>Session History</Text>
      <Box marginTop={1} flexDirection="column">
        {pageSessions.map((session: Session, i: number) => {
          const isSelected = i === selectedIndex;
          const status = session.completed ? "+" : "-";
          return (
            <Text key={session.id} color={isSelected ? theme.primary : undefined}>
              {isSelected ? "> " : "  "}
              {status} {formatDate(session.started_at)}  {session.meditation_type.padEnd(18)}  {formatDuration(session.duration_seconds).padEnd(8)}
            </Text>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          Page {page + 1} of {totalPages} ({sessions.length} sessions)
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>[{"\u2190\u2192"} pages {"\u00b7"} {"\u2191\u2193"} navigate {"\u00b7"} Esc back]</Text>
      </Box>
    </Box>
  );
}
