"use client";
import { useEffect } from "react";
import { KEYS, useHydrated, usePersisted } from "@/lib/store";
import { setLanguage, type Lang } from "@/lib/translator";

// English is the default; the lessons themselves are written in Bangla and translated on the fly
const DEFAULT_LANG: Lang = "en";

export function useLang() {
  return usePersisted<Lang>(KEYS.lang, DEFAULT_LANG);
}

/** Keeps the page in the chosen language and lifts the pre-paint cover set by the boot script. */
export function LangSync() {
  const [lang] = useLang();
  const hydrated = useHydrated();
  useEffect(() => {
    if (!hydrated) return;
    let live = true;
    setLanguage(lang).then(() => live && document.documentElement.classList.remove("tr-wait"));
    return () => {
      live = false;
    };
  }, [lang, hydrated]);
  return null;
}

export default function LangToggle() {
  const [lang, setLang] = useLang();
  const hydrated = useHydrated();
  const cur = hydrated ? lang : DEFAULT_LANG;
  return (
    <div className="lang" role="radiogroup" aria-label="Language" translate="no">
      {(
        [
          ["en", "EN"],
          ["bn", "বাং"],
        ] as const
      ).map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={cur === v} className={cur === v ? "on" : ""} onClick={() => setLang(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}
