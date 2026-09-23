/*
 * Offline "Writing Polisher": finds weak words, informal / non-formal words,
 * common learner errors and repetition in an English text.
 */

export type Kind = "grammar" | "weak" | "informal" | "formal" | "repeat";
export type Issue = { start: number; end: number; text: string; kind: Kind; sugg: string[]; note: string };

export const KIND_LABEL: Record<Kind, string> = {
  grammar: "ভুল",
  weak: "দুর্বল শব্দ",
  informal: "কথ্য ভাষা",
  formal: "ফরমাল নয়",
  repeat: "বারবার",
};

type Rule = { re: RegExp; kind: Kind; sugg: (m: RegExpExecArray) => string[]; note: string; formalOnly?: boolean };

/* very + adjective → one strong word */
const VERY: Record<string, string[]> = {
  good: ["excellent", "outstanding", "superb"],
  bad: ["terrible", "awful", "dreadful"],
  big: ["huge", "enormous", "massive"],
  small: ["tiny", "minute"],
  happy: ["delighted", "thrilled", "overjoyed"],
  sad: ["heartbroken", "miserable"],
  tired: ["exhausted", "drained"],
  important: ["crucial", "essential", "vital"],
  difficult: ["challenging", "demanding"],
  hard: ["challenging", "demanding", "arduous"],
  easy: ["effortless", "straightforward"],
  beautiful: ["stunning", "gorgeous"],
  pretty: ["stunning", "gorgeous"],
  angry: ["furious", "livid"],
  hungry: ["starving", "ravenous"],
  cold: ["freezing", "icy"],
  hot: ["scorching", "boiling"],
  old: ["ancient", "elderly"],
  fast: ["rapid", "swift"],
  quick: ["rapid", "swift"],
  scared: ["terrified", "petrified"],
  afraid: ["terrified", "petrified"],
  interesting: ["fascinating", "compelling"],
  boring: ["tedious", "dull"],
  clean: ["spotless", "immaculate"],
  dirty: ["filthy", "grimy"],
  clear: ["obvious", "evident"],
  smart: ["brilliant", "ingenious"],
  quiet: ["silent", "hushed"],
  rich: ["wealthy", "affluent"],
  poor: ["impoverished", "destitute"],
  many: ["numerous", "countless"],
  much: ["considerably", "greatly"],
  sure: ["certain", "confident"],
  strong: ["powerful", "mighty"],
  funny: ["hilarious"],
  bright: ["dazzling", "brilliant"],
  surprised: ["astonished", "amazed"],
  worried: ["anxious", "distressed"],
  useful: ["invaluable", "beneficial"],
};

/* single weak words */
const WEAK: [string, string[], string][] = [
  ["good", ["great", "excellent", "effective", "beneficial"], "good খুব সাধারণ — কী ধরনের ভালো, সেটা বোঝায় এমন শব্দ বেছে নাও।"],
  ["bad", ["poor", "harmful", "unpleasant", "negative"], "bad এর বদলে নির্দিষ্ট শব্দ লেখাকে পরিণত করে।"],
  ["big", ["large", "significant", "substantial", "major"], "big কথ্য ভাষায় চলে, লেখায় significant / major ভালো।"],
  ["nice", ["pleasant", "kind", "lovely", "enjoyable"], "nice অস্পষ্ট — কেমন সুন্দর বা ভালো, সেটা বলো।"],
  ["thing", ["aspect", "issue", "matter", "factor"], "thing খুব অস্পষ্ট — আসল জিনিসটার নাম বলো।"],
  ["things", ["aspects", "issues", "matters", "factors"], "things খুব অস্পষ্ট — আসল জিনিসগুলোর নাম বলো।"],
  ["stuff", ["material", "items", "belongings"], "stuff কথ্য শব্দ — লেখায় এড়িয়ে চলো।"],
  ["a lot of", ["many", "much", "a great deal of", "numerous"], "a lot of কথ্য; countable হলে many/numerous, uncountable হলে much/a great deal of।"],
  ["lots of", ["many", "much", "plenty of", "numerous"], "lots of কথ্য; লেখায় many/much ভালো।"],
  ["get", ["obtain", "receive", "gain", "become"], "get এর অনেক অর্থ — নির্দিষ্ট verb বেছে নাও।"],
  ["got", ["obtained", "received", "gained", "became"], "got এর বদলে নির্দিষ্ট verb বেশি পরিষ্কার।"],
  ["really", ["truly", "genuinely", "extremely"], "really প্রায়ই অপ্রয়োজনীয় — বাদ দিলেও চলে।"],
  ["think", ["believe", "consider", "feel"], "think এর বদলে believe / consider লেখাকে দৃঢ় করে।"],
  ["show", ["demonstrate", "reveal", "illustrate"], "show এর চেয়ে demonstrate / illustrate একাডেমিক লেখায় ভালো।"],
  ["help", ["assist", "support", "facilitate"], "help এর ফরমাল বিকল্প assist / support।"],
  ["buy", ["purchase", "acquire"], "buy এর ফরমাল রূপ purchase।"],
  ["need", ["require", "demand"], "need এর ফরমাল রূপ require।"],
  ["maybe", ["perhaps", "possibly"], "maybe কথ্য — লেখায় perhaps।"],
  ["kind of", ["somewhat", "rather", "fairly"], "kind of / sort of কথ্য — somewhat / rather লেখো।"],
  ["sort of", ["somewhat", "rather", "fairly"], "kind of / sort of কথ্য — somewhat / rather লেখো।"],
  ["make a big difference", ["have a significant impact"], "have a significant impact — বেশি শক্তিশালী ও ফরমাল।"],
  ["in my opinion", ["from my perspective", "I would argue that"], "ঠিকই আছে, তবে একঘেয়ে — বৈচিত্র্য আনো।"],
];

const INFORMAL: [string, string[]][] = [
  ["gonna", ["going to"]],
  ["wanna", ["want to"]],
  ["gotta", ["have to", "have got to"]],
  ["kinda", ["somewhat", "kind of"]],
  ["sorta", ["somewhat", "sort of"]],
  ["ain't", ["is not", "am not", "are not"]],
  ["yeah", ["yes"]],
  ["yep", ["yes"]],
  ["nope", ["no"]],
  ["okay", ["fine", "all right", "acceptable"]],
  ["ok", ["fine", "all right", "acceptable"]],
  ["u", ["you"]],
  ["ur", ["your", "you are"]],
  ["pls", ["please"]],
  ["plz", ["please"]],
  ["thx", ["thanks", "thank you"]],
  ["coz", ["because"]],
  ["cuz", ["because"]],
  ["btw", ["by the way", "incidentally"]],
  ["lol", [""]],
  ["guys", ["everyone", "people"]],
  ["kids", ["children"]],
  ["awesome", ["impressive", "excellent"]],
  ["cool", ["impressive", "excellent"]],
];

const GRAMMAR: [RegExp, string[], string][] = [
  [/\bi\b(?!\.e\.)/g, ["I"], "‘আমি’ অর্থে I সবসময় বড় হাতের।"],
  [/\bmore (better|worse|bigger|smaller|faster|easier|harder|taller)\b/gi, [], "comparative এর আগে আবার more লাগে না।"],
  [/\bmost (best|worst|biggest|smallest|fastest|easiest|smartest)\b/gi, [], "superlative এর আগে আবার most লাগে না।"],
  [/\b(could|would|should|must) of\b/gi, [], "of নয় — could have / would have / should have।"],
  [/\balot\b/gi, ["a lot"], "alot বলে কোনো শব্দ নেই — a lot (আলাদা করে)।"],
  [/\bdiscuss about\b/gi, ["discuss"], "discuss এর পরে about বসে না।"],
  [/\bdespite of\b/gi, ["despite", "in spite of"], "despite এর পরে of নয়।"],
  [/\breturn back\b/gi, ["return"], "return মানেই ফেরত — back বাড়তি।"],
  [/\brepeat again\b/gi, ["repeat"], "repeat মানেই আবার — again বাড়তি।"],
  [/\bvery unique\b/gi, ["unique"], "unique মানেই অনন্য — very লাগে না।"],
  [/\birregardless\b/gi, ["regardless"], "সঠিক শব্দ regardless।"],
  [/\bi am agree\b/gi, ["I agree"], "agree নিজেই verb — am লাগে না।"],
  [/\binformations\b/gi, ["information"], "information uncountable — s হয় না।"],
  [/\badvices\b/gi, ["advice", "pieces of advice"], "advice uncountable — s হয় না।"],
  [/\bfurnitures\b/gi, ["furniture"], "furniture uncountable — s হয় না।"],
  [/\bequipments\b/gi, ["equipment"], "equipment uncountable — s হয় না।"],
  [/\b(he|she|it) don't\b/gi, [], "He/She/It এর সাথে doesn't।"],
  [/\bdidn't (went|came|saw|did|ate|took|gave|made|wrote|said)\b/gi, [], "didn't এর পরে V1।"],
  [/\beach and every\b/gi, ["every", "each"], "each and every বাড়তি — একটাই যথেষ্ট।"],
  [/\bcan able to\b/gi, ["can", "am able to"], "can আর able to একসাথে নয়।"],
];

const CONTRACTIONS: Record<string, string> = {
  "don't": "do not", "doesn't": "does not", "didn't": "did not", "can't": "cannot", "won't": "will not",
  "isn't": "is not", "aren't": "are not", "wasn't": "was not", "weren't": "were not", "haven't": "have not",
  "hasn't": "has not", "hadn't": "had not", "couldn't": "could not", "shouldn't": "should not", "wouldn't": "would not",
  "i'm": "I am", "it's": "it is", "that's": "that is", "there's": "there is", "i've": "I have", "we've": "we have",
  "they've": "they have", "you're": "you are", "we're": "we are", "they're": "they are", "i'll": "I will",
  "we'll": "we will", "they'll": "they will", "you'll": "you will", "i'd": "I would", "he's": "he is", "she's": "she is",
  "let's": "let us",
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const phraseRe = (ps: string[]) =>
  new RegExp("(?<![\\w'’])(?:" + [...ps].sort((a, b) => b.length - a.length).map((p) => esc(p).replace(/'/g, "['’]").replace(/ /g, "\\s+")).join("|") + ")(?![\\w'’])", "gi");

const WEAK_MAP = new Map(WEAK.map(([w, s, n]) => [w, { s, n }]));
const INF_MAP = new Map(INFORMAL);
const normKey = (s: string) => s.toLowerCase().replace(/’/g, "'").replace(/\s+/g, " ");

const RULES: Rule[] = [
  ...GRAMMAR.map(([re, s, note]): Rule => ({
    re,
    kind: "grammar",
    note,
    sugg: (m) => {
      if (s.length) return s;
      const t = m[0].toLowerCase();
      if (/^(could|would|should|must) of$/.test(t)) return [t.replace(" of", " have")];
      if (/^(more|most) /.test(t)) return [m[1]];
      if (/ don't$/.test(t)) return [m[0].split(" ")[0] + " doesn't"];
      if (/^didn't /.test(t)) {
        const V: Record<string, string> = { went: "go", came: "come", saw: "see", did: "do", ate: "eat", took: "take", gave: "give", made: "make", wrote: "write", said: "say" };
        return ["didn't " + V[m[1].toLowerCase()]];
      }
      return [];
    },
  })),
  {
    re: /\bvery\s+([a-z]+)\b/gi,
    kind: "weak",
    note: "very + সাধারণ বিশেষণ এর বদলে একটা শক্তিশালী শব্দ ব্যবহার করো।",
    sugg: (m) => VERY[m[1].toLowerCase()] || [m[1]],
  },
  {
    re: phraseRe([...INF_MAP.keys()]),
    kind: "informal",
    note: "এটা কথ্য বা চ্যাটের ভাষা — লেখায় পূর্ণ রূপ ব্যবহার করো।",
    sugg: (m) => INF_MAP.get(normKey(m[0])) || [],
  },
  {
    re: phraseRe(Object.keys(CONTRACTIONS)),
    kind: "formal",
    formalOnly: true,
    note: "ফরমাল লেখায় (ইমেইল, পরীক্ষা, রিপোর্ট) contraction এর বদলে পূর্ণ রূপ লেখো।",
    sugg: (m) => [CONTRACTIONS[normKey(m[0])]].filter(Boolean),
  },
  {
    re: /(?:^|[.!?]\s+)(And|But|So)\b/g,
    kind: "formal",
    formalOnly: true,
    note: "ফরমাল লেখায় বাক্য And/But/So দিয়ে শুরু না করে linking word ব্যবহার করো।",
    sugg: (m) => ({ and: ["Moreover,", "Furthermore,", "In addition,"], but: ["However,", "Nevertheless,"], so: ["Therefore,", "Consequently,", "As a result,"] })[m[1].toLowerCase()] || [],
  },
  {
    re: phraseRe(WEAK.map(([w]) => w)),
    kind: "weak",
    note: "",
    sugg: (m) => WEAK_MAP.get(normKey(m[0]))?.s || [],
  },
];

const STOP = new Set(
  "the a an and or but so of to in on at for with by from is are was were be been being have has had do does did this that these those it its they them their there here he she his her we our you your i me my not no can will would could should may might must very really just also than then when what which who whom whose how why where because about into over under more most some any all each every such only own same other".split(" "),
);

export type Analysis = {
  issues: Issue[];
  words: number;
  sentences: number;
  avgLen: number;
  longSentences: string[];
  variety: number;
  level: string;
  score: number;
};

const LEVELS = ["A2", "B1", "B2", "C1", "C2"];

export function analyze(text: string, formal: boolean, ignored: Set<string>): Analysis {
  const found: Issue[] = [];
  for (const r of RULES) {
    if (r.formalOnly && !formal) continue;
    r.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = r.re.exec(text))) {
      if (!m[0]) {
        r.re.lastIndex++;
        continue;
      }
      // the sentence-start rule matches the preceding punctuation too — keep only the word
      const lead = r.re.source.startsWith("(?:^|[.!?]") ? m[0].length - m[1].length : 0;
      const start = m.index + lead;
      const t = text.slice(start, m.index + m[0].length);
      if (r.kind === "weak" && r.note === "" && !formal && /^(think|help|need|show|buy|get|got)$/i.test(t)) continue;
      const note = r.note || WEAK_MAP.get(normKey(t))?.n || "";
      found.push({ start, end: start + t.length, text: t, kind: r.kind, sugg: r.sugg(m), note });
    }
  }

  // repetition: the same content word 3+ times
  const words = text.match(/[A-Za-z][A-Za-z'’-]*/g) || [];
  const counts = new Map<string, number>();
  words.forEach((w) => {
    const k = w.toLowerCase();
    if (k.length >= 4 && !STOP.has(k)) counts.set(k, (counts.get(k) || 0) + 1);
  });
  counts.forEach((n, k) => {
    if (n < 3) return;
    const re = new RegExp("\\b" + esc(k) + "\\b", "gi");
    let m: RegExpExecArray | null;
    let seen = 0;
    while ((m = re.exec(text))) {
      if (seen++ === 0) continue; // keep the first use
      found.push({ start: m.index, end: m.index + m[0].length, text: m[0], kind: "repeat", sugg: WEAK_MAP.get(k)?.s || [], note: `“${k}” ${n} বার এসেছে — প্রতিশব্দ বা সর্বনাম (it/this) ব্যবহার করো।` });
    }
  });

  // earliest first, longer wins, no overlaps, skip ignored
  found.sort((a, b) => a.start - b.start || b.end - a.end);
  const issues: Issue[] = [];
  let last = -1;
  for (const f of found) {
    if (f.start < last) continue;
    if (ignored.has(normKey(f.text) + "|" + f.kind)) continue;
    issues.push(f);
    last = f.end;
  }

  const sents = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => /[A-Za-z]/.test(s));
  const wc = words.length;
  const avgLen = sents.length ? wc / sents.length : 0;
  const longSentences = sents.filter((s) => (s.match(/\S+/g) || []).length > 28);
  const uniq = new Set(words.map((w) => w.toLowerCase())).size;
  const variety = wc ? Math.round((uniq / wc) * 100) : 0;
  const longWords = words.filter((w) => w.length >= 7).length;
  const lw = wc ? (longWords / wc) * 100 : 0;

  const weight: Record<Kind, number> = { grammar: 8, informal: 5, formal: 3, weak: 3, repeat: 2 };
  const penalty = issues.reduce((a, i) => a + weight[i.kind], 0) + longSentences.length * 4;
  const per100 = wc ? (penalty / wc) * 100 : 0;
  const score = wc ? Math.round(100 * Math.exp(-per100 / 70)) : 0;

  // rough CEFR guess from word length + sentence length, pulled down by problems
  const pts = lw * 0.6 + Math.min(avgLen, 25) * 0.8 - Math.min(per100, 60) * 0.08;
  const level = wc < 20 ? "—" : LEVELS[pts < 12 ? 0 : pts < 20 ? 1 : pts < 30 ? 2 : pts < 48 ? 3 : 4];

  return { issues, words: wc, sentences: sents.length, avgLen, longSentences, variety, level, score };
}

export const ignoreKey = (i: Issue) => normKey(i.text) + "|" + i.kind;

/** replace an issue in the text, keeping a leading capital */
export function applyFix(text: string, i: Issue, s: string) {
  let rep = s;
  if (rep && /^[A-Z]/.test(i.text) && i.text !== "I") rep = rep[0].toUpperCase() + rep.slice(1);
  let out = text.slice(0, i.start) + rep + text.slice(i.end);
  if (!rep) out = out.replace(/\s{2,}/g, " ");
  return out;
}
