import { VERBS } from "@/data/games";
import { SENT, WORDS } from "@/data/practice";
import { dayKey } from "./util";

/*
 * Spaced repetition (a small SM-2 variant). Everything lives in localStorage:
 *   lab.srs    → { [cardId]: CardState }
 *   lab.srsday → how many new cards were introduced today
 */
export type Deck = "w" | "s" | "v";
export type Card = { id: string; deck: Deck; front: string; back: string; ex?: string };
export type CardState = { due: string; iv: number; ease: number; reps: number; lapses: number };
export type SRSMap = Record<string, CardState>;
export type SRSDay = { day: string; fresh: number };
export type Grade = 0 | 1 | 2 | 3; // আবার, কঠিন, ভালো, সহজ

export const NO_SRS: SRSMap = {};
export const NO_SRS_DAY: SRSDay = { day: "", fresh: 0 };
export const NEW_PER_DAY = 10;

export const DECKS: Record<Deck, { name: string; icon: string; cards: Card[] }> = {
  w: {
    name: "শব্দ",
    icon: "🔤",
    cards: WORDS.map(([en, bn, ex]) => ({ id: "w:" + en, deck: "w", front: en, back: bn, ex })),
  },
  s: {
    name: "বাক্য",
    icon: "💬",
    // Bangla on the front: the goal is to *produce* English
    cards: SENT.map(([en, bn]) => ({ id: "s:" + en, deck: "s", front: bn, back: en })),
  },
  v: {
    name: "Verb",
    icon: "🔁",
    cards: VERBS.map(([v1, v2, v3, bn]) => ({ id: "v:" + v1, deck: "v", front: v1, back: v2 + " · " + v3, ex: bn })),
  },
};

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dayKey(d);
};

/** Cards to study now: everything due, then up to today's allowance of new cards. */
export function queueOf(deck: Deck, map: SRSMap, day: SRSDay) {
  const today = dayKey();
  const cards = DECKS[deck].cards;
  const due = cards.filter((c) => map[c.id] && map[c.id].due <= today).sort((a, b) => map[a.id].due.localeCompare(map[b.id].due));
  const freshLeft = Math.max(0, NEW_PER_DAY - (day.day === today ? day.fresh : 0));
  const fresh = cards.filter((c) => !map[c.id]).slice(0, freshLeft);
  return { due, fresh, all: [...due, ...fresh] };
}

export function schedule(prev: CardState | undefined, g: Grade): CardState {
  const s = prev ?? { due: dayKey(), iv: 0, ease: 2.5, reps: 0, lapses: 0 };
  if (g === 0) return { ...s, iv: 0, reps: 0, lapses: s.lapses + 1, ease: Math.max(1.3, s.ease - 0.2), due: dayKey() };
  const ease = Math.max(1.3, s.ease + (g === 1 ? -0.15 : g === 3 ? 0.15 : 0));
  let iv: number;
  if (s.reps === 0) iv = g === 3 ? 4 : 1;
  else if (s.reps === 1) iv = g === 1 ? 2 : g === 3 ? 6 : 3;
  else iv = Math.round(s.iv * (g === 1 ? 1.2 : g === 3 ? ease * 1.3 : ease));
  iv = Math.max(1, Math.min(iv, 365));
  return { due: addDays(iv), iv, ease, reps: s.reps + 1, lapses: s.lapses };
}

/** days until the next review for a grade — shown on the buttons */
export const preview = (prev: CardState | undefined, g: Grade) => (g === 0 ? 0 : schedule(prev, g).iv);

/** a card counts as "learned" once its interval reaches 21 days */
export const masteredCount = (map: SRSMap) => Object.values(map).filter((s) => s.iv >= 21).length;
