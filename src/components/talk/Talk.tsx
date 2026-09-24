"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { LEVELS, SCENES } from "@/data/talk";
import { KEYS, useHydrated, usePersisted } from "@/lib/store";
import { bnNum, dayKey, reducedMotion } from "@/lib/util";
import { NO_XP, type XPLog } from "@/lib/xp";
import Listen from "./Listen";
import Phrases from "./Phrases";
import RolePlay from "./RolePlay";
import { NO_TALK, type TalkStats } from "./common";

type Mode = "listen" | "play" | "phrases";
const MODES: { id: Mode; t: string }[] = [
  { id: "listen", t: "👀 শোনো" },
  { id: "play", t: "🎭 রোল-প্লে" },
  { id: "phrases", t: "🔑 কাজের বাক্য" },
];

export default function Talk() {
  const hydrated = useHydrated();
  const [stats] = usePersisted<TalkStats>(KEYS.talk, NO_TALK);
  const [xp] = usePersisted<XPLog>(KEYS.xp, NO_XP);
  const [sid, setSid] = useState(SCENES[0].id);
  const [mode, setMode] = useState<Mode>("listen");
  const stage = useRef<HTMLDivElement>(null);
  const scene = SCENES.find((s) => s.id === sid) ?? SCENES[0];
  const today = hydrated ? xp[dayKey()] || 0 : 0;
  const done = hydrated ? SCENES.filter((s) => stats.best[s.id] !== undefined).length : 0;

  const open = (id: string) => {
    setSid(id);
    setMode("listen");
    requestAnimationFrame(() => stage.current?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" }));
  };

  return (
    <div className="page talk">
      <p className="crumb">
        <Link href="/">কোর্স ম্যাপ</Link> <span>›</span> রোল-প্লে স্টুডিও
      </p>

      <section className="talk-hero">
        <div className="th-glow" aria-hidden />
        <div className="th-text">
          <span className="adv-badge">
            <i className="live-dot" /> ভার্চুয়াল পার্টনার · কথা বলার অনুশীলন
          </span>
          <h2>রোল-প্লে স্টুডিও</h2>
          <p>বাস্তব জীবনের কথোপকথন — আগে শোনো, তারপর নিজেই চরিত্রে ঢুকে বলো বা লেখো। স্মার্ট কোচ সাথে সাথে ভুল ধরিয়ে দেবে।</p>
        </div>
        <div className="th-chat" aria-hidden>
          <span className="tb a">Hi! Can I help you?</span>
          <span className="tb b">I&apos;m looking for…</span>
          <span className="tb a dots">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="adv-kpis">
          <div>
            <b>
              {bnNum(done)}/{bnNum(SCENES.length)}
            </b>
            <small>দৃশ্য শেষ</small>
          </div>
          <div>
            <b>{bnNum(hydrated ? stats.lines : 0)}</b>
            <small>লাইন বলেছ</small>
          </div>
          <div>
            <b>{bnNum(today)}</b>
            <small>আজকের XP</small>
          </div>
        </div>
      </section>

      <div className="talk-scenes" role="list">
        {SCENES.map((s) => {
          const best = hydrated ? stats.best[s.id] : undefined;
          return (
            <button key={s.id} type="button" role="listitem" className={"tscene lv" + s.level + (s.id === sid ? " on" : "") + (best !== undefined ? " done" : "")} onClick={() => open(s.id)}>
              <span className="ts-i">{s.icon}</span>
              <span className="ts-t">
                <b>{s.title}</b>
                <small>{s.sub}</small>
              </span>
              <span className="ts-meta">
                <em className="ts-lv">{LEVELS[s.level]}</em>
                {best !== undefined && <em className="ts-best">✓ {bnNum(best)}%</em>}
              </span>
            </button>
          );
        })}
      </div>

      <div ref={stage} className="talk-stage">
        <div className="tst-head">
          <span className="tst-i">{scene.icon}</span>
          <div>
            <b>{scene.title}</b>
            <small>{scene.sub}</small>
          </div>
        </div>
        <div className="seg talk-seg" role="tablist" aria-label="মোড">
          {MODES.map((m) => (
            <button key={m.id} type="button" role="tab" aria-selected={mode === m.id} className={mode === m.id ? "on" : ""} onClick={() => setMode(m.id)}>
              {m.t}
            </button>
          ))}
        </div>
        {!hydrated ? (
          <div className="quiz skel" />
        ) : mode === "listen" ? (
          <Listen key={scene.id} scene={scene} onPlay={() => setMode("play")} />
        ) : mode === "play" ? (
          <RolePlay key={scene.id} scene={scene} onListen={() => setMode("listen")} />
        ) : (
          <Phrases scene={scene} />
        )}
      </div>
    </div>
  );
}
