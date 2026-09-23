"use client";
import { useMemo, useState } from "react";
import { speak } from "@/lib/speech";
import { bnNum, hasBn, shuffle } from "@/lib/util";

export type Q = { q: string; o: string[]; a: string; why: string; s: string };

/**
 * Shared quiz widget (lesson quiz + practice quiz).
 * `onAnswer` fires per question, `onEnd` once with the final score.
 */
export default function Quiz({
  questions,
  onAnswer,
  onEnd,
  endMessage,
  againLabel = "আবার খেলো",
  onAgain,
}: {
  questions: Q[];
  onAnswer?: (q: Q, ok: boolean) => void;
  onEnd?: (score: number) => void;
  endMessage: (score: number, total: number) => string;
  againLabel?: string;
  onAgain: () => void;
}) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const q = questions[qi];
  const opts = useMemo(() => shuffle(q?.o ?? []), [q]);
  const total = questions.length;

  if (!q) return null;

  const choose = (t: string) => {
    if (picked) return;
    const ok = t === q.a;
    setPicked(t);
    if (ok) {
      setScore((s) => s + 1);
      speak(q.s);
    }
    onAnswer?.(q, ok);
  };

  const next = () => {
    if (qi < total - 1) {
      setQi(qi + 1);
      setPicked(null);
    } else {
      setOver(true);
      onEnd?.(score);
    }
  };

  const ok = picked === q.a;

  return (
    <div className="quiz">
      <div className="qbar">
        <span>
          প্রশ্ন {bnNum(Math.min(qi + 1, total))} / {bnNum(total)}
        </span>
        <span>স্কোর: {bnNum(score)}</span>
      </div>
      <div className="qtrack">
        <i style={{ width: (over ? 100 : (qi / total) * 100) + "%" }} />
      </div>
      {over ? (
        <div className="qdone">
          <div className="big">
            {bnNum(score)} / {bnNum(total)}
          </div>
          <p>{endMessage(score, total)}</p>
          <button type="button" className="btn" onClick={onAgain}>
            {againLabel}
          </button>
        </div>
      ) : (
        <>
          <p className={"qask" + (hasBn(q.q) ? "" : " en")}>{q.q}</p>
          <div className="qopts">
            {opts.map((t) => (
              <button
                key={t}
                type="button"
                className={"qopt" + (picked && t === q.a ? " right" : "") + (picked === t && !ok ? " wrong" : "")}
                disabled={!!picked}
                onClick={() => choose(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="qwhy" aria-live="polite">
            {picked &&
              (ok ? (
                <>✅ ঠিক! {q.why}</>
              ) : (
                <>
                  ❌ সঠিক হলো: <b className="en">{q.a}</b> — {q.why}
                </>
              ))}
          </p>
          {picked && (
            <button type="button" className="btn" onClick={next} autoFocus>
              {qi === total - 1 ? "ফলাফল দেখো" : "পরের প্রশ্ন"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
