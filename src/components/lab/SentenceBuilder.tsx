"use client";
import { useState } from "react";
import { SENT } from "@/data/practice";
import { speak } from "@/lib/speech";
import { KEYS, usePersisted } from "@/lib/store";
import { bnNum, pick, shuffle } from "@/lib/util";
import { useGainXP } from "@/lib/xp";
import SayButton from "../SayButton";
import { type LabStats, NO_LAB, normWords, tokens } from "./common";

const POOL = SENT.filter(([en]) => {
  const n = tokens(en).length;
  return n >= 3 && n <= 10;
});

type Round = { en: string; bn: string; bank: { id: number; w: string }[] };

function newRound(): Round {
  const [en, bn] = pick(POOL, 1)[0];
  const ws = tokens(en).map((w, id) => ({ id, w }));
  let bank = shuffle(ws);
  // never hand out the answer already in order
  for (let k = 0; k < 5 && bank.every((b, i) => b.id === i); k++) bank = shuffle(ws);
  return { en, bn, bank };
}

export default function SentenceBuilder() {
  const gain = useGainXP();
  const [, setLab] = usePersisted<LabStats>(KEYS.lab, NO_LAB);
  const [r, setR] = useState(newRound);
  const [chosen, setChosen] = useState<number[]>([]);
  const [state, setState] = useState<"play" | "right" | "wrong" | "shown">("play");
  const [streak, setStreak] = useState(0);

  const byId = new Map(r.bank.map((b) => [b.id, b.w]));
  const built = chosen.map((id) => byId.get(id)!).join(" ");
  const full = chosen.length === r.bank.length;

  const check = () => {
    // same words in the same order counts, even if two identical words swapped places
    const ok = normWords(built).join(" ") === normWords(r.en).join(" ");
    if (ok) {
      setState("right");
      setStreak((s) => s + 1);
      setLab((s) => ({ ...s, built: s.built + 1 }));
      speak(r.en);
      gain(3, "✅ দারুণ");
    } else {
      setState("wrong");
      setStreak(0);
    }
  };

  const next = () => {
    setR(newRound());
    setChosen([]);
    setState("play");
  };

  const locked = state === "right" || state === "shown";

  return (
    <section className="sec" id="lbuild">
      <h3>🧩 বাক্য সাজাও</h3>
      <p>বাংলা বাক্যটা দেখে নিচের শব্দগুলো ঠিক ক্রমে চাপো। ইংরেজি বাক্যের গঠন (Subject → Verb → Object) মাথায় বসে যাবে।</p>
      <div className="build">
        <div className="qbar">
          <span>টানা সঠিক: {bnNum(streak)} 🔥</span>
          <button type="button" className="link" onClick={next}>
            অন্য বাক্য →
          </button>
        </div>
        <p className="build-bn">{r.bn}</p>
        <div className={"build-line " + state} aria-live="polite">
          {chosen.length ? (
            chosen.map((id) => (
              <button
                key={id}
                type="button"
                className="tok on"
                disabled={locked}
                onClick={() => {
                  setChosen((c) => c.filter((x) => x !== id));
                  setState("play");
                }}
              >
                {byId.get(id)}
              </button>
            ))
          ) : (
            <span className="build-ph">এখানে বাক্যটা তৈরি হবে…</span>
          )}
        </div>
        <div className="build-bank">
          {r.bank.map((b) => (
            <button
              key={b.id}
              type="button"
              className="tok"
              disabled={locked || chosen.includes(b.id)}
              onClick={() => {
                setChosen((c) => [...c, b.id]);
                setState("play");
              }}
            >
              {b.w}
            </button>
          ))}
        </div>
        {state === "wrong" && <p className="qwhy">❌ ক্রমটা ঠিক হয়নি — কোন শব্দটা ভুল জায়গায় আছে খুঁজে বের করো (চাপলে ফিরে যাবে)।</p>}
        {(state === "right" || state === "shown") && (
          <p className="qwhy">
            {state === "right" ? "✅ একদম ঠিক!" : "সঠিক বাক্য:"} <b className="en">{r.en}</b> <SayButton text={r.en} />
          </p>
        )}
        <div className="cta">
          {locked ? (
            <button type="button" className="btn" onClick={next} autoFocus>
              পরের বাক্য →
            </button>
          ) : (
            <>
              <button type="button" className="btn" disabled={!full} onClick={check}>
                ✔ মিলিয়ে দেখো
              </button>
              <button type="button" className="btn ghost" disabled={!chosen.length} onClick={() => setChosen([])}>
                ↺ মুছে ফেলো
              </button>
              <button
                type="button"
                className="link"
                onClick={() => {
                  setState("shown");
                  setStreak(0);
                  setChosen(r.bank.map((b) => b.id).sort((a, b) => a - b));
                }}
              >
                উত্তর দেখাও
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
