"use client";
import { useState } from "react";
import { ERRORS } from "@/data/advanced";
import { speak } from "@/lib/speech";
import { KEYS, usePersisted } from "@/lib/store";
import { bnNum, pick } from "@/lib/util";
import { useGainXP } from "@/lib/xp";
import SayButton from "../SayButton";
import { tokens } from "../lab/common";
import { type AdvStats, NO_ADV, ROUND, withRound } from "./common";

type Item = { toks: string[]; bad: number; fix: string; why: string };

const newRound = (): Item[] =>
  pick(ERRORS, ROUND).map(([s, fix, why]) => {
    const raw = tokens(s);
    return { toks: raw.map((t) => t.replace(/\*/g, "")), bad: raw.findIndex((t) => t.includes("*")), fix, why };
  });

export default function ErrorHunt() {
  const gain = useGainXP();
  const [, setStats] = usePersisted<AdvStats>(KEYS.adv, NO_ADV);
  const [items, setItems] = useState(newRound);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const it = items[qi];
  const ok = picked === it.bad;

  const choose = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === it.bad) {
      setScore((s) => s + 1);
      speak(it.fix);
    }
  };

  const next = () => {
    if (qi < items.length - 1) {
      setQi(qi + 1);
      setPicked(null);
    } else {
      setOver(true);
      setStats(withRound("errors", score));
      gain(score * 2, "🔍 ভুল খোঁজা শেষ");
    }
  };

  const again = () => {
    setItems(newRound());
    setQi(0);
    setPicked(null);
    setScore(0);
    setOver(false);
  };

  return (
    <section className="sec adv-sec">
      <h3>🔍 ভুল খোঁজো — গ্রামার গোয়েন্দা</h3>
      <p>প্রতিটা বাক্যে ঠিক একটা ভুল শব্দ লুকিয়ে আছে — IELTS আর চাকরির পরীক্ষায় যেগুলো সবচেয়ে বেশি আসে। ভুল শব্দটায় চাপ দাও।</p>
      <div className="quiz hunt">
        <div className="qbar">
          <span>
            বাক্য {bnNum(Math.min(qi + 1, items.length))} / {bnNum(items.length)}
          </span>
          <span>স্কোর: {bnNum(score)}</span>
        </div>
        <div className="qtrack">
          <i style={{ width: (over ? 100 : (qi / items.length) * 100) + "%" }} />
        </div>
        {over ? (
          <div className="qdone">
            <div className="big">
              {bnNum(score)} / {bnNum(items.length)}
            </div>
            <p>{score === items.length ? "🕵️ নিখুঁত গোয়েন্দা! একটাও ফাঁকি দিতে পারেনি।" : score >= 7 ? "👏 দারুণ চোখ!" : "💪 নিয়মগুলো আরেকবার দেখে নাও, পরের রাউন্ডে আরও ভালো হবে।"}</p>
            <button type="button" className="btn" onClick={again} autoFocus>
              ↻ নতুন রাউন্ড
            </button>
          </div>
        ) : (
          <>
            <p className="hunt-tip">{picked === null ? "👇 কোন শব্দটা ভুল?" : ok ? "✅ ধরে ফেলেছ!" : "❌ ভুলটা ছিল সবুজ শব্দটা"}</p>
            <div className="hunt-line" aria-live="polite">
              {it.toks.map((w, k) => (
                <button
                  key={qi + "-" + k}
                  type="button"
                  className={"tok" + (picked !== null && k === it.bad ? " right" : "") + (picked === k && !ok ? " wrong" : "")}
                  disabled={picked !== null}
                  onClick={() => choose(k)}
                >
                  {w}
                </button>
              ))}
            </div>
            {picked !== null && (
              <div className={"hunt-res" + (ok ? " good" : "")}>
                <small>সঠিক বাক্য</small>
                <p className="hunt-fix">
                  <span className="en">{it.fix}</span>
                  <SayButton text={it.fix} />
                </p>
                <p>💡 {it.why}</p>
              </div>
            )}
            {picked !== null && (
              <button type="button" className="btn" onClick={next} autoFocus>
                {qi === items.length - 1 ? "ফলাফল দেখো" : "পরের বাক্য →"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
