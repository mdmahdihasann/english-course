(function(){
"use strict";
const {$,$$,bnNum,store,toast,speak,mkSay,confetti}=window.EC;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(arr,n)=>shuffle(arr).slice(0,n);
const KEY={w:"practice.writings",d:"practice.draft",s:"practice.stats",t:"practice.tasks"};
const X=window.EC_DATA||{quiz:[],sent:[],words:[],topics:[],tasks:[]};

/* ---------- data pools ---------- */
/* q = প্রশ্ন, o = অপশন, a = সঠিক অপশন, why = কারণ, s = পুরো বাক্য (উচ্চারণের জন্য) */
const QUIZ=[
["“আমি ছাত্র।” — ইংরেজিতে কোনটা ঠিক?",["I am a student.","I is a student.","I student."],"I am a student.","I এর সাথে সবসময় am বসে, আর পেশার আগে a লাগে।"],
["“সে (মেয়ে) প্রতিদিন স্কুলে যায়।”",["She goes to school every day.","She go to school every day.","She going to school every day."],"She goes to school every day.","He/She/It হলে Present Simple-এ verb-এর শেষে s/es বসে।"],
["They ___ playing football now.",["are","is","am"],"are","They এর সাথে are বসে।","They are playing football now."],
["“গতকাল আমি বাজারে গিয়েছিলাম।”",["I went to the market yesterday.","I go to the market yesterday.","I gone to the market yesterday."],"I went to the market yesterday.","yesterday = অতীত, তাই go → went (Past Simple)।"],
["“আমি কাল তোমাকে ফোন করব।”",["I will call you tomorrow.","I call you tomorrow.","I called you tomorrow."],"I will call you tomorrow.","ভবিষ্যতের কথা বলতে will + verb-এর ১ম রূপ।"],
["He ___ like tea.",["doesn't","don't","isn't"],"doesn't","He/She/It হলে না-বোধক বাক্যে doesn't বসে।","He doesn't like tea."],
["___ you like mangoes?",["Do","Does","Are"],"Do","you এর সাথে প্রশ্নে Do বসে।","Do you like mangoes?"],
["Where ___ you live?",["do","does","are"],"do","Present Simple প্রশ্নে you-এর সাথে do।","Where do you live?"],
["She can ___ English.",["speak","speaks","speaking"],"speak","can এর পরে সবসময় verb-এর ১ম রূপ।","She can speak English."],
["You ___ see a doctor. (উচিত)",["should","can","must"],"should","“উচিত” বোঝাতে should।","You should see a doctor."],
["I ___ never been to Dhaka.",["have","has","am"],"have","I/You/We/They এর সাথে have + verb-এর ৩য় রূপ।","I have never been to Dhaka."],
["The book is ___ the table.",["on","in","at"],"on","কোনো কিছুর উপরে থাকলে on।","The book is on the table."],
["I get up ___ 6 o'clock.",["at","in","on"],"at","ঘড়ির সময়ের আগে at।","I get up at 6 o'clock."],
["My birthday is ___ March.",["in","on","at"],"in","মাস বা বছরের আগে in।","My birthday is in March."],
["There ___ two chairs in the room.",["are","is","have"],"are","একাধিক জিনিস (two chairs) থাকলে There are।","There are two chairs in the room."],
["She ___ a new phone.",["has","have","is"],"has","He/She/It হলে has।","She has a new phone."],
["“আমি এখন পড়ছি।”",["I am studying now.","I study now.","I am study now."],"I am studying now.","এখন যা চলছে → am/is/are + verb-ing।"],
["“তুমি কেমন আছো?”",["How are you?","How you are?","How is you?"],"How are you?","প্রশ্নে are আগে বসে, তারপর you।"],
["I didn't ___ the film.",["see","saw","seen"],"see","did/didn't এর পরে verb-এর ১ম রূপ।","I didn't see the film."],
["Did you ___ your homework?",["do","did","done"],"do","Did দিয়ে প্রশ্ন করলে পরে ১ম রূপ (do)।","Did you do your homework?"],
["“সে গতকাল আসেনি।”",["He didn't come yesterday.","He didn't came yesterday.","He not came yesterday."],"He didn't come yesterday.","didn't এর পরে come, came নয়।"],
["কোনটা ঠিক?",["I agree.","I am agree."],"I agree.","agree নিজেই একটা verb, তাই am লাগে না।"],
["I have ___ fever.",["a","an","the"],"a","ইংরেজিতে বলে “have a fever”।","I have a fever."],
["What ___ your name?",["is","are","am"],"is","name একবচন, তাই is।","What is your name?"],
["We ___ going to Cox's Bazar next week.",["are","is","will"],"are","We এর সাথে are; “are going to” = যাচ্ছি/যাব।","We are going to Cox's Bazar next week."],
["“আমি ইংরেজি বলতে পারি না।”",["I can't speak English.","I can't speaking English.","I not can speak English."],"I can't speak English.","can't এর পরে verb-এর ১ম রূপ।"],
["“আপনি কি আরেকবার বলবেন?” (ভদ্রভাবে)",["Could you say that again?","You say again?","Can you saying again?"],"Could you say that again?","ভদ্র অনুরোধে Could you + verb।"],
["He is ___ than me.",["taller","more taller","tallest"],"taller","-er থাকলে more লাগে না।","He is taller than me."],
["She ___ TV every evening.",["watches","watch","watching"],"watches","She + প্রতিদিনের কাজ → watches।","She watches TV every evening."],
["It ___ raining.",["is","are","am"],"is","It এর সাথে is।","It is raining."],
["“আমরা প্রতিদিন ক্রিকেট খেলি।”",["We play cricket every day.","We plays cricket every day.","We are play cricket every day."],"We play cricket every day.","We এর সাথে verb-এ s বসে না, am/is/are-ও লাগে না।"],
["“না, আমি বুঝিনি।”",["No, I don't understand.","No, I am not understand.","No, I not understand."],"No, I don't understand.","understand নিজেই verb → don't understand।"],
["I have ___ my keys. (হারিয়ে ফেলেছি)",["lost","lose","losing"],"lost","have এর পরে verb-এর ৩য় রূপ (lost)।","I have lost my keys."],
["She has ___ her work.",["finished","finish","finishing"],"finished","has এর পরে ৩য় রূপ (finished)।","She has finished her work."],
["Let's ___ it.",["discuss","discuss about","talk"],"discuss","discuss এর পরে about বসে না।","Let's discuss it."],
["How much ___ this?",["is","are","do"],"is","this একবচন → is।","How much is this?"],
["When ___ he come yesterday?",["did","does","do"],"did","yesterday আছে → Past, তাই did।","When did he come yesterday?"],
["I ___ tired.",["am","is","are"],"am","I এর সাথে am।","I am tired."],
["“সে (ছেলে) ডাক্তার।”",["He is a doctor.","He is doctor.","He doctor."],"He is a doctor.","পেশার আগে a/an লাগে।"],
["“আমি ভাত খাই না।”",["I don't eat rice.","I not eat rice.","I doesn't eat rice."],"I don't eat rice.","I এর সাথে don't।"],
["Excuse me, where ___ the bank?",["is","are","do"],"is","the bank একবচন → is।","Excuse me, where is the bank?"],
["I am ___ for the bus.",["waiting","wait","waits"],"waiting","am এর পরে verb-ing।","I am waiting for the bus."],
["She ___ to music yesterday.",["listened","listen","listens"],"listened","yesterday → Past Simple (listened)।","She listened to music yesterday."],
["Nice to ___ you.",["meet","meeting","met"],"meet","to এর পরে verb-এর ১ম রূপ।","Nice to meet you."],
["___ is the weather today?",["How","What","Where"],"How","আবহাওয়া কেমন → How is the weather?","How is the weather today?"],
["কোনটা ঠিক?",["What's your name?","What is your good name?"],"What's your name?","ইংরেজিতে good name বলা হয় না।"],
["কোনটা ঠিক?",["I have a headache.","My head is paining."],"I have a headache.","মাথাব্যথা = have a headache।"],
["I ___ my homework last night.",["did","do","done"],"did","last night → Past Simple (did)।","I did my homework last night."],
["My mother ___ cooking now.",["is","are","am"],"is","My mother = She → is।","My mother is cooking now."],
["We ___ to the park last Friday.",["went","go","gone"],"went","last Friday → went।","We went to the park last Friday."],
["I will ___ you later.",["call","called","calling"],"call","will এর পরে ১ম রূপ।","I will call you later."],
["Does she ___ in Dhaka?",["live","lives","living"],"live","Does এর পরে s বাদ।","Does she live in Dhaka?"],
["They ___ not at home.",["are","is","do"],"are","They এর সাথে are।","They are not at home."],
["I ___ breakfast at 8 every day.",["have","has","having"],"have","I + প্রতিদিনের কাজ → have।","I have breakfast at 8 every day."],
].concat(X.quiz).map(a=>({q:a[0],o:a[1],a:a[2],why:a[3],s:a[4]||a[2]}));

const SENT=[
["I wake up at six every morning.","আমি প্রতিদিন সকাল ছয়টায় ঘুম থেকে উঠি।"],
["What do you do?","তুমি কী করো? (পেশা জানতে)"],
["I work in a small office.","আমি একটা ছোট অফিসে কাজ করি।"],
["It's very hot today.","আজ খুব গরম।"],
["Can you help me, please?","আপনি কি আমাকে একটু সাহায্য করতে পারবেন?"],
["I don't understand. Could you repeat that?","আমি বুঝিনি। আবার বলবেন?"],
["How much is this?","এটার দাম কত?"],
["I'm looking for a pharmacy.","আমি একটা ফার্মেসি খুঁজছি।"],
["Turn left at the next corner.","পরের মোড়ে বাঁয়ে যান।"],
["I'll be there in ten minutes.","আমি দশ মিনিটের মধ্যে আসছি।"],
["Sorry, I'm late.","দুঃখিত, আমার দেরি হয়ে গেল।"],
["What time is it?","কয়টা বাজে?"],
["I have a headache.","আমার মাথা ব্যথা করছে।"],
["Let's have lunch together.","চলো একসাথে দুপুরের খাবার খাই।"],
["I'm learning English every day.","আমি প্রতিদিন ইংরেজি শিখছি।"],
["My father is a farmer.","আমার বাবা একজন কৃষক।"],
["We went to the village last week.","আমরা গত সপ্তাহে গ্রামে গিয়েছিলাম।"],
["She is cooking dinner now.","সে এখন রাতের খাবার রান্না করছে।"],
["I will finish this work tomorrow.","আমি এই কাজটা কাল শেষ করব।"],
["Have you eaten?","তুমি কি খেয়েছ?"],
["I haven't seen him today.","আজ আমি তাকে দেখিনি।"],
["Could you speak slowly, please?","একটু আস্তে বলবেন, প্লিজ?"],
["Where are you from?","তুমি কোথা থেকে এসেছ?"],
["I'm from Bangladesh.","আমি বাংলাদেশ থেকে এসেছি।"],
["Nice to meet you.","তোমার সাথে পরিচিত হয়ে ভালো লাগল।"],
["See you tomorrow.","কাল দেখা হবে।"],
["I need to buy some vegetables.","আমার কিছু সবজি কিনতে হবে।"],
["The shop is closed today.","দোকানটা আজ বন্ধ।"],
["Please call me back later.","পরে আমাকে ফোন দিও, প্লিজ।"],
["I'm busy right now.","আমি এখন ব্যস্ত আছি।"],
["There is a bus stop near my house.","আমার বাসার কাছে একটা বাসস্ট্যান্ড আছে।"],
["He doesn't like cold weather.","সে ঠান্ডা আবহাওয়া পছন্দ করে না।"],
["You should take some rest.","তোমার একটু বিশ্রাম নেওয়া উচিত।"],
["I can't come today.","আমি আজ আসতে পারব না।"],
["What's your favourite food?","তোমার প্রিয় খাবার কী?"],
["I like tea more than coffee.","আমি কফির চেয়ে চা বেশি পছন্দ করি।"],
["It's raining outside.","বাইরে বৃষ্টি হচ্ছে।"],
["Don't worry, everything will be fine.","চিন্তা কোরো না, সব ঠিক হয়ে যাবে।"],
["I forgot my phone at home.","আমি ফোনটা বাসায় ফেলে এসেছি।"],
["How was your day?","তোমার দিন কেমন গেল?"],
["Thank you so much for your help.","তোমার সাহায্যের জন্য অনেক ধন্যবাদ।"],
["I'm sorry to hear that.","শুনে খারাপ লাগল।"],
["Could I have the bill, please?","বিলটা দেবেন, প্লিজ?"],
["I usually go to bed at eleven.","আমি সাধারণত এগারোটায় ঘুমাতে যাই।"],
["We are waiting for the bus.","আমরা বাসের জন্য অপেক্ষা করছি।"],
["Can I borrow your pen?","তোমার কলমটা একটু ধার নিতে পারি?"],
["I'm not feeling well today.","আজ আমার শরীরটা ভালো লাগছে না।"],
["Let me think about it.","আমাকে একটু ভাবতে দাও।"],
["What are you doing this weekend?","এই সপ্তাহান্তে তুমি কী করছ?"],
["I have to go now.","আমাকে এখন যেতে হবে।"],
].concat(X.sent);

const WORDS=[
["arrive","পৌঁছানো","I will arrive at 5 pm."],["borrow","ধার নেওয়া","Can I borrow your pen?"],["busy","ব্যস্ত","I am busy today."],
["careful","সাবধান","Be careful on the road."],["cheap","সস্তা","This shirt is very cheap."],["expensive","দামি","The phone is too expensive."],
["comfortable","আরামদায়ক","This chair is comfortable."],["dangerous","বিপজ্জনক","Swimming here is dangerous."],["decide","সিদ্ধান্ত নেওয়া","I decided to learn English."],
["delicious","সুস্বাদু","The food was delicious."],["early","সকাল সকাল / তাড়াতাড়ি","I wake up early."],["enough","যথেষ্ট","We have enough time."],
["famous","বিখ্যাত","Cox's Bazar is famous for its beach."],["favourite","প্রিয়","Rice is my favourite food."],["forget","ভুলে যাওয়া","Don't forget your keys."],
["free","খালি / ফাঁকা","Are you free tomorrow?"],["healthy","স্বাস্থ্যকর","Vegetables are healthy."],["hungry","ক্ষুধার্ত","I am very hungry."],
["important","গুরুত্বপূর্ণ","This is an important meeting."],["interesting","মজার / আকর্ষণীয়","The book is interesting."],["journey","যাত্রা","The journey was long."],
["lazy","অলস","Don't be lazy."],["lend","ধার দেওয়া","Can you lend me 100 taka?"],["luggage","মালপত্র","Where is my luggage?"],
["neighbour","প্রতিবেশী","My neighbour is very kind."],["noisy","কোলাহলপূর্ণ","The street is noisy."],["often","প্রায়ই","I often eat out."],
["patient","ধৈর্যশীল","Please be patient."],["polite","ভদ্র","He is a polite boy."],["prefer","বেশি পছন্দ করা","I prefer tea to coffee."],
["quiet","শান্ত / নীরব","The library is quiet."],["receive","পাওয়া / গ্রহণ করা","I received your message."],["remember","মনে রাখা","I remember your name."],
["repair","মেরামত করা","I need to repair my bike."],["salary","বেতন","I get my salary every month."],["seldom","কদাচিৎ / খুব কম","I seldom watch TV."],
["shy","লাজুক","She is a little shy."],["suddenly","হঠাৎ","Suddenly it started to rain."],["tired","ক্লান্ত","I am tired after work."],
["usually","সাধারণত","I usually walk to school."],["weather","আবহাওয়া","The weather is nice today."],["wonderful","চমৎকার","We had a wonderful time."],
["worried","চিন্তিত","I am worried about the exam."],["afraid","ভীত","I am afraid of dogs."],["angry","রাগান্বিত","Why are you angry?"],
["answer","উত্তর দেওয়া","Please answer my question."],["appointment","সাক্ষাতের নির্ধারিত সময়","I have an appointment at 3."],["invite","নিমন্ত্রণ করা","I invited him to dinner."],
["improve","উন্নতি করা","My English is improving."],["practise","অনুশীলন করা","I practise speaking every day."],["mistake","ভুল","Don't be afraid of mistakes."],
["excited","উত্তেজিত / খুব খুশি","I am excited about the trip."],["bored","বিরক্ত / একঘেয়ে লাগা","I am bored at home."],["crowded","ভিড়ে ভরা","The market is crowded."],
["empty","খালি","The bottle is empty."],["holiday","ছুটি","Friday is a holiday."],["order","অর্ডার দেওয়া","I would like to order a burger."],
["reach","পৌঁছানো","I reached home at 9."],["return","ফিরে আসা","I will return by evening."],["spend","খরচ করা / সময় কাটানো","I spend time with my family."],
["nervous","ঘাবড়ে যাওয়া","I feel nervous before exams."],["proud","গর্বিত","I am proud of you."],["lucky","ভাগ্যবান","You are very lucky."],
].concat(X.words);

const TOPICS=[
{t:"My daily routine",bn:"আমার প্রতিদিনের রুটিন",h:["সকালে কখন ওঠো, কী করো?","দুপুরে ও বিকেলে কী করো?","রাতে কখন ঘুমাও?"]},
{t:"My best friend",bn:"আমার সবচেয়ে ভালো বন্ধু",h:["তার নাম কী, কোথায় থাকে?","সে দেখতে কেমন, মানুষ হিসেবে কেমন?","তোমরা একসাথে কী করো?"]},
{t:"My family",bn:"আমার পরিবার",h:["পরিবারে কে কে আছে?","প্রত্যেকে কী করে?","তোমরা একসাথে কী করতে ভালোবাসো?"]},
{t:"What I did yesterday",bn:"গতকাল আমি কী করেছি",h:["Past Simple ব্যবহার করো (went, ate, saw, met)","সকাল → দুপুর → রাত, ধাপে ধাপে লেখো"]},
{t:"My favourite food",bn:"আমার প্রিয় খাবার",h:["খাবারটা কী, কে বানায়?","কেন ভালো লাগে?","কখন খাও?"]},
{t:"My village or my town",bn:"আমার গ্রাম / শহর",h:["জায়গাটা কোথায়?","সেখানে কী কী আছে? (There is / There are)","কেন তোমার ভালো লাগে?"]},
{t:"My plan for next week",bn:"আগামী সপ্তাহের পরিকল্পনা",h:["will / going to ব্যবহার করো","অন্তত ৫টা কাজ লেখো"]},
{t:"A day at the market",bn:"বাজারে একদিন",h:["কী কী কিনলে?","দাম নিয়ে কী কথা হলো?","Past Simple ব্যবহার করো"]},
{t:"Why I want to learn English",bn:"আমি কেন ইংরেজি শিখতে চাই",h:["তোমার লক্ষ্য কী?","ইংরেজি শিখলে কী সুবিধা হবে?","কীভাবে প্রতিদিন চর্চা করো?"]},
{t:"My favourite season",bn:"আমার প্রিয় ঋতু",h:["ঋতুটা কোনটা, আবহাওয়া কেমন থাকে?","তখন তুমি কী করো?"]},
{t:"A phone call with a friend",bn:"বন্ধুর সাথে ফোনালাপ (সংলাপ আকারে লেখো)",h:["Hello দিয়ে শুরু করো","কেন ফোন করলে, কী প্ল্যান হলো?","Bye বলে শেষ করো"]},
{t:"My school days",bn:"আমার স্কুলের দিনগুলো",h:["স্কুলটা কেমন ছিল?","প্রিয় শিক্ষক বা বন্ধু কে ছিল?","Past Simple ব্যবহার করো"]},
{t:"Introduce yourself",bn:"নিজের পরিচয় দাও",h:["নাম, বয়স, কোথায় থাকো","কী করো (পড়াশোনা / কাজ)","কী পছন্দ করো, ভবিষ্যতে কী হতে চাও"]},
{t:"A place I want to visit",bn:"যে জায়গায় আমি যেতে চাই",h:["জায়গাটা কোথায়?","কেন যেতে চাও?","সেখানে গিয়ে কী করবে? (will)"]},
{t:"My hobby",bn:"আমার শখ",h:["শখটা কী?","কখন থেকে করো?","কেন ভালো লাগে?"]},
{t:"A person I admire",bn:"যাকে আমি শ্রদ্ধা করি",h:["মানুষটা কে?","তিনি কী করেন?","তার কোন গুণটা তোমার ভালো লাগে?"]},
{t:"My mobile phone",bn:"আমার মোবাইল ফোন",h:["ফোন দিয়ে কী কী করো?","দিনে কতক্ষণ ব্যবহার করো?","ভালো দিক আর খারাপ দিক কী?"]},
{t:"A memorable day",bn:"একটা স্মরণীয় দিন",h:["কবে, কোথায়?","কী হয়েছিল?","কেন মনে আছে? (Past Simple)"]},
{t:"Ordering food at a restaurant",bn:"রেস্টুরেন্টে খাবার অর্ডার (সংলাপ লেখো)",h:["Waiter আর তোমার কথোপকথন","I would like… / Could I have…"]},
{t:"My morning today",bn:"আজ সকালটা কেমন গেল",h:["Present Perfect / Past Simple ব্যবহার করো","I have already… / I woke up…"]},
{t:"My dream job",bn:"আমার স্বপ্নের চাকরি",h:["কী হতে চাও?","কেন?","তার জন্য এখন কী করছ?"]},
{t:"A problem in my area",bn:"আমার এলাকার একটা সমস্যা",h:["সমস্যাটা কী?","কেন হয়?","কী করা উচিত? (should)"]},
].concat(X.topics);
const TASKS=X.tasks;

/* ---------- stats ---------- */
let stats=store.get(KEY.s,{quizzes:0,best:0,tasks:0});if(!stats.tasks)stats.tasks=0;
let writings=store.get(KEY.w,[]);
const saveStats=()=>store.set(KEY.s,stats);
function updStats(){
  $("#pQuizN").textContent=bnNum(stats.quizzes);
  $("#pBest").textContent=stats.quizzes?bnNum(stats.best)+"/১০":"—";
  $("#pWriteN").textContent=bnNum(writings.length);
  $("#pTaskN").textContent=bnNum(stats.tasks);
  $("#pPool").textContent=bnNum(QUIZ.length)+" প্রশ্ন · "+bnNum(SENT.length)+" বাক্য · "+bnNum(WORDS.length)+" শব্দ";
}

/* ---------- quiz ---------- */
let qs=[],qi=0,score=0;
function qStart(){qs=pick(QUIZ,10);qi=0;score=0;qShow()}
function qShow(){
  const q=qs[qi];
  $("#qNum").textContent="প্রশ্ন "+bnNum(qi+1)+" / "+bnNum(qs.length);$("#qScore").textContent="স্কোর: "+bnNum(score);
  $("#qFill").style.width=(qi/qs.length*100)+"%";$("#qWhy").textContent="";$("#qNext").hidden=true;
  const ask=$("#qAsk");ask.hidden=false;ask.textContent=q.q;ask.classList.toggle("en",!/[ঀ-৿]/.test(q.q));
  const box=$("#qOpts");box.innerHTML="";
  shuffle(q.o).forEach(t=>{const b=document.createElement("button");b.type="button";b.className="qopt";b.textContent=t;
    b.onclick=()=>{const ok=t===q.a;if(ok)score++;
      $$(".qopt").forEach(x=>{x.disabled=true;if(x.textContent===q.a)x.classList.add("right")});if(!ok)b.classList.add("wrong");
      $("#qWhy").innerHTML=(ok?"✅ ঠিক! ":"❌ সঠিক হলো: <b class='en'>"+q.a+"</b> — ")+q.why;$("#qScore").textContent="স্কোর: "+bnNum(score);
      $("#qNext").hidden=false;$("#qNext").textContent=qi===qs.length-1?"ফলাফল দেখো":"পরের প্রশ্ন";if(ok)speak(q.s)};
    box.appendChild(b)});
}
function qEnd(){
  $("#qFill").style.width="100%";$("#qAsk").hidden=true;$("#qWhy").textContent="";$("#qNext").hidden=true;
  stats.quizzes++;stats.best=Math.max(stats.best,score);saveStats();updStats();
  const msg=score===qs.length?"অসাধারণ! একটাও ভুল নেই 🏆":score>=7?"দারুণ! ভালো করেছ 💪":"আরেকবার চেষ্টা করো — প্রতিবার নতুন প্রশ্ন আসবে 🌱";
  $("#qOpts").innerHTML="<div class='qdone'><div class='big'>"+bnNum(score)+" / "+bnNum(qs.length)+"</div><p>"+msg+"</p><button type='button' class='btn' id='qAgain'>🎲 নতুন কুইজ খেলো</button></div>";
  $("#qAgain").onclick=qStart;if(score===qs.length)confetti();
}
$("#qNext").onclick=()=>{qi++;qi<qs.length?qShow():qEnd()};
qStart();

/* ---------- sentences + words ---------- */
function renderRead(){
  const sl=$("#sentList");sl.innerHTML="";
  pick(SENT,5).forEach(([en,bn])=>{const d=document.createElement("div");d.className="sent";
    const e=document.createElement("div");e.className="en";e.textContent=en;e.appendChild(mkSay(en));
    const s=document.createElement("small");s.textContent=bn;d.append(e,s);sl.appendChild(d)});
  const wg=$("#wordGrid");wg.innerHTML="";
  pick(WORDS,8).forEach(([w,m,ex])=>{const d=document.createElement("div");d.className="word";
    const b=document.createElement("b");b.textContent=w;b.appendChild(mkSay(w));
    const s=document.createElement("span");s.textContent=m;
    const i=document.createElement("i");i.textContent=ex;i.appendChild(mkSay(ex));
    d.append(b,s,i);wg.appendChild(d)});
}
$("#newSet").onclick=()=>{renderRead();toast("নতুন বাক্য আর শব্দ এলো 🔄");$("#sentList").scrollIntoView({behavior:"smooth",block:"start"})};
renderRead();

/* ---------- home task ---------- */
const today=()=>new Date().toISOString().slice(0,10);
let tk=store.get(KEY.t,null);
function newTasks(){tk={date:today(),ids:pick(TASKS.map((_,i)=>i),3),done:[]};store.set(KEY.t,tk)}
if(!tk||tk.date!==today()||!Array.isArray(tk.ids))newTasks();
function renderTasks(){
  const box=$("#taskList");box.innerHTML="";
  tk.ids.forEach(id=>{const t=TASKS[id];if(!t)return;const on=tk.done.includes(id);
    const l=document.createElement("label");l.className="task"+(on?" on":"");
    l.innerHTML=`<input type="checkbox"${on?" checked":""}><span class="tk"><b></b><small></small></span>`;
    l.querySelector("b").textContent=t.t;l.querySelector("small").textContent=t.d;
    l.querySelector("input").onchange=e=>{
      if(e.target.checked){tk.done.push(id);stats.tasks++;toast("দারুণ! একটা টাস্ক শেষ ✅")}
      else{tk.done=tk.done.filter(x=>x!==id);stats.tasks=Math.max(0,stats.tasks-1)}
      store.set(KEY.t,tk);saveStats();updStats();renderTasks();
      if(tk.done.length===tk.ids.length&&e.target.checked){confetti();toast("আজকের সব হোম টাস্ক শেষ! 🏆")}};
    box.appendChild(l)});
  $("#taskProg").textContent=bnNum(tk.done.length)+" / "+bnNum(tk.ids.length)+" শেষ";
}
$("#newTasks").onclick=()=>{newTasks();renderTasks();toast("নতুন হোম টাস্ক এলো 📝")};
renderTasks();

/* ---------- writing ---------- */
const ta=$("#wText");let topic=null;
const wordCount=t=>(t.trim().match(/\S+/g)||[]).length;
function setTopic(tp){topic=tp;$("#topicT").textContent=tp.t;$("#topicBn").textContent=tp.bn;
  const ul=$("#topicHints");ul.innerHTML="";tp.h.forEach(x=>{const li=document.createElement("li");li.textContent=x;ul.appendChild(li)})}
const newTopic=()=>setTopic(pick(TOPICS.filter(x=>!topic||x.t!==topic.t),1)[0]);
function updCount(){$("#wCount").textContent=bnNum(wordCount(ta.value))+" শব্দ"}
let dt;
function saveDraft(){clearTimeout(dt);dt=setTimeout(()=>{store.set(KEY.d,{t:topic.t,text:ta.value});$("#wSaved").textContent=ta.value.trim()?"খসড়া সেভ হয়েছে ✓":""},400)}
ta.oninput=()=>{updCount();saveDraft()};
$("#newTopic").onclick=()=>{newTopic();saveDraft();toast("নতুন টপিক: "+topic.t)};

const draft=store.get(KEY.d,null);
if(draft&&draft.text){setTopic(TOPICS.find(x=>x.t===draft.t)||pick(TOPICS,1)[0]);ta.value=draft.text;$("#wSaved").textContent="আগের খসড়া ফিরে এসেছে ✓"}
else newTopic();
updCount();

const fmtDate=iso=>{try{return new Date(iso).toLocaleDateString("bn-BD",{day:"numeric",month:"long",year:"numeric"})}catch(e){return iso.slice(0,10)}};
function renderList(){
  const box=$("#wList");box.innerHTML="";
  if(!writings.length){box.innerHTML="<div class='wempty'>এখনো কোনো লেখা জমা দাওনি। উপরের টপিকে ৫টা বাক্য লিখে জমা দাও — সব লেখা এই ব্রাউজারেই থাকবে।</div>";return}
  [...writings].reverse().forEach(w=>{
    const d=document.createElement("article");d.className="witem";
    d.innerHTML=`<div class="wh"><b></b><small></small></div><p></p><div class="wa"><button type="button" class="say" aria-label="শোনো">🔊</button><button type="button" class="link wdel">মুছে ফেলো</button></div>`;
    d.querySelector("b").textContent=w.topic;d.querySelector("small").textContent=fmtDate(w.date)+" · "+bnNum(wordCount(w.text))+" শব্দ";d.querySelector("p").textContent=w.text;
    const say=d.querySelector(".say");say.onclick=()=>speak(w.text,say);
    const del=d.querySelector(".wdel");let arm=false;
    del.onclick=()=>{if(!arm){arm=true;del.textContent="সত্যিই মুছবে? আবার চাপো";setTimeout(()=>{arm=false;del.textContent="মুছে ফেলো"},3000);return}
      writings=writings.filter(x=>x.id!==w.id);store.set(KEY.w,writings);renderList();updStats();toast("লেখাটা মুছে ফেলা হলো")};
    box.appendChild(d)});
}
$("#wSubmit").onclick=()=>{
  const text=ta.value.trim();
  if(wordCount(text)<5){toast("অন্তত ৫টা শব্দ লেখো, তারপর জমা দাও ✍️");ta.focus();return}
  writings.push({id:Date.now(),topic:topic.t,text,date:new Date().toISOString()});store.set(KEY.w,writings);
  try{localStorage.removeItem(KEY.d)}catch(e){}
  ta.value="";$("#wSaved").textContent="";updCount();newTopic();renderList();updStats();
  toast("জমা হয়েছে! নতুন টপিক এলো 🎉");if(writings.length%5===0)confetti();
  $("#wList").scrollIntoView({behavior:"smooth",block:"start"});
};
renderList();
updStats();
})();
