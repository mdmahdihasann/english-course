/*
 * Pre-translates every Bangla string in the app into src/data/i18n-en.json.
 *   node scripts/i18n-build.mts            → only translates strings not in the file yet
 *   node scripts/i18n-build.mts extra.json → also merges a runtime cache dump (localStorage "tr.en")
 * Strings built at runtime (numbers glued to words, template literals) are handled by the
 * in-browser translator and cached there, so this file doesn't have to be complete.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { BN, keyOf, lookup, mask, remember, translateMany } from "../src/lib/tr-core.ts";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "src/data/i18n-en.json");

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

const found = new Set<string>();
const add = (text: string) => {
  // strings that carry markup are split the way the DOM will split them
  const parts = text.split(/<[^>]*>/);
  for (const raw of parts) {
    const { masked } = mask(decode(raw).trim());
    if (BN.test(masked)) found.add(keyOf(masked).plain);
  }
};

// JSX text lines are trimmed and joined with a space, like React does
const jsxText = (t: string) =>
  t
    .split(/\r?\n/)
    .map((l, i, a) => (i === 0 ? l.trimEnd() : i === a.length - 1 ? l.trimStart() : l.trim()))
    .filter(Boolean)
    .join(" ");

for (const file of walk(join(ROOT, "src"))) {
  if (file.endsWith(".html")) {
    add(readFileSync(file, "utf8"));
    continue;
  }
  if (!/\.tsx?$/.test(file) || file.endsWith("tr-core.ts")) continue;
  const src = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const visit = (n: ts.Node) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      if (BN.test(n.text)) add(n.text);
    } else if (ts.isJsxText(n)) {
      const t = jsxText(n.text);
      if (BN.test(t)) add(t);
    }
    ts.forEachChild(n, visit);
  };
  visit(src);
}

const old: Record<string, string> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const extra: Record<string, string> = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], "utf8")) : {};
// keep entries for strings that still exist, plus runtime-only ones from a cache dump
const keep = new Set([...found].flatMap((s) => [keyOf(s).key, keyOf(s).plain]));
const dict: Record<string, string> = { ...Object.fromEntries(Object.entries(old).filter(([k]) => keep.has(k))), ...extra };

const todo = [...found].filter((s) => BN.test(s) && lookup(dict, s) === null);
console.log(`${found.size} strings found, ${todo.length} need translating`);

for (let i = 0; i < todo.length; i += 60) {
  const part = todo.slice(i, i + 60);
  for (let tries = 0; ; tries++) {
    try {
      const res = await translateMany(part);
      part.forEach((s, k) => remember(dict, s, res[k]));
      break;
    } catch (e) {
      if (tries > 4) throw e;
      await new Promise((r) => setTimeout(r, 2000 * (tries + 1)));
    }
  }
  process.stdout.write(`\r${Math.min(i + 60, todo.length)}/${todo.length}`);
}

const sorted = Object.fromEntries(Object.entries(dict).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, JSON.stringify(sorted, null, 0).replace(/","/g, '",\n"') + "\n");
console.log(`\nwrote ${Object.keys(sorted).length} entries → src/data/i18n-en.json`);
