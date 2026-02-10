# CLI Meditation Tool: Three-Perspective Analysis

## 1. UX Designer's Take

**Core philosophy**: "Quiet confidence over cheerful enthusiasm." The tool should feel like a senior colleague who meditates, not a wellness app.

### Key Recommendations

- **Pull, not push** — manual invocation only by default. No unsolicited reminders unless the user opts in. Developers already have notification fatigue.
- **Two-phase interaction**: quick, efficient CLI invocation followed by a spacious, minimal practice phase. Don't try to make meditation "engaging" — engagement comes from genuine utility.
- **Tone matters**: no "Great job!" or emoji-laden encouragement. Understated, respectful, spacious. Think `git`, not Duolingo.
- **Session types to start with**: breath awareness, timed breathing (box breathing), body scan, micro-break. That's it.
- **Streaks without guilt**: show them, but don't punish breaks. "That's okay. What matters is showing up again."
- **Three commands cover 90% of use**: `breathe`, `break`, `stats`
- **Accessibility**: respect `NO_COLOR`, support screen readers via `--linear` mode, handle small terminal windows gracefully (min 40x12)

### Example First-Run

```
$ hs breathe 3m

  Meditation is simpler than you think:
  1. Sit comfortably
  2. Notice your breath
  3. When your mind wanders, gently return

  [Press ENTER to start]
```

### Interaction Patterns

Developers interact with their terminal in three distinct mental states:

- **Flow state**: Deep work, problem-solving, high concentration
- **Transition state**: Between tasks, context-switching, checking status
- **Frustrated state**: Stuck on a bug, tests failing, feeling overwhelmed

The tool should primarily target **transition states**, not interrupt flow.

### Session Design

**Visual breathing indicators:**

```
  Breath Awareness — 5 minutes

  Follow your natural breath.
  When your mind wanders, gently return.

  Breathe in...                    ●

  Hold...                          ●●

  Breathe out...                   ●●●

  [2:34 remaining]                          q to quit
```

**Box breathing visualization:**

```
  Box Breathing — 4 rounds

              ╭─────────╮
              │         │  Hold (4s)
              │         │
   Breathe in │    ●    │ Breathe out
       (4s)   │         │    (4s)
              │         │
              ╰─────────╯
                Hold (4s)

  Round 2 of 4
```

### Sound Integration

- Default to visual-only
- Offer optional bell/chime via system notification sound
- Never require audio

### Workflow Integration

- **Manual invocation by default** — no push notifications
- **Optional, user-controlled reminders**: `hs remind every 2h during 9am-5pm`
- **Git integration**: suggest breaks after detecting bursts of commits, don't interrupt flow
- **Pomodoro integration**: auto-trigger breathing during pomodoro breaks

### Onboarding & Progression

- Demystify immediately — no ceremony, no special knowledge required
- Progressive disclosure: don't dump all features upfront
- Customization over gamification (no badges, leaderboards, points)
- Show streaks but don't emphasize or punish breaks

### Stats & History

```
$ hs stats

  Practice Summary

  Total sessions:     47
  Total time:         3h 42m
  Current streak:     12 days
  Longest streak:     18 days

  Recent practice:
  Today:      2 sessions (8 min)
  Yesterday:  1 session  (5 min)
  This week:  9 sessions (41 min)
```

### Accessibility

- Use terminal's default colors for most text
- Support `NO_COLOR` environment variable and `--no-color` flag
- Detect screen readers and switch to `--linear` mode
- Minimum viable terminal size: 40x12
- Test across Terminal.app, iTerm2, Alacritty, Kitty, WSL, GNOME Terminal, tmux/screen

### Command Structure

```bash
# Basic sessions
hs breathe [duration]           # Unguided breath awareness
hs break [duration]             # Quick mindful break
hs body-scan [duration]         # Guided body scan
hs box-breathing [rounds]       # Structured breathing

# Configuration
hs config [key] [value]         # Set configuration
hs remind [schedule]            # Set reminders
hs sounds [enable|disable]      # Toggle sounds

# Tracking & history
hs stats                        # Show statistics
hs log                          # Session history
hs export                       # Export data
```

### Implementation Priority

- **Phase 1 (MVP):** `breathe` command with timer, `break` command (2min default), simple session log
- **Phase 2 (Refinement):** Visual breathing indicators, `body-scan`, `stats`, configuration
- **Phase 3 (Polish):** Sound integration, accessibility mode, custom session templates, export

---

## 2. Architect's Take

### Technology Recommendation: TypeScript with Ink

| Aspect | Recommendation | Why |
|---|---|---|
| Language | TypeScript | Type safety, fast iteration, huge ecosystem |
| TUI Framework | Ink (React for CLI) | Component-based, declarative rendering, battle-tested |
| Styling | Chalk | ANSI color support, auto-detects color level |
| CLI Framework | Commander | Industry standard, subcommands, auto-help generation |
| Prompts | Inquirer / @inquirer/prompts | Interactive prompts when needed |
| Animations | cli-spinners + ora | Smooth terminal animations |
| Box Drawing | boxen + cli-boxes | Bordered UI elements for breathing visualizations |
| Progress | cli-progress | Timer bars and progress indicators |
| Figures | figures | Cross-platform Unicode symbols with fallbacks |
| Content | YAML with timed timelines | Human-readable, version-controllable |
| Config | conf (or cosmiconfig) | XDG-compliant, JSON-based, type-safe |
| History | better-sqlite3 | Queryable, ACID, synchronous API, fast |
| Distribution | npm + npx + Homebrew | `npx hs breathe 3m` works instantly |
| Bundling | tsup (esbuild) | Fast builds, single-file output possible |

### Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Entry Point                      │
│                    (Argument Parsing, Dispatch)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐          ┌─────────▼────────┐
│  Command Layer  │          │   TUI Manager    │
│  (Quick actions)│          │ (Interactive UI) │
└───────┬────────┘          └─────────┬────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
        ┌──────────────┴─────────────────────────┐
        │                                        │
┌───────▼─────────┐                   ┌──────────▼─────────┐
│ Session Engine  │◄──────────────────┤ Content Manager    │
│ - Timer control │                   │ - Load meditations │
│ - State machine │                   │ - Parse metadata   │
│ - Progress track│                   │ - Timed delivery   │
└───────┬─────────┘                   └──────────┬─────────┘
        │                                        │
        └──────────────┬─────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐          ┌─────────▼────────┐
│ State Manager  │          │ Renderer Engine  │
│ - Persistence  │          │ - Animations     │
│ - Stats/streaks│          │ - Visualizations │
│ - Preferences  │          │ - Layout engine  │
└───────┬────────┘          └─────────┬────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
              ┌────────▼──────────┐
              │ Plugin System      │
              │ - Custom content   │
              │ - Integrations     │
              │ - Theme engine     │
              └────────────────────┘
```

### Project Structure

```
hs/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── src/
│   ├── index.ts              # CLI entry point (Commander setup)
│   ├── commands/
│   │   ├── breathe.ts        # Breath awareness session
│   │   ├── break.ts          # Quick mindful break
│   │   ├── box-breathing.ts  # Structured breathing
│   │   ├── body-scan.ts      # Guided body scan
│   │   └── stats.ts          # Statistics display
│   ├── ui/
│   │   ├── App.tsx           # Root Ink component
│   │   ├── BreathingCircle.tsx
│   │   ├── BoxBreathingViz.tsx
│   │   ├── Timer.tsx
│   │   └── SessionComplete.tsx
│   ├── engine/
│   │   ├── session.ts        # Session state machine
│   │   ├── timer.ts          # Precision timer with pause/resume
│   │   └── content.ts        # YAML meditation loader
│   ├── store/
│   │   ├── db.ts             # better-sqlite3 setup & migrations
│   │   ├── history.ts        # Session history queries
│   │   ├── streaks.ts        # Streak calculation
│   │   └── config.ts         # User preferences (conf)
│   └── utils/
│       ├── terminal.ts       # Terminal size detection, color support
│       └── format.ts         # Duration formatting, etc.
├── content/
│   └── meditations/          # YAML meditation scripts
└── test/
    └── ...
```

### 7 Core Modules

1. **CLI Entry Point** — argument parsing with Commander, subcommand routing, environment detection (`process.stdout.columns`, `chalk.level`)
2. **Commands** — each command maps to an Ink app or a quick non-interactive output
3. **UI Components (Ink/React)** — declarative TUI components: breathing visualizations, timers, session screens. Ink handles the render loop and diffing automatically
4. **Session Engine** — state machine: `Idle → Preparing → Active → Paused → Complete`, timer with `process.hrtime.bigint()` for sub-ms precision
5. **Content Manager** — loads YAML meditation scripts via `js-yaml`, manages timed content delivery queue
6. **Store** — better-sqlite3 for session history, streaks, preferences. Synchronous API keeps code simple
7. **Utils** — terminal capability detection, duration formatting, graceful degradation helpers

### Content Format: Structured YAML with Timed Timelines

```yaml
# meditations/focus-10min.yaml
metadata:
  id: focus-10min
  title: "Focus Meditation"
  duration: 600
  category: focus
  difficulty: beginner
  tags: [work, concentration, midday]

timeline:
  - at: 0
    type: instruction
    content: |
      Find a comfortable seated position.
      Let your hands rest gently in your lap.

  - at: 30
    type: instruction
    content: "Close your eyes, or soften your gaze downward."

  - at: 60
    type: breathing_cue
    pattern: "4-4-4"
    cycles: 3
    content: "Let's begin with three deep breaths."

  - at: 120
    type: instruction
    content: |
      Notice the sensation of your breath.
      Feel the air entering your nostrils.

  - at: 600
    type: completion
    content: "Well done. Take this calm focus into your next task."
```

### State & Data

**Directory structure (XDG via `conf` or `env-paths`):**

```
# macOS: ~/Library/Application Support/hs/
# Linux: ~/.config/hs/
├── config.json
├── history.db
└── plugins/
```

**SQLite schema:**

```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    duration_seconds INTEGER NOT NULL,
    planned_duration INTEGER NOT NULL,
    meditation_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0
);

CREATE TABLE streaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date TEXT NOT NULL,
    end_date TEXT,
    session_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT 1
);
```

### Terminal Rendering

- Ink handles the React-style render loop with smart diffing (only redraws what changed)
- Breathing animations via `useEffect` + `setInterval` with easing functions
- Chalk auto-detects color support: truecolor → 256 → 16 → no color
- Respects `NO_COLOR` env var and `--no-color` flag via chalk's built-in support
- `figures` package handles Unicode symbol fallbacks on Windows
- Responsive layout via `useStdout()` hook — adapts to terminal resize events

### Distribution

- **npm**: `npm install -g hs-meditate` (primary)
- **npx**: `npx hs-meditate breathe 3m` (zero-install, try instantly)
- **Homebrew**: `brew install hs` (convenience for macOS)
- **GitHub Releases**: optional, via `pkg` or `bun build --compile` for standalone binaries
- Node.js 18+ required (LTS)

### Plugin System

- **Content plugins**: YAML meditation packs in `~/.config/hs/plugins/`
- **Integration hooks**: shell scripts triggered on lifecycle events (pre_session_start, session_completed, etc.)
- **Themes**: JSON-based color/symbol definitions loaded via `conf`

### Architectural Principles

1. Fast startup (< 200ms with Node.js, acceptable for interactive CLI)
2. Offline-first (never require network)
3. Calm technology (smooth, unhurried UI)
4. Privacy by default (local data, no telemetry)
5. Graceful degradation (works in any terminal)
6. Community-extensible (easy to share meditations/themes)
7. Rapid development (TypeScript ecosystem enables fast iteration)

### Implementation Roadmap

- **Phase 1 MVP (2-3 weeks):** CLI with `hs breathe`, 5 embedded meditations, basic Ink timer UI, breathing viz with Chalk, SQLite history, JSON config, npm publish
- **Phase 2 Polish (1-2 weeks):** Advanced breathing visuals, `body-scan`, `stats` command, streaks, themes, shell completions (via Commander)
- **Phase 3 Extensibility (2-3 weeks):** Plugin system, hooks, plugin registry, Pomodoro/git integration

---

## 3. Devil's Advocate

### The Uncomfortable Truths

**Your audience is microscopic.** Developers who meditate AND prefer CLI AND will adopt a new tool = maybe 1,000 people worldwide. Existing tools tell the story:

- **Zenta**: 533 stars (the "success story")
- **Soji**: 77 stars, abandoned — tried everything, died of scope creep
- **CLI-meditation**: 0 stars

**The philosophical contradiction.** You're building a screen-based tool to help people escape screens. Real meditation means closing your eyes and stepping away from your desk. CLI meditation may just be a fig leaf for "never leave your terminal" culture.

**What already failed and why:**

- Soji tried Pomodoro + meditation + journaling + tracking. Classic scope creep, abandoned.
- Audio playback in terminals is a cross-platform nightmare (PulseAudio, PipeWire, CoreAudio, ALSA...)

**The 3-month abandonware risk.** Content creation is ongoing. Who writes the meditations? You're not a meditation teacher. Community contributions need moderation. Dependency maintenance grinds you down.

### What COULD Work: The "Unfair Advantage" Angles

#### 1. Pomodoro Break Companion

30-second breathing exercise auto-triggered after work sessions. Friction-free micro-interventions, not 20-minute guided sessions.

```bash
# After a pomodoro session ends
$ work-timer done  # triggers meditation-cli
$ meditation-cli quick-breathe --cycles 3
# 30-second breathing exercise, then back to work
```

#### 2. Mindful Git

Intercept commits with a 3-breath pause. Catches rage commits, promotes clearer commit messages.

```bash
$ git commit
# Instead of immediate commit:
> Before committing, take 3 breaths.
> [breath cycle animation]
> Now write your commit message with a clear mind.
```

#### 3. Error Message Mindfulness

Wrap `npm test` or `cargo build`. On failure, insert a 10-second breathing pause before showing errors. Prevents panic-driven debugging.

```bash
$ mindful npm test
# On test failure:
> Tests failed. Before diving into fixes:
> [3-breath cycle, 10 seconds]
> Now you're ready to debug clearly.
> [show error output]
```

### The Verdict

- **Market is tiny**: ~1,000 potential daily users worldwide
- **Existing tools are good enough**: Zenta already does this (533 stars, maintained)
- **Philosophical contradiction**: Terminal meditation reinforces the problem it claims to solve
- **Technical nightmare**: Audio, terminal compatibility, cross-platform
- **Unsustainable**: Content creation + maintenance burden leads to burnout
- **Competitive graveyard**: Soji (abandoned), CLI-meditation (0 stars)

### The ONLY Way This Works

1. Be radically minimal: breathing pacer only, no audio, no content, no tracking
2. Integrate with existing workflows: Pomodoro breaks, git hooks, error wrappers
3. Solve a terminal-native problem: catching emotional states during coding
4. Stay small forever: resist every feature request that adds scope
5. Accept tiny audience: 500 stars in 3 years is success

---

## Where All Three Perspectives Agree

1. **Radical minimalism wins** — 3 commands, no bloat, no gamification
2. **Integration over standalone** — hook into existing workflows (Pomodoro, git), don't replace meditation apps
3. **Micro-interventions > long sessions** — 30-second breathing beats 20-minute guided meditation for adoption
4. **No push notifications** — pull-based, user-initiated only
5. **Privacy-first, local-only data**

## The Key Tension to Resolve

Is this a **standalone meditation app** (competing with Headspace) or a **workflow integration tool** (catching stress moments during coding)? The UX and architecture agents designed the former; the devil's advocate argues only the latter has legs. The sweet spot is probably a hybrid — a minimal standalone tool (`hs breathe 5m`) that *also* integrates into developer-specific moments (post-Pomodoro, pre-commit, post-error).
