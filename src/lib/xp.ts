"use client";
import { useCallback } from "react";
import { useUI } from "@/components/UIProvider";
import { KEYS, read, write } from "./store";
import { bnNum, confetti, dayKey } from "./util";

/** XP earned per day: { "2026-09-23": 42 } */
export type XPLog = Record<string, number>;
export const NO_XP: XPLog = {};
export const NO_DAYS: string[] = [];
export const DEFAULT_GOAL = 30;

export const totalXP = (log: XPLog) => Object.values(log).reduce((a, b) => a + b, 0);

/** level L starts at 50·L·(L−1) XP → 0, 100, 300, 600, 1000 … */
const startOf = (l: number) => 50 * l * (l - 1);
export function levelOf(xp: number) {
  const l = Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
  const from = startOf(l);
  const to = startOf(l + 1);
  return { level: l, into: xp - from, need: to - from, pct: Math.round(((xp - from) / (to - from)) * 100) };
}

const TITLES = ["নতুন শিক্ষার্থী", "শিক্ষানবিশ", "নিয়মিত পাঠক", "বাক্য কারিগর", "আত্মবিশ্বাসী বক্তা", "ইংরেজি যোদ্ধা", "সাবলীল বক্তা", "ভাষার ওস্তাদ"];
export const titleOf = (level: number) => TITLES[Math.min(level, TITLES.length) - 1];

export function streakOf(days: string[]) {
  let n = 0;
  const d = new Date();
  if (!days.includes(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.includes(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Award XP. Reaching the daily goal also marks today as a study day (keeps the streak going). */
export function useGainXP() {
  const { toast } = useUI();
  return useCallback(
    (n: number, msg?: string) => {
      if (n <= 0) return;
      const k = dayKey();
      const log = read<XPLog>(KEYS.xp, NO_XP);
      const before = log[k] || 0;
      const after = before + n;
      write(KEYS.xp, { ...log, [k]: after });
      const goal = read<number>(KEYS.goal, DEFAULT_GOAL);
      const lvBefore = levelOf(totalXP(log)).level;
      const lvAfter = levelOf(totalXP(log) + n).level;
      if (lvAfter > lvBefore) {
        confetti();
        toast("🎉 লেভেল " + bnNum(lvAfter) + "! তুমি এখন “" + titleOf(lvAfter) + "”");
      } else if (before < goal && after >= goal) {
        const studied = read<string[]>(KEYS.studied, NO_DAYS);
        if (!studied.includes(k)) write(KEYS.studied, [...studied, k]);
        confetti();
        toast("🎯 আজকের লক্ষ্য পূরণ! টানা পড়ার দিন বাড়ল 🔥");
      } else if (msg) toast(msg + " · +" + bnNum(n) + " XP");
    },
    [toast],
  );
}
