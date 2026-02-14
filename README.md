# hs-meditate

A minimal CLI meditation tool for developers. Take mindful breaks without leaving your terminal.

`hs` provides guided breathing exercises, mindful pauses, and box breathing sessions — all rendered as interactive terminal UI using [Ink](https://github.com/vadimdemedes/ink) (React for CLIs).

## Features

- **Breath Awareness** — Guided breathing with a visual pacer bar. Inhale, hold, exhale with customizable breathing patterns.
- **Mindful Break** — A shorter, gentler pause using the same breathing pacer. Defaults to 2 minutes.
- **Box Breathing** — The classic 4-4-4-4 technique (inhale, hold, exhale, hold) with an animated box visualization. A dot traces the perimeter of a box in your terminal, one side per phase.
- **Custom Breathing Patterns** — Choose from built-in presets (4-4-4, 4-7-8 relaxing, 5-5 coherent, 4-4-4-4 box) or define your own via `--pattern`.
- **Session Pause/Resume** — Press Space or `p` to pause a running session and resume without losing progress.
- **Session Tracking** — Every session is recorded in a local SQLite database. View your practice summary, streaks, and weekly stats.
- **Session History Browser** — Browse past sessions in a paginated, scrollable list from the interactive menu.
- **Export Data** — Export your full session history to CSV or JSON for use in other tools.
- **Theme System** — Three visual themes (default, minimal, focus) with distinct color palettes and breathing bar styles.
- **Interactive Menu** — Run `hs` with no arguments to get a full interactive menu with arrow-key navigation. Browse meditation types, pick patterns and durations, view stats, and change settings without memorizing commands.
- **Shell Completions** — Generate tab-completion scripts for bash, zsh, and fish.
- **Configurable** — Set your default session duration and visual theme. Settings persist across sessions via [Conf](https://github.com/sindresorhus/conf).

## Installation

Requires **[Bun](https://bun.sh)**.

```bash
# Clone the repository
git clone https://github.com/your-username/headspace-clone.git
cd headspace-clone

# Install dependencies
bun install

# Build
bun run build

# Link globally so you can use `hs` anywhere
bun link
```

After linking, the `hs` command is available in your terminal.

## Usage

### Interactive menu

Run `hs` with no arguments to launch the interactive menu:

```bash
hs
```

This presents a navigable list of all available features. Use the arrow keys to move, Enter to select, and Esc to go back. Double-tap Esc to quit from any menu screen.

When selecting Breath Awareness, you'll first pick a breathing pattern, then a duration. All sessions launched from the menu stay within the same UI — pressing Esc during or after a session returns you to the main menu instead of exiting the app.

### Direct commands

You can also launch sessions directly from the command line, bypassing the menu entirely:

```bash
# Breath awareness (default duration from config, or specify one)
hs breathe
hs breathe 5m
hs breathe 90s
hs breathe 1h30m

# Breath awareness with a specific pattern
hs breathe --pattern 4-7-8 5m
hs breathe --pattern 5-5 3m

# Mindful break (default: 2 minutes)
hs break
hs break 3m

# Box breathing (default: 4 rounds)
hs box-breathing
hs box-breathing 6

# View stats
hs stats

# View or update configuration
hs config
hs config defaultDuration
hs config defaultDuration 600
hs config theme minimal

# Export session history
hs export                  # JSON to stdout (default)
hs export --format csv     # CSV to stdout
hs export --format json    # JSON to stdout

# Generate shell completions
hs completions bash
hs completions zsh
hs completions fish
```

### Breathing patterns

Built-in patterns available via `--pattern` or the interactive menu:

| Pattern | Name | Phases |
|---------|------|--------|
| `4-4-4` | Standard | Inhale 4s, Hold 4s, Exhale 4s |
| `4-7-8` | Relaxing | Inhale 4s, Hold 7s, Exhale 8s |
| `5-5` | Coherent | Inhale 5s, Exhale 5s |
| `4-4-4-4` | Box | Inhale 4s, Hold 4s, Exhale 4s, Hold 4s |

You can also specify custom patterns as dash-separated seconds (e.g., `--pattern 3-6-9`).

### Duration format

Durations accept flexible formats:

| Input | Meaning |
|-------|---------|
| `5` | 5 minutes |
| `5m` | 5 minutes |
| `90s` | 90 seconds |
| `1h` | 1 hour |
| `1h30m` | 1 hour 30 minutes |
| `5m30s` | 5 minutes 30 seconds |

### Keyboard controls

| Key | Action |
|-----|--------|
| `Up` / `Down` | Navigate menu items |
| `Left` / `Right` | Navigate history pages |
| `Enter` | Select / start session |
| `Space` / `p` | Pause / resume a running session |
| `Esc` | Go back one screen |
| `Esc` `Esc` | Quit the app (from menu screens, within 400ms) |

### Themes

Three visual themes are available, configurable via `hs config theme <name>` or the Settings menu:

| Property | default | minimal | focus |
|----------|---------|---------|-------|
| Primary color | cyan | white | magenta |
| Secondary color | blue | gray | blue |
| Success color | green | white | green |
| Warning color | yellow | white | yellow |
| Bar fill | `━` | `=` | `█` |
| Bar empty | `─` | `-` | `░` |
| Dot | `●` | `o` | `◉` |

### Shell completions

To enable tab completion, add the output of the completions command to your shell config:

```bash
# Bash (~/.bashrc)
eval "$(hs completions bash)"

# Zsh (~/.zshrc)
eval "$(hs completions zsh)"

# Fish (~/.config/fish/config.fish)
hs completions fish | source
```

## How it works

### Breathing visualizations

**Breath Awareness & Mindful Break** display a progress bar that fills during inhale, stays full during hold, and empties during exhale:

```
Breathe in
━━━━━━━━━━━━────────
```

**Box Breathing** renders an ASCII box with a dot that traces the perimeter — up the left side (inhale), across the top (hold), down the right side (exhale), across the bottom (hold):

```
Breathe in
          →
  ╭──────────────────╮
  │                  │
↑ │                  │
  │                  │
  ╰──────────────────╯

Round 1 of 4
```

### Session tracking

Sessions are stored in a SQLite database at:

- **macOS**: `~/Library/Application Support/hs-meditate/history.db`
- **Linux**: `~/.local/share/hs-meditate/history.db` (or `$XDG_DATA_HOME`)
- **Windows**: `%APPDATA%/hs-meditate/history.db`

Each session records: start time, end time, actual duration, planned duration, meditation type, and whether it was completed in full.

The stats screen shows:

- Total sessions and total meditation time
- Current streak and longest streak (consecutive days)
- Today's, yesterday's, and this week's session counts and times

### Configuration

Settings are stored via [Conf](https://github.com/sindresorhus/conf) (OS-native config directory) and persist across sessions.

| Key | Default | Description |
|-----|---------|-------------|
| `defaultDuration` | `300` (5 min) | Default session duration in seconds when none is specified |
| `theme` | `default` | Visual theme (`default`, `minimal`, `focus`) |

You can update settings interactively from the menu (Settings screen) or directly via the CLI:

```bash
hs config defaultDuration 600   # Set default to 10 minutes
hs config theme minimal         # Switch theme
```

## Project structure

```
src/
  index.tsx              # CLI entry point (Commander.js argument parsing)
  commands/
    menu.tsx             # Interactive menu launcher
    breathe.tsx          # Direct CLI: breath awareness session
    break.tsx            # Direct CLI: mindful break session
    box-breathing.tsx    # Direct CLI + component: box breathing session
    stats.ts             # Direct CLI: print stats to stdout
    config.ts            # Direct CLI: view/set config from command line
    export.ts            # Direct CLI: export session data to CSV/JSON
    completions.ts       # Direct CLI: generate shell completion scripts
  engine/
    patterns.ts          # Breathing pattern definitions and parser
  ui/
    theme.ts             # Theme color and character definitions
    ThemeContext.tsx      # React context provider and useTheme() hook
    Menu.tsx             # Main interactive menu (hosts all screens)
    SelectList.tsx       # Reusable arrow-key select list component
    App.tsx              # Breath awareness / mindful break session screen
    BreathingIndicator.tsx  # Animated breathing progress bar
    BoxBreathingViz.tsx  # Animated box breathing visualization
    Timer.tsx            # Countdown timer display
    SessionComplete.tsx  # Post-session completion screen
    StatsScreen.tsx      # Stats display (Ink-based, for menu context)
    ConfigScreen.tsx     # Interactive settings editor (for menu context)
    HistoryScreen.tsx    # Paginated session history browser
  store/
    db.ts                # SQLite database setup and connection
    history.ts           # Session CRUD and stats queries
    config.ts            # Persistent config via Conf
  utils/
    format.ts            # Duration parsing and formatting
test/
  format.test.ts         # Duration parser tests
  history.test.ts        # Session history and streak tests
  patterns.test.ts       # Breathing pattern parsing tests
  export.test.ts         # Export formatting tests
```

## Tech stack

- **[Ink](https://github.com/vadimdemedes/ink)** — React-based terminal UI framework
- **[React](https://react.dev)** — Component model and hooks (`useState`, `useEffect`, `useInput`)
- **[Commander.js](https://github.com/tj/commander.js)** — CLI argument parsing and subcommand routing
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** — Synchronous SQLite for session history
- **[Conf](https://github.com/sindresorhus/conf)** — Persistent user configuration
- **[Bun](https://bun.sh)** — JavaScript runtime and package manager
- **[tsup](https://github.com/egoist/tsup)** — TypeScript bundler (ESM output)
- **[Vitest](https://vitest.dev)** — Test runner

## Development

```bash
# Watch mode (rebuilds on file changes)
bun run dev

# Run tests
bun run test

# Run tests in watch mode
bun run test:watch

# Build for production
bun run build

# Run without global install
bun dist/index.js
```

## Accessibility

Set `NO_COLOR=1` to disable color output for terminals that don't support ANSI colors.

The tool checks terminal dimensions on startup and warns if your terminal is smaller than 40x12 characters.

## Roadmap

Features and improvements planned for future releases:

### Meditation content

- **Guided meditation sessions** — Audio-free guided prompts that display timed instructions (body scan, loving-kindness, focus meditation) as text in the terminal
- **Ambient soundscapes** — Optional terminal bell or system sound cues at phase transitions (inhale/exhale) for eyes-free sessions
- **Daily intention prompts** — Short journaling prompt before or after sessions, saved alongside session history

### Tracking and insights

- **Weekly/monthly reports** — Richer stats breakdowns with charts rendered in the terminal (sparklines, bar charts for weekly trends)
- **Goals and reminders** — Set daily meditation goals (e.g., "10 minutes per day") and see progress toward them in the stats screen

### User experience

- **Custom durations in menu** — Allow typing a custom duration in the picker instead of only preset options
- **Notifications** — Optional system notifications for session reminders at configurable intervals

### Technical

- **npm publishing** — Publish to npm as a global CLI tool (`bun add -g hs-meditate`)
- **CI/CD pipeline** — GitHub Actions for automated testing, linting, and release publishing
- **Plugin system** — Allow third-party meditation techniques to be added as plugins
- **Cross-platform testing** — Ensure consistent behavior on macOS, Linux, and Windows terminals

## License

MIT
