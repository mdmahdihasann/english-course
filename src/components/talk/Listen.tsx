"use client";
import { useEffect, useRef, useState } from "react";
import type { Scene } from "@/data/talk";
import { useUI } from "../UIProvider";
import { sayLine } from "./common";

/** the whole conversation as chat bubbles; plays it line by line and highlights the current one */
export default function Listen({ scene, onPlay }: { scene: Scene; onPlay: () => void }) {
  const [cur, setCur] = useState(-1);
  const [hideBn, setHideBn] = useState(false);
  const stop = useRef<(() => void) | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const { toast } = useUI();

  const halt = () => {
    stop.current?.();
    stop.current = null;
    setCur(-1);
  };
  useEffect(() => () => stop.current?.(), []);

  useEffect(() => {
    if (cur >= 0) box.current?.children[cur]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [cur]);

  /** play from line `i`; `all` keeps going to the end */
  const play = (i: number, all: boolean) => {
    stop.current?.();
    if (!("speechSynthesis" in window)) toast("তোমার ব্রাউজারে উচ্চারণ শোনার সুবিধা নেই");
    setCur(i);
    const l = scene.lines[i];
    stop.current = sayLine(l.en, l.me, () => {
      if (all && i + 1 < scene.lines.length) play(i + 1, true);
      else {
        stop.current = null;
        setCur(-1);
      }
    });
  };

  return (
    <div className="tlisten">
      <div className="tl-bar">
        {cur >= 0 ? (
          <button type="button" className="btn" onClick={halt}>
            ⏹ থামাও
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => play(0, true)}>
            ▶ পুরোটা শোনো
          </button>
        )}
        <label className="tl-toggle">
          <input type="checkbox" checked={hideBn} onChange={(e) => setHideBn(e.target.checked)} />
          <span>বাংলা লুকাও</span>
        </label>
      </div>

      <div className="chat" ref={box}>
        {scene.lines.map((l, i) => (
          <button key={i} type="button" className={"bub " + (l.me ? "me" : "them") + (cur === i ? " live" : "")} onClick={() => play(i, false)} aria-label={l.en}>
            <small className="who">{l.me ? scene.you : scene.them}</small>
            <span className="en">{l.en}</span>
            {!hideBn && (
              <span className="bn" translate="no">
                {l.bn}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="tl-next">
        <p>শোনা হয়ে গেলে এবার নিজের লাইনগুলো তুমি নিজেই বলো।</p>
        <button
          type="button"
          className="btn sunny"
          onClick={() => {
            halt();
            onPlay();
          }}
        >
          🎭 রোল-প্লে শুরু করো
        </button>
      </div>
    </div>
  );
}
