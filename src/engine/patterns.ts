export interface BreathingPhase {
  name: string;
  label: string;
  durationMs: number;
}

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  phases: BreathingPhase[];
  cycleMs: number;
}

function makePattern(
  id: string,
  name: string,
  description: string,
  phases: BreathingPhase[],
): BreathingPattern {
  const cycleMs = phases.reduce((sum, p) => sum + p.durationMs, 0);
  return { id, name, description, phases, cycleMs };
}

export const BUILTIN_PATTERNS: BreathingPattern[] = [
  makePattern("4-4-4", "4-4-4 (Standard)", "Balanced breathing: inhale, hold, exhale", [
    { name: "inhale", label: "Breathe in", durationMs: 4000 },
    { name: "hold", label: "Hold", durationMs: 4000 },
    { name: "exhale", label: "Breathe out", durationMs: 4000 },
  ]),
  makePattern("4-7-8", "4-7-8 (Relaxing)", "Calming breath for sleep and anxiety", [
    { name: "inhale", label: "Breathe in", durationMs: 4000 },
    { name: "hold", label: "Hold", durationMs: 7000 },
    { name: "exhale", label: "Breathe out", durationMs: 8000 },
  ]),
  makePattern("5-5", "5-5 (Coherent)", "Simple coherent breathing for focus", [
    { name: "inhale", label: "Breathe in", durationMs: 5000 },
    { name: "exhale", label: "Breathe out", durationMs: 5000 },
  ]),
  makePattern("4-4-4-4", "4-4-4-4 (Box)", "Box breathing: inhale, hold, exhale, hold", [
    { name: "inhale", label: "Breathe in", durationMs: 4000 },
    { name: "hold-top", label: "Hold", durationMs: 4000 },
    { name: "exhale", label: "Breathe out", durationMs: 4000 },
    { name: "hold-bottom", label: "Hold", durationMs: 4000 },
  ]),
];

export function getPatternById(id: string): BreathingPattern | undefined {
  return BUILTIN_PATTERNS.find((p) => p.id === id);
}

export function parseCustomPattern(input: string): BreathingPattern | null {
  const parts = input.split("-").map((s) => parseInt(s, 10));
  if (parts.length < 2 || parts.some((n) => isNaN(n) || n <= 0)) return null;

  const phaseNames = ["inhale", "hold", "exhale", "hold-bottom"];
  const phaseLabels = ["Breathe in", "Hold", "Breathe out", "Hold"];

  const phases: BreathingPhase[] = parts.map((seconds, i) => ({
    name: phaseNames[i % phaseNames.length],
    label: phaseLabels[i % phaseLabels.length],
    durationMs: seconds * 1000,
  }));

  const id = parts.join("-");
  return makePattern(id, `Custom (${id})`, `Custom pattern: ${id}`, phases);
}
