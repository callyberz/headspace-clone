import { describe, it, expect } from "vitest";
import { formatDuration, parseDuration } from "../src/utils/format.js";

describe("formatDuration", () => {
  it("formats seconds under a minute", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(59)).toBe("0:59");
  });

  it("formats full minutes", () => {
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(300)).toBe("5:00");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(125)).toBe("2:05");
  });

  it("formats hours", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(7200)).toBe("2:00:00");
  });

  it("clamps negative values to 0", () => {
    expect(formatDuration(-10)).toBe("0:00");
  });

  it("ceils fractional seconds", () => {
    expect(formatDuration(0.1)).toBe("0:01");
    expect(formatDuration(59.1)).toBe("1:00");
  });
});

describe("parseDuration", () => {
  it("treats bare numbers as minutes", () => {
    expect(parseDuration("5")).toBe(300);
    expect(parseDuration("10")).toBe(600);
    expect(parseDuration("0")).toBe(0);
  });

  it("parses minute notation", () => {
    expect(parseDuration("5m")).toBe(300);
    expect(parseDuration("1m")).toBe(60);
  });

  it("parses second notation", () => {
    expect(parseDuration("90s")).toBe(90);
    expect(parseDuration("30s")).toBe(30);
  });

  it("parses hour notation", () => {
    expect(parseDuration("1h")).toBe(3600);
    expect(parseDuration("2h")).toBe(7200);
  });

  it("parses combined notations", () => {
    expect(parseDuration("1h30m")).toBe(5400);
    expect(parseDuration("5m30s")).toBe(330);
    expect(parseDuration("1h5m10s")).toBe(3910);
  });

  it("trims whitespace and is case-insensitive", () => {
    expect(parseDuration("  5M  ")).toBe(300);
    expect(parseDuration("1H30M")).toBe(5400);
  });

  it("returns null for invalid input", () => {
    expect(parseDuration("")).toBeNull();
    expect(parseDuration("abc")).toBeNull();
    expect(parseDuration("m")).toBeNull();
    expect(parseDuration("5x")).toBeNull();
  });
});
