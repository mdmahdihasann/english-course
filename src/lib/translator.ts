"use client";
/*
 * The site is written in Bangla. In English mode this swaps every Bangla text node / label
 * for its English translation in place, and swaps it back when the reader picks Bangla.
 *
 * - Text is only ever changed through `Text.data`, never by replacing nodes, so React keeps
 *   working: when React rewrites a node the observer sees it and translates the new text.
 * - A paragraph that mixes text with inline tags (<b>, <span class="en">…) is translated as one
 *   sentence: English/untouchable inline elements become tokens (ZXA, ZXB…) and stay in place.
 * - Adjacent text nodes ("৩" + "টা কার্ড") are translated together as one sentence.
 * - Hand fixes (i18n-en.fix.json) + pre-built dictionary (i18n-en.json) first, then a
 *   localStorage cache, then the Google Translate endpoint. Offline → the Bangla stays.
 * - Anything inside [translate="no"] (meanings, pronunciations, Bangla quiz prompts) is left alone.
 */
import { BN, cap, keyOf, lookup, mask, remember, translateMany, translateText, unmask } from "./tr-core";

export type Lang = "en" | "bn";

const SKIP = 'script,style,textarea,noscript,[translate="no"],.notranslate,[contenteditable="true"],.dbn';
const ATTRS = ["placeholder", "aria-label", "title"];
const INLINE = new Set(["B", "STRONG", "I", "EM", "U", "SMALL", "SPAN", "A", "MARK", "S", "SUB", "SUP", "CODE", "KBD", "BR", "ABBR", "Q", "BUTTON"]);
const CACHE_KEY = "tr.en";

type Rec = { o: string; t: string };
const textRec = new WeakMap<Text, Rec>();
const attrRec = new WeakMap<Element, Record<string, Rec>>();
const touched = new Set<WeakRef<Text | Element>>();

let dict: Record<string, string> | null = null;
let cache: Record<string, string> = {};
let obs: MutationObserver | null = null;
let active = false;

const queued = new Set<string>();
const failed = new Set<string>();
const waiting = new Set<Node>();
const pass = new Set<Node>(); // blocks / runs already handled in the current batch
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let inflight = 0;
let idle: (() => void)[] = [];

function get(plain: string) {
  const v = lookup(cache, plain) ?? lookup(dict!, plain);
  if (v !== null) return v;
  const p = keyOf(plain).plain;
  if (!failed.has(p)) queued.add(p);
  return null;
}

const skip = (el: Element | null) => !el || !!el.closest(SKIP);
const isText = (n: Node): n is Text => n.nodeType === 3;

function srcOf(t: Text) {
  const r = textRec.get(t);
  return r && t.data === r.t ? r.o : t.data;
}

function write(n: Text, o: string, v: string) {
  if (!textRec.has(n)) touched.add(new WeakRef(n));
  textRec.set(n, { o, t: v });
  if (n.data !== v) n.data = v;
}

/* ---------- plain runs of text nodes ---------- */

function doRun(first: Text) {
  if (pass.has(first)) return;
  pass.add(first);
  const run: Text[] = [];
  for (let n: Node | null = first; n && isText(n); n = n.nextSibling) run.push(n);
  const srcs = run.map(srcOf);
  const full = srcs.join("");
  if (!BN.test(full) || skip(first.parentElement)) return;
  const tr = translateText(full, get);
  if (tr === null) return void waiting.add(first);
  run.forEach((n, i) => write(n, srcs[i], i === 0 ? tr : ""));
}

function runStart(t: Text) {
  let a: Node = t;
  while (a.previousSibling && isText(a.previousSibling)) a = a.previousSibling;
  return a as Text;
}

/* ---------- paragraphs with inline markup ---------- */

/** inline element whose Bangla joins the sentence (its formatting is dropped in English) */
const isMerge = (el: Element) =>
  INLINE.has(el.tagName) &&
  el.tagName !== "BUTTON" &&
  el.tagName !== "A" && // a link must keep its own text
  el.tagName !== "BR" &&
  !el.matches(SKIP) &&
  el.childNodes.length > 0 &&
  [...el.childNodes].every(isText) &&
  BN.test([...el.childNodes].map((n) => srcOf(n as Text)).join("")) &&
  // a <small> styled as its own line is a label, not part of the sentence
  getComputedStyle(el).display.startsWith("inline");

/** text mixed with inline elements, with some Bangla in it */
function isRich(el: Element) {
  if (!el.firstElementChild || skip(el)) return false;
  let bn = false;
  for (const n of el.childNodes) {
    if (isText(n)) bn ||= BN.test(srcOf(n));
    else if (n.nodeType === 1) {
      if (!INLINE.has((n as Element).tagName)) return false;
      bn ||= isMerge(n as Element);
    }
  }
  return bn;
}

const letter = (i: number) => String.fromCharCode(65 + i);
const WORDY = /[\p{L}\p{M}\p{N}]$/u;

function doBlock(el: Element) {
  if (pass.has(el)) return;
  pass.add(el);
  const gaps: { n: Text; o: string }[][] = [[]];
  let src = "";
  let tokens = 0;
  for (const n of el.childNodes) {
    if (isText(n)) {
      const o = srcOf(n);
      // keep a token a separate word for the translator
      src += (tokens && /ZX[A-Z]$/.test(src) && /^[\p{L}\p{M}\p{N}]/u.test(o) ? " " : "") + o;
      gaps[gaps.length - 1].push({ n, o });
    } else if (n.nodeType === 1) {
      const c = n as Element;
      if (isMerge(c)) {
        for (const t of c.childNodes as NodeListOf<Text>) {
          const o = srcOf(t);
          src += o;
          gaps[gaps.length - 1].push({ n: t, o });
        }
      } else {
        src += (WORDY.test(src) ? " " : "") + "ZX" + letter(tokens++);
        gaps.push([]);
        scan(c);
      }
    }
  }
  const fallback = () => gaps.flat().forEach(({ n }) => doRun(runStart(n)));
  if (tokens > 26) return fallback();
  // "<span>🏠</span>হোম" — elements only around one piece of text: translate just that text
  const content = gaps.flatMap((g, i) => (g.some((x) => x.o.trim()) ? [i] : []));
  const only = tokens && content.length === 1 ? content[0] : -1;
  const text = only >= 0 ? gaps[only].map((x) => x.o).join("") : src;

  const lead = text.match(/^\s*/)![0];
  const trail = text.match(/\s*$/)![0];
  const { masked, parts } = mask(text.replace(/\s+/g, " ").trim());
  if (!BN.test(masked)) return;
  const v = get(masked);
  if (v === null) return void waiting.add(el);
  const out = unmask(v, parts);
  if (out === null) return fallback();

  // prefer the paragraph's own text node so the words don't all turn bold
  const put = (g: { n: Text; o: string }[], s: string) => {
    const host = g.find((x) => x.n.parentNode === el) ?? g[0];
    g.forEach((x) => write(x.n, x.o, x === host ? s : ""));
  };
  if (only >= 0) return put(gaps[only], lead + cap(out) + trail);

  const pieces = cap(out).split(/ ?\bZX([A-Z])\b ?/);
  const segs = pieces.filter((_, i) => i % 2 === 0);
  const order = pieces.filter((_, i) => i % 2 === 1).join("");
  // the translation moved or lost an element — translate piece by piece instead
  if (order !== [...Array(tokens)].map((_, i) => letter(i)).join("")) return fallback();
  // a gap with no text node can't hold words
  if (gaps.some((g, i) => !g.length && segs[i].trim())) return fallback();

  gaps.forEach((g, i) => {
    let s = segs[i];
    // "<a>…</a> <span>›</span>": the space between elements has no translation but must stay
    if (!s.trim() && g.some((x) => /\s/.test(x.o))) s = " ";
    else if (s && i > 0 && !/^[\s.,;:!?)\]”’]/.test(s)) s = " " + s;
    if (s && i < gaps.length - 1 && !/[\s(\[“‘]$/.test(s)) s += " ";
    if (i === 0) s = lead + s.trimStart();
    if (i === gaps.length - 1) s = s.trimEnd() + trail;
    put(g, s);
  });
}

/* ---------- dispatch ---------- */

function doText(t: Text) {
  const p = t.parentElement;
  if (!p || skip(p)) return;
  if (isMerge(p) && p.parentElement && isRich(p.parentElement)) return doBlock(p.parentElement);
  if (isRich(p)) return doBlock(p);
  doRun(runStart(t));
}

function doAttrs(el: Element) {
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (!v) continue;
    const recs = attrRec.get(el) ?? {};
    const r = recs[a];
    const src = r && v === r.t ? r.o : v;
    if (!BN.test(src) || skip(el)) continue;
    const tr = translateText(src, get);
    if (tr === null) {
      waiting.add(el);
      continue;
    }
    if (!attrRec.has(el)) touched.add(new WeakRef(el));
    recs[a] = { o: src, t: tr };
    attrRec.set(el, recs);
    if (v !== tr) el.setAttribute(a, tr);
  }
}

function scan(root: Node) {
  if (isText(root)) return doText(root);
  if (root.nodeType !== 1) return;
  const el = root as Element;
  if (skip(el)) return;
  doAttrs(el);
  const w = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeType === 1 && (n as Element).matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (n.nodeType === 1) doAttrs(n as Element);
    else doText(n as Text);
  }
}

/* ---------- network ---------- */

function kick() {
  pass.clear();
  if (!queued.size) {
    if (!flushTimer && !inflight) settle();
    return;
  }
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, 30);
}

async function flush() {
  flushTimer = undefined;
  const list = [...queued];
  queued.clear();
  inflight++;
  try {
    const res = await translateMany(list);
    list.forEach((s, i) => remember(cache, s, res[i]));
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch {}
    }, 500);
  } catch {
    list.forEach((s) => failed.add(s));
  }
  inflight--;
  if (!active) return;
  const again = [...waiting];
  waiting.clear();
  again.forEach((n) => n.isConnected && scan(n));
  kick();
}

function settle() {
  const cbs = idle;
  idle = [];
  cbs.forEach((f) => f());
}

function onMutations(ms: MutationRecord[]) {
  for (const m of ms) {
    if (m.type === "characterData") {
      const t = m.target as Text;
      const r = textRec.get(t);
      if (r && r.t === t.data) continue; // our own write
      doText(t);
    } else if (m.type === "attributes") {
      const el = m.target as Element;
      const r = attrRec.get(el)?.[m.attributeName!];
      if (r && r.t === el.getAttribute(m.attributeName!)) continue;
      doAttrs(el);
    } else {
      m.addedNodes.forEach(scan);
      // neighbours of added / removed nodes may now form a different sentence
      if (m.target.nodeType === 1) {
        const el = m.target as Element;
        if (isRich(el)) doBlock(el);
        else el.childNodes.forEach((c) => isText(c) && doText(c));
      }
    }
  }
  kick();
}

async function loadDict() {
  if (dict) return;
  try {
    cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {}
  const [auto, fix] = await Promise.all([import("@/data/i18n-en.json"), import("@/data/i18n-en.fix.json")]);
  // hand-written fixes win over the machine translation
  dict = { ...(auto.default as Record<string, string>) };
  for (const [k, v] of Object.entries(fix.default as Record<string, string>)) dict[keyOf(k).key] = v;
}

/** Switch the page language. Resolves once the first pass is on screen (or after `maxWait`). */
export async function setLanguage(lang: Lang, maxWait = 1500) {
  document.documentElement.lang = lang;
  if (lang === "bn") {
    active = false;
    obs?.disconnect();
    obs = null;
    waiting.clear();
    restore();
    return;
  }
  if (active) return;
  active = true;
  await loadDict();
  if (!active) return;
  obs = new MutationObserver(onMutations);
  obs.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  const done = new Promise<void>((r) => {
    idle.push(r);
    setTimeout(r, maxWait);
  });
  scan(document.head.querySelector("title") ?? document.head);
  scan(document.body);
  kick();
  await done;
}

function restore() {
  touched.forEach((ref) => {
    const n = ref.deref();
    if (!n) return;
    if (isText(n)) {
      const r = textRec.get(n);
      if (r && n.data === r.t) n.data = r.o;
      textRec.delete(n);
    } else {
      const el = n as Element;
      const recs = attrRec.get(el);
      if (recs) for (const [a, r] of Object.entries(recs)) if (el.getAttribute(a) === r.t) el.setAttribute(a, r.o);
      attrRec.delete(el);
    }
  });
  touched.clear();
}
