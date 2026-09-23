"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { COURSE } from "@/data/course";
import { GROUPS, GROUP_ICONS, lessonHref, useProgress } from "@/lib/progress";
import { useHydrated } from "@/lib/store";
import { bnNum } from "@/lib/util";
import { useUI } from "./UIProvider";

/** page: lesson index, -1 home, -2 practice, -3 other, -4 lab, -5 progress, -6 advanced */
export default function Sidebar({ page }: { page: number }) {
  const { navOpen, setNavOpen, toast } = useUI();
  const p = useProgress();
  const hydrated = useHydrated();
  const [q, setQ] = useState("");
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    nav.current?.querySelector("a.on")?.scrollIntoView({ block: "center" });
  }, [page, hydrated]);

  const lockedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast("🔒 আগে এই পাঠটা শেষ করো: “" + COURSE[p.next].title + "”");
  };

  const item = (i: number) => {
    const c = COURSE[i];
    const d = hydrated && p.isDone(i);
    const o = !hydrated || p.isOpen(i);
    const nx = hydrated && i === p.next && !d;
    const cls = [i === page ? "on" : "", d ? "done" : "", !o ? "locked" : "", nx ? "next" : ""].join(" ").trim();
    return (
      <Link
        key={c.id}
        className={cls}
        href={o ? lessonHref(i) : "#"}
        onClick={o ? () => setNavOpen(false) : lockedClick}
        aria-disabled={!o || undefined}
        aria-current={i === page ? "page" : undefined}
      >
        <i className="nb">{d ? "✓" : !o ? "🔒" : c.badge}</i>
        <span className="nt">
          <small>{c.tag}</small>
          {c.title}
        </span>
      </Link>
    );
  };

  const query = q.trim().toLowerCase();
  const hits = query
    ? COURSE.map((c, i) => ({ c, i })).filter(({ c }) => (c.title + " " + c.tag + " " + c.group).toLowerCase().includes(query))
    : [];

  return (
    <>
      <div className="scrim" onClick={() => setNavOpen(false)} />
      <aside className="side" id="side" aria-label="অধ্যায়সমূহ" data-open={navOpen || undefined}>
        <div className="side-head">
          <div className="sh-top">
            <div>
              <b>সূচিপত্র</b>
              <small>৩ মাসের কোর্স</small>
            </div>
            <button className="icon-btn side-close" type="button" aria-label="মেনু বন্ধ করো" onClick={() => setNavOpen(false)}>
              ✕
            </button>
          </div>
          <div className="sh-prog">
            <div className="sh-row">
              <span>কোর্সের অগ্রগতি</span>
              <b>{bnNum(hydrated ? p.percent : 0)}%</b>
            </div>
            <div className="sh-bar">
              <i style={{ width: (hydrated ? p.percent : 0) + "%" }} />
            </div>
          </div>
          <label className="sh-search">
            <span aria-hidden>🔍</span>
            <input type="search" placeholder="পাঠ খুঁজো… (যেমন: Past, can)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="পাঠ খুঁজো" />
          </label>
        </div>
        <nav className="side-nav" ref={nav}>
          {query ? (
            <div className="gl flat">{hits.length ? hits.map(({ i }) => item(i)) : <p className="side-empty">কিছু পাওয়া যায়নি</p>}</div>
          ) : (
            <>
              <Link className={"side-home" + (page === -1 ? " on" : "")} href="/" onClick={() => setNavOpen(false)}>
                <span className="gi">🏠</span>হোম ও কোর্স ম্যাপ
              </Link>
              {GROUPS.map((g) => {
                const open = g.items.includes(page) || g.items.includes(p.next) || page === -1;
                const dn = hydrated ? g.items.filter(p.isDone).length : 0;
                return (
                  <details className="ng" key={g.name} open={open}>
                    <summary>
                      <span className="gi">{GROUP_ICONS[g.name] || "📄"}</span>
                      <span className="gn">{g.name}</span>
                      <span className="gc">
                        {bnNum(dn)}/{bnNum(g.items.length)}
                      </span>
                    </summary>
                    <div className="gl">{g.items.map(item)}</div>
                  </details>
                );
              })}
              <Link className={"side-home side-prac" + (page === -2 ? " on" : "")} href="/practice" onClick={() => setNavOpen(false)}>
                <span className="gi">🎯</span>দৈনিক অনুশীলন
              </Link>
              <Link className={"side-home" + (page === -4 ? " on" : "")} href="/lab" onClick={() => setNavOpen(false)}>
                <span className="gi">🧪</span>লার্নিং ল্যাব
              </Link>
              <Link className={"side-home side-adv" + (page === -6 ? " on" : "")} href="/advanced" onClick={() => setNavOpen(false)}>
                <span className="gi">🎓</span>অ্যাডভান্সড স্টুডিও
              </Link>
              <Link className={"side-home" + (page === -5 ? " on" : "")} href="/progress" onClick={() => setNavOpen(false)}>
                <span className="gi">📊</span>আমার অগ্রগতি
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
