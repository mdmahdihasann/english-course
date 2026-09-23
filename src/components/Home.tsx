"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { COURSE } from "@/data/course";
import { GROUPS, GROUP_ICONS, lessonHref, N, useProgress } from "@/lib/progress";
import { KEYS, useHydrated, usePersisted } from "@/lib/store";
import { streakOf } from "@/lib/xp";
import { bnNum, confetti, dayKey, reducedMotion } from "@/lib/util";
import SayButton from "./SayButton";
import { useUI } from "./UIProvider";

const EMPTY: string[] = [];

const PAIRS: [string, string][] = [
  ["আমি ভাত খাই।", "I eat rice."],
  ["তুমি কেমন আছো?", "How are you?"],
  ["আমি এখন পড়ছি।", "I am studying now."],
  ["গতকাল আমি বাজারে গিয়েছিলাম।", "I went to the market yesterday."],
  ["আমি তোমাকে কাল ফোন দেব।", "I will call you tomorrow."],
  ["আরেকবার বলবেন, প্লিজ?", "Could you say that again, please?"],
  ["আমি ইংরেজি শিখছি।", "I'm learning English."],
];

export default function Home() {
  const p = useProgress();
  const hydrated = useHydrated();
  const { toast } = useUI();
  const [studied, setStudied] = usePersisted<string[]>(KEYS.studied, EMPTY);

  const streak = hydrated ? streakOf(studied) : 0;
  const today = hydrated && studied.includes(dayKey());
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return hydrated && studied.includes(dayKey(d));
  });
  const weekCount = week.filter(Boolean).length;
  const count = hydrated ? p.count : 0;
  const finished = hydrated && p.next >= N;

  const cta = !hydrated
    ? { t: "শুরু করো", h: lessonHref(0) }
    : finished
      ? { t: "কোর্স শেষ! আবার রিভিশন দাও", h: lessonHref(0) }
      : p.count
        ? { t: "চালিয়ে যাও: পাঠ " + bnNum(p.next + 1) + " →", h: lessonHref(p.next) }
        : { t: "পাঠ ১ দিয়ে শুরু করো →", h: lessonHref(0) };

  return (
    <div className="page">
      <section className="hero">
        <h1>ইংরেজিতে কথা বলা শুরু হোক আজ থেকেই</h1>
        <p className="lead">
          একদম শুরু থেকে, বাংলায় বুঝে বুঝে — ৩ মাসে নিজের কথা নিজে ইংরেজিতে বলার সহজ কোর্স। প্রতিটা পাঠ শেষ করলে তবেই পরের পাঠ খুলবে, তাই ধাপে ধাপে এগোও।
        </p>
        <Machine />
        <div className="dash">
          <div className="card">
            <span className="ring" style={{ "--p": Math.round((count / N) * 100) } as React.CSSProperties} />
            <div className="k">পাঠ শেষ</div>
            <div className="v">
              {bnNum(count)}
              <small> / {bnNum(N)}</small>
            </div>
          </div>
          <div className="card">
            <div className="k">টানা পড়ার দিন 🔥</div>
            <div className="v">
              {bnNum(streak)}
              <small> দিন</small>
            </div>
          </div>
          <div className="card">
            <div className="k">এই সপ্তাহ</div>
            <div className="days">
              {week.map((on, i) => (
                <i key={i} className={on ? "on" : ""} />
              ))}
            </div>
            <div className="hint">গত ৭ দিনে {bnNum(weekCount)} দিন পড়েছ</div>
          </div>
          <div className="card today">
            <p>{today ? "দারুণ! কাল আবার দেখা হবে। 🌱" : "আজকের ৪০ মিনিট পড়া শেষ হলে বাটনটা চাপো।"}</p>
            <button
              className="btn sunny"
              type="button"
              disabled={today}
              onClick={() => {
                const k = dayKey();
                if (studied.includes(k)) return;
                const next = [...studied, k];
                setStudied(next);
                const s = streakOf(next);
                toast("শাবাশ! টানা " + bnNum(s) + " দিন 🔥");
                if ([7, 30, 60, 90].includes(s)) confetti();
              }}
            >
              {today ? "✔ আজকের পড়া শেষ" : "✔ আজ পড়েছি"}
            </button>
          </div>
        </div>
        <div className="cta">
          <Link className="btn" href={cta.h}>
            {cta.t}
          </Link>
          <Link className="btn ghost" href="/practice">
            🎯 আজকের অনুশীলন
          </Link>
        </div>
      </section>

      <div className="part">
        <p className="part-t">কোর্স ম্যাপ</p>
      </div>
      <p className="map-note">🔒 তালাবদ্ধ পাঠগুলো আগের পাঠ শেষ করলে খুলবে। তোমার অগ্রগতি এই ব্রাউজারেই সেভ থাকে — ⚙️ সেটিংস থেকে ব্যাকআপ নিতে পারো।</p>
      {finished && (
        <div className="cert">
          <h2>🎓 অভিনন্দন!</h2>
          <p>তুমি পুরো কোর্স শেষ করেছ। এবার প্রতিদিন ইংরেজিতে কথা বলার অভ্যাস চালিয়ে যাও।</p>
        </div>
      )}
      <CourseMap />

      <div className="part">
        <p className="part-t">প্রতিদিনের অনুশীলন</p>
      </div>
      <Link className="pcard" href="/practice">
        <span className="pi">🎯</span>
        <span>
          <b>দৈনিক অনুশীলন</b>
          <small>২৮০+ কুইজ · ২০০+ বাক্য · ৩৬০+ শব্দ · 🎤 বলে দেখো · দৈনিক হোম টাস্ক · লেখার টপিক — প্রতিবার নতুন, কোনো তালা নেই</small>
        </span>
        <span className="go">শুরু করো →</span>
      </Link>
      <Link className="pcard lab" href="/lab">
        <span className="pi">🧪</span>
        <span>
          <b>লার্নিং ল্যাব — অ্যাডভান্সড</b>
          <small>🧠 স্মার্ট রিভিশন (Spaced Repetition) · 🧩 বাক্য সাজাও · 🎧 শুনে লেখো · ⚡ Verb স্পিড ড্রিল · 📚 পকেট অভিধান</small>
        </span>
        <span className="go">খোলো →</span>
      </Link>
      <Link className="pcard adv" href="/advanced">
        <span className="pi">🎓</span>
        <span>
          <b>অ্যাডভান্সড স্টুডিও — নতুন</b>
          <small>✍️ রাইটিং পলিশার · 💬 Idioms ও Phrasal Verbs · 🔍 ভুল খোঁজো · 🔗 Collocations · 🎩 ফরমাল ইংলিশ</small>
        </span>
        <span className="go">খোলো →</span>
      </Link>
      <Link className="pcard prog" href="/progress">
        <span className="pi">📊</span>
        <span>
          <b>আমার অগ্রগতি</b>
          <small>লেভেল ও XP · দৈনিক লক্ষ্য · পড়ার ক্যালেন্ডার · ১৬টা ব্যাজ</small>
        </span>
        <span className="go">দেখো →</span>
      </Link>
    </div>
  );
}

function CourseMap() {
  const p = useProgress();
  const hydrated = useHydrated();
  const { toast } = useUI();
  return (
    <div className={"cmap" + (hydrated ? "" : " loading")}>
      {GROUPS.map((g) => (
        <div className="mg" key={g.name}>
          <h3>
            <span>{GROUP_ICONS[g.name] || "📄"}</span>
            {g.name}
            <small>
              {bnNum(hydrated ? g.items.filter(p.isDone).length : 0)} / {bnNum(g.items.length)}
            </small>
          </h3>
          <div className="mgrid">
            {g.items.map((i) => {
              const c = COURSE[i];
              const d = hydrated && p.isDone(i);
              const o = !hydrated || p.isOpen(i);
              const nx = hydrated && i === p.next;
              return (
                <Link
                  key={c.id}
                  className={["mc", d ? "done" : "", !o ? "locked" : "", nx ? "next" : ""].join(" ")}
                  href={o ? lessonHref(i) : "#"}
                  aria-disabled={!o || undefined}
                  onClick={
                    o
                      ? undefined
                      : (e) => {
                          e.preventDefault();
                          toast("🔒 আগে “" + COURSE[p.next].title + "” শেষ করো");
                        }
                  }
                >
                  <i className="nb">{d ? "✓" : !o ? "🔒" : bnNum(i + 1)}</i>
                  <span>
                    <small>
                      {c.tag}
                      {nx ? " · এখন পড়ো" : ""}
                    </small>
                    {c.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Bangla → English typing animation */
function Machine() {
  const [pi, setPi] = useState(0);
  const [typed, setTyped] = useState(0);
  const [bn, en] = PAIRS[pi];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const nxt = () => {
      setTyped(0);
      setPi((x) => (x + 1) % PAIRS.length);
    };
    if (reducedMotion()) {
      timers.push(setTimeout(() => setTyped(en.length), 0));
      timers.push(setTimeout(nxt, 4000));
    } else {
      for (let i = 1; i <= en.length; i++) timers.push(setTimeout(() => setTyped(i), 700 + i * 55));
      timers.push(setTimeout(nxt, 700 + en.length * 55 + 2600));
    }
    return () => timers.forEach(clearTimeout);
  }, [pi, en.length]);

  return (
    <div className="machine" aria-live="polite">
      <div className="row">
        <small>বাংলায় ভাবো</small>
        <div className="bn-s">{bn}</div>
      </div>
      <div className="mid">
        <b>ইংরেজিতে বলো</b>
      </div>
      <div className="row en-row">
        <div className="en-s">
          <span>
            <span>{en.slice(0, typed)}</span>
            <span className="caret" />
          </span>
          <SayButton text={en} />
        </div>
      </div>
    </div>
  );
}
