"use client";
import Link from "next/link";
import { useRef } from "react";
import { COLLOCATIONS, ERRORS, IDIOMS, REGISTER } from "@/data/advanced";
import { KEYS, useHydrated, usePersisted } from "@/lib/store";
import { bnNum, dayKey, reducedMotion } from "@/lib/util";
import { NO_XP, type XPLog } from "@/lib/xp";
import AdvQuiz from "./AdvQuiz";
import { type AdvStats, type Mode, NO_ADV, ROUND } from "./common";
import ErrorHunt from "./ErrorHunt";
import Polisher from "./Polisher";

const MODES: { id: Mode; icon: string; t: string; d: string }[] = [
  { id: "polish", icon: "✍️", t: "রাইটিং পলিশার", d: "তোমার লেখার ভুল, দুর্বল শব্দ আর কথ্য ভাষা ধরে উন্নত বিকল্প দেখায়" },
  { id: "idioms", icon: "💬", t: "Idioms", d: `${bnNum(IDIOMS.length)}টা idiom ও phrasal verb` },
  { id: "errors", icon: "🔍", t: "ভুল খোঁজো", d: `${bnNum(ERRORS.length)}টা গ্রামার ফাঁদ` },
  { id: "colloc", icon: "🔗", t: "Collocations", d: `${bnNum(COLLOCATIONS.length)}টা শব্দজোড়া` },
  { id: "formal", icon: "🎩", t: "ফরমাল ইংলিশ", d: `${bnNum(REGISTER.length)}টা অফিসের বাক্য` },
];
const IDS = MODES.map((m) => m.id);

export default function Advanced() {
  const hydrated = useHydrated();
  const [tabRaw, setTab] = usePersisted<Mode>(KEYS.advTab, "polish");
  const [stats] = usePersisted<AdvStats>(KEYS.adv, NO_ADV);
  const [xp] = usePersisted<XPLog>(KEYS.xp, NO_XP);
  const body = useRef<HTMLDivElement>(null);
  const tab = IDS.includes(tabRaw) ? tabRaw : "polish";
  const today = hydrated ? xp[dayKey()] || 0 : 0;

  const open = (id: Mode) => {
    setTab(id);
    requestAnimationFrame(() => body.current?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" }));
  };

  return (
    <div className="page adv">
      <p className="crumb">
        <Link href="/">কোর্স ম্যাপ</Link> <span>›</span> অ্যাডভান্সড স্টুডিও
      </p>

      <section className="adv-hero">
        <span className="adv-badge">B2 → C1 · অ্যাডভান্সড</span>
        <h2>অ্যাডভান্সড স্টুডিও</h2>
        <p>গ্রামার জানো? এবার ইংরেজিকে নেটিভদের মতো স্বাভাবিক, নির্ভুল আর পেশাদার করার পালা — নিজের লেখা পলিশ করো, idiom শেখো, সূক্ষ্ম ভুল ধরো।</p>
        <div className="adv-kpis">
          <div>
            <b>{bnNum(hydrated ? stats.rounds : 0)}</b>
            <small>রাউন্ড খেলেছ</small>
          </div>
          <div>
            <b>{bnNum(hydrated ? stats.fixes : 0)}</b>
            <small>শব্দ উন্নত করেছ</small>
          </div>
          <div>
            <b>{bnNum(today)}</b>
            <small>আজকের XP</small>
          </div>
        </div>
      </section>

      <div className="adv-modes" role="tablist" aria-label="অ্যাডভান্সড টুল">
        {MODES.map((m) => {
          const best = hydrated ? stats.best[m.id] : undefined;
          const on = hydrated && tab === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={"adv-mode m-" + m.id + (on ? " on" : "")}
              onClick={() => open(m.id)}
            >
              <span className="am-i">{m.icon}</span>
              <span className="am-t">
                <b>{m.t}</b>
                <small>{m.d}</small>
              </span>
              {m.id === "polish" ? (
                <span className="am-new">নতুন</span>
              ) : (
                best !== undefined && (
                  <span className="am-best">
                    🏆 {bnNum(best)}/{bnNum(ROUND)}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>

      <div ref={body} className="adv-body" role="tabpanel">
        {!hydrated ? (
          <div className="quiz skel" />
        ) : tab === "polish" ? (
          <Polisher />
        ) : tab === "errors" ? (
          <ErrorHunt />
        ) : (
          <AdvQuiz key={tab} mode={tab} />
        )}
      </div>
    </div>
  );
}
