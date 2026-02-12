import chalk from "chalk";
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

export function statsCommand(): void {
  const total = getTotalSessions();
  const totalTime = getTotalTime();
  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const today = getSessionsToday();
  const yesterday = getSessionsYesterday();
  const thisWeek = getSessionsThisWeek();

  console.log();
  console.log(chalk.bold("  Practice Summary"));
  console.log();
  console.log(`  Total sessions:     ${chalk.cyan(total)}`);
  console.log(`  Total time:         ${chalk.cyan(formatTime(totalTime))}`);
  console.log(`  Current streak:     ${chalk.cyan(pluralize(currentStreak, "day"))}`);
  console.log(`  Longest streak:     ${chalk.cyan(pluralize(longestStreak, "day"))}`);

  console.log();
  console.log(chalk.bold("  Recent practice:"));
  console.log(
    `  Today:      ${pluralize(today.count, "session")} (${formatTime(today.totalSeconds)})`
  );
  console.log(
    `  Yesterday:  ${pluralize(yesterday.count, "session")} (${formatTime(yesterday.totalSeconds)})`
  );
  console.log(
    `  This week:  ${pluralize(thisWeek.count, "session")} (${formatTime(thisWeek.totalSeconds)})`
  );
  console.log();
}
