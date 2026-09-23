"use client";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { POLISH_SAMPLE } from "@/data/advanced";
import { applyFix, analyze, ignoreKey, type Issue, KIND_LABEL, type Kind } from "@/lib/polish";
import { KEYS, usePersisted } from "@/lib/store";
import { bnNum } from "@/lib/util";
import { useGainXP } from "@/lib/xp";
import SayButton from "../SayButton";
import { useUI } from "../UIProvider";
import { type AdvStats, NO_ADV } from "./common";

const KINDS: Kind[] = ["grammar", "informal", "formal", "weak", "repeat"];

export default function Polisher() {
  const gain = useGainXP();
  const { toast } = useUI();
  const [, setStats] = usePersisted<AdvStats>(KEYS.adv, NO_ADV);
  const [text, setText] = usePersisted<string>(KEYS.advDraft, "");
  const [formal, setFormal] = useState(false);
  const [ignored, setIgnored] = useState<Set<string>>(() => new Set());
  // cursor into the text: the selected issue is the first one starting at or after it
  const [sel, setSel] = useState<number | null>(null);
  const card = useRef<HTMLDivElement>(null);

  const deferred = useDeferredValue(text);
  const a = useMemo(() => analyze(deferred, formal, ignored), [deferred, formal, ignored]);
  const stale = deferred !== text;
  const cur: Issue | undefined = sel === null || stale ? undefined : a.issues.find((i) => i.start >= sel);

  const counts = KINDS.map((k) => [k, a.issues.filter((i) => i.kind === k).length] as const).filter(([, n]) => n);

  const select = (i: Issue | undefined) => {
    if (!i) return;
    setSel(i.start);
    requestAnimationFrame(() => card.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  };

  const fix = (i: Issue, s: string) => {
    setText(applyFix(text, i, s));
    setSel(i.start + s.length);
    setStats((st) => ({ ...st, fixes: st.fixes + 1 }));
    gain(1);
  };

  const ignore = (i: Issue) => {
    setIgnored((g) => new Set(g).add(ignoreKey(i)));
    setSel(i.end);
  };

  const copy = () => {
    navigator.clipboard?.writeText(text).then(
      () => toast("📋 লেখাটা কপি হয়েছে"),
      () => toast("কপি করা গেল না"),
    );
  };

  // text with clickable highlights
  const parts: React.ReactNode[] = [];
  let pos = 0;
  if (!stale)
    a.issues.forEach((i) => {
      if (i.start > pos) parts.push(deferred.slice(pos, i.start));
      parts.push(
        <button key={i.start} type="button" className={"pmark k-" + i.kind + (cur === i ? " on" : "")} onClick={() => select(i)}>
          {deferred.slice(i.start, i.end)}
        </button>,
      );
      pos = i.end;
    });
  parts.push(deferred.slice(pos));

  const scoreCls = a.score >= 85 ? "good" : a.score >= 60 ? "mid" : "low";

  return (
    <section className="sec adv-sec">
      <h3>✍️ রাইটিং পলিশার</h3>
      <p>
        ইংরেজিতে যেকোনো কিছু লেখো — ইমেইল, প্যারাগ্রাফ, রচনা বা IELTS উত্তর। পলিশার সাথে সাথে ভুল, দুর্বল শব্দ, কথ্য ভাষা আর একই শব্দের বারবার ব্যবহার ধরে ফেলবে এবং আরও উন্নত শব্দ সাজেস্ট করবে। সব কাজ
        তোমার ফোনেই হয় — ইন্টারনেট লাগে না।
      </p>

      <div className="pol">
        <div className="pol-top">
          <div className="seg" role="group" aria-label="লেখার ধরন">
            <button type="button" className={!formal ? "on" : ""} onClick={() => setFormal(false)} aria-pressed={!formal}>
              💬 সাধারণ
            </button>
            <button type="button" className={formal ? "on" : ""} onClick={() => setFormal(true)} aria-pressed={formal}>
              🎩 ফরমাল
            </button>
          </div>
          <div className="pol-acts">
            {!text.trim() ? (
              <button type="button" className="chip" onClick={() => setText(POLISH_SAMPLE)}>
                📝 উদাহরণ
              </button>
            ) : (
              <>
                <button type="button" className="chip" onClick={copy}>
                  📋 কপি
                </button>
                <button
                  type="button"
                  className="chip"
                  onClick={() => {
                    setText("");
                    setSel(null);
                    setIgnored(new Set());
                  }}
                >
                  🗑 মুছো
                </button>
              </>
            )}
          </div>
        </div>

        <textarea
          className="pol-text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSel(null);
          }}
          placeholder="Write here in English… যেমন: I think online learning is very good because…"
          rows={6}
          spellCheck
          lang="en"
          aria-label="তোমার ইংরেজি লেখা"
        />

        {a.words > 0 && (
          <div className="pol-stats">
            <div className={"pol-score " + scoreCls} style={{ "--p": a.score } as React.CSSProperties}>
              <b>{bnNum(a.score)}</b>
              <small>স্কোর</small>
            </div>
            <dl>
              <div>
                <dt>শব্দ</dt>
                <dd>{bnNum(a.words)}</dd>
              </div>
              <div>
                <dt>বাক্য</dt>
                <dd>{bnNum(a.sentences)}</dd>
              </div>
              <div>
                <dt>বৈচিত্র্য</dt>
                <dd>{bnNum(a.variety)}%</dd>
              </div>
              <div>
                <dt>লেভেল</dt>
                <dd className="lv">{a.level}</dd>
              </div>
            </dl>
          </div>
        )}

        {a.words > 0 && (
          <div className="pol-live">
            <div className="pol-legend">
              {counts.length ? (
                counts.map(([k, n]) => (
                  <button key={k} type="button" className={"lg k-" + k} onClick={() => select(a.issues.find((i) => i.kind === k))}>
                    <i />
                    {KIND_LABEL[k]} <b>{bnNum(n)}</b>
                  </button>
                ))
              ) : (
                <span className="pol-clean">✨ কোনো সমস্যা পাওয়া যায়নি — চমৎকার লেখা!</span>
              )}
            </div>
            <p className="pol-hint">{counts.length ? "👇 রঙিন শব্দে চাপ দাও — উন্নত বিকল্প দেখাবে, এক চাপে বদলে যাবে।" : ""}</p>
            <div className={"pol-view" + (stale ? " stale" : "")} lang="en">
              {parts}
            </div>
            {cur && (
              <div className={"pol-card k-" + cur.kind} ref={card} aria-live="polite">
                <div className="pc-head">
                  <span className={"pc-kind k-" + cur.kind}>{KIND_LABEL[cur.kind]}</span>
                  <b className="en">“{cur.text}”</b>
                  <button type="button" className="icon-btn pc-x" aria-label="বন্ধ করো" onClick={() => setSel(null)}>
                    ✕
                  </button>
                </div>
                {cur.note && <p className="pc-note">{cur.note}</p>}
                {cur.sugg.length > 0 && (
                  <div className="pc-sugg">
                    {cur.sugg.map((s) => (
                      <button key={s} type="button" className="tok" onClick={() => fix(cur, s)}>
                        {s ? "→ " + s : "✂ বাদ দাও"}
                      </button>
                    ))}
                  </div>
                )}
                <div className="pc-foot">
                  <button type="button" className="link" onClick={() => ignore(cur)}>
                    উপেক্ষা করো
                  </button>
                  <button type="button" className="link" onClick={() => select(a.issues.find((i) => i.start > cur.start) ?? a.issues[0])}>
                    পরেরটা →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {a.longSentences.length > 0 && (
          <div className="box gold pol-long">
            <b>📏 অনেক লম্বা বাক্য ({bnNum(a.longSentences.length)}টা)</b>
            <p>২৮ শব্দের বেশি বাক্য পড়তে কষ্ট হয় — দুই ভাগ করো বা linking word (However, Therefore) দিয়ে ভাঙো।</p>
            {a.longSentences.slice(0, 3).map((s) => (
              <p key={s} className="en">
                “{s.slice(0, 90)}
                {s.length > 90 ? "…" : ""}”
              </p>
            ))}
          </div>
        )}

        {a.words >= 5 && (
          <div className="pol-listen">
            <span>🎧 নিজের লেখা শুনে দেখো, কানে কেমন লাগে</span>
            <SayButton text={text} label="লেখাটা শোনো" />
          </div>
        )}
      </div>
    </section>
  );
}
