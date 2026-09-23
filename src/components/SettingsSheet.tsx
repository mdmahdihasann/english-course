"use client";
import { useEffect, useRef, useState } from "react";
import { COURSE } from "@/data/course";
import { lessonHref } from "@/lib/progress";
import { DEFAULT_SETTINGS, speak, type Settings } from "@/lib/speech";
import { clearProgress, exportAll, importAll, KEYS, useHydrated, usePersisted } from "@/lib/store";
import { bnNum } from "@/lib/util";
import { useUI } from "./UIProvider";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const NO_SETTINGS: Partial<Settings> = {};

export function useSettings() {
  const [raw, setRaw] = usePersisted<Partial<Settings>>(KEYS.settings, NO_SETTINGS);
  const s = { ...DEFAULT_SETTINGS, ...raw };
  return [s, (patch: Partial<Settings>) => setRaw((p) => ({ ...p, ...patch }))] as const;
}

export default function SettingsSheet() {
  const { settingsOpen: open, setSettingsOpen, toast } = useUI();
  const [s, set] = useSettings();
  const [theme, setTheme] = usePersisted<"dark" | "light" | null>(KEYS.theme, null);
  const hydrated = useHydrated();
  const [install, setInstall] = useState<BIPEvent | null>(null);
  const [offline, setOffline] = useState<"idle" | "busy" | "done">("idle");
  const [armReset, setArmReset] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    document.documentElement.dataset.fs = s.font;
  }, [s.font]);

  useEffect(() => {
    const h = (e: Event) => {
      e.preventDefault();
      setInstall(e as BIPEvent);
    };
    addEventListener("beforeinstallprompt", h);
    return () => removeEventListener("beforeinstallprompt", h);
  }, []);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const close = () => setSettingsOpen(false);

  async function saveOffline() {
    if (!("caches" in window)) return toast("এই ব্রাউজারে অফলাইন সেভ হয় না");
    setOffline("busy");
    try {
      const c = await caches.open("ec-pages-v1");
      const urls = ["/", "/practice", "/lab", "/advanced", "/progress", ...COURSE.map((_, i) => lessonHref(i))];
      await Promise.all(
        urls.map(async (u) => {
          const r = await fetch(u, { credentials: "same-origin" });
          if (r.ok) await c.put(u, r);
        }),
      );
      setOffline("done");
      toast("✅ সব পাঠ অফলাইনের জন্য সেভ হয়েছে");
    } catch {
      setOffline("idle");
      toast("সেভ করা গেল না — ইন্টারনেট চেক করো");
    }
  }

  function backup() {
    const blob = new Blob([JSON.stringify({ app: "english-course", date: new Date().toISOString(), data: exportAll() }, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `english-course-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("ব্যাকআপ ফাইল ডাউনলোড হলো 💾");
  }

  async function restore(f: File) {
    try {
      const j = JSON.parse(await f.text());
      const n = importAll(j.data ?? j);
      toast(n ? `✅ অগ্রগতি ফিরে এসেছে (${bnNum(n)}টা অংশ)` : "ফাইলে কোনো ডেটা পাওয়া যায়নি");
    } catch {
      toast("ফাইলটা পড়া গেল না");
    }
  }

  const themeVal = theme ?? "system";

  return (
    <dialog ref={dlg} className="sheet" onClose={close} onClick={(e) => e.target === dlg.current && close()} aria-labelledby="setTitle">
      <div className="sheet-in">
        <div className="sheet-head">
          <b id="setTitle">⚙️ সেটিংস</b>
          <button type="button" className="icon-btn" onClick={close} aria-label="বন্ধ করো">
            ✕
          </button>
        </div>

        {install && (
          <button
            type="button"
            className="btn sunny wide"
            onClick={async () => {
              await install.prompt();
              setInstall(null);
            }}
          >
            📲 অ্যাপ হিসেবে ইনস্টল করো
          </button>
        )}

        <fieldset className="opt">
          <legend>থিম</legend>
          <Seg
            value={themeVal}
            onChange={(v) => setTheme(v === "system" ? null : (v as "dark" | "light"))}
            items={[
              ["light", "☀️ আলো"],
              ["dark", "🌙 অন্ধকার"],
              ["system", "📱 ফোনের মতো"],
            ]}
          />
        </fieldset>

        <fieldset className="opt">
          <legend>লেখার আকার</legend>
          <Seg
            value={s.font}
            onChange={(v) => set({ font: v as Settings["font"] })}
            items={[
              ["sm", "ছোট"],
              ["md", "মাঝারি"],
              ["lg", "বড়"],
            ]}
          />
        </fieldset>

        <fieldset className="opt">
          <legend>উচ্চারণের গতি</legend>
          <Seg
            value={String(s.rate)}
            onChange={(v) => {
              set({ rate: +v });
              setTimeout(() => speak("Hello! How are you today?"), 50);
            }}
            items={[
              ["0.65", "🐢 ধীরে"],
              ["0.85", "স্বাভাবিক"],
              ["1", "🐇 দ্রুত"],
            ]}
          />
        </fieldset>

        <fieldset className="opt">
          <legend>উচ্চারণের ধরন</legend>
          <Seg
            value={s.accent}
            onChange={(v) => {
              set({ accent: v as Settings["accent"] });
              setTimeout(() => speak("I'm learning English every day."), 50);
            }}
            items={[
              ["US", "🇺🇸 আমেরিকান"],
              ["GB", "🇬🇧 ব্রিটিশ"],
            ]}
          />
        </fieldset>

        <fieldset className="opt">
          <legend>অফলাইন</legend>
          <p className="opt-note">ইন্টারনেট ছাড়াও পড়তে চাইলে একবার সব পাঠ সেভ করে রাখো।</p>
          <button type="button" className="btn ghost wide" disabled={!hydrated || offline === "busy"} onClick={saveOffline}>
            {offline === "busy" ? "সেভ হচ্ছে…" : offline === "done" ? "✅ অফলাইনে সেভ আছে" : "📥 সব পাঠ অফলাইনে সেভ করো"}
          </button>
        </fieldset>

        <fieldset className="opt">
          <legend>অগ্রগতির ব্যাকআপ</legend>
          <p className="opt-note">অগ্রগতি এই ব্রাউজারে থাকে। ফোন বদলালে ব্যাকআপ ফাইল দিয়ে ফিরিয়ে আনো।</p>
          <div className="row2">
            <button type="button" className="btn ghost" onClick={backup}>
              💾 ব্যাকআপ নাও
            </button>
            <button type="button" className="btn ghost" onClick={() => file.current?.click()}>
              📂 ফিরিয়ে আনো
            </button>
          </div>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) restore(f);
              e.target.value = "";
            }}
          />
        </fieldset>

        <div className="reset">
          <button
            type="button"
            className="link"
            onClick={() => {
              if (!armReset) {
                setArmReset(true);
                setTimeout(() => setArmReset(false), 3500);
                return;
              }
              clearProgress();
              setArmReset(false);
              toast("সব অগ্রগতি মুছে ফেলা হলো");
              close();
            }}
          >
            {armReset ? "সত্যিই সব মুছবে? আবার চাপো" : "সব অগ্রগতি মুছে নতুন করে শুরু করো"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

function Seg({ value, onChange, items }: { value: string; onChange: (v: string) => void; items: [string, string][] }) {
  return (
    <div className="seg" role="radiogroup">
      {items.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}
