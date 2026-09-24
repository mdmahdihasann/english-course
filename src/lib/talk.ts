/*
 * Checks a role-play answer against the expected line (and its alternatives).
 * Contractions are expanded first so "I am" and "I'm" count as the same answer.
 */
const CONTRACT: Record<string, string> = {
  "i'm": "i am", "you're": "you are", "we're": "we are", "they're": "they are", "he's": "he is", "she's": "she is",
  "it's": "it is", "that's": "that is", "what's": "what is", "here's": "here is", "there's": "there is", "where's": "where is",
  "let's": "let us", "can't": "can not", "cannot": "can not", "won't": "will not", "shan't": "shall not", "ain't": "is not",
  "i'd": "i would", "we'd": "we would", "you'd": "you would", "i'll": "i will", "we'll": "we will", "you'll": "you will",
  "i've": "i have", "we've": "we have", "you've": "you have", "they've": "they have",
};

const expand = (w: string) => CONTRACT[w] ?? w.replace(/n't$/, " not").replace(/'re$/, " are").replace(/'ll$/, " will").replace(/'ve$/, " have").replace(/'s$/, "");

/** a written word → its comparable tokens ("I'm" → ["i", "am"]) */
export const toks = (word: string) =>
  expand(word.toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9' ]+/g, "").replace(/^'+|'+$/g, ""))
    .split(" ")
    .filter(Boolean);

const words = (t: string) => t.split(/\s+/).filter((w) => toks(w).length);

/** longest common subsequence of two token lists → which indices matched on each side */
function lcs(a: string[], b: string[]) {
  const n = a.length, m = b.length;
  const d = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) d[i][j] = a[i] === b[j] ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
  const ia = new Set<number>(), ib = new Set<number>();
  for (let i = 0, j = 0; i < n && j < m; ) {
    if (a[i] === b[j]) {
      ia.add(i++);
      ib.add(j++);
    } else if (d[i + 1][j] >= d[i][j + 1]) i++;
    else j++;
  }
  return { ia, ib, len: d[0][0] };
}

export type Word = { w: string; ok: boolean };
export type Check = { score: number; said: Word[]; target: Word[]; missing: string[]; extra: string[]; answer: string };

function checkOne(target: string, said: string): Check {
  const tw = words(target), sw = words(said);
  // flatten words into tokens, remembering which word each token came from
  const flat = (ws: string[]) => ws.flatMap((w, i) => toks(w).map((t) => ({ t, i })));
  const ft = flat(tw), fs = flat(sw);
  const { ia, ib, len } = lcs(ft.map((x) => x.t), fs.map((x) => x.t));
  const bad = (f: { i: number }[], hit: Set<number>) => {
    const s = new Set<number>();
    f.forEach((x, k) => !hit.has(k) && s.add(x.i));
    return s;
  };
  const badT = bad(ft, ia), badS = bad(fs, ib);
  const score = ft.length + fs.length ? Math.round(((2 * len) / (ft.length + fs.length)) * 100) : 0;
  return {
    score,
    answer: target,
    target: tw.map((w, i) => ({ w, ok: !badT.has(i) })),
    said: sw.map((w, i) => ({ w, ok: !badS.has(i) })),
    missing: ft.filter((_, k) => !ia.has(k)).map((x) => x.t),
    extra: fs.filter((_, k) => !ib.has(k)).map((x) => x.t),
  };
}

/** best match among the main answer and its alternatives */
export function checkLine(answers: string[], said: string): Check {
  return answers.map((a) => checkOne(a, said)).reduce((best, c) => (c.score > best.score ? c : best));
}

/** "Nice to meet you." → "N___ t_ m___ y__." */
export const hintOf = (t: string) => t.replace(/[A-Za-z][A-Za-z']*/g, (w) => w[0] + (w.length > 1 ? w.slice(1).replace(/[A-Za-z]/g, "_") : "_"));

export const PASS = 70;

/** 3 XP for finishing, up to 10 for a perfect run */
export const xpFor = (score: number) => 3 + Math.round((7 * score) / 100);
