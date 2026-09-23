"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { COURSE } from "@/data/course";
import { lessonHref, N, useMarkDone, useProgress } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { KEYS, read, useHydrated, write } from "@/lib/store";
import { bnNum, confetti, hasBn, hasLat } from "@/lib/util";
import { useGainXP } from "@/lib/xp";
import FlashCards from "./FlashCards";
import MistakeQuiz from "./MistakeQuiz";
import { useUI } from "./UIProvider";

export default function LessonView({ index, html }: { index: number; html: string }) {
  const c = COURSE[index];
  const p = useProgress();
  const hydrated = useHydrated();
  const markDone = useMarkDone();
  const gain = useGainXP();
  const router = useRouter();
  const { toast } = useUI();
  const [reqMet, setReqMet] = useState(false);
  const fin = useRef<HTMLDivElement>(null);

  const open = !hydrated || p.isOpen(index);
  const done = hydrated && p.isDone(index);
  // browsers without IntersectionObserver can't detect scrolling to the end — don't block them
  const noIO = hydrated && c.req === "read" && !("IntersectionObserver" in window);
  const ready = !done && (reqMet || noIO);

  // "read" lessons unlock the button once the finish bar scrolls into view
  useEffect(() => {
    if (!open || done || c.req !== "read" || !fin.current || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) {
        setReqMet(true);
        io.disconnect();
      }
    }, { threshold: 0.6 });
    io.observe(fin.current);
    return () => io.disconnect();
  }, [open, done, c.req]);

  if (!open) {
    const need = COURSE[p.next];
    return (
      <div className="page">
        <div className="lockcard">
          <div className="lk-ic">🔒</div>
          <h1>এই পাঠটা এখনো তালাবদ্ধ</h1>
          <p>
            ধাপে ধাপে শেখার জন্য আগের পাঠগুলো শেষ করতে হবে। এখন তোমার পড়ার কথা:
            <br />
            <b>
              পাঠ {bnNum(p.next + 1)} — {need.title}
            </b>
          </p>
          <div className="cta">
            <Link className="btn" href={lessonHref(p.next)}>
              ওই পাঠে যাও
            </Link>
            <Link className="btn ghost" href="/">
              কোর্স ম্যাপ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const finish = () => {
    if (done) {
      router.push(index < N - 1 ? lessonHref(index + 1) : "/");
      return;
    }
    if (!ready) return;
    markDone(index);
    gain(20);
    if (index === N - 1) {
      confetti();
      toast("🎉 পুরো কোর্স শেষ! অভিনন্দন!");
    } else toast("✔ পাঠ শেষ! পরের পাঠ খুলে গেছে 🔓");
  };

  const prev = index > 0 ? COURSE[index - 1] : null;
  const next = index < N - 1 ? COURSE[index + 1] : null;

  return (
    <div className="page">
      <p className="crumb">
        <Link href="/">কোর্স ম্যাপ</Link> <span>›</span> {c.group} <span>›</span> পাঠ {bnNum(index + 1)} / {bnNum(N)}
      </p>
      <section className="sec" id="lesson">
        <Content html={html} />
        {c.req === "flash" && <FlashCards onAllSeen={() => setReqMet(true)} />}
        {c.req === "quiz" && <MistakeQuiz onPass={() => setReqMet(true)} />}
      </section>

      <div ref={fin} className={"finish" + (done ? " complete" : ready ? " ready" : "")}>
        <div className="finish-ic">{done ? "✅" : "🎯"}</div>
        <div className="finish-tx">
          <b>{done ? "এই পাঠ শেষ করেছ" : ready ? "দারুণ! এবার পাঠটা শেষ করো" : "এই পাঠ শেষ করো"}</b>
          <p>
            {done
              ? index < N - 1
                ? "পরের পাঠ খুলে গেছে। চাইলে এই পাঠ আবার পড়তে পারো।"
                : "অভিনন্দন! তুমি পুরো কোর্স শেষ করেছ।"
              : c.hint}
          </p>
        </div>
        <button className="btn" type="button" disabled={!done && !ready} onClick={finish}>
          {done ? (index < N - 1 ? "পরের পাঠে যাও →" : "কোর্স ম্যাপে যাও") : "✔ পাঠ শেষ করেছি"}
        </button>
      </div>

      <nav className="pager" aria-label="পাঠ বদলাও">
        {prev && (
          <Link className="pg" href={lessonHref(index - 1)}>
            <small>← আগের পাঠ</small>
            <b>{prev.title}</b>
          </Link>
        )}
        {next &&
          (done ? (
            <Link className="pg nx" href={lessonHref(index + 1)}>
              <small>পরের পাঠ →</small>
              <b>{next.title}</b>
            </Link>
          ) : (
            <a
              className="pg nx lk"
              href="#"
              aria-disabled="true"
              onClick={(e) => {
                e.preventDefault();
                toast("🔒 আগে এই পাঠটা শেষ করো");
              }}
            >
              <small>🔒 পরের পাঠ</small>
              <b>{next.title}</b>
            </a>
          ))}
      </nav>
    </div>
  );
}

/** Static lesson HTML + progressive enhancements (pronunciation buttons, answer toggles, week checkboxes). */
function Content({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useUI();

  useEffect(() => {
    const root = ref.current;
    if (!root || root.dataset.enh) return;
    root.dataset.enh = "1";

    const mkSay = (text: string) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "say";
      b.textContent = "🔊";
      b.setAttribute("aria-label", "উচ্চারণ শোনো");
      b.onclick = (e) => {
        e.stopPropagation();
        root.querySelectorAll(".say.playing").forEach((x) => x.classList.remove("playing"));
        b.classList.add("playing");
        if (!speak(text, () => b.classList.remove("playing"))) {
          b.classList.remove("playing");
          toast("তোমার ব্রাউজারে উচ্চারণ শোনার সুবিধা নেই");
        }
      };
      return b;
    };

    root.querySelectorAll("table").forEach((t) => {
      const w = document.createElement("div");
      w.className = "tw";
      t.before(w);
      w.appendChild(t);
      const h = t.querySelector("th");
      if (h && h.textContent?.trim() === "ইংরেজি") {
        t.classList.add("stack");
        w.classList.add("stackw");
      }
      if (t.classList.contains("mist")) return;
      t.querySelectorAll("tbody tr").forEach((tr) => {
        const cell = tr.querySelector("td.en");
        if (!cell) return;
        const txt = cell.textContent?.trim() ?? "";
        if (t.classList.contains("verbs")) {
          const cells = [...tr.children].slice(0, 3).map((x) => x.textContent);
          cell.appendChild(mkSay(cells.join(", ")));
          return;
        }
        if (!hasBn(txt) && hasLat(txt) && !t.classList.contains("plain") && !t.classList.contains("sum")) cell.appendChild(mkSay(txt));
      });
    });

    root.querySelectorAll(".dialog .dl").forEach((d) => {
      const e = d.querySelector(".en");
      if (e) e.after(mkSay(e.textContent ?? ""));
    });

    root.querySelectorAll<HTMLElement>(".practice .ans").forEach((a) => {
      a.hidden = true;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ans-btn";
      b.textContent = "উত্তর দেখো";
      b.onclick = () => {
        a.hidden = !a.hidden;
        b.textContent = a.hidden ? "উত্তর দেখো" : "উত্তর লুকাও";
      };
      a.before(b);
    });

    // roadmap week checkboxes
    const weeks = [...read<boolean[]>(KEYS.weeks, [])];
    root.querySelectorAll("table.road tbody tr").forEach((tr, i) => {
      const td = tr.lastElementChild as HTMLElement;
      td.textContent = "";
      const c = document.createElement("input");
      c.type = "checkbox";
      c.className = "chk";
      const label = tr.firstElementChild?.textContent ?? "";
      c.setAttribute("aria-label", label + " শেষ");
      c.checked = !!weeks[i];
      tr.classList.toggle("done", c.checked);
      c.onchange = () => {
        weeks[i] = c.checked;
        write(KEYS.weeks, [...weeks]);
        tr.classList.toggle("done", c.checked);
        if (c.checked) toast(label + " শেষ! দারুণ 👏");
      };
      td.appendChild(c);
    });
  }, [html, toast]);

  return <div className="lesson-body" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
