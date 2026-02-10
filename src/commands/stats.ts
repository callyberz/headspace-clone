import chalk from "chalk";
import { getTotalSessions, getTotalTime, getRecentSessions } from "../store/history.js";

function formatMinutes(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

export function statsCommand(): void {
  const total = getTotalSessions();
  const totalTime = getTotalTime();
  const recent = getRecentSessions(5);

  console.log();
  console.log(chalk.bold("  Meditation Stats"));
  console.log();
  console.log(`  Sessions:    ${chalk.cyan(total)}`);
  console.log(`  Total time:  ${chalk.cyan(formatMinutes(totalTime))}`);

  if (recent.length > 0) {
    console.log();
    console.log(chalk.bold("  Recent Sessions"));
    console.log();
    for (const s of recent) {
      const date = new Date(s.started_at).toLocaleDateString();
      const dur = formatMinutes(s.duration_seconds);
      const status = s.completed ? chalk.green("✓") : chalk.yellow("—");
      console.log(`  ${status} ${chalk.dim(date)}  ${s.meditation_type}  ${chalk.dim(dur)}`);
    }
  }

  console.log();
}
