"use client";
import { useEffect, useRef, useState } from "react";
import { VERBS } from "@/data/games";
import { speak } from "@/lib/speech";
import { bnNum, shuffle } from "@/lib/util";
import { useUI } from "./UIProvider";

const ALL = VERBS.map((_, i) => i);

export default function FlashCards({ onAllSeen }: { onAllSeen: () => void }) {
  const { toast } = useUI();
  const [order, setOrder] = useState(ALL);
  const [fi, setFi] = useState(0);
  const [flip, setFlip] = useState(false);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const [shown, setShown] = useState(0); // card face lags a bit so the back isn't revealed while un-flipping
  const [playing, setPlaying] = useState(false);
  const sx = useRef<number | null>(null);

  const v = VERBS[order[shown]];

  useEffect(() => {
    const t = setTimeout(() => setShown(fi), 150);
    return () => clearTimeout(t);
  }, [fi, order]);

  useEffect(() => {
    if (seen.size === VERBS.length) onAllSeen();
  }, [seen, onAllSeen]);

  const go = (d: number) => {
    setFlip(false);
    setFi((x) => (x + d + VERBS.length) % VERBS.length);
  };
  const toggle = () => {
    if (!flip) setSeen((s) => new Set(s).add(order[fi]));
    setFlip(!flip);
  };

  return (
    <div className="fc-wrap">
      <button
        className={"fc" + (flip ? " flip" : "")}
        type="button"
        aria-label="কার্ড উল্টাও"
        onClick={toggle}
        onTouchStart={(e) => (sx.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (sx.current === null) return;
          const dx = e.changedTouches[0].clientX - sx.current;
          sx.current = null;
          if (Math.abs(dx) > 60) {
            e.preventDefault();
            go(dx < 0 ? 1 : -1);
          }
        }}
      >
        <span className="fc-in">
          <span className="fc-front">
            <small>এর অতীত রূপ কী?</small>
            <b>{v[0]}</b>
            <em>{v[3]}</em>
          </span>
          <span className="fc-back">
            <small>V1 – V2 – V3</small>
            <b>
              {v[0]} – {v[1]} – {v[2]}
            </b>
            <em>ট্যাপ করে আবার দেখো</em>
          </span>
        </span>
      </button>
      <div className="fc-nav">
        <button type="button" className="btn ghost" onClick={() => go(-1)}>
          আগের
        </button>
        <span className="fc-count">
          {bnNum(fi + 1)} / {bnNum(VERBS.length)}
        </span>
        <button
          type="button"
          className={"btn ghost" + (playing ? " playing" : "")}
          aria-label="উচ্চারণ শোনো"
          onClick={() => {
            const w = VERBS[order[fi]];
            setPlaying(true);
            if (!speak(`${w[0]}, ${w[1]}, ${w[2]}`, () => setPlaying(false))) setPlaying(false);
          }}
        >
          🔊 শোনো
        </button>
        <button type="button" className="btn" onClick={() => go(1)}>
          পরের
        </button>
      </div>
      <button
        type="button"
        className="link"
        onClick={() => {
          setOrder(shuffle(ALL));
          setFi(0);
          setFlip(false);
          toast("কার্ডগুলো এলোমেলো করা হলো");
        }}
      >
        এলোমেলো করো
      </button>
      <p className="fc-seen">
        উল্টে দেখা হয়েছে: {bnNum(seen.size)} / {bnNum(VERBS.length)}
      </p>
      <p className="fc-tip">💡 মোবাইলে কার্ডটা ডানে-বাঁয়ে সোয়াইপ করেও বদলাতে পারো।</p>
    </div>
  );
}
