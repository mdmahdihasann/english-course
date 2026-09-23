"use client";
import { useRef, useState } from "react";
import { SENT } from "@/data/practice";
import { speak } from "@/lib/speech";
import { KEYS, usePersisted } from "@/lib/store";
import { bnNum, pick } from "@/lib/util";
import { useGainXP } from "@/lib/xp";
import { useUI } from "../UIProvider";
import { diffWords, type LabStats, NO_LAB, tokens } from "./common";

const POOL = SENT.filter(([en]) => tokens(en).length <= 9);

export default function Dictation() {
  const { toast } = useUI();
  const gain = useGainXP();
  const [, setLab] = usePersisted<LabStats>(KEYS.lab, NO_LAB);
  const [cur, setCur] = useState(() => pick(POOL, 1)[0]);
  const [text, setText] = useState("");
  const [plays, setPlays] = useState(0);
  const [res, setRes] = useState<ReturnType<typeof diffWords> | null>(null);
  const [total, setTotal] = useState({ n: 0, ok: 0 });
  const inp = useRef<HTMLInputElement>(null);

  const play = (slow = false) => {
    if (!speak(cur[0], undefined, slow ? { rate: 0.55 } : undefined)) return toast("তোমার ব্রাউজারে উচ্চারণ শোনার সুবিধা নেই");
    setPlays((p) => p + 1);
    inp.current?.focus();
  };

  const check = () => {
    if (!text.trim()) return toast("আগে শুনে যা শুনলে সেটা লেখো ✍️");
    const d = diffWords(cur[0], text);
    setRes(d);
    setTotal((t) => ({ n: t.n + 1, ok: t.ok + (d.exact ? 1 : 0) }));
    setLab((s) => ({ ...s, dict: s.dict + 1 }));
    if (d.exact) gain(plays <= 1 ? 5 : 3, "🎧 নিখুঁত");
    else if (d.score >= 70) gain(1);
  };

  const next = () => {
    setCur(pick(POOL.filter((x) => x !== cur), 1)[0]);
    setText("");
    setRes(null);
    setPlays(0);
    setTimeout(() => inp.current?.focus(), 0);
  };

  return (
    <section className="sec" id="ldict">
      <h3>🎧 শুনে লেখো (Dictation)</h3>
      <p>বাক্যটা শোনো, তারপর হুবহু ইংরেজিতে লেখো। কান আর বানান — দুটোই একসাথে পাকা হবে। একবার শুনেই ঠিক লিখলে বেশি XP।</p>
      <div className="speak dict">
        <div className="qbar wide">
          <span>
            সঠিক: {bnNum(total.ok)} / {bnNum(total.n)}
          </span>
          <span>শুনেছ: {bnNum(plays)} বার</span>
        </div>
        <div className="dict-play">
          <button type="button" className="mic listen" onClick={() => play()} aria-label="বাক্যটা শোনো">
            🔊
          </button>
          <button type="button" className="link" onClick={() => play(true)}>
            🐢 আস্তে শোনো
          </button>
        </div>
        <form
          className="dict-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (res) next();
            else check();
          }}
        >
          <input
            ref={inp}
            className="field"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="যা শুনলে লেখো… (Type what you hear)"
            autoComplete="off"
            autoCapitalize="sentences"
            spellCheck={false}
            readOnly={!!res}
            aria-label="যা শুনলে লেখো"
          />
          <button type="submit" className="btn">
            {res ? "পরেরটা →" : "✔ মিলিয়ে দেখো"}
          </button>
        </form>
        {res && (
          <div className={"dict-res" + (res.exact ? " good" : "")} aria-live="polite">
            <div className="en">
              {res.words.map((w, i) => (
                <span key={i} className={w.ok ? "sw ok" : "sw miss"}>
                  {w.raw}{" "}
                </span>
              ))}
            </div>
            <small translate="no">{cur[1]}</small>
            <p>
              {res.exact
                ? "✅ নিখুঁত! সব শব্দ ঠিক।"
                : `${bnNum(res.score)}% মিলেছে — লাল শব্দগুলো ছুটে গেছে বা ভুল বানান হয়েছে।` +
                  (res.extra.length ? ` বাড়তি লিখেছ: “${res.extra.join(", ")}”` : "")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
