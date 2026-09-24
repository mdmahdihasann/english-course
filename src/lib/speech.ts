"use client";
import { KEYS, read } from "./store";

export type Settings = { rate: number; accent: "US" | "GB"; font: "sm" | "md" | "lg" };
export const DEFAULT_SETTINGS: Settings = { rate: 0.85, accent: "US", font: "md" };

const hasTTS = () => typeof window !== "undefined" && "speechSynthesis" in window;

let voices: SpeechSynthesisVoice[] = [];
if (hasTTS()) {
  const load = () => (voices = speechSynthesis.getVoices());
  load();
  speechSynthesis.addEventListener?.("voiceschanged", load);
}

function pickVoice(accent: Settings["accent"]) {
  const re = accent === "GB" ? /en[-_]GB/i : /en[-_]US/i;
  return (
    voices.find((x) => re.test(x.lang) && /female|samantha|google|natural/i.test(x.name)) ||
    voices.find((x) => re.test(x.lang)) ||
    voices.find((x) => /^en/i.test(x.lang)) ||
    null
  );
}

const clean = (t: string) =>
  t
    .replace(/[✗✓]/g, "")
    .replace(/_{2,}/g, " blank ")
    .replace(/\s\/\s/g, ", ")
    .replace(/\(.*?\)/g, "")
    .trim();

let current: (() => void) | null = null;

/** Speak English text. Returns false when the browser can't. */
export function speak(text: string, onEnd?: () => void, opts?: { rate?: number; pitch?: number }) {
  if (!hasTTS()) return false;
  speechSynthesis.cancel();
  current?.();
  current = onEnd ?? null;
  const s = { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) };
  const u = new SpeechSynthesisUtterance(clean(text));
  u.lang = s.accent === "GB" ? "en-GB" : "en-US";
  u.rate = opts?.rate ?? s.rate;
  if (opts?.pitch) u.pitch = opts.pitch;
  const v = pickVoice(s.accent);
  if (v) u.voice = v;
  u.onend = u.onerror = () => {
    if (current === onEnd) current = null;
    onEnd?.();
  };
  speechSynthesis.speak(u);
  return true;
}

/* ---------- speech recognition (speaking practice) ---------- */
type Rec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function getRecognition(): Rec | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  const C = w.SpeechRecognition || w.webkitSpeechRecognition;
  return C ? new C() : null;
}

const norm = (t: string) =>
  t
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

/** Word-by-word comparison of what was said against the target sentence. */
export function compareSpeech(target: string, said: string) {
  const tw = target.split(/\s+/).filter(Boolean);
  const heard = norm(said);
  const pool = new Map<string, number>();
  heard.forEach((w) => pool.set(w, (pool.get(w) || 0) + 1));
  const words = tw.map((raw) => {
    const key = norm(raw)[0] ?? "";
    const n = pool.get(key) || 0;
    if (key && n > 0) pool.set(key, n - 1);
    return { raw, ok: !key || n > 0 };
  });
  const scored = words.filter((w) => norm(w.raw).length);
  const score = scored.length ? Math.round((scored.filter((w) => w.ok).length / scored.length) * 100) : 0;
  return { words, score };
}
