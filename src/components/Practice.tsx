"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { QUIZ, SENT, TASKS, TOPICS, WORDS, type Topic } from "@/data/practice";
import { compareSpeech, getRecognition, speak } from "@/lib/speech";
import { KEYS, remove, useHydrated, usePersisted } from "@/lib/store";
import { bnNum, confetti, dayKey, pick, wordCount } from "@/lib/util";
import { useGainXP } from "@/lib/xp";
import Quiz, { type Q } from "./Quiz";
import SayButton from "./SayButton";
import { useUI } from "./UIProvider";

const POOL: Q[] = QUIZ.map(([q, o, a, why, s]) => ({ q, o, a, why, s: s || a }));
const qid = (q: Q) => q.q + "|" + q.a;
const BY_ID = new Map(POOL.map((q) => [qid(q), q]));

type Stats = { quizzes: number; best: number; tasks: number };
type Writing = { id: number; topic: string; text: string; date: string };
type TaskState = { date: string; ids: number[]; done: number[] } | null;
type SpeakStats = { tries: number; best: number; perfect: number };

const NO_STATS: Stats = { quizzes: 0, best: 0, tasks: 0 };
const NO_WRITINGS: Writing[] = [];
const NO_MISSED: string[] = [];
const NO_SPEAK: SpeakStats = { tries: 0, best: 0, perfect: 0 };

const SECTIONS: [string, string][] = [
  ["pquiz", "🎲 কুইজ"],
  ["pread", "📖 বাক্য ও শব্দ"],
  ["pspeak", "🎤 বলে দেখো"],
  ["ptask", "📝 হোম টাস্ক"],
  ["pwrite", "✍️ লেখা"],
];

export default function Practice() {
  const hydrated = useHydrated();
  const [stats] = usePersisted<Stats>(KEYS.stats, NO_STATS);
  const [writings] = usePersisted<Writing[]>(KEYS.writings, NO_WRITINGS);
  const [sp] = usePersisted<SpeakStats>(KEYS.speak, NO_SPEAK);

  return (
    <div className="page">
      <p className="crumb">
        <Link href="/">কোর্স ম্যাপ</Link> <span>›</span> দৈনিক অনুশীলন
      </p>
      <section className="sec" id="lesson">
        <h2>
          <span className="tag">প্রতিদিন</span>
          <span className="ttl">দৈনিক অনুশীলন</span>
        </h2>
        <p>
          এই পেজটা প্রতিবার খুললে <b>নতুন কুইজ, নতুন বাক্য, নতুন শব্দ আর লেখার নতুন টপিক</b> পাবে। কোর্সের যেকোনো ধাপে এখানে এসে প্রতিদিন ১৫ মিনিট অনুশীলন করো। তোমার স্কোর আর লেখাগুলো এই ব্রাউজারেই সেভ থাকে।
        </p>
        <p className="pool">
          এই মুহূর্তে ভান্ডারে:{" "}
          <b>
            {bnNum(POOL.length)} প্রশ্ন · {bnNum(SENT.length)} বাক্য · {bnNum(WORDS.length)} শব্দ
          </b>
        </p>
        <div className="pstats">
          <Stat k="কুইজ খেলেছ" v={hydrated ? bnNum(stats.quizzes) : "০"} />
          <Stat k="সেরা স্কোর" v={hydrated && stats.quizzes ? bnNum(stats.best) + "/১০" : "—"} />
          <Stat k="লেখা জমা দিয়েছ" v={hydrated ? bnNum(writings.length) : "০"} />
          <Stat k="হোম টাস্ক শেষ" v={hydrated ? bnNum(stats.tasks) : "০"} />
          <Stat k="বলার সেরা স্কোর" v={hydrated && sp.tries ? bnNum(sp.best) + "%" : "—"} />
        </div>
      </section>

      <nav className="jump" aria-label="অনুশীলনের অংশ">
        {SECTIONS.map(([id, l]) => (
          <a key={id} href={"#" + id}>
            {l}
          </a>
        ))}
      </nav>

      {hydrated ? (
        <>
          <PracticeQuiz />
          <ReadSet />
          <SpeakPractice />
          <HomeTasks />
          <Writing />
        </>
      ) : (
        <div className="quiz skel" />
      )}
    </div>
  );
}

const Stat = ({ k, v }: { k: string; v: string }) => (
  <div className="card">
    <div className="k">{k}</div>
    <div className="v">{v}</div>
  </div>
);

/* ---------- quiz ---------- */
function PracticeQuiz() {
  const { toast } = useUI();
  const gain = useGainXP();
  const [, setStats] = usePersisted<Stats>(KEYS.stats, NO_STATS);
  const [missed, setMissed] = usePersisted<string[]>(KEYS.missed, NO_MISSED);
  const [round, setRound] = useState(() => ({ n: 0, review: false, qs: pick(POOL, 10) }));
  const missedQs = missed.map((id) => BY_ID.get(id)).filter((q): q is Q => !!q);

  const start = (review: boolean) => {
    if (review && !missedQs.length) return toast("কোনো ভুল প্রশ্ন জমা নেই 🎉");
    setRound((r) => ({ n: r.n + 1, review, qs: pick(review ? missedQs : POOL, 10) }));
  };

  return (
    <section className="sec" id="pquiz">
      <h3>🎲 র‍্যান্ডম কুইজ</h3>
      <p>২৮০+ প্রশ্ন থেকে প্রতিবার ১০টা এলোমেলোভাবে আসবে। ভুল হলে বাংলায় কারণ দেখাবে, আর ভুল প্রশ্নগুলো জমা থাকবে পরে আবার অনুশীলনের জন্য।</p>
      <div className="qmode">
        <button type="button" className={"chip" + (!round.review ? " on" : "")} onClick={() => start(false)}>
          🎲 নতুন ১০টা প্রশ্ন
        </button>
        <button type="button" className={"chip" + (round.review ? " on" : "")} onClick={() => start(true)} disabled={!missedQs.length}>
          🔁 ভুলগুলো আবার ({bnNum(missedQs.length)})
        </button>
      </div>
      <Quiz
        key={round.n}
        questions={round.qs}
        onAnswer={(q, ok) => {
          const id = qid(q);
          setMissed((m) => (ok ? m.filter((x) => x !== id) : m.includes(id) ? m : [...m, id].slice(-100)));
        }}
        onEnd={(score) => {
          setStats((s) => ({ ...s, quizzes: s.quizzes + 1, best: Math.max(s.best, score) }));
          gain(score);
          if (score === round.qs.length) confetti();
        }}
        endMessage={(score, total) =>
          round.review
            ? score === total
              ? "সব ভুল ঠিক করে ফেলেছ! 🏆"
              : "ঠিক হওয়া প্রশ্নগুলো তালিকা থেকে সরে গেছে। আবার চেষ্টা করো 💪"
            : score === total
              ? "অসাধারণ! একটাও ভুল নেই 🏆"
              : score >= 7
                ? "দারুণ! ভালো করেছ 💪"
                : "আরেকবার চেষ্টা করো — প্রতিবার নতুন প্রশ্ন আসবে 🌱"
        }
        againLabel={round.review ? "🔁 আবার ভুলগুলো" : "🎲 নতুন কুইজ খেলো"}
        onAgain={() => start(round.review && missed.length > 0)}
      />
    </section>
  );
}

/* ---------- sentences + words ---------- */
function ReadSet() {
  const { toast } = useUI();
  const [set, setSet] = useState(() => ({ s: pick(SENT, 5), w: pick(WORDS, 8) }));
  const top = useRef<HTMLHeadingElement>(null);
  return (
    <section className="sec" id="pread">
      <h3 ref={top}>📖 আজকের ৫টা বাক্য</h3>
      <p>প্রতিটা বাক্য 🔊 চেপে শোনো, তারপর জোরে জোরে অন্তত ৩ বার বলো।</p>
      <div className="sent-list">
        {set.s.map(([en, bn]) => (
          <div className="sent" key={en}>
            <div className="en">
              {en}
              <SayButton text={en} />
            </div>
            <small translate="no">{bn}</small>
          </div>
        ))}
      </div>
      <h3>🆕 আজকের ৮টা নতুন শব্দ</h3>
      <p>শব্দটা, অর্থ আর উদাহরণ বাক্যটা খাতায় লিখে রাখো।</p>
      <div className="word-grid">
        {set.w.map(([w, m, ex]) => (
          <div className="word" key={w}>
            <b>
              {w}
              <SayButton text={w} />
            </b>
            <span translate="no">{m}</span>
            <i>
              {ex}
              <SayButton text={ex} />
            </i>
          </div>
        ))}
      </div>
      <div className="cta">
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            setSet({ s: pick(SENT, 5), w: pick(WORDS, 8) });
            toast("নতুন বাক্য আর শব্দ এলো 🔄");
            top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          🔄 নতুন সেট দাও
        </button>
      </div>
    </section>
  );
}

/* ---------- speaking practice (speech recognition) ---------- */
type RecState = "idle" | "listening" | "done" | "error";

function SpeakPractice() {
  const { toast } = useUI();
  const [, setSp] = usePersisted<SpeakStats>(KEYS.speak, NO_SPEAK);
  const gain = useGainXP();
  const [supported] = useState(() => !!getRecognition());
  const [cur, setCur] = useState(() => pick(SENT.filter(([en]) => en.split(" ").length <= 9), 1)[0]);
  const [state, setState] = useState<RecState>("idle");
  const [heard, setHeard] = useState("");
  const [result, setResult] = useState<ReturnType<typeof compareSpeech> | null>(null);
  const rec = useRef<ReturnType<typeof getRecognition>>(null);

  useEffect(() => () => rec.current?.abort(), []);

  const next = () => {
    rec.current?.abort();
    setCur(pick(SENT.filter(([en]) => en !== cur[0] && en.split(" ").length <= 9), 1)[0]);
    setState("idle");
    setHeard("");
    setResult(null);
  };

  const listen = () => {
    if (state === "listening") {
      rec.current?.stop();
      return;
    }
    const r = getRecognition();
    if (!r) return;
    rec.current = r;
    r.lang = "en-US";
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    let final = "";
    r.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      final = t;
      setHeard(t);
    };
    r.onerror = (e) => {
      setState("error");
      toast(e.error === "not-allowed" ? "মাইক্রোফোনের অনুমতি দাও 🎤" : e.error === "no-speech" ? "কিছু শোনা যায়নি — আবার বলো" : "শোনা গেল না, আবার চেষ্টা করো");
    };
    r.onend = () => {
      if (!final) {
        setState((s) => (s === "listening" ? "idle" : s));
        return;
      }
      const res = compareSpeech(cur[0], final);
      setResult(res);
      setState("done");
      setSp((s) => ({ tries: s.tries + 1, best: Math.max(s.best, res.score), perfect: s.perfect + (res.score === 100 ? 1 : 0) }));
      if (res.score >= 80) gain(3);
      if (res.score === 100) {
        confetti();
        toast("🎉 একদম নিখুঁত!");
      }
    };
    setHeard("");
    setResult(null);
    setState("listening");
    try {
      r.start();
    } catch {
      setState("error");
    }
  };

  return (
    <section className="sec" id="pspeak">
      <h3>🎤 বলে দেখো</h3>
      <p>বাক্যটা আগে 🔊 শুনে নাও, তারপর মাইক বাটন চেপে জোরে বলো। কোন শব্দ ঠিকমতো শোনা গেছে, সেটা সবুজ হয়ে যাবে।</p>
      <div className="speak">
        <div className="speak-target">
          <div className="en">
            {result
              ? result.words.map((w, i) => (
                  <span key={i} className={w.ok ? "sw ok" : "sw miss"}>
                    {w.raw}{" "}
                  </span>
                ))
              : cur[0]}
          </div>
          <small>{cur[1]}</small>
          <div className="speak-say">
            <SayButton text={cur[0]} />
            <button type="button" className="link" onClick={() => speak(cur[0], undefined, { rate: 0.6 })}>
              🐢 আস্তে শোনো
            </button>
          </div>
        </div>
        {supported ? (
          <>
            <button type="button" className={"mic" + (state === "listening" ? " on" : "")} onClick={listen} aria-label={state === "listening" ? "থামাও" : "বলা শুরু করো"}>
              <span>{state === "listening" ? "⏹" : "🎤"}</span>
            </button>
            <p className="speak-status" aria-live="polite">
              {state === "listening" ? "শুনছি… এখন বলো" : state === "done" ? "" : "মাইক চেপে বাক্যটা বলো"}
            </p>
            {heard && (
              <p className="speak-heard">
                তুমি বললে: <b className="en">“{heard}”</b>
              </p>
            )}
            {result && (
              <div className={"speak-score" + (result.score >= 80 ? " good" : "")}>
                <b>{bnNum(result.score)}%</b>
                <span>{result.score === 100 ? "নিখুঁত! 🏆" : result.score >= 80 ? "খুব ভালো! 💪" : result.score >= 50 ? "ভালো চেষ্টা — লাল শব্দগুলো আবার বলো" : "আবার শুনে ধীরে ধীরে বলো 🌱"}</span>
              </div>
            )}
          </>
        ) : (
          <p className="box warn">
            তোমার ব্রাউজারে কথা শোনার (Speech Recognition) সুবিধা নেই। Android-এ <b>Chrome</b> বা iPhone-এ <b>Safari</b> দিয়ে খুললে এটা কাজ করবে। ততক্ষণ 🔊 শুনে জোরে জোরে বলো।
          </p>
        )}
        <div className="cta">
          <button type="button" className="btn ghost" onClick={next}>
            ➡️ অন্য বাক্য
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- home task ---------- */
function newTaskState(): NonNullable<TaskState> {
  return { date: dayKey(), ids: pick(TASKS.map((_, i) => i), 3), done: [] };
}

function HomeTasks() {
  const { toast } = useUI();
  const [stored, setTk] = usePersisted<TaskState>(KEYS.tasks, null);
  const gain = useGainXP();
  const [, setStats] = usePersisted<Stats>(KEYS.stats, NO_STATS);
  const fresh = stored && stored.date === dayKey() && Array.isArray(stored.ids);
  const [fallback] = useState(newTaskState);
  const tk = fresh ? stored : fallback;

  useEffect(() => {
    if (!fresh) setTk(fallback);
  }, [fresh, fallback, setTk]);

  return (
    <section className="sec" id="ptask">
      <h3>📝 আজকের হোম টাস্ক</h3>
      <p>প্রতিদিন ৩টা ছোট কাজ — খাতায় লেখো বা জোরে বলো, তারপর টিক দাও। কাল আবার নতুন টাস্ক আসবে।</p>
      <div className="task-head">
        <span>
          {bnNum(tk.done.length)} / {bnNum(tk.ids.length)} শেষ
        </span>
        <button
          type="button"
          className="link"
          onClick={() => {
            setTk(newTaskState());
            toast("নতুন হোম টাস্ক এলো 📝");
          }}
        >
          অন্য টাস্ক দাও
        </button>
      </div>
      <div className="task-list">
        {tk.ids.map((id) => {
          const t = TASKS[id];
          if (!t) return null;
          const on = tk.done.includes(id);
          return (
            <label className={"task" + (on ? " on" : "")} key={id}>
              <input
                type="checkbox"
                checked={on}
                onChange={(e) => {
                  const checked = e.target.checked;
                  const done = checked ? [...tk.done, id] : tk.done.filter((x) => x !== id);
                  setTk({ ...tk, done });
                  setStats((s) => ({ ...s, tasks: Math.max(0, (s.tasks || 0) + (checked ? 1 : -1)) }));
                  if (checked) {
                    gain(5);
                    if (done.length === tk.ids.length) {
                      confetti();
                      toast("আজকের সব হোম টাস্ক শেষ! 🏆");
                    } else toast("দারুণ! একটা টাস্ক শেষ ✅");
                  }
                }}
              />
              <span className="tk">
                <b>{t.t}</b>
                <small>{t.d}</small>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- writing ---------- */
const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
};

function Writing() {
  const { toast } = useUI();
  const [writings, setWritings] = usePersisted<Writing[]>(KEYS.writings, NO_WRITINGS);
  const gain = useGainXP();
  const [draft, setDraft] = usePersisted<{ t: string; text: string } | null>(KEYS.draft, null);
  const [topic, setTopic] = useState<Topic>(() => (draft?.text && TOPICS.find((x) => x.t === draft.t)) || pick(TOPICS, 1)[0]);
  const [text, setText] = useState(() => draft?.text ?? "");
  const [saved, setSaved] = useState(draft?.text ? "আগের খসড়া ফিরে এসেছে ✓" : "");
  const list = useRef<HTMLDivElement>(null);
  const ta = useRef<HTMLTextAreaElement>(null);

  // debounce draft save
  useEffect(() => {
    const t = setTimeout(() => {
      if (!text.trim()) {
        if (draft) remove(KEYS.draft);
        return;
      }
      if (draft?.text !== text || draft?.t !== topic.t) {
        setDraft({ t: topic.t, text });
        setSaved("খসড়া সেভ হয়েছে ✓");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [text, topic, draft, setDraft]);

  const newTopic = () => {
    const t = pick(
      TOPICS.filter((x) => x.t !== topic.t),
      1,
    )[0];
    setTopic(t);
    return t;
  };

  const submit = () => {
    const tx = text.trim();
    if (wordCount(tx) < 5) {
      toast("অন্তত ৫টা শব্দ লেখো, তারপর জমা দাও ✍️");
      ta.current?.focus();
      return;
    }
    const next = [...writings, { id: Date.now(), topic: topic.t, text: tx, date: new Date().toISOString() }];
    setWritings(next);
    gain(10);
    remove(KEYS.draft);
    setText("");
    setSaved("");
    newTopic();
    toast("জমা হয়েছে! নতুন টপিক এলো 🎉");
    if (next.length % 5 === 0) confetti();
    setTimeout(() => list.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <section className="sec" id="pwrite">
      <h3>✍️ আজকের লেখা</h3>
      <p>নিচের টপিকে ইংরেজিতে অন্তত ৫টা বাক্য লেখো। ভুল হলে হবে — লেখার অভ্যাসটাই আসল।</p>
      <div className="box gold topic">
        <div className="bt">টপিক</div>
        <div className="topic-t">{topic.t}</div>
        <div className="topic-bn" translate="no">{topic.bn}</div>
        <ul>
          {topic.h.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <button
          type="button"
          className="link"
          onClick={() => {
            const t = newTopic();
            toast("নতুন টপিক: " + t.t);
          }}
        >
          অন্য টপিক দাও
        </button>
      </div>
      <label className="wlabel" htmlFor="wText">
        তোমার লেখা
      </label>
      <textarea
        ref={ta}
        className="wtext"
        id="wText"
        rows={8}
        placeholder="Write here in English..."
        spellCheck
        autoCapitalize="sentences"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="wbar">
        <span>{bnNum(wordCount(text))} শব্দ</span>
        <span className="saved">{saved}</span>
      </div>
      <div className="cta">
        <button className="btn" type="button" onClick={submit}>
          📩 জমা দাও
        </button>
        {text.trim() && <SayButton text={text} label="নিজের লেখা শোনো" />}
      </div>
      <h3>🗂 আমার জমা দেওয়া লেখাগুলো</h3>
      <div className="wlist" ref={list}>
        {!writings.length ? (
          <div className="wempty">এখনো কোনো লেখা জমা দাওনি। উপরের টপিকে ৫টা বাক্য লিখে জমা দাও — সব লেখা এই ব্রাউজারেই থাকবে।</div>
        ) : (
          [...writings].reverse().map((w) => <WritingItem key={w.id} w={w} onDelete={() => setWritings((ws) => ws.filter((x) => x.id !== w.id))} />)
        )}
      </div>
    </section>
  );
}

function WritingItem({ w, onDelete }: { w: Writing; onDelete: () => void }) {
  const { toast } = useUI();
  const [arm, setArm] = useState(false);
  useEffect(() => {
    if (!arm) return;
    const t = setTimeout(() => setArm(false), 3000);
    return () => clearTimeout(t);
  }, [arm]);
  return (
    <article className="witem">
      <div className="wh">
        <b>{w.topic}</b>
        <small>
          {fmtDate(w.date)} · {bnNum(wordCount(w.text))} শব্দ
        </small>
      </div>
      <p>{w.text}</p>
      <div className="wa">
        <SayButton text={w.text} label="শোনো" />
        <button
          type="button"
          className="link wdel"
          onClick={() => {
            if (!arm) return setArm(true);
            onDelete();
            toast("লেখাটা মুছে ফেলা হলো");
          }}
        >
          {arm ? "সত্যিই মুছবে? আবার চাপো" : "মুছে ফেলো"}
        </button>
      </div>
    </article>
  );
}
