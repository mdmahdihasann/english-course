/*
 * Role-play scenes. `me: true` lines are the learner's; the rest are said by the partner.
 * `alt` = other answers that are just as correct; `tip` = a short Bangla note from the coach.
 */
export type Line = { me?: boolean; en: string; bn: string; alt?: string[]; tip?: string };
export type Scene = {
  id: string;
  icon: string;
  title: string;
  sub: string;
  level: 1 | 2 | 3;
  you: string;
  them: string;
  lines: Line[];
  phrases: [string, string][];
};

export const LEVELS = ["", "সহজ", "মাঝারি", "কঠিন"] as const;

export const SCENES: Scene[] = [
  {
    id: "intro",
    icon: "👋",
    title: "পরিচয়",
    sub: "নতুন সহপাঠীর সাথে প্রথম কথা",
    level: 1,
    you: "তুমি",
    them: "Sara",
    lines: [
      { en: "Hi! I'm Sara. I'm new here.", bn: "হাই! আমি সারা। আমি এখানে নতুন।" },
      { me: true, en: "Hi Sara, I'm Rahim. Nice to meet you.", bn: "হাই সারা, আমি রহিম। তোমার সাথে দেখা হয়ে ভালো লাগল।", alt: ["Hello Sara, I'm Rahim. Nice to meet you.", "Hi Sara, my name is Rahim. Nice to meet you."], tip: "“Nice to meet you” — প্রথম দেখায় বলা হয়। পরে দেখা হলে বলো “Nice to see you”।" },
      { en: "Nice to meet you too. Where are you from?", bn: "তোমার সাথে দেখা হয়েও ভালো লাগল। তুমি কোথা থেকে এসেছ?" },
      { me: true, en: "I'm from Dhaka. What about you?", bn: "আমি ঢাকা থেকে। তুমি?", alt: ["I am from Dhaka. How about you?", "I'm from Dhaka. And you?"], tip: "“What about you?” দিয়ে একই প্রশ্ন ফিরিয়ে দেওয়া যায় — কথা চালিয়ে যাওয়ার সহজ কৌশল।" },
      { en: "I'm from Sylhet. What do you do?", bn: "আমি সিলেট থেকে। তুমি কী করো?" },
      { me: true, en: "I'm a student. I study computer science.", bn: "আমি একজন ছাত্র। আমি কম্পিউটার সায়েন্স পড়ি।", tip: "পেশার আগে a/an বসে: I'm a student, I'm an engineer।" },
      { en: "That's great! Do you like it?", bn: "দারুণ! তোমার ভালো লাগে?" },
      { me: true, en: "Yes, I love it. See you in class!", bn: "হ্যাঁ, খুব ভালো লাগে। ক্লাসে দেখা হবে!", alt: ["Yes, I really like it. See you in class!"] },
    ],
    phrases: [
      ["Nice to meet you.", "তোমার সাথে দেখা হয়ে ভালো লাগল।"],
      ["Where are you from?", "তুমি কোথা থেকে এসেছ?"],
      ["What do you do?", "তুমি কী করো? (পেশা)"],
      ["What about you?", "আর তুমি?"],
      ["See you later!", "পরে দেখা হবে!"],
    ],
  },
  {
    id: "shop",
    icon: "🛍️",
    title: "দোকানে কেনাকাটা",
    sub: "জামা কেনা, দাম আর সাইজ",
    level: 1,
    you: "তুমি",
    them: "দোকানদার",
    lines: [
      { en: "Good afternoon! Can I help you?", bn: "শুভ অপরাহ্ন! আমি কি সাহায্য করতে পারি?" },
      { me: true, en: "Yes, I'm looking for a blue shirt.", bn: "হ্যাঁ, আমি একটা নীল শার্ট খুঁজছি।", alt: ["Yes please, I'm looking for a blue shirt."], tip: "দোকানে “I want” এর চেয়ে “I'm looking for” অনেক বেশি ভদ্র শোনায়।" },
      { en: "Sure. What size do you wear?", bn: "অবশ্যই। তুমি কোন সাইজ পরো?" },
      { me: true, en: "Medium, please.", bn: "মিডিয়াম, প্লিজ।", alt: ["Medium please.", "A medium, please."] },
      { en: "Here you are. The fitting room is over there.", bn: "এই নাও। ট্রায়াল রুম ওই দিকে।" },
      { me: true, en: "Thank you. How much is it?", bn: "ধন্যবাদ। এটার দাম কত?", alt: ["Thanks. How much is it?", "Thank you. How much does it cost?"], tip: "একটা জিনিস হলে “How much is it?”, অনেকগুলো হলে “How much are they?”" },
      { en: "It's eight hundred taka.", bn: "এটা আটশো টাকা।" },
      { me: true, en: "Can you give me a discount?", bn: "একটু কম রাখা যায়?", alt: ["Could you give me a discount?", "Can I get a discount?"] },
      { en: "Okay, seven hundred and fifty. Cash or card?", bn: "ঠিক আছে, সাড়ে সাতশো। ক্যাশ না কার্ড?" },
      { me: true, en: "Cash, please. Here you are.", bn: "ক্যাশ, প্লিজ। এই নিন।", alt: ["Cash please. Here you go."] },
    ],
    phrases: [
      ["I'm looking for…", "আমি … খুঁজছি"],
      ["How much is it?", "এটার দাম কত?"],
      ["Can I try it on?", "আমি কি পরে দেখতে পারি?"],
      ["Can you give me a discount?", "একটু কম রাখা যায়?"],
      ["Here you are.", "এই নিন।"],
    ],
  },
  {
    id: "way",
    icon: "🗺️",
    title: "রাস্তা জিজ্ঞেস",
    sub: "অচেনা জায়গায় পথ খোঁজা",
    level: 2,
    you: "তুমি",
    them: "পথচারী",
    lines: [
      { me: true, en: "Excuse me, can you help me?", bn: "মাফ করবেন, আমাকে একটু সাহায্য করতে পারবেন?", alt: ["Excuse me, could you help me?"], tip: "অচেনা মানুষকে থামাতে সবসময় “Excuse me” দিয়ে শুরু করো।" },
      { en: "Of course. What are you looking for?", bn: "অবশ্যই। কী খুঁজছেন?" },
      { me: true, en: "How do I get to the train station?", bn: "রেলস্টেশনে কীভাবে যাব?", alt: ["How can I get to the train station?", "Where is the train station?"] },
      { en: "Go straight and turn left at the second light.", bn: "সোজা যান, তারপর দ্বিতীয় সিগন্যালে বামে ঘুরুন।" },
      { me: true, en: "Is it far from here?", bn: "এখান থেকে কি অনেক দূর?", alt: ["Is it very far from here?", "Is it far?"] },
      { en: "No, it's about ten minutes on foot.", bn: "না, হেঁটে দশ মিনিটের মতো।" },
      { me: true, en: "Could you show me on the map?", bn: "ম্যাপে একটু দেখিয়ে দেবেন?", alt: ["Can you show me on the map?"], tip: "“Could you…?” — “Can you…?” এর চেয়ে বেশি ভদ্র। অচেনা কাউকে অনুরোধ করতে এটাই ভালো।" },
      { en: "Sure. You are here, and the station is here.", bn: "অবশ্যই। আপনি এখানে, আর স্টেশন এখানে।" },
      { me: true, en: "Thank you so much for your help.", bn: "সাহায্যের জন্য অনেক ধন্যবাদ।", alt: ["Thanks a lot for your help.", "Thank you very much for your help."] },
    ],
    phrases: [
      ["Excuse me…", "মাফ করবেন… (কাউকে থামাতে)"],
      ["How do I get to…?", "… কীভাবে যাব?"],
      ["Go straight.", "সোজা যান।"],
      ["Turn left / right.", "বামে / ডানে ঘুরুন।"],
      ["Is it far from here?", "এখান থেকে কি দূর?"],
    ],
  },
  {
    id: "food",
    icon: "🍽️",
    title: "রেস্টুরেন্ট",
    sub: "খাবার অর্ডার আর বিল চাওয়া",
    level: 2,
    you: "তুমি",
    them: "ওয়েটার",
    lines: [
      { en: "Good evening. Do you have a reservation?", bn: "শুভ সন্ধ্যা। আপনার কি আগে থেকে বুক করা আছে?" },
      { me: true, en: "No, we don't. A table for two, please.", bn: "না, নেই। দুজনের জন্য একটা টেবিল, প্লিজ।", alt: ["No, we do not. A table for two, please.", "No. A table for two, please."] },
      { en: "Right this way. Here's the menu.", bn: "এদিকে আসুন। এই যে মেনু।" },
      { me: true, en: "What do you recommend?", bn: "আপনি কী খেতে বলবেন?", alt: ["What would you recommend?"], tip: "নতুন রেস্টুরেন্টে এই প্রশ্নটা খুব কাজের — ওয়েটার সবচেয়ে ভালো খাবারটা বলে দেবে।" },
      { en: "Our chicken biryani is very popular.", bn: "আমাদের চিকেন বিরিয়ানি খুব জনপ্রিয়।" },
      { me: true, en: "I'd like the chicken biryani, please.", bn: "আমি চিকেন বিরিয়ানিটা নেব, প্লিজ।", alt: ["I would like the chicken biryani, please.", "I'll have the chicken biryani, please."], tip: "“I'd like…” = I would like — অর্ডার দেওয়ার সবচেয়ে ভদ্র উপায়। “I want” বললে রুক্ষ শোনায়।" },
      { en: "Anything to drink?", bn: "কিছু পান করবেন?" },
      { me: true, en: "Just a glass of water, thanks.", bn: "শুধু এক গ্লাস পানি, ধন্যবাদ।", alt: ["Just water, thanks.", "A glass of water, please."] },
      { en: "Here's your food. Enjoy your meal!", bn: "এই যে আপনার খাবার। ভালো করে খান!" },
      { me: true, en: "Could we have the bill, please?", bn: "বিলটা দেবেন, প্লিজ?", alt: ["Can we have the bill, please?", "Could I have the bill, please?"] },
    ],
    phrases: [
      ["A table for two, please.", "দুজনের জন্য একটা টেবিল।"],
      ["What do you recommend?", "আপনি কী খেতে বলবেন?"],
      ["I'd like…", "আমি … নেব"],
      ["Could we have the bill, please?", "বিলটা দেবেন?"],
      ["Enjoy your meal!", "ভালো করে খান!"],
    ],
  },
  {
    id: "doctor",
    icon: "🩺",
    title: "ডাক্তারের কাছে",
    sub: "অসুখের কথা বুঝিয়ে বলা",
    level: 2,
    you: "তুমি",
    them: "ডাক্তার",
    lines: [
      { en: "Hello. What seems to be the problem?", bn: "হ্যালো। সমস্যাটা কী?" },
      { me: true, en: "I have a headache and a fever.", bn: "আমার মাথাব্যথা আর জ্বর।", alt: ["I've got a headache and a fever."], tip: "অসুখের কথা বলতে “I have a …” — I have a cold, I have a cough, I have a stomachache।" },
      { en: "How long have you had them?", bn: "কতদিন ধরে এমন হচ্ছে?" },
      { me: true, en: "Since yesterday morning.", bn: "গতকাল সকাল থেকে।", alt: ["Since yesterday.", "Since yesterday morning, doctor."], tip: "নির্দিষ্ট সময় থেকে হলে since (since Monday), সময়ের পরিমাণ হলে for (for two days)।" },
      { en: "Do you have a cough or a sore throat?", bn: "কাশি বা গলাব্যথা আছে?" },
      { me: true, en: "Yes, my throat hurts a little.", bn: "হ্যাঁ, গলাটা একটু ব্যথা করে।", alt: ["Yes, I have a sore throat.", "Yes, my throat hurts."] },
      { en: "It's probably the flu. Take this medicine twice a day.", bn: "সম্ভবত ফ্লু। এই ওষুধটা দিনে দুবার খাবেন।" },
      { me: true, en: "Should I take it after meals?", bn: "খাবারের পরে খাব?", alt: ["Should I take it after eating?", "Do I take it after meals?"] },
      { en: "Yes, after meals. And drink plenty of water.", bn: "হ্যাঁ, খাবারের পরে। আর প্রচুর পানি খাবেন।" },
      { me: true, en: "Thank you, doctor.", bn: "ধন্যবাদ, ডাক্তার সাহেব।", alt: ["Thanks, doctor.", "Thank you very much, doctor."] },
    ],
    phrases: [
      ["I have a headache.", "আমার মাথাব্যথা।"],
      ["My throat hurts.", "আমার গলা ব্যথা করছে।"],
      ["Since yesterday.", "গতকাল থেকে।"],
      ["twice a day", "দিনে দুবার"],
      ["after meals", "খাবারের পরে"],
    ],
  },
  {
    id: "job",
    icon: "💼",
    title: "চাকরির ইন্টারভিউ",
    sub: "নিজেকে গুছিয়ে উপস্থাপন",
    level: 3,
    you: "তুমি",
    them: "ইন্টারভিউয়ার",
    lines: [
      { en: "Good morning. Please have a seat.", bn: "শুভ সকাল। বসুন, প্লিজ।" },
      { me: true, en: "Thank you. It's a pleasure to be here.", bn: "ধন্যবাদ। এখানে আসতে পেরে ভালো লাগছে।", alt: ["Thank you. It is a pleasure to be here.", "Thank you. I'm glad to be here."] },
      { en: "Tell me a little about yourself.", bn: "নিজের সম্পর্কে একটু বলুন।" },
      { me: true, en: "I graduated in business and I have two years of experience in sales.", bn: "আমি বিজনেসে গ্র্যাজুয়েশন করেছি, আর সেলসে আমার দুই বছরের অভিজ্ঞতা আছে।", alt: ["I graduated in business, and I have two years of sales experience."], tip: "ইন্টারভিউতে আগে পড়াশোনা, তারপর অভিজ্ঞতা — ছোট আর গোছানো রাখো।" },
      { en: "Why do you want to work here?", bn: "আপনি এখানে কেন কাজ করতে চান?" },
      { me: true, en: "I admire your company and I want to grow with your team.", bn: "আমি আপনাদের কোম্পানিকে শ্রদ্ধা করি, আর আপনাদের টিমের সাথে এগিয়ে যেতে চাই।", alt: ["I admire your company, and I would like to grow with your team."] },
      { en: "What is your greatest strength?", bn: "আপনার সবচেয়ে বড় শক্তি কী?" },
      { me: true, en: "I'm a quick learner and I work well under pressure.", bn: "আমি দ্রুত শিখতে পারি, আর চাপের মধ্যেও ভালো কাজ করি।", alt: ["I am a fast learner and I work well under pressure."], tip: "“work well under pressure” — ইন্টারভিউয়ের একটা জনপ্রিয় collocation।" },
      { en: "Do you have any questions for us?", bn: "আমাদের কাছে আপনার কোনো প্রশ্ন আছে?" },
      { me: true, en: "Yes. What does a typical day look like in this role?", bn: "হ্যাঁ। এই পদে একটা সাধারণ দিন কেমন কাটে?", alt: ["Yes. What is a typical day like in this role?"], tip: "শেষে একটা প্রশ্ন করলে বোঝায় তুমি সত্যিই আগ্রহী। “No questions” বলো না।" },
      { en: "Great question. We'll contact you next week.", bn: "চমৎকার প্রশ্ন। আমরা আগামী সপ্তাহে যোগাযোগ করব।" },
      { me: true, en: "Thank you for your time. I look forward to hearing from you.", bn: "সময় দেওয়ার জন্য ধন্যবাদ। আপনাদের উত্তরের অপেক্ষায় থাকব।", alt: ["Thank you for your time. I'm looking forward to hearing from you."], tip: "“look forward to” এর পরে verb+ing: looking forward to hearing, to meeting…" },
    ],
    phrases: [
      ["Tell me about yourself.", "নিজের সম্পর্কে বলুন।"],
      ["I have two years of experience in…", "… এ আমার দুই বছরের অভিজ্ঞতা আছে"],
      ["I'm a quick learner.", "আমি দ্রুত শিখি।"],
      ["I work well under pressure.", "চাপের মধ্যেও ভালো কাজ করি।"],
      ["I look forward to hearing from you.", "আপনাদের উত্তরের অপেক্ষায় থাকব।"],
    ],
  },
];
