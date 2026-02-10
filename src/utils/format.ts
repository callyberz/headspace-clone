/** Format seconds into "M:SS" or "H:MM:SS" */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Parse a duration string like "5m", "1h30m", "90s", "5" (minutes) into seconds */
export function parseDuration(input: string): number | null {
  const trimmed = input.trim().toLowerCase();

  // Pure number → treat as minutes
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10) * 60;
  }

  // Patterns like "5m", "90s", "1h", "1h30m", "5m30s"
  const match = trimmed.match(
    /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/,
  );
  if (!match || (!match[1] && !match[2] && !match[3])) return null;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}
