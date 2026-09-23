export const bnNum = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

export const shuffle = <T,>(a: readonly T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export const pick = <T,>(a: readonly T[], n: number) => shuffle(a).slice(0, n);

export const hasBn = (t: string) => /[ঀ-৿]/.test(t);
export const hasLat = (t: string) => /[A-Za-z]/.test(t);

/** local YYYY-MM-DD */
export const dayKey = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

export const wordCount = (t: string) => (t.trim().match(/\S+/g) || []).length;

export const reducedMotion = () =>
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function confetti() {
  if (reducedMotion()) return;
  const cols = ["#0b6e4f", "#f2b705", "#d63a31", "#1f45b5", "#6b3fb3"];
  for (let i = 0; i < 80; i++) {
    const c = document.createElement("i");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = cols[i % 5];
    c.style.animationDuration = 1.8 + Math.random() * 1.8 + "s";
    c.style.animationDelay = Math.random() * 0.4 + "s";
    c.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4200);
  }
}
