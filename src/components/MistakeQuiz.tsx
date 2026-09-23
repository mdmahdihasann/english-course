"use client";
import { useState } from "react";
import { MISTAKES } from "@/data/games";
import { useHydrated } from "@/lib/store";
import { confetti, pick } from "@/lib/util";
import Quiz, { type Q } from "./Quiz";

const POOL: Q[] = MISTAKES.map(([wrong, right, why]) => ({ q: "নিচের কোন বাক্যটা ঠিক?", o: [wrong, right], a: right, why, s: right }));

export default function MistakeQuiz({ onPass }: { onPass: () => void }) {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="quiz skel" />;
  return <Round onPass={onPass} />;
}

function Round({ onPass }: { onPass: () => void }) {
  const [round, setRound] = useState(() => ({ n: 0, qs: pick(POOL, 10) }));
  return (
    <Quiz
      key={round.n}
      questions={round.qs}
      onEnd={(score) => {
        if (score >= 7) onPass();
        if (score === round.qs.length) confetti();
      }}
      endMessage={(score, total) =>
        score === total
          ? "অসাধারণ! একটাও ভুল নেই 🏆"
          : score >= 7
            ? "পাস করেছ! এবার নিচের বাটন চেপে পাঠ শেষ করো 💪"
            : "৭ পেলে পাস — “সাধারণ ভুল” পাঠটা আরেকবার দেখে আবার চেষ্টা করো 🌱"
      }
      onAgain={() => setRound((r) => ({ n: r.n + 1, qs: pick(POOL, 10) }))}
    />
  );
}
