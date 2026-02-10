import chalk from "chalk";
import { getConfig, setConfig } from "../store/config.js";

const VALID_KEYS = ["defaultDuration", "theme"] as const;

function parseValue(key: string, raw: string): number | string {
  if (key === "defaultDuration") {
    const n = Number(raw);
    if (isNaN(n) || n <= 0) {
      console.error(chalk.red(`Invalid value for defaultDuration: "${raw}". Must be a positive number (seconds).`));
      process.exit(1);
    }
    return n;
  }
  return raw;
}

export function configCommand(key?: string, value?: string): void {
  const cfg = getConfig();

  // List all config values
  if (!key) {
    console.log();
    console.log(chalk.bold("  Configuration"));
    console.log();
    for (const [k, v] of Object.entries(cfg)) {
      console.log(`  ${chalk.cyan(k)}  ${v}`);
    }
    console.log();
    return;
  }

  // Validate key
  if (!VALID_KEYS.includes(key as any)) {
    console.error(chalk.red(`Unknown config key: "${key}". Valid keys: ${VALID_KEYS.join(", ")}`));
    process.exit(1);
  }

  // Get single value
  if (value === undefined) {
    console.log(cfg[key as keyof typeof cfg]);
    return;
  }

  // Set value
  const parsed = parseValue(key, value);
  setConfig(key as any, parsed as any);
  console.log(chalk.green(`Set ${key} = ${parsed}`));
}
