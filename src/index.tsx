import { Command } from "commander";
import { parseDuration } from "./utils/format.js";
import { breatheCommand } from "./commands/breathe.js";
import { breakCommand } from "./commands/break.js";
import { statsCommand } from "./commands/stats.js";
import { configCommand } from "./commands/config.js";
import { boxBreathingCommand } from "./commands/box-breathing.js";
import { menuCommand } from "./commands/menu.js";
import { exportCommand } from "./commands/export.js";
import { completionsCommand } from "./commands/completions.js";
import { getConfig } from "./store/config.js";
import { getPatternById, parseCustomPattern } from "./engine/patterns.js";

function checkTerminalSize(): void {
  const cols = process.stdout.columns ?? 80;
  const rows = process.stdout.rows ?? 24;
  if (cols < 40 || rows < 12) {
    console.warn(
      "Warning: Terminal is small (%dx%d). For the best experience, use at least 40x12.",
      cols,
      rows,
    );
  }
}

const program = new Command();

program
  .name("hs")
  .version("0.1.0")
  .description(
    "A minimal CLI meditation tool for developers\n\nSet NO_COLOR=1 to disable color output.",
  );

program
  .action(() => {
    checkTerminalSize();
    menuCommand();
  });

program
  .command("breathe [duration]")
  .description("Start a breath awareness session (default: from config)")
  .option("--pattern <pattern>", "Breathing pattern (e.g. 4-4-4, 4-7-8, 5-5)")
  .action((duration?: string, options?: { pattern?: string }) => {
    checkTerminalSize();
    const defaultSeconds = getConfig().defaultDuration;
    const seconds = duration ? parseDuration(duration) : defaultSeconds;
    if (seconds === null || seconds <= 0) {
      console.error(`Invalid duration: "${duration}". Try "5m", "90s", or "1h30m".`);
      process.exit(1);
    }
    let pattern;
    if (options?.pattern) {
      pattern = getPatternById(options.pattern) ?? parseCustomPattern(options.pattern);
      if (!pattern) {
        console.error(`Invalid pattern: "${options.pattern}". Try "4-4-4", "4-7-8", or "5-5".`);
        process.exit(1);
      }
    }
    breatheCommand(seconds, pattern);
  });

program
  .command("break [duration]")
  .description("Start a mindful break (default: 2m)")
  .action((duration?: string) => {
    checkTerminalSize();
    const seconds = duration ? parseDuration(duration) : 2 * 60;
    if (seconds === null || seconds <= 0) {
      console.error(`Invalid duration: "${duration}". Try "2m", "90s", or "30s".`);
      process.exit(1);
    }
    breakCommand(seconds);
  });

program
  .command("stats")
  .description("Show your meditation statistics")
  .action(() => {
    statsCommand();
  });

program
  .command("box-breathing [rounds]")
  .description("Start a box breathing session (default: 4 rounds)")
  .action((rounds?: string) => {
    checkTerminalSize();
    const numRounds = rounds ? parseInt(rounds, 10) : 4;
    if (isNaN(numRounds) || numRounds <= 0) {
      console.error(`Invalid rounds: "${rounds}". Provide a positive number.`);
      process.exit(1);
    }
    boxBreathingCommand(numRounds);
  });

program
  .command("config [key] [value]")
  .description("View or update configuration")
  .action((key?: string, value?: string) => {
    configCommand(key, value);
  });

program
  .command("export")
  .description("Export session data to stdout")
  .option("--format <format>", "Output format: json or csv", "json")
  .action((options: { format: string }) => {
    if (options.format !== "json" && options.format !== "csv") {
      console.error(`Invalid format: "${options.format}". Use "json" or "csv".`);
      process.exit(1);
    }
    exportCommand(options.format);
  });

program
  .command("completions <shell>")
  .description("Generate shell completion script (bash, zsh, fish)")
  .action((shell: string) => {
    completionsCommand(shell);
  });

program.parse();
