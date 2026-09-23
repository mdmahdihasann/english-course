"use client";
import Link from "next/link";
import { KEYS, useHydrated, usePersisted } from "@/lib/store";
import { bnNum, dayKey } from "@/lib/util";
import { DEFAULT_GOAL, NO_XP, type XPLog } from "@/lib/xp";
import Dictation from "./Dictation";
import Dictionary from "./Dictionary";
import SentenceBuilder from "./SentenceBuilder";
import SRSReview from "./SRSReview";
import VerbDrill from "./VerbDrill";

const SECTIONS: [string, string][] = [
  ["lsrs", "🧠 রিভিশন"],
  ["lbuild", "🧩 বাক্য সাজাও"],
  ["ldict", "🎧 শুনে লেখো"],
  ["ldrill", "⚡ Verb ড্রিল"],
  ["ldict2", "📚 অভিধান"],
];

export default function Lab() {
  const hydrated = useHydrated();
  const [xp] = usePersisted<XPLog>(KEYS.xp, NO_XP);
  const [goal] = usePersisted<number>(KEYS.goal, DEFAULT_GOAL);
  const today = hydrated ? xp[dayKey()] || 0 : 0;
  const pct = Math.min(100, Math.round((today / goal) * 100));

  return (
    <div className="page">
      <p className="crumb">
        <Link href="/">কোর্স ম্যাপ</Link> <span>›</span> অ্যাডভান্সড ল্যাব
      </p>
      <section className="sec">
        <h2>
          <span className="tag">অ্যাডভান্সড</span>
          <span className="ttl">লার্নিং ল্যাব</span>
        </h2>
        <p>
          পড়া মনে রাখার বৈজ্ঞানিক উপায় (Spaced Repetition), বাক্য গঠন, শোনা-লেখা আর গতি বাড়ানোর খেলা — সব এক জায়গায়। প্রতিটা কাজে <b>XP</b> পাবে, দৈনিক লক্ষ্য পূরণ হলে টানা পড়ার দিন নিজে থেকেই বাড়বে।
        </p>
        <Link href="/progress" className="goalbar">
          <span>🎯 আজকের লক্ষ্য</span>
          <span className="gtrack">
            <i style={{ width: pct + "%" }} />
          </span>
          <b>
            {bnNum(today)} / {bnNum(goal)} XP
          </b>
        </Link>
      </section>

      <nav className="jump" aria-label="ল্যাবের অংশ">
        {SECTIONS.map(([id, l]) => (
          <a key={id} href={"#" + id}>
            {l}
          </a>
        ))}
      </nav>

      {hydrated ? (
        <>
          <SRSReview />
          <SentenceBuilder />
          <Dictation />
          <VerbDrill />
          <Dictionary />
        </>
      ) : (
        <div className="quiz skel" />
      )}
    </div>
  );
}
