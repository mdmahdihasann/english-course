"use client";
import type { Scene } from "@/data/talk";
import SayButton from "../SayButton";

export default function Phrases({ scene }: { scene: Scene }) {
  return (
    <ul className="tphrases">
      {scene.phrases.map(([en, bn]) => (
        <li key={en}>
          <span>
            <b className="en">{en}</b>
            <small translate="no">{bn}</small>
          </span>
          <SayButton text={en} />
        </li>
      ))}
    </ul>
  );
}
