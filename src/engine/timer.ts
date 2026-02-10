export type TimerState = "idle" | "running" | "paused" | "complete";

export type TimerEvents = {
  onTick?: (remaining: number, elapsed: number) => void;
  onComplete?: () => void;
};

export class Timer {
  private durationMs: number;
  private elapsedMs = 0;
  private state: TimerState = "idle";
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastTickAt: bigint = 0n;
  private events: TimerEvents;

  constructor(durationSeconds: number, events: TimerEvents = {}) {
    this.durationMs = durationSeconds * 1000;
    this.events = events;
  }

  start(): void {
    if (this.state !== "idle") return;
    this.state = "running";
    this.lastTickAt = process.hrtime.bigint();
    this.startInterval();
  }

  pause(): void {
    if (this.state !== "running") return;
    this.accumulate();
    this.stopInterval();
    this.state = "paused";
  }

  resume(): void {
    if (this.state !== "paused") return;
    this.state = "running";
    this.lastTickAt = process.hrtime.bigint();
    this.startInterval();
  }

  stop(): void {
    if (this.state === "idle" || this.state === "complete") return;
    if (this.state === "running") this.accumulate();
    this.stopInterval();
    this.state = "complete";
  }

  getState(): TimerState {
    return this.state;
  }

  /** Elapsed time in seconds */
  getElapsed(): number {
    const extra =
      this.state === "running"
        ? Number(process.hrtime.bigint() - this.lastTickAt) / 1e6
        : 0;
    return (this.elapsedMs + extra) / 1000;
  }

  /** Remaining time in seconds */
  getRemaining(): number {
    return Math.max(0, this.durationMs / 1000 - this.getElapsed());
  }

  /** Total duration in seconds */
  getDuration(): number {
    return this.durationMs / 1000;
  }

  private accumulate(): void {
    const now = process.hrtime.bigint();
    this.elapsedMs += Number(now - this.lastTickAt) / 1e6;
    this.lastTickAt = now;
  }

  private startInterval(): void {
    this.intervalId = setInterval(() => {
      this.accumulate();

      if (this.elapsedMs >= this.durationMs) {
        this.elapsedMs = this.durationMs;
        this.stopInterval();
        this.state = "complete";
        this.events.onTick?.(0, this.durationMs / 1000);
        this.events.onComplete?.();
        return;
      }

      const remaining = (this.durationMs - this.elapsedMs) / 1000;
      const elapsed = this.elapsedMs / 1000;
      this.events.onTick?.(remaining, elapsed);
    }, 250);
  }

  private stopInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
