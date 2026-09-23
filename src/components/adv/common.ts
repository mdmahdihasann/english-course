export type Mode = "polish" | "idioms" | "errors" | "colloc" | "formal";
export type AdvStats = { best: Partial<Record<Mode, number>>; rounds: number; fixes: number };
export const NO_ADV: AdvStats = { best: {}, rounds: 0, fixes: 0 };
export const ROUND = 10;

/** record a finished round: best score + round count */
export const withRound = (mode: Mode, score: number) => (s: AdvStats): AdvStats => ({
  ...s,
  rounds: s.rounds + 1,
  best: { ...s.best, [mode]: Math.max(s.best[mode] ?? 0, score) },
});
