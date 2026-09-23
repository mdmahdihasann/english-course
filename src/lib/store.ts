"use client";
import { useCallback, useSyncExternalStore } from "react";

/*
 * localStorage-backed state shared by every component on the page.
 * Keys are kept identical to the old static site so existing progress survives.
 */
export const KEYS = {
  done: "done",
  weeks: "weeks",
  studied: "studied",
  theme: "theme",
  settings: "settings",
  writings: "practice.writings",
  draft: "practice.draft",
  stats: "practice.stats",
  tasks: "practice.tasks",
  missed: "practice.missed",
  speak: "practice.speak",
  xp: "lab.xp",
  goal: "lab.goal",
  srs: "lab.srs",
  srsDay: "lab.srsday",
  lab: "lab.stats",
} as const;

type Listener = () => void;
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<Listener>>();

const emit = (key: string) => listeners.get(key)?.forEach((l) => l());

export function read<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let v = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) v = JSON.parse(raw) as T;
  } catch {}
  cache.set(key, v);
  return v;
}

export function write<T>(key: string, v: T) {
  cache.set(key, v);
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
  emit(key);
}

export function remove(key: string) {
  cache.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {}
  emit(key);
}

if (typeof window !== "undefined") {
  // keep tabs in sync
  addEventListener("storage", (e) => {
    if (!e.key) {
      cache.clear();
      listeners.forEach((_, k) => emit(k));
    } else if (listeners.has(e.key)) {
      cache.delete(e.key);
      emit(e.key);
    }
  });
}

/** `fallback` must be a stable reference (module-level constant). */
export function usePersisted<T>(key: string, fallback: T) {
  const subscribe = useCallback(
    (cb: Listener) => {
      let set = listeners.get(key);
      if (!set) listeners.set(key, (set = new Set()));
      set.add(cb);
      return () => void set.delete(cb);
    },
    [key],
  );
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback);
      write(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    [key, fallback],
  );
  return [value, setValue] as const;
}

const noop = () => () => {};
/** false during SSR + hydration, true afterwards. */
export const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

/** Everything the app stores, for backup / restore. */
export function exportAll() {
  const out: Record<string, unknown> = {};
  Object.values(KEYS).forEach((k) => {
    try {
      const raw = localStorage.getItem(k);
      if (raw !== null) out[k] = JSON.parse(raw);
    } catch {}
  });
  return out;
}

export function importAll(data: Record<string, unknown>) {
  const allowed = new Set<string>(Object.values(KEYS));
  let n = 0;
  Object.entries(data).forEach(([k, v]) => {
    if (allowed.has(k)) {
      write(k, v);
      n++;
    }
  });
  return n;
}

export function clearProgress() {
  [KEYS.done, KEYS.weeks, KEYS.studied, KEYS.writings, KEYS.draft, KEYS.stats, KEYS.tasks, KEYS.missed, KEYS.speak, KEYS.xp, KEYS.srs, KEYS.srsDay, KEYS.lab].forEach(remove);
}
