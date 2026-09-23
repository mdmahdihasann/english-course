"use client";
import { useState } from "react";
import { COLLOCATIONS, IDIOMS, REGISTER } from "@/data/advanced";
import { KEYS, usePersisted } from "@/lib/store";
import { pick } from "@/lib/util";
import { useGainXP } from "@/lib/xp";
import Quiz, { type Q } from "../Quiz";
import { type AdvStats, type Mode, NO_ADV, ROUND, withRound } from "./common";

type QuizMode = Extract<Mode, "idioms" | "colloc" | "formal">;

function build(mode: QuizMode): Q[] {
  if (mode === "idioms") {
    return pick(IDIOMS, ROUND).map(([en, bn, ex, kind]) => {
      // half the questions go English → Bangla, half Bangla → English
      const same = IDIOMS.filter((x) => x[3] === kind && x[0] !== en);
      const others = pick(same, 3);
      const why = `উদাহরণ: ${ex}`;
      return Math.random() < 0.5
        ? { q: `“${en}” — এর মানে কী?`, o: [bn, ...others.map((x) => x[1])], a: bn, why, s: ex }
        : { q: `“${bn}” — ইংরেজিতে কোনটা?`, o: [en, ...others.map((x) => x[0])], a: en, why, s: ex };
    });
  }
  if (mode === "colloc") {
    return pick(COLLOCATIONS, ROUND).map(([q, o, why]) => ({ q, o, a: o[0], why, s: q.replace("___", o[0]) }));
  }
  return pick(REGISTER, ROUND).map(([inf, o, why]) => ({ q: `ফরমালভাবে বলো: “${inf}”`, o, a: o[0], why, s: o[0] }));
}

const INFO: Record<QuizMode, { h: string; p: string; done: string }> = {
  idioms: {
    h: "💬 Idioms ও Phrasal Verbs",
    p: "নেটিভ স্পিকাররা প্রতিদিন যেসব এক্সপ্রেশন বলে — শব্দ ধরে অনুবাদ করলে মানে মিলবে না। প্রতিটার সাথে একটা বাস্তব উদাহরণ পাবে।",
    done: "💬 Idioms রাউন্ড শেষ",
  },
  colloc: {
    h: "🔗 Collocations — কোন শব্দ কার সঙ্গী",
    p: "ইংরেজিতে কিছু শব্দ জোড়ায় জোড়ায় বসে: make a decision, heavy rain, pay attention। ভুল জোড়া দিলে গ্রামার ঠিক থাকলেও কানে বেখাপ্পা শোনায়।",
    done: "🔗 Collocation রাউন্ড শেষ",
  },
  formal: {
    h: "🎩 ফরমাল ইংলিশ — অফিস ও ইমেইলের ভাষা",
    p: "বন্ধুর সাথে যেভাবে বলো, বসকে সেভাবে লেখা যায় না। কথ্য বাক্যের সবচেয়ে ভদ্র ও পেশাদার রূপটা বেছে নাও।",
    done: "🎩 ফরমাল রাউন্ড শেষ",
  },
};

export default function AdvQuiz({ mode }: { mode: QuizMode }) {
  const gain = useGainXP();
  const [, setStats] = usePersisted<AdvStats>(KEYS.adv, NO_ADV);
  const [round, setRound] = useState(0);
  const [qs, setQs] = useState(() => build(mode));
  const info = INFO[mode];

  return (
    <section className="sec adv-sec">
      <h3>{info.h}</h3>
      <p>{info.p}</p>
      <Quiz
        key={round}
        questions={qs}
        onEnd={(score) => {
          setStats(withRound(mode, score));
          gain(score * 2, info.done);
        }}
        endMessage={(s, t) =>
          s === t ? "🏆 নিখুঁত! তুমি সত্যিই অ্যাডভান্সড।" : s >= t * 0.7 ? "👏 দারুণ! আরেক রাউন্ডে নিখুঁত করো।" : "💪 চালিয়ে যাও — ব্যাখ্যাগুলো আরেকবার পড়ে নাও।"
        }
        againLabel="↻ নতুন রাউন্ড"
        onAgain={() => {
          setQs(build(mode));
          setRound((r) => r + 1);
        }}
      />
    </section>
  );
}
