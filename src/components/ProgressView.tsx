"use client";
import Link from "next/link";
import { N, useProgress } from "@/lib/progress";
import { masteredCount, NO_SRS, type SRSMap } from "@/lib/srs";
import { KEYS, useHydrated, usePersisted } from "@/lib/store";
import { bnNum, dayKey } from "@/lib/util";
import { DEFAULT_GOAL, levelOf, NO_DAYS, NO_XP, streakOf, titleOf, totalXP, type XPLog } from "@/lib/xp";
import { type LabStats, NO_LAB } from "./lab/common";

type PStats = { quizzes: number; best: number; tasks: number };
type SpeakStats = { tries: number; best: number; perfect: number };
const NO_P: PStats = { quizzes: 0, best: 0, tasks: 0 };
const NO_SP: SpeakStats = { tries: 0, best: 0, perfect: 0 };
const NO_W: unknown[] = [];
const GOALS = [20, 30, 50, 100];
const WEEKS = 18;
const WD = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র"];

function bestStreak(days: string[]) {
  const s = [...new Set(days)].sort();
  let best = 0;
  let run = 0;
  let prev = 0;
  for (const d of s) {
    const t = Date.parse(d + "T00:00:00Z") / 864e5;
    run = t - prev === 1 ? run + 1 : 1;
    prev = t;
    best = Math.max(best, run);
  }
  return best;
}

export default function ProgressView() {
  const hydrated = useHydrated();
  const p = useProgress();
  const [xp] = usePersisted<XPLog>(KEYS.xp, NO_XP);
  const [goal, setGoal] = usePersisted<number>(KEYS.goal, DEFAULT_GOAL);
  const [studied] = usePersisted<string[]>(KEYS.studied, NO_DAYS);
  const [srs] = usePersisted<SRSMap>(KEYS.srs, NO_SRS);
  const [lab] = usePersisted<LabStats>(KEYS.lab, NO_LAB);
  const [ps] = usePersisted<PStats>(KEYS.stats, NO_P);
  const [sp] = usePersisted<SpeakStats>(KEYS.speak, NO_SP);
  const [writings] = usePersisted<unknown[]>(KEYS.writings, NO_W);

  if (!hydrated) return <div className="page"><div className="quiz skel" /></div>;

  const total = totalXP(xp);
  const lv = levelOf(total);
  const today = xp[dayKey()] || 0;
  const days = [...new Set([...studied, ...Object.keys(xp).filter((k) => xp[k] > 0)])];
  const streak = streakOf(studied);
  const mastered = masteredCount(srs);

  // heatmap: columns are weeks (Saturday first), last column is this week
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - ((end.getDay() + 1) % 7) - (WEEKS - 1) * 7);
  const cells: { k: string; v: number; future: boolean }[] = [];
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const k = dayKey(d);
    cells.push({ k, v: xp[k] || (studied.includes(k) ? 1 : 0), future: d > end });
  }
  const lvl = (v: number) => (v <= 0 ? 0 : v < goal * 0.5 ? 1 : v < goal ? 2 : v < goal * 2 ? 3 : 4);
  const activeDays = days.length;

  const badges: { icon: string; name: string; how: string; on: boolean }[] = [
    { icon: "🌱", name: "প্রথম পা", how: "প্রথম পাঠ শেষ করো", on: p.count >= 1 },
    { icon: "📘", name: "অর্ধেক পথ", how: "অর্ধেক কোর্স শেষ করো", on: p.count >= Math.ceil(N / 2) },
    { icon: "🎓", name: "কোর্স সম্পূর্ণ", how: "সব পাঠ শেষ করো", on: p.count >= N },
    { icon: "🔥", name: "৩ দিনের আগুন", how: "টানা ৩ দিন পড়ো", on: bestStreak(studied) >= 3 },
    { icon: "⚡", name: "সাপ্তাহিক যোদ্ধা", how: "টানা ৭ দিন পড়ো", on: bestStreak(studied) >= 7 },
    { icon: "🏔", name: "মাসের চ্যাম্পিয়ন", how: "টানা ৩০ দিন পড়ো", on: bestStreak(studied) >= 30 },
    { icon: "⭐", name: "৫০০ XP", how: "মোট ৫০০ XP জমাও", on: total >= 500 },
    { icon: "💎", name: "২০০০ XP", how: "মোট ২০০০ XP জমাও", on: total >= 2000 },
    { icon: "🧠", name: "স্মৃতির জাদুকর", how: "১০০টা কার্ড রিভিশন দাও", on: lab.reviews >= 100 },
    { icon: "🏅", name: "পাকা ৫০", how: "৫০টা কার্ড পাকা করো", on: mastered >= 50 },
    { icon: "🧩", name: "বাক্য কারিগর", how: "২৫টা বাক্য সাজাও", on: lab.built >= 25 },
    { icon: "🎧", name: "তীক্ষ্ণ কান", how: "২৫টা ডিক্টেশন দাও", on: lab.dict >= 25 },
    { icon: "🏎", name: "স্পিড মাস্টার", how: "Verb ড্রিলে ২০+ পাও", on: lab.drillBest >= 20 },
    { icon: "🎲", name: "কুইজ প্রেমী", how: "১০টা কুইজ খেলো", on: ps.quizzes >= 10 },
    { icon: "🎤", name: "নিখুঁত উচ্চারণ", how: "বলার অনুশীলনে ১০০% পাও", on: sp.perfect >= 1 },
    { icon: "✍️", name: "লেখক", how: "১০টা লেখা জমা দাও", on: writings.length >= 10 },
  ];
  const earned = badges.filter((b) => b.on).length;

  return (
    <div className="page">
      <p className="crumb">
        <Link href="/">কোর্স ম্যাপ</Link> <span>›</span> আমার অগ্রগতি
      </p>
      <section className="sec">
        <h2>
          <span className="tag">পরিসংখ্যান</span>
          <span className="ttl">আমার অগ্রগতি</span>
        </h2>

        <div className="lvcard">
          <div className="lv-badge">
            <small>লেভেল</small>
            <b>{bnNum(lv.level)}</b>
          </div>
          <div className="lv-body">
            <b>{titleOf(lv.level)}</b>
            <div className="gtrack">
              <i style={{ width: lv.pct + "%" }} />
            </div>
            <small>
              পরের লেভেলে যেতে আর {bnNum(lv.need - lv.into)} XP · মোট {bnNum(total)} XP
            </small>
          </div>
        </div>

        <div className="pstats">
          <Stat k="আজকের XP" v={bnNum(today) + " / " + bnNum(goal)} />
          <Stat k="টানা পড়ার দিন 🔥" v={bnNum(streak)} />
          <Stat k="সেরা টানা" v={bnNum(bestStreak(studied))} />
          <Stat k="মোট সক্রিয় দিন" v={bnNum(activeDays)} />
          <Stat k="পাঠ শেষ" v={bnNum(p.count) + " / " + bnNum(N)} />
          <Stat k="পাকা কার্ড" v={bnNum(mastered)} />
        </div>

        <fieldset className="opt">
          <legend>🎯 দৈনিক লক্ষ্য (XP)</legend>
          <p className="opt-note">লক্ষ্য পূরণ হলে দিনটা নিজে থেকেই “পড়েছি” হিসেবে গোনা হবে। নতুনদের জন্য ৩০ XP ভালো শুরু (প্রায় ১৫ মিনিট)।</p>
          <div className="seg">
            {GOALS.map((g) => (
              <button key={g} type="button" className={goal === g ? "on" : ""} onClick={() => setGoal(g)} aria-pressed={goal === g}>
                {bnNum(g)}
              </button>
            ))}
          </div>
        </fieldset>

        <h3>📅 পড়ার ক্যালেন্ডার</h3>
        <p className="map-note">গত {bnNum(WEEKS)} সপ্তাহ — যত গাঢ় সবুজ, সেদিন তত বেশি XP।</p>
        <div className="heat-wrap">
          <div className="heat-days" aria-hidden>
            {WD.map((d, i) => (
              <span key={d}>{i % 2 ? "" : d}</span>
            ))}
          </div>
          <div className="heat" role="img" aria-label={`গত ${bnNum(WEEKS)} সপ্তাহে ${bnNum(cells.filter((c) => c.v > 0).length)} দিন পড়েছ`}>
            {cells.map((c) => (
              <i key={c.k} className={c.future ? "fut" : "l" + lvl(c.v)} title={c.future ? "" : `${c.k} · ${c.v} XP`} />
            ))}
          </div>
        </div>
        <div className="heat-legend" aria-hidden>
          কম <i className="l0" />
          <i className="l1" />
          <i className="l2" />
          <i className="l3" />
          <i className="l4" /> বেশি
        </div>

        <h3>
          🏆 ব্যাজ <small className="badge-count">{bnNum(earned)} / {bnNum(badges.length)}</small>
        </h3>
        <div className="badges">
          {badges.map((b) => (
            <div key={b.name} className={"bdg" + (b.on ? " on" : "")}>
              <span className="bi">{b.on ? b.icon : "🔒"}</span>
              <b>{b.name}</b>
              <small>{b.how}</small>
            </div>
          ))}
        </div>

        <div className="box gold">
          <div className="bt">XP কীভাবে পাবে?</div>
          <ul>
            <li>পাঠ শেষ করলে ২০ XP · কুইজে প্রতিটা সঠিক উত্তরে ১ XP</li>
            <li>স্মার্ট রিভিশনে প্রতিটা কার্ডে ১–২ XP · বাক্য সাজালে ৩ XP</li>
            <li>ডিক্টেশন নিখুঁত হলে ৩–৫ XP · Verb ড্রিলে প্রতিটা সঠিকে ১ XP</li>
            <li>বলার অনুশীলনে ৮০%+ পেলে ৩ XP · হোম টাস্কে ৫ XP · লেখা জমা দিলে ১০ XP</li>
          </ul>
        </div>
        <div className="cta">
          <Link className="btn" href="/lab">
            🧪 ল্যাবে যাও
          </Link>
          <Link className="btn ghost" href="/practice">
            🎯 দৈনিক অনুশীলন
          </Link>
        </div>
      </section>
    </div>
  );
}

const Stat = ({ k, v }: { k: string; v: string }) => (
  <div className="card">
    <div className="k">{k}</div>
    <div className="v">{v}</div>
  </div>
);
