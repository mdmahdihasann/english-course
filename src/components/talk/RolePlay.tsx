"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { Scene } from "@/data/talk";
import { getRecognition } from "@/lib/speech";
import { KEYS, usePersisted } from "@/lib/store";
import { type Check, checkLine, hintOf, PASS, xpFor } from "@/lib/talk";
import { bnNum, confetti, reducedMotion } from "@/lib/util";
import { useGainXP } from "@/lib/xp";
import { useUI } from "../UIProvider";
import { NO_TALK, sayLine, type TalkStats } from "./common";

type Result = { c: Check; score: number };
const PEEK_CAP = 50;

/** the partner's lines play by themselves; on your turn you only see the Bangla and type or say it */
export default function RolePlay({ scene, onListen }: { scene: Scene; onListen: () => void }) {
  const { toast } = useUI();
  const gain = useGainXP();
  const [, setStats] = usePersisted<TalkStats>(KEYS.talk, NO_TALK);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(-1);
  const [res, setRes] = useState<Record<number, Result>>({});
  const [text, setText] = useState("");
  const [hint, setHint] = useState(false);
  const [peek, setPeek] = useState(false);
  const [attempt, setAttempt] = useState<Check | null>(null);
  const [passing, setPassing] = useState(false);
  const [listening, setListening] = useState(false);
  const [final, setFinal] = useState<{ score: number; xp: number } | null>(null);
  const [micOk] = useState(() => !!getRecognition());
  const resRef = useRef<Record<number, Result>>({});
  const rec = useRef<ReturnType<typeof getRecognition>>(null);
  const speech = useRef<(() => void) | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const lines = scene.lines;
  const line = lines[i];
  const myTurn = started && !final && !!line?.me;

  useEffect(
    () => () => {
      speech.current?.();
      rec.current?.abort();
    },
    [],
  );

  const finish = () => {
    const mine = lines.map((l, k) => (l.me ? k : -1)).filter((k) => k >= 0);
    const score = Math.round(mine.reduce((a, k) => a + (resRef.current[k]?.score ?? 0), 0) / mine.length);
    const xp = xpFor(score);
    setFinal({ score, xp });
    setStats((s) => ({ ...s, plays: s.plays + 1, best: { ...s.best, [scene.id]: Math.max(s.best[scene.id] ?? 0, score) } }));
    gain(xp, "🎭 দৃশ্য শেষ");
    if (score >= 90) confetti();
  };

  const goTo = (next: number) => {
    speech.current = null;
    setText("");
    setHint(false);
    setPeek(false);
    setAttempt(null);
    setPassing(false);
    if (next >= lines.length) finish();
    else setI(next);
  };
  const advance = useEffectEvent(goTo);

  // partner's turn: "typing…", then the line appears and is spoken
  useEffect(() => {
    if (!started || final || !line || line.me) return;
    let cancel: (() => void) | undefined;
    const t = setTimeout(
      () => {
        setShown(i);
        cancel = sayLine(line.en, false, () => advance(i + 1));
      },
      reducedMotion() ? 200 : 900,
    );
    return () => {
      clearTimeout(t);
      cancel?.();
    };
  }, [started, final, i, line]);

  useEffect(() => {
    if (started) end.current?.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
    if (myTurn && matchMedia("(pointer: fine)").matches) input.current?.focus();
  }, [started, i, shown, attempt, myTurn, final, hint, peek]);

  const submit = (said: string) => {
    if (!myTurn || passing || !said.trim()) return;
    const c = checkLine([line.en, ...(line.alt ?? [])], said);
    const score = peek ? Math.min(c.score, PEEK_CAP) : c.score;
    const prev = resRef.current[i];
    resRef.current = { ...resRef.current, [i]: !prev || score >= prev.score ? { c, score } : prev };
    setRes(resRef.current);
    setAttempt(c);
    setStats((s) => ({ ...s, lines: s.lines + 1 }));
    if (c.score >= PASS) {
      setPassing(true);
      const at = i;
      speech.current = sayLine(c.answer, true, () => goTo(at + 1));
    }
  };

  const listen = () => {
    if (listening) return rec.current?.stop();
    const r = getRecognition();
    if (!r) return;
    speech.current?.();
    rec.current = r;
    r.lang = "en-US";
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    let heard = "";
    r.onresult = (e) => {
      let t = "";
      for (let k = 0; k < e.results.length; k++) t += e.results[k][0].transcript;
      heard = t;
      setText(t);
    };
    r.onerror = (e) => {
      setListening(false);
      toast(e.error === "not-allowed" ? "মাইক্রোফোনের অনুমতি দাও 🎤" : e.error === "no-speech" ? "কিছু শোনা যায়নি — আবার বলো" : "শোনা গেল না, আবার চেষ্টা করো");
    };
    r.onend = () => {
      setListening(false);
      if (heard) submit(heard);
    };
    setText("");
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
    }
  };

  const restart = () => {
    speech.current?.();
    resRef.current = {};
    setRes({});
    setShown(-1);
    setFinal(null);
    setI(0);
    goTo(0);
    setStarted(true);
  };

  if (!started)
    return (
      <div className="tplay-intro">
        <div className="tpi-cast">
          <span className="av them">{scene.icon}</span>
          <span className="tpi-vs">↔</span>
          <span className="av me">🙂</span>
        </div>
        <p className="tpi-names">
          <b>{scene.them}</b>
          <b>{scene.you}</b>
        </p>
        <p>পার্টনার নিজের লাইন নিজেই বলবে। তোমার পালায় শুধু বাংলাটা দেখবে — ইংরেজিতে টাইপ করো বা 🎤 মাইকে বলো।</p>
        <button type="button" className="btn" onClick={restart}>
          ▶ শুরু করো
        </button>
      </div>
    );

  const partnerTyping = !final && !!line && !line.me && shown < i;

  return (
    <div className="tplay">
      <div className="tp-track" aria-hidden>
        <i style={{ width: (final ? 100 : (i / lines.length) * 100) + "%" }} />
      </div>
      <div className="chat">
        {lines.slice(0, final ? lines.length : i + 1).map((l, k) => {
          if (!l.me) {
            if (k === i && shown < i && !final) return null;
            return (
              <button key={k} type="button" className={"bub them" + (k === i && !final ? " live" : "")} onClick={() => sayLine(l.en, false, () => {})}>
                <small className="who">{scene.them}</small>
                <span className="en">{l.en}</span>
                <span className="bn" translate="no">
                  {l.bn}
                </span>
              </button>
            );
          }
          const r = res[k];
          if (k < i || final)
            return (
              <div key={k} className={"bub me said" + (r && r.score >= PASS ? " good" : " weak")}>
                <span className="who-row">
                  <small className="who">{scene.you}</small>
                  {r && <em className="sc">{bnNum(r.score)}%</em>}
                </span>
                <span className="en">{r ? <Words w={r.c.said} /> : "—"}</span>
                {(!r || r.c.score < 100) && <span className="fix">✓ {l.en}</span>}
              </div>
            );
          return (
            <div key={k} className="bub me turn">
              <small className="who">তোমার পালা</small>
              <span className="bn big" translate="no">
                {l.bn}
              </span>
              {hint && !peek && <span className="hint-l">💡 {hintOf(l.en)}</span>}
              {peek && <span className="fix">👀 {l.en}</span>}
            </div>
          );
        })}
        {partnerTyping && (
          <div className="bub them typing" aria-label="লিখছে…">
            <small className="who">{scene.them}</small>
            <span className="dots">
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
      </div>

      {attempt && myTurn && <Coach c={attempt} tip={line.tip} passing={passing} onRetry={() => (setAttempt(null), setText(""), input.current?.focus())} onSkip={() => goTo(i + 1)} />}

      {final && (
        <div className="tfinal">
          <div className={"pol-score" + (final.score >= 80 ? " good" : final.score >= 50 ? " mid" : "")} style={{ "--p": final.score } as React.CSSProperties}>
            <b>{bnNum(final.score)}</b>
            <small>স্কোর</small>
          </div>
          <div>
            <b className="tf-t">{final.score >= 90 ? "অসাধারণ! তুমি একদম তৈরি 🏆" : final.score >= 70 ? "খুব ভালো! আরেকবার করলে নিখুঁত হবে 💪" : "ভালো শুরু — আরেকবার শুনে চেষ্টা করো 🌱"}</b>
            <p className="tf-xp">+{bnNum(final.xp)} XP</p>
            <div className="cta">
              <button type="button" className="btn" onClick={restart}>
                🔁 আবার খেলো
              </button>
              <button type="button" className="btn ghost" onClick={onListen}>
                👀 আবার শোনো
              </button>
            </div>
          </div>
        </div>
      )}

      {myTurn && (
        <div className="composer">
          <div className="cp-help">
            <button type="button" className="chip" onClick={() => setHint(true)} disabled={hint || peek}>
              💡 ইঙ্গিত
            </button>
            <button type="button" className="chip" onClick={() => setPeek(true)} disabled={peek}>
              👀 উত্তর দেখাও
            </button>
            <small>
              {bnNum(lines.slice(0, i + 1).filter((l) => l.me).length)}/{bnNum(lines.filter((l) => l.me).length)}
            </small>
          </div>
          <form
            className="cp-row"
            onSubmit={(e) => {
              e.preventDefault();
              submit(text);
            }}
          >
            <input
              ref={input}
              className="cp-in en"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={listening ? "শুনছি… এখন বলো" : "ইংরেজিতে লেখো…"}
              aria-label="তোমার উত্তর"
              autoComplete="off"
              autoCapitalize="sentences"
              spellCheck={false}
              enterKeyHint="send"
              disabled={passing}
            />
            {micOk && (
              <button type="button" className={"cp-mic" + (listening ? " on" : "")} onClick={listen} aria-label={listening ? "থামাও" : "মাইকে বলো"} disabled={passing}>
                {listening ? "⏹" : "🎤"}
              </button>
            )}
            <button type="submit" className="cp-send" aria-label="পাঠাও" disabled={passing || !text.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}
      <div ref={end} className="tp-end" />
    </div>
  );
}

function Words({ w }: { w: { w: string; ok: boolean }[] }) {
  return (
    <>
      {w.map((x, k) => (
        <span key={k} className={x.ok ? undefined : "bad"}>
          {x.w}{" "}
        </span>
      ))}
    </>
  );
}

/** feedback on the latest attempt */
function Coach({ c, tip, passing, onRetry, onSkip }: { c: Check; tip?: string; passing: boolean; onRetry: () => void; onSkip: () => void }) {
  const good = c.score >= PASS;
  return (
    <div className={"coach" + (good ? " good" : "")} aria-live="polite">
      <div className="co-head">
        <span className="co-ai">✨ স্মার্ট কোচ</span>
        <b>{bnNum(c.score)}%</b>
      </div>
      <p className="co-said en">
        <Words w={c.said} />
      </p>
      {c.score === 100 ? (
        <p className="co-msg">একদম নিখুঁত! 🎯</p>
      ) : (
        <>
          <p className="co-msg">{good ? "খুব কাছাকাছি! সঠিক বাক্যটা শোনো 👇" : "আরেকটু বাকি — লাল দাগের শব্দগুলো খেয়াল করো।"}</p>
          {c.missing.length > 0 && (
            <p className="co-row">
              <small>বাদ পড়েছে:</small> <span className="en">{c.missing.join(", ")}</span>
            </p>
          )}
          {c.extra.length > 0 && (
            <p className="co-row">
              <small>বাড়তি / ভুল:</small> <span className="en">{c.extra.join(", ")}</span>
            </p>
          )}
          {good && <p className="co-ans en">✓ {c.answer}</p>}
        </>
      )}
      {tip && <p className="co-tip">💡 {tip}</p>}
      {!passing && (
        <div className="co-act">
          <button type="button" className="btn" onClick={onRetry}>
            🔁 আবার চেষ্টা
          </button>
          <button type="button" className="btn ghost" onClick={onSkip}>
            ➡️ পরের লাইন
          </button>
        </div>
      )}
    </div>
  );
}
