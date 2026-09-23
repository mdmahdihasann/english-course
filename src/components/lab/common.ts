export type LabStats = { reviews: number; built: number; dict: number; drillBest: number; drills: number };
export const NO_LAB: LabStats = { reviews: 0, built: 0, dict: 0, drillBest: 0, drills: 0 };

/** words of an English sentence, keeping punctuation attached */
export const tokens = (s: string) => s.split(/\s+/).filter(Boolean);

/** lowercase, straight apostrophes, no punctuation — for forgiving comparisons */
export const normWords = (t: string) =>
  t
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

/** Word-level diff (LCS) of an attempt against the target, for highlighting. */
export function diffWords(target: string, attempt: string) {
  const t = tokens(target);
  const tn = t.map((w) => normWords(w).join(""));
  const a = normWords(attempt);
  const m = tn.length;
  const n = a.length;
  const L = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) L[i][j] = tn[i] === a[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const words: { raw: string; ok: boolean }[] = [];
  const extra: string[] = [];
  let i = 0;
  let j = 0;
  while (i < m) {
    if (!tn[i]) {
      words.push({ raw: t[i++], ok: true });
    } else if (j < n && tn[i] === a[j]) {
      words.push({ raw: t[i++], ok: true });
      j++;
    } else if (j < n && L[i][j + 1] >= L[i + 1][j]) {
      extra.push(a[j++]);
    } else {
      words.push({ raw: t[i++], ok: false });
    }
  }
  while (j < n) extra.push(a[j++]);
  const scored = tn.filter(Boolean).length;
  const right = words.filter((w, k) => w.ok && tn[k]).length;
  const score = scored ? Math.round((right / (scored + extra.length * 0.5)) * 100) : 0;
  return { words, extra, score: Math.min(100, score), exact: right === scored && !extra.length };
}
