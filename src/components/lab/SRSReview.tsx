"use client";
import { useEffect, useState } from "react";
import { DECKS, type Deck, type Grade, masteredCount, NEW_PER_DAY, NO_SRS, NO_SRS_DAY, preview, queueOf, schedule, type SRSDay, type SRSMap } from "@/lib/srs";
import { KEYS, read, usePersisted } from "@/lib/store";
import { bnNum, dayKey } from "@/lib/util";
import { useGainXP } from "@/lib/xp";
import SayButton from "../SayButton";
import { useUI } from "../UIProvider";
import { type LabStats, NO_LAB } from "./common";

const GRADES: { g: Grade; label: string; cls: string }[] = [
  { g: 0, label: "আবার", cls: "g0" },
  { g: 1, label: "কঠিন", cls: "g1" },
  { g: 2, label: "ভালো", cls: "g2" },
  { g: 3, label: "সহজ", cls: "g3" },
];

const ivLabel = (d: number) => (d === 0 ? "এখনই" : d < 30 ? bnNum(d) + " দিন" : d < 365 ? bnNum(Math.round(d / 30)) + " মাস" : "১ বছর");

export default function SRSReview() {
  const { toast } = useUI();
  const gain = useGainXP();
  const [map, setMap] = usePersisted<SRSMap>(KEYS.srs, NO_SRS);
  const [day, setDay] = usePersisted<SRSDay>(KEYS.srsDay, NO_SRS_DAY);
  const [, setLab] = usePersisted<LabStats>(KEYS.lab, NO_LAB);
  const [deck, setDeck] = useState<Deck>("w");
  const [session, setSession] = useState<string[] | null>(null);
  const [shown, setShown] = useState(false);
  const [doneN, setDoneN] = useState(0);

  const q = queueOf(deck, map, day);
  const byId = new Map(DECKS[deck].cards.map((c) => [c.id, c]));
  const card = session?.length ? byId.get(session[0]) : undefined;

  const start = () => {
    if (!q.all.length) return toast("এই ডেকে আজ আর কিছু বাকি নেই ✅");
    setSession(q.all.map((c) => c.id));
    setShown(false);
    setDoneN(0);
  };

  const grade = (g: Grade) => {
    if (!card || !session) return;
    const cur = read<SRSMap>(KEYS.srs, NO_SRS);
    const isNew = !cur[card.id];
    setMap({ ...cur, [card.id]: schedule(cur[card.id], g) });
    if (isNew) {
      const today = dayKey();
      setDay((d) => ({ day: today, fresh: (d.day === today ? d.fresh : 0) + 1 }));
    }
    setLab((s) => ({ ...s, reviews: s.reviews + 1 }));
    // "again" goes back into this session, a few cards later
    const rest = session.slice(1);
    if (g === 0) rest.splice(Math.min(3, rest.length), 0, card.id);
    setSession(rest);
    setShown(false);
    if (g > 0) {
      setDoneN((n) => n + 1);
      gain(g === 1 ? 1 : 2);
    }
    if (!rest.length) toast("🎉 আজকের রিভিশন শেষ!");
  };

  // keyboard: Space / Enter shows the answer, 1–4 grades
  useEffect(() => {
    if (!card) return;
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea")) return;
      if (!shown && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setShown(true);
      } else if (shown && ["1", "2", "3", "4"].includes(e.key)) grade((+e.key - 1) as Grade);
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  });

  return (
    <section className="sec" id="lsrs">
      <h3>🧠 স্মার্ট রিভিশন</h3>
      <p>
        ভুলে যাওয়ার ঠিক আগে আবার দেখানো হয় (Spaced Repetition)। যেটা সহজ লাগে সেটা অনেক দিন পরে আসবে, যেটা কঠিন সেটা বারবার আসবে। প্রতিদিন {bnNum(NEW_PER_DAY)}টা করে নতুন কার্ড যোগ হয়।
      </p>
      <div className="qmode">
        {(Object.keys(DECKS) as Deck[]).map((d) => {
          const n = queueOf(d, map, day).all.length;
          return (
            <button
              key={d}
              type="button"
              className={"chip" + (deck === d ? " on" : "")}
              onClick={() => {
                setDeck(d);
                setSession(null);
              }}
            >
              {DECKS[d].icon} {DECKS[d].name} <span className="cnt">{bnNum(n)}</span>
            </button>
          );
        })}
      </div>

      <div className="srs">
        {!session ? (
          <div className="srs-idle">
            <div className="srs-nums">
              <div>
                <b>{bnNum(q.due.length)}</b>
                <small>রিভিশন বাকি</small>
              </div>
              <div>
                <b>{bnNum(q.fresh.length)}</b>
                <small>নতুন কার্ড</small>
              </div>
              <div>
                <b>{bnNum(masteredCount(map))}</b>
                <small>পাকা হয়েছে</small>
              </div>
            </div>
            <button type="button" className="btn" onClick={start} disabled={!q.all.length}>
              {q.all.length ? "▶ রিভিশন শুরু করো (" + bnNum(q.all.length) + ")" : "✅ আজ আর কিছু বাকি নেই"}
            </button>
          </div>
        ) : !card ? (
          <div className="srs-idle">
            <div className="finish-ic">🏆</div>
            <p>
              <b>{bnNum(doneN)}টা কার্ড</b> রিভিশন হলো। কাল আবার এসো — সময়মতো কার্ডগুলো ফিরে আসবে।
            </p>
            <button type="button" className="btn ghost" onClick={() => setSession(null)}>
              ঠিক আছে
            </button>
          </div>
        ) : (
          <>
            <div className="qbar">
              <span>বাকি: {bnNum(session.length)}</span>
              <span>{map[card.id] ? "🔁 রিভিশন" : "✨ নতুন"}</span>
            </div>
            <div className={"srs-card" + (card.deck === "s" ? " bnf" : "")}>
              <div className="srs-front" translate={card.deck === "s" ? "no" : undefined}>
                {card.front}
                {card.deck !== "s" && <SayButton text={card.front} />}
              </div>
              {card.deck === "v" && !shown && <small className="srs-q">V2 আর V3 কী?</small>}
              {card.deck === "s" && !shown && <small className="srs-q">ইংরেজিতে জোরে বলো, তারপর উত্তর দেখো</small>}
              {shown && (
                <div className="srs-back">
                  <div className={card.deck === "w" ? "" : "en"} translate={card.deck === "w" ? "no" : undefined}>
                    {card.back}
                    {card.deck === "s" && <SayButton text={card.back} />}
                  </div>
                  {card.ex && (
                    <small>
                      {card.ex}
                      {card.deck === "w" && <SayButton text={card.ex} />}
                    </small>
                  )}
                </div>
              )}
            </div>
            {!shown ? (
              <button type="button" className="btn wide" onClick={() => setShown(true)} autoFocus>
                উত্তর দেখো <kbd>Space</kbd>
              </button>
            ) : (
              <div className="grades" role="group" aria-label="কতটা মনে ছিল?">
                {GRADES.map(({ g, label, cls }) => (
                  <button key={g} type="button" className={"grade " + cls} onClick={() => grade(g)}>
                    <b>{label}</b>
                    <small>{ivLabel(preview(map[card.id], g))}</small>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
