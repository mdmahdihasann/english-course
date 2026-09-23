/*
 * Bangla → English translation helpers shared by the in-browser translator
 * and scripts/i18n-build.mts (which pre-translates every string into src/data/i18n-en.json).
 * Keep this file free of DOM / Next imports.
 */

export const BN = /[ঀ-৿]/;

export const toLatinDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));

/**
 * Bangla inside “quotes” is the thing being taught (quiz prompts, meanings) — it must stay as-is.
 * It's swapped for a token (“ZQA”, “ZQB”…) that survives translation, and put back afterwards.
 */
export function mask(text: string) {
  const parts: string[] = [];
  const masked = text.replace(/“[^”]*”/g, (q) => {
    if (!BN.test(q) || parts.length >= 26) return q;
    parts.push(q);
    return "“ZQ" + String.fromCharCode(64 + parts.length) + "”";
  });
  return { masked, parts };
}

export function unmask(out: string, parts: string[]) {
  let res = out;
  for (let i = 0; i < parts.length; i++) {
    const re = new RegExp(`["“”]?\\s*ZQ${String.fromCharCode(65 + i)}\\b\\s*["“”]?`);
    if (!re.test(res)) return null;
    res = res.replace(re, () => parts[i]);
  }
  return res;
}

/** Lookup key: whitespace collapsed, digits templated so "৩টা কার্ড" and "৭টা কার্ড" share one entry. */
export function keyOf(s: string) {
  const plain = toLatinDigits(s).replace(/\s+/g, " ").trim();
  const nums = plain.match(/\d+/g) ?? [];
  return { key: plain.replace(/\d+/g, "{n}"), nums, plain };
}

export function fill(tpl: string, nums: string[]) {
  let i = 0;
  return tpl.replace(/\{n\}/g, () => nums[i++] ?? "");
}

/** Turn a fresh translation into a template — only when its numbers come back in the same order. */
export function toTemplate(out: string, nums: string[]) {
  const got = out.match(/\d+/g) ?? [];
  // "1st" / "3rd" don't survive a number swap
  if (/\d(st|nd|rd|th)\b/.test(out)) return null;
  if (got.length !== nums.length || got.some((g, i) => g !== nums[i])) return null;
  return out.replace(/\d+/g, "{n}");
}

/** Store one API result into a dictionary (templated when possible). */
export function remember(dict: Record<string, string>, plain: string, out: string) {
  const { key, nums } = keyOf(plain);
  const tpl = nums.length ? toTemplate(out, nums) : out;
  if (tpl !== null) dict[key] = tpl;
  else dict[plain] = out;
}

export function lookup(dict: Record<string, string>, s: string): string | null {
  const { key, nums, plain } = keyOf(s);
  if (!BN.test(plain)) return plain;
  const t = dict[key];
  if (t !== undefined) return fill(t, nums);
  return dict[plain] ?? null;
}

const fixI = (s: string) => s.replace(/\bi\b/g, "I").replace(/\bi'/g, "I'");
export const cap = (s: string) => s.replace(/^(\s*[^\p{L}\s]*)(\p{Ll})/u, (_, a: string, b: string) => a + b.toUpperCase());

/** Translate a whole text using `get` for the Bangla; null when the translation isn't known yet. */
export function translateText(text: string, get: (plain: string) => string | null) {
  const lead = text.match(/^\s*/)![0];
  const trail = text.match(/\s*$/)![0];
  const { masked, parts } = mask(text.slice(lead.length, text.length - trail.length || undefined));
  if (!BN.test(masked)) return text;
  const v = get(masked);
  if (v === null) return null;
  // a token got lost in translation — better to show the original than lose the quoted Bangla
  const out = unmask(v, parts);
  return out === null ? text : lead + cap(out) + trail;
}

const API = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=bn&tl=en&dt=t";

async function call(q: string, f: typeof fetch) {
  const r = await f(API, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: "q=" + encodeURIComponent(q),
  });
  if (!r.ok) throw new Error("translate " + r.status);
  const j = (await r.json()) as [[string, ...unknown[]][]];
  return j[0].map((x) => x[0]).join("");
}

/** Translate plain (single-line) strings in as few requests as possible. */
export async function translateMany(list: string[], f: typeof fetch = fetch, maxChars = 1500): Promise<string[]> {
  const out: string[] = new Array(list.length);
  const chunks: number[][] = [];
  let cur: number[] = [];
  let len = 0;
  list.forEach((s, i) => {
    if (cur.length && len + s.length > maxChars) {
      chunks.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(i);
    len += s.length + 1;
  });
  if (cur.length) chunks.push(cur);

  for (const c of chunks) {
    const res = (await call(c.map((i) => list[i]).join("\n"), f)).split("\n");
    if (res.length === c.length) c.forEach((i, k) => (out[i] = fixI(res[k].trim())));
    // lines got merged or split — fall back to one request per string
    else for (const i of c) out[i] = fixI((await call(list[i], f)).replace(/\s+/g, " ").trim());
  }
  return out;
}
