"use client";
import { speak } from "@/lib/speech";

export type TalkStats = { best: Record<string, number>; lines: number; plays: number };
export const NO_TALK: TalkStats = { best: {}, lines: 0, plays: 0 };

/** the partner gets a slightly higher voice so the two sides sound different */
export const voiceOf = (me?: boolean) => ({ pitch: me ? 0.95 : 1.2 });

/**
 * Speak a line and call `done` exactly once — when speech ends, or after a length-based
 * fallback (some mobile browsers never fire `onend`, block speech, or have no voices at all).
 * Returns a cancel function that silences it without calling `done`.
 */
export function sayLine(text: string, me: boolean | undefined, done: () => void) {
  const t = { over: false, sync: true, failed: false, timer: undefined as ReturnType<typeof setTimeout> | undefined };
  const finish = () => {
    // speech that fails straight away (blocked autoplay) → fall back to reading time below
    if (t.sync) return void (t.failed = true);
    if (t.over) return;
    t.over = true;
    clearTimeout(t.timer);
    done();
  };
  const ok = speak(text, finish, voiceOf(me));
  t.sync = false;
  const read = 900 + text.length * 45;
  t.timer = setTimeout(finish, !ok || t.failed ? read : 1500 + text.split(/\s+/).length * 700);
  return () => {
    t.over = true;
    clearTimeout(t.timer);
    if (ok) speechSynthesis.cancel();
  };
}
