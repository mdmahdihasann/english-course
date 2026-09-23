"use client";
import { useEffect, useRef, useState } from "react";
import { VERBS } from "@/data/games";
import { KEYS, usePersisted } from "@/lib/store";
import { bnNum, confetti } from "@/lib/util";
import { useGainXP } from "@/lib/xp";
import { type LabStats, NO_LAB } from "./common";

const SECONDS = 60;
type Ask = { v: number; form: 1 | 2 };

const newAsk = (prev?: Ask): Ask => {
  let v = Math.floor(Math.random() * VERBS.length);
  if (prev && v === prev.v) v = (v + 1) % VERBS.length;
  return { v, form: Math.random() < 0.5 ? 1 : 2 };
};
const answers = (a: Ask) => VERBS[a.v][a.form].split("/").map((x) => x.trim().toLowerCase());

export default function VerbDrill() {
  const gain = useGainXP();
  const [lab, setLab] = usePersisted<LabStats>(KEYS.lab, NO_LAB);
  const [phase, setPhase] = useState<"idle" | "run" | "over">("idle");
  const [left, setLeft] = useState(SECONDS);
  const [ask, setAsk] = useState<Ask>(() => newAsk());
  const [text, setText] = useState("");
  const [score, setScore] = useState(0);
  const [miss, setMiss] = useState<{ q: string; a: string }[]>([]);
  const [flash, setFlash] = useState<"" | "ok" | "no">("");
  const [prevBest, setPrevBest] = useState(0);
  const inp = useRef<HTMLInputElement>(null);
  const endAt = useRef(0);

  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => {
      const s = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) setPhase("over");
    }, 200);
    return () => clearInterval(t);
  }, [phase]);

  // record the result once, when the round ends
  const recorded = useRef(false);
  useEffect(() => {
    if (phase !== "over" || recorded.current) return;
    recorded.current = true;
    setLab((s) => ({ ...s, drills: s.drills + 1, drillBest: Math.max(s.drillBest, score) }));
    if (score > prevBest && score >= 5) confetti();
    gain(score, "⚡ ড্রিল শেষ");
  }, [phase, score, prevBest, setLab, gain]);

  const start = () => {
    recorded.current = false;
    setPrevBest(lab.drillBest);
    endAt.current = Date.now() + SECONDS * 1000;
    setLeft(SECONDS);
    setScore(0);
    setMiss([]);
    setText("");
    setAsk(newAsk());
    setPhase("run");
    setTimeout(() => inp.current?.focus(), 0);
  };

  const submit = () => {
    const t = text.trim().toLowerCase();
    if (!t) return;
    const ok = answers(ask).includes(t);
    if (ok) setScore((s) => s + 1);
    else setMiss((m) => [...m, { q: VERBS[ask.v][0] + " → " + (ask.form === 1 ? "V2" : "V3"), a: VERBS[ask.v][ask.form] }]);
    setFlash(ok ? "ok" : "no");
    setTimeout(() => setFlash(""), 350);
    setText("");
    setAsk((a) => newAsk(a));
  };

  const verb = VERBS[ask.v];

  return (
    <section className="sec" id="ldrill">
      <h3>⚡ Verb স্পিড ড্রিল</h3>
      <p>৬০ সেকেন্ডে যত বেশি পারো Verb-এর ২য় (V2) বা ৩য় (V3) রূপ টাইপ করো। Past আর Present Perfect বলতে গেলে এগুলো মুখে মুখে থাকা চাই।</p>
      <div className={"speak drill " + flash}>
        {phase === "idle" && (
          <>
            <div className="drill-big">⏱ {bnNum(SECONDS)}s</div>
            <p className="speak-status">সেরা স্কোর: {lab.drills ? bnNum(lab.drillBest) : "—"}</p>
            <button type="button" className="btn" onClick={start}>
              ▶ শুরু করো
            </button>
          </>
        )}
        {phase === "run" && (
          <>
            <div className="qbar wide">
              <span>স্কোর: {bnNum(score)}</span>
              <span className={left <= 10 ? "hot" : ""}>⏱ {bnNum(left)}s</span>
            </div>
            <div className="qtrack wide">
              <i style={{ width: (left / SECONDS) * 100 + "%" }} />
            </div>
            <div className="drill-q">
              <b>{verb[0]}</b>
              <span>
                <em>{ask.form === 1 ? "V2 (অতীত)" : "V3 (Past Participle)"}</em> · {verb[3]}
              </span>
            </div>
            <form
              className="dict-form"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <input
                ref={inp}
                className="field"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={ask.form === 1 ? "V2 লেখো…" : "V3 লেখো…"}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-label="উত্তর লেখো"
              />
              <button type="submit" className="btn">
                ↵
              </button>
            </form>
          </>
        )}
        {phase === "over" && (
          <>
            <div className="qdone">
              <div className="big">{bnNum(score)}</div>
              <p>{score > prevBest ? "🏆 নতুন রেকর্ড!" : "সেরা: " + bnNum(lab.drillBest)}</p>
            </div>
            {miss.length > 0 && (
              <div className="drill-miss">
                <b>যেগুলো ভুল হয়েছে:</b>
                <ul>
                  {miss.slice(0, 12).map((m, i) => (
                    <li key={i}>
                      <span className="en">{m.q}</span> = <b className="en">{m.a}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button type="button" className="btn" onClick={start} autoFocus>
              ↻ আবার খেলো
            </button>
          </>
        )}
      </div>
    </section>
  );
}
