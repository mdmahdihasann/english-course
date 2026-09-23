"use client";
import { useState } from "react";
import { speak } from "@/lib/speech";
import { useUI } from "./UIProvider";

export default function SayButton({ text, className = "", label = "উচ্চারণ শোনো" }: { text: string; className?: string; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const { toast } = useUI();
  return (
    <button
      type="button"
      className={"say" + (playing ? " playing" : "") + (className ? " " + className : "")}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        setPlaying(true);
        if (!speak(text, () => setPlaying(false))) {
          setPlaying(false);
          toast("তোমার ব্রাউজারে উচ্চারণ শোনার সুবিধা নেই");
        }
      }}
    >
      🔊
    </button>
  );
}
