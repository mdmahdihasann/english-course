"use client";
import { useDeferredValue, useMemo, useState } from "react";
import { VERBS } from "@/data/games";
import { SENT, WORDS } from "@/data/practice";
import { bnNum } from "@/lib/util";
import SayButton from "../SayButton";

type Hit = { kind: "শব্দ" | "Verb" | "বাক্য"; en: string; bn: string; ex?: string };

const INDEX: (Hit & { key: string })[] = [
  ...VERBS.map(([v1, v2, v3, bn]): Hit => ({ kind: "Verb", en: `${v1} · ${v2} · ${v3}`, bn })),
  ...WORDS.map(([en, bn, ex]): Hit => ({ kind: "শব্দ", en, bn, ex })),
  ...SENT.map(([en, bn]): Hit => ({ kind: "বাক্য", en, bn })),
].map((h) => ({ ...h, key: (h.en + " " + h.bn + " " + (h.ex ?? "")).toLowerCase() }));

const LIMIT = 40;

export default function Dictionary() {
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q.trim().toLowerCase());

  const hits = useMemo(() => {
    if (!dq) return [];
    // exact word / start-of-word matches first
    const starts = (h: (typeof INDEX)[number]) => (h.en.toLowerCase().startsWith(dq) || h.bn.startsWith(dq) ? 0 : 1);
    return INDEX.filter((h) => h.key.includes(dq)).sort((a, b) => starts(a) - starts(b));
  }, [dq]);

  return (
    <section className="sec" id="ldict2">
      <h3>📚 পকেট অভিধান</h3>
      <p>
        কোর্সের সব শব্দ, Verb আর বাক্য এক জায়গায় — ইংরেজি বা বাংলা দুইভাবেই খোঁজো। মোট <b>{bnNum(INDEX.length)}</b>টা এন্ট্রি, ইন্টারনেট ছাড়াও কাজ করে।
      </p>
      <label className="dict-search">
        <span aria-hidden>🔍</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="যেমন: bought, খাওয়া, weather…" aria-label="অভিধানে খোঁজো" />
      </label>
      {dq && (
        <p className="pool">
          {hits.length ? bnNum(hits.length) + "টা পাওয়া গেছে" + (hits.length > LIMIT ? ` (প্রথম ${bnNum(LIMIT)}টা দেখাচ্ছি)` : "") : "কিছু পাওয়া যায়নি — অন্য বানানে খুঁজে দেখো"}
        </p>
      )}
      <div className="sent-list">
        {hits.slice(0, LIMIT).map((h, i) => (
          <div className="sent" key={h.kind + h.en + i}>
            <div className="en">
              <span className="kind">{h.kind}</span>
              {h.en}
              <SayButton text={h.kind === "Verb" ? h.en.replace(/ · /g, ", ") : h.en} />
            </div>
            <small>{h.bn}</small>
            {h.ex && (
              <small className="ex">
                {h.ex} <SayButton text={h.ex} />
              </small>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
