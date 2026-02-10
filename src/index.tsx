import { Command } from "commander";
import { parseDuration } from "./utils/format.js";
import { breatheCommand } from "./commands/breathe.js";
import { breakCommand } from "./commands/break.js";
import { statsCommand } from "./commands/stats.js";
import { configCommand } from "./commands/config.js";

const program = new Command();

program
  .name("hs")
  .version("0.1.0")
  .description("A minimal CLI meditation tool for developers");

program
  .command("breathe [duration]")
  .description("Start a breath awareness session (default: 5m)")
  .action((duration?: string) => {
    const seconds = duration ? parseDuration(duration) : 5 * 60;
    if (seconds === null || seconds <= 0) {
      console.error(`Invalid duration: "${duration}". Try "5m", "90s", or "1h30m".`);
      process.exit(1);
    }
    breatheCommand(seconds);
  });

program
  .command("break [duration]")
  .description("Start a mindful break (default: 2m)")
  .action((duration?: string) => {
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
  .command("config [key] [value]")
  .description("View or update configuration")
  .action((key?: string, value?: string) => {
    configCommand(key, value);
  });

program.parse();
