"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { COURSE } from "@/data/course";
import { lessonHref, useProgress } from "@/lib/progress";
import { KEYS, useHydrated, usePersisted } from "@/lib/store";
import { bnNum, dayKey, reducedMotion } from "@/lib/util";
import { DEFAULT_GOAL, NO_XP, type XPLog } from "@/lib/xp";
import LangToggle, { LangSync } from "./LangToggle";
import SettingsSheet from "./SettingsSheet";
import Sidebar from "./Sidebar";
import { UIProvider, useUI } from "./UIProvider";

const pageOf = (path: string) => {
  if (path === "/") return -1;
  if (path.startsWith("/practice")) return -2;
  if (path.startsWith("/lab")) return -4;
  if (path.startsWith("/progress")) return -5;
  if (path.startsWith("/advanced")) return -6;
  if (path.startsWith("/talk")) return -7;
  const m = path.match(/^\/lessons\/(\d+)/);
  return m ? +m[1] - 1 : -3;
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <LangSync />
      <Shell>{children}</Shell>
    </UIProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const page = pageOf(path);
  const { navOpen, setNavOpen, setSettingsOpen } = useUI();

  // close drawer on navigation, Esc closes it
  useEffect(() => setNavOpen(false), [path, setNavOpen]);
  useEffect(() => {
    document.body.classList.toggle("nav-open", navOpen);
    const k = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [navOpen, setNavOpen]);

  // service worker (offline support) — production only
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
    }
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="in">
          <Link className="brand" href="/">
            <i>En</i>
            <b>ইংরেজি বলা শিখি</b>
          </Link>
          <LangToggle />
          <XPChip />
          <ThemeButton />
          <button className="icon-btn" type="button" aria-label="সেটিংস" onClick={() => setSettingsOpen(true)}>
            ⚙️
          </button>
        </div>
        <ScrollBar />
      </header>
      <Sidebar page={page} />
      <div className="layout">
        <main id="main">{children}</main>
      </div>
      <BottomNav page={page} />
      <ToTop />
      <SettingsSheet />
    </>
  );
}

export function ThemeButton() {
  const [theme, setTheme] = usePersisted<"dark" | "light" | null>(KEYS.theme, null);
  const hydrated = useHydrated();
  const cur = theme ?? (hydrated && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [theme]);
  return (
    <button className="icon-btn theme-btn" type="button" aria-label="থিম বদলাও" onClick={() => setTheme(cur === "dark" ? "light" : "dark")}>
      {hydrated ? (cur === "dark" ? "☀️" : "🌙") : "🌙"}
    </button>
  );
}

/** today's XP vs the daily goal, links to the progress page */
function XPChip() {
  const hydrated = useHydrated();
  const [xp] = usePersisted<XPLog>(KEYS.xp, NO_XP);
  const [goal] = usePersisted<number>(KEYS.goal, DEFAULT_GOAL);
  const today = hydrated ? xp[dayKey()] || 0 : 0;
  const pct = Math.min(100, Math.round((today / goal) * 100));
  return (
    <Link href="/progress" className={"xpchip" + (pct >= 100 ? " full" : "")} aria-label={`আজ ${bnNum(today)} XP, লক্ষ্য ${bnNum(goal)}`}>
      <span className="ring sm" style={{ "--p": pct } as React.CSSProperties} />
      <b>{bnNum(today)}</b>
      <small>XP</small>
    </Link>
  );
}

function ScrollBar() {
  const [w, setW] = useState(0);
  const path = usePathname();
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const m = h.scrollHeight - h.clientHeight;
      setW(m > 0 ? (h.scrollTop / m) * 100 : 0);
    };
    on();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on, { passive: true });
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
    };
  }, [path]);
  return <div className="pbar" style={{ width: w + "%" }} />;
}

function ToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(document.documentElement.scrollTop > 700);
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <button
      className={"totop" + (show ? " show" : "")}
      type="button"
      aria-label="উপরে যাও"
      onClick={() => scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" })}
    >
      ↑
    </button>
  );
}

function BottomNav({ page }: { page: number }) {
  const { navOpen, setNavOpen } = useUI();
  const p = useProgress();
  const hydrated = useHydrated();
  const next = hydrated ? Math.min(p.next, COURSE.length - 1) : 0;
  return (
    <nav className="bnav" aria-label="দ্রুত যাও">
      <Link href="/" className={page === -1 && !navOpen ? "on" : ""}>
        <span>🏠</span>হোম
      </Link>
      <Link href={page >= 0 ? lessonHref(page) : lessonHref(next)} className={page >= 0 && !navOpen ? "on" : ""}>
        <span>📖</span>
        {page >= 0 ? "এই পাঠ" : "পড়া চালাও"}
      </Link>
      <Link href="/practice" className={page === -2 && !navOpen ? "on" : ""}>
        <span>🎯</span>অনুশীলন
      </Link>
      <Link href="/lab" className={page === -4 && !navOpen ? "on" : ""}>
        <span>🧪</span>ল্যাব
      </Link>
      <button type="button" className={navOpen ? "on" : ""} onClick={() => setNavOpen(!navOpen)} aria-expanded={navOpen} aria-controls="side">
        <span>☰</span>সূচিপত্র
      </button>
    </nav>
  );
}
