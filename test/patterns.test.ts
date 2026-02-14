import { describe, it, expect } from "vitest";
import {
  BUILTIN_PATTERNS,
  getPatternById,
  parseCustomPattern,
} from "../src/engine/patterns.js";

describe("BUILTIN_PATTERNS", () => {
  it("has 4 built-in patterns", () => {
    expect(BUILTIN_PATTERNS).toHaveLength(4);
  });

  it("each pattern has correct cycleMs", () => {
    for (const pattern of BUILTIN_PATTERNS) {
      const sum = pattern.phases.reduce((acc, p) => acc + p.durationMs, 0);
      expect(pattern.cycleMs).toBe(sum);
    }
  });

  it("each pattern has at least 2 phases", () => {
    for (const pattern of BUILTIN_PATTERNS) {
      expect(pattern.phases.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("4-4-4 pattern has 3 phases totaling 12s", () => {
    const p = BUILTIN_PATTERNS[0];
    expect(p.id).toBe("4-4-4");
    expect(p.phases).toHaveLength(3);
    expect(p.cycleMs).toBe(12000);
  });

  it("4-7-8 pattern has correct durations", () => {
    const p = BUILTIN_PATTERNS[1];
    expect(p.id).toBe("4-7-8");
    expect(p.phases[0].durationMs).toBe(4000);
    expect(p.phases[1].durationMs).toBe(7000);
    expect(p.phases[2].durationMs).toBe(8000);
    expect(p.cycleMs).toBe(19000);
  });

  it("4-4-4-4 pattern has 4 phases totaling 16s", () => {
    const p = BUILTIN_PATTERNS[3];
    expect(p.id).toBe("4-4-4-4");
    expect(p.phases).toHaveLength(4);
    expect(p.cycleMs).toBe(16000);
  });
});

describe("getPatternById", () => {
  it("returns a pattern by id", () => {
    const p = getPatternById("4-7-8");
    expect(p).toBeDefined();
    expect(p!.id).toBe("4-7-8");
  });

  it("returns undefined for unknown id", () => {
    expect(getPatternById("unknown")).toBeUndefined();
  });
});

describe("parseCustomPattern", () => {
  it("parses a valid pattern string", () => {
    const p = parseCustomPattern("3-6-9");
    expect(p).not.toBeNull();
    expect(p!.phases).toHaveLength(3);
    expect(p!.phases[0].durationMs).toBe(3000);
    expect(p!.phases[1].durationMs).toBe(6000);
    expect(p!.phases[2].durationMs).toBe(9000);
    expect(p!.cycleMs).toBe(18000);
  });

  it("parses a 2-phase pattern", () => {
    const p = parseCustomPattern("5-5");
    expect(p).not.toBeNull();
    expect(p!.phases).toHaveLength(2);
    expect(p!.cycleMs).toBe(10000);
  });

  it("parses a 4-phase pattern", () => {
    const p = parseCustomPattern("4-4-4-4");
    expect(p).not.toBeNull();
    expect(p!.phases).toHaveLength(4);
    expect(p!.cycleMs).toBe(16000);
  });

  it("returns null for invalid input", () => {
    expect(parseCustomPattern("")).toBeNull();
    expect(parseCustomPattern("abc")).toBeNull();
    expect(parseCustomPattern("4")).toBeNull();
    expect(parseCustomPattern("0-4")).toBeNull();
    expect(parseCustomPattern("-4-4")).toBeNull();
  });

  it("assigns appropriate phase names", () => {
    const p = parseCustomPattern("3-3-3");
    expect(p!.phases[0].name).toBe("inhale");
    expect(p!.phases[1].name).toBe("hold");
    expect(p!.phases[2].name).toBe("exhale");
  });
});
