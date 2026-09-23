"use client";
import { useCallback, useMemo } from "react";
import { COURSE } from "@/data/course";
import { KEYS, usePersisted } from "./store";

export const N = COURSE.length;
export const lessonHref = (i: number) => `/lessons/${i + 1}`;

export const GROUP_ICONS: Record<string, string> = {
  "শুরু করো": "🚀",
  গ্রামার: "📘",
  "স্পোকেন ইংলিশ": "🗣️",
  "অনুশীলন কর্নার": "🎯",
  "শেষ ধাপ": "🏁",
};

export const GROUPS = COURSE.reduce<{ name: string; items: number[] }[]>((g, c, i) => {
  const last = g[g.length - 1];
  if (last && last.name === c.group) last.items.push(i);
  else g.push({ name: c.group, items: [i] });
  return g;
}, []);

const EMPTY: string[] = [];

/** Lesson completion + lock state. Lesson ids are stored as "lesson-01.html" (old site format). */
export function useProgress() {
  const [done] = usePersisted<string[]>(KEYS.done, EMPTY);
  return useMemo(() => {
    const set = new Set(done);
    const isDone = (i: number) => set.has(COURSE[i].id + ".html");
    let next = 0;
    while (next < N && isDone(next)) next++;
    return {
      count: set.size,
      next,
      isDone,
      isOpen: (i: number) => i <= next,
      percent: Math.round((set.size / N) * 100),
    };
  }, [done]);
}

export function useMarkDone() {
  const [, setDone] = usePersisted<string[]>(KEYS.done, EMPTY);
  return useCallback(
    (i: number) => setDone((d) => (d.includes(COURSE[i].id + ".html") ? d : [...d, COURSE[i].id + ".html"])),
    [setDone],
  );
}
