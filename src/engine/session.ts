import { Timer, type TimerState } from "./timer.js";

export type SessionState =
  | "idle"
  | "preparing"
  | "active"
  | "paused"
  | "complete";

export type SessionEvents = {
  onStateChange?: (state: SessionState) => void;
  onTick?: (remaining: number, elapsed: number) => void;
  onComplete?: () => void;
};

export class Session {
  private state: SessionState = "idle";
  private timer: Timer | null = null;
  private durationSeconds: number;
  private events: SessionEvents;
  private startedAt: Date | null = null;
  private completedAt: Date | null = null;

  constructor(durationSeconds: number, events: SessionEvents = {}) {
    this.durationSeconds = durationSeconds;
    this.events = events;
  }

  /** Transition to preparing state (show instructions, wait for user) */
  prepare(): void {
    if (this.state !== "idle") return;
    this.setState("preparing");
  }

  /** Begin the timed session */
  start(): void {
    if (this.state !== "idle" && this.state !== "preparing") return;
    this.startedAt = new Date();
    this.timer = new Timer(this.durationSeconds, {
      onTick: (remaining, elapsed) => {
        this.events.onTick?.(remaining, elapsed);
      },
      onComplete: () => {
        this.completedAt = new Date();
        this.setState("complete");
        this.events.onComplete?.();
      },
    });
    this.setState("active");
    this.timer.start();
  }

  pause(): void {
    if (this.state !== "active") return;
    this.timer?.pause();
    this.setState("paused");
  }

  resume(): void {
    if (this.state !== "paused") return;
    this.timer?.resume();
    this.setState("active");
  }

  /** End session early */
  stop(): void {
    if (this.state === "idle" || this.state === "complete") return;
    this.completedAt = new Date();
    this.timer?.stop();
    this.setState("complete");
  }

  getState(): SessionState {
    return this.state;
  }

  getTimerState(): TimerState | null {
    return this.timer?.getState() ?? null;
  }

  getElapsed(): number {
    return this.timer?.getElapsed() ?? 0;
  }

  getRemaining(): number {
    return this.timer?.getRemaining() ?? this.durationSeconds;
  }

  getDuration(): number {
    return this.durationSeconds;
  }

  getStartedAt(): Date | null {
    return this.startedAt;
  }

  getCompletedAt(): Date | null {
    return this.completedAt;
  }

  /** Whether the session ran for the full planned duration */
  isFullCompletion(): boolean {
    return this.state === "complete" && (this.timer?.getRemaining() ?? 1) === 0;
  }

  private setState(next: SessionState): void {
    this.state = next;
    this.events.onStateChange?.(next);
  }
}
