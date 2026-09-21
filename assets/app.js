(function(){
"use strict";
const COURSE=[{"f": "lesson-01.html", "g": "শুরু করো", "tag": "শুরুর আগে", "t": "এই বইটা কীভাবে পড়বে", "b": "✦", "req": "read"}, {"f": "lesson-02.html", "g": "শুরু করো", "tag": "রোডম্যাপ", "t": "১২ সপ্তাহের প্ল্যান", "b": "🗺", "req": "read"}, {"f": "lesson-03.html", "g": "গ্রামার", "tag": "পাঠ ১", "t": "ইংরেজি বাক্যের গঠন — সবচেয়ে জরুরি পাঠ", "b": "১", "req": "read"}, {"f": "lesson-04.html", "g": "গ্রামার", "tag": "পাঠ ২", "t": "Pronoun — আমি, তুমি, সে, আমরা...", "b": "২", "req": "read"}, {"f": "lesson-05.html", "g": "গ্রামার", "tag": "পাঠ ৩", "t": "am / is / are — “হই, আছি, হয়”", "b": "৩", "req": "read"}, {"f": "lesson-06.html", "g": "গ্রামার", "tag": "পাঠ ৪", "t": "Present Simple — প্রতিদিনের কাজ ও অভ্যাস", "b": "৪", "req": "read"}, {"f": "lesson-07.html", "g": "গ্রামার", "tag": "পাঠ ৫", "t": "Present Continuous — এখন যা চলছে", "b": "৫", "req": "read"}, {"f": "lesson-08.html", "g": "গ্রামার", "tag": "পাঠ ৬", "t": "Past Simple — অতীতের কথা", "b": "৬", "req": "read"}, {"f": "lesson-09.html", "g": "গ্রামার", "tag": "তালিকা", "t": "সবচেয়ে দরকারি ৪০টি অনিয়মিত Verb", "b": "≡", "req": "read"}, {"f": "lesson-10.html", "g": "গ্রামার", "tag": "পাঠ ৭", "t": "Future — ভবিষ্যতের কথা", "b": "৭", "req": "read"}, {"f": "lesson-11.html", "g": "গ্রামার", "tag": "পাঠ ৮", "t": "প্রশ্ন করা — What, Where, When...", "b": "৮", "req": "read"}, {"f": "lesson-12.html", "g": "গ্রামার", "tag": "পাঠ ৯", "t": "can, should, must — পারা, উচিত, অবশ্যই", "b": "৯", "req": "read"}, {"f": "lesson-13.html", "g": "গ্রামার", "tag": "পাঠ ১০", "t": "Present Perfect — “করেছি” (সময় বলা নেই)", "b": "১০", "req": "read"}, {"f": "lesson-14.html", "g": "গ্রামার", "tag": "পাঠ ১১", "t": "There is / are এবং have / has", "b": "১১", "req": "read"}, {"f": "lesson-15.html", "g": "গ্রামার", "tag": "পাঠ ১২", "t": "in / on / at — সময় ও জায়গা", "b": "১২", "req": "read"}, {"f": "lesson-16.html", "g": "গ্রামার", "tag": "এক নজরে", "t": "সব Tense একসাথে", "b": "◎", "req": "read"}, {"f": "lesson-17.html", "g": "গ্রামার", "tag": "মূল কৌশল", "t": "বাংলা থেকে ইংরেজি বাক্য বানানোর ৪ ধাপ", "b": "★", "req": "read"}, {"f": "lesson-18.html", "g": "স্পোকেন ইংলিশ", "tag": "স্পোকেন ১", "t": "শুভেচ্ছা ও ভদ্রতা", "b": "১", "req": "read"}, {"f": "lesson-19.html", "g": "স্পোকেন ইংলিশ", "tag": "স্পোকেন ২", "t": "নিজের পরিচয় দেওয়া", "b": "২", "req": "read"}, {"f": "lesson-20.html", "g": "স্পোকেন ইংলিশ", "tag": "স্পোকেন ৩", "t": "না বুঝলে কী বলবে — খুব জরুরি!", "b": "৩", "req": "read"}, {"f": "lesson-21.html", "g": "স্পোকেন ইংলিশ", "tag": "স্পোকেন ৪", "t": "দোকান ও বাজারে", "b": "৪", "req": "read"}, {"f": "lesson-22.html", "g": "স্পোকেন ইংলিশ", "tag": "স্পোকেন ৫", "t": "অফিস ও কাজে", "b": "৫", "req": "read"}, {"f": "lesson-23.html", "g": "স্পোকেন ইংলিশ", "tag": "স্পোকেন ৬", "t": "ফোনে কথা বলা", "b": "৬", "req": "read"}, {"f": "lesson-24.html", "g": "স্পোকেন ইংলিশ", "tag": "স্পোকেন ৭", "t": "রাস্তা জিজ্ঞেস করা", "b": "৭", "req": "read"}, {"f": "lesson-25.html", "g": "স্পোকেন ইংলিশ", "tag": "স্পোকেন ৮", "t": "রেস্টুরেন্টে", "b": "৮", "req": "read"}, {"f": "lesson-26.html", "g": "স্পোকেন ইংলিশ", "tag": "স্পোকেন ৯", "t": "অনুভূতি ও শরীর", "b": "৯", "req": "read"}, {"f": "lesson-27.html", "g": "স্পোকেন ইংলিশ", "tag": "স্পোকেন ১০", "t": "প্রতিদিনের ছোট কথা", "b": "১০", "req": "read"}, {"f": "lesson-28.html", "g": "স্পোকেন ইংলিশ", "tag": "অনুশীলন", "t": "ছোট ছোট সংলাপ", "b": "💬", "req": "read"}, {"f": "lesson-29.html", "g": "অনুশীলন কর্নার", "tag": "খেলা", "t": "Verb ফ্ল্যাশকার্ড", "b": "🃏", "req": "flash"}, {"f": "lesson-30.html", "g": "অনুশীলন কর্নার", "tag": "কুইজ", "t": "কোনটা সঠিক?", "b": "?", "req": "quiz"}, {"f": "lesson-31.html", "g": "শেষ ধাপ", "tag": "সাবধান", "t": "বাংলাভাষীদের সবচেয়ে সাধারণ ১৫টি ভুল", "b": "!", "req": "read"}, {"f": "lesson-32.html", "g": "শেষ ধাপ", "tag": "চূড়ান্ত লক্ষ্য", "t": "২ মিনিটের নিজের পরিচয়", "b": "🎤", "req": "read"}, {"f": "lesson-33.html", "g": "শেষ ধাপ", "tag": "গোপন কৌশল", "t": "দ্রুত কথা বলা শেখার ৮টি টিপস", "b": "💡", "req": "read"}];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const bnNum=n=>String(n).replace(/\d/g,d=>"০১২৩৪৫৬৭৮৯"[d]);
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const toast=t=>{const e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove("show"),2400)};
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const PAGE=parseInt(document.body.dataset.page,10);
const N=COURSE.length;

/* ---------- progress / lock logic ---------- */
let done=new Set(store.get("done",[]));
const isDone=i=>done.has(COURSE[i].f);
const unlockedUpTo=()=>{let i=0;while(i<N&&isDone(i))i++;return i}; // first not-done lesson index (open)
const isOpen=i=>i<=unlockedUpTo();
const saveDone=()=>store.set("done",[...done]);
function markDone(i){done.add(COURSE[i].f);saveDone()}

/* ---------- theme ---------- */
const root=document.documentElement;
const sysDark=()=>matchMedia("(prefers-color-scheme: dark)").matches;
const themeIcon=()=>{$("#themeBtn").textContent=(root.dataset.theme||(sysDark()?"dark":"light"))==="dark"?"☀️":"🌙"};
themeIcon();
$("#themeBtn").onclick=()=>{const cur=root.dataset.theme||(sysDark()?"dark":"light");const n=cur==="dark"?"light":"dark";root.dataset.theme=n;store.set("theme",n);themeIcon()};

/* ---------- sidebar ---------- */
const icons={"শুরু করো":"🚀","গ্রামার":"📘","স্পোকেন ইংলিশ":"🗣️","অনুশীলন কর্নার":"🎯","শেষ ধাপ":"🏁"};
function groupsOf(){const g=[];COURSE.forEach((c,i)=>{let last=g[g.length-1];if(!last||last.name!==c.g){last={name:c.g,items:[]};g.push(last)}last.items.push(i)});return g}
function renderSide(){
  const nav=$("#sideNav"),next=unlockedUpTo();
  let h=`<a class="side-home${PAGE===-1?" on":""}" href="index.html"><span class="gi">🏠</span>হোম ও কোর্স ম্যাপ</a>`;
  groupsOf().forEach(g=>{
    const inG=g.items.includes(PAGE)||g.items.includes(next);
    const dn=g.items.filter(isDone).length;
    h+=`<details class="ng"${inG||PAGE===-1?" open":""}><summary><span class="gi">${icons[g.name]||"📄"}</span><span class="gn">${g.name}</span><span class="gc">${bnNum(dn)}/${bnNum(g.items.length)}</span></summary><div class="gl">`;
    g.items.forEach(i=>{const c=COURSE[i];const d=isDone(i),o=isOpen(i);
      const cls=[i===PAGE?"on":"",d?"done":"",!o?"locked":"",(i===next&&!d)?"next":""].join(" ");
      const badge=d?"✓":!o?"🔒":c.b;
      h+=`<a class="${cls}" href="${o?c.f:"#"}"${o?"":` aria-disabled="true" data-lock="${i}"`}${i===PAGE?' aria-current="page"':""}><i class="nb">${badge}</i><span class="nt"><small>${c.tag}</small>${c.t}</span></a>`});
    h+="</div></details>"});
  h+=`<a class="side-home side-prac${PAGE===-2?" on":""}" href="practice.html"><span class="gi">🎯</span>দৈনিক অনুশীলন</a>`;
  nav.innerHTML=h;
  $$("#sideNav a[data-lock]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();toast("🔒 আগে “"+COURSE[unlockedUpTo()].t+"” শেষ করো")}));
  const pc=Math.round(done.size/N*100);$("#sideProg").textContent=bnNum(pc)+"%";$("#sideBar").style.width=pc+"%";
  const on=nav.querySelector("a.on");if(on)on.scrollIntoView({block:"center"});
}
renderSide();
const openNav=o=>{document.body.classList.toggle("nav-open",o);$("#menuBtn").setAttribute("aria-expanded",o)};
$("#menuBtn").onclick=()=>openNav(!document.body.classList.contains("nav-open"));
$("#scrim").onclick=()=>openNav(false);$("#sideClose").onclick=()=>openNav(false);
addEventListener("keydown",e=>{if(e.key==="Escape")openNav(false)});

/* ---------- speech ---------- */
const hasTTS="speechSynthesis" in window;let voice=null;
const pickVoice=()=>{if(!hasTTS)return;const v=speechSynthesis.getVoices();voice=v.find(x=>/en[-_]US/i.test(x.lang)&&/female|samantha|google/i.test(x.name))||v.find(x=>/en[-_](US|GB)/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang))||null};
if(hasTTS){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
const clean=t=>t.replace(/[✗✓]/g,"").replace(/_{2,}/g," blank ").replace(/\s\/\s/g,", ").replace(/\(.*?\)/g,"").trim();
function speak(text,btn){
  if(!hasTTS){toast("তোমার ব্রাউজারে উচ্চারণ শোনার সুবিধা নেই");return}
  speechSynthesis.cancel();$$(".say.playing").forEach(b=>b.classList.remove("playing"));
  const u=new SpeechSynthesisUtterance(clean(text));u.lang="en-US";u.rate=0.85;if(voice)u.voice=voice;
  if(btn){btn.classList.add("playing");u.onend=u.onerror=()=>btn.classList.remove("playing")}
  speechSynthesis.speak(u)}
const hasBn=t=>/[\u0980-\u09FF]/.test(t),hasLat=t=>/[A-Za-z]/.test(t);
const mkSay=text=>{const b=document.createElement("button");b.type="button";b.className="say";b.textContent="🔊";b.setAttribute("aria-label","উচ্চারণ শোনো");b.onclick=e=>{e.stopPropagation();speak(text,b)};return b};

/* ---------- confetti ---------- */
function confetti(){if(reduce)return;const cols=["#0b6e4f","#f2b705","#d63a31","#1f45b5","#6b3fb3"];
  for(let i=0;i<80;i++){const c=document.createElement("i");c.className="confetti";c.style.left=Math.random()*100+"vw";c.style.background=cols[i%5];c.style.animationDuration=(1.8+Math.random()*1.8)+"s";c.style.animationDelay=(Math.random()*.4)+"s";c.style.borderRadius=Math.random()>.5?"50%":"2px";document.body.appendChild(c);setTimeout(()=>c.remove(),4200)}}

/* ---------- scroll helpers ---------- */
const onScroll=()=>{const h=document.documentElement;const m=h.scrollHeight-h.clientHeight;$("#pbar").style.width=(m>0?h.scrollTop/m*100:0)+"%";$("#totop").classList.toggle("show",h.scrollTop>700)};
addEventListener("scroll",onScroll,{passive:true});
$("#totop").onclick=()=>scrollTo({top:0,behavior:reduce?"auto":"smooth"});

/* shared helpers for other page scripts (practice.js) */
window.EC={$,$$,bnNum,store,toast,speak,mkSay,confetti,reduce};

/* ================= LESSON PAGE ================= */
if(PAGE>=0){
  const main=$("#main");
  if(!isOpen(PAGE)){
    const need=unlockedUpTo();
    main.innerHTML=`<div class="lockcard"><div class="lk-ic">🔒</div><h1>এই পাঠটা এখনো তালাবদ্ধ</h1>
      <p>ধাপে ধাপে শেখার জন্য আগের পাঠগুলো শেষ করতে হবে। এখন তোমার পড়ার কথা:<br><b>পাঠ ${bnNum(need+1)} — ${COURSE[need].t}</b></p>
      <div class="cta"><a class="btn" href="${COURSE[need].f}">ওই পাঠে যাও</a><a class="btn ghost" href="index.html">কোর্স ম্যাপ</a></div></div>`;
    document.title="🔒 তালাবদ্ধ — ইংরেজি বলা শিখি";
    root.classList.add("ready");onScroll();return;
  }
  const cur=COURSE[PAGE];

  /* tables */
  $$(".sec table").forEach(t=>{
    const w=document.createElement("div");w.className="tw";t.before(w);w.appendChild(t);
    const h=t.querySelector("th");
    if(h&&h.textContent.trim()==="ইংরেজি"){t.classList.add("stack");w.classList.add("stackw")}
    if(t.classList.contains("mist"))return;
    t.querySelectorAll("tbody tr").forEach(tr=>{const c=tr.querySelector("td.en");if(!c)return;const txt=c.textContent.trim();
      if(t.classList.contains("verbs")){const cells=[...tr.children].slice(0,3).map(x=>x.textContent);c.appendChild(mkSay(cells.join(", ")));return}
      if(!hasBn(txt)&&hasLat(txt)&&!t.classList.contains("plain")&&!t.classList.contains("sum"))c.appendChild(mkSay(txt))})});
  $$(".dialog .dl").forEach(d=>{const e=d.querySelector(".en");if(e)e.after(mkSay(e.textContent))});
  $$(".practice .ans").forEach(a=>{a.hidden=true;const b=document.createElement("button");b.type="button";b.className="ans-btn";b.textContent="উত্তর দেখো";
    b.onclick=()=>{a.hidden=!a.hidden;b.textContent=a.hidden?"উত্তর দেখো":"উত্তর লুকাও"};a.before(b)});

  /* roadmap checkboxes */
  let weeks=store.get("weeks",[]);
  $$("table.road tbody tr").forEach((tr,i)=>{const td=tr.lastElementChild;td.textContent="";const c=document.createElement("input");c.type="checkbox";c.className="chk";c.setAttribute("aria-label",tr.firstElementChild.textContent+" শেষ");c.checked=!!weeks[i];tr.classList.toggle("done",c.checked);
    c.onchange=()=>{weeks[i]=c.checked;store.set("weeks",weeks);tr.classList.toggle("done",c.checked);if(c.checked)toast(tr.firstElementChild.textContent+" শেষ! দারুণ 👏")};td.appendChild(c)});

  /* finish bar */
  const btn=$("#doneBtn"),fin=$("#finish");
  let reqMet=false;
  function setReady(){if(isDone(PAGE)||reqMet)return;reqMet=true;btn.disabled=false;fin.classList.add("ready");$("#finishTitle").textContent="দারুণ! এবার পাঠটা শেষ করো";}
  function showComplete(){
    fin.classList.remove("ready");fin.classList.add("complete");$(".finish-ic").textContent="✅";
    $("#finishTitle").textContent="এই পাঠ শেষ করেছ";
    if(PAGE<N-1){$("#finishHint").textContent="পরের পাঠ খুলে গেছে। চাইলে এই পাঠ আবার পড়তে পারো।";btn.disabled=false;btn.textContent="পরের পাঠে যাও →";btn.onclick=()=>location.href=COURSE[PAGE+1].f}
    else{$("#finishHint").textContent="অভিনন্দন! তুমি পুরো কোর্স শেষ করেছ।";btn.disabled=false;btn.textContent="কোর্স ম্যাপে যাও";btn.onclick=()=>location.href="index.html"}
  }
  btn.onclick=()=>{if(btn.disabled)return;markDone(PAGE);renderSide();renderPager();showComplete();
    if(PAGE===N-1){confetti();toast("🎉 পুরো কোর্স শেষ! অভিনন্দন!")}else toast("✔ পাঠ শেষ! পরের পাঠ খুলে গেছে 🔓")};
  if(isDone(PAGE))showComplete();
  else if(cur.req==="read"){
    if("IntersectionObserver" in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){setReady();io.disconnect()}},{threshold:.6});io.observe(fin)}else setReady();
  }

  /* pager */
  function renderPager(){
    let h="";
    if(PAGE>0){const p=COURSE[PAGE-1];h+=`<a class="pg" href="${p.f}"><small>← আগের পাঠ</small><b>${p.t}</b></a>`}
    if(PAGE<N-1){const n=COURSE[PAGE+1];const o=isDone(PAGE);
      h+=o?`<a class="pg nx" href="${n.f}"><small>পরের পাঠ →</small><b>${n.t}</b></a>`:`<a class="pg nx lk" href="#" aria-disabled="true"><small>🔒 পরের পাঠ</small><b>${n.t}</b></a>`}
    $("#pager").innerHTML=h;
    const lk=$(".pg.lk");if(lk)lk.onclick=e=>{e.preventDefault();toast("🔒 আগে এই পাঠটা শেষ করো")};
  }
  renderPager();

  /* flashcards */
  const fc=$("#fc");
  if(fc){
    const verbs=(store.get("verbs",null))||[["go","went","gone","যাওয়া"],["come","came","come","আসা"],["eat","ate","eaten","খাওয়া"],["drink","drank","drunk","পান করা"],["see","saw","seen","দেখা"],["do","did","done","করা"],["have","had","had","থাকা / খাওয়া"],["make","made","made","বানানো"],["take","took","taken","নেওয়া"],["give","gave","given","দেওয়া"],["get","got","got / gotten","পাওয়া"],["buy","bought","bought","কেনা"],["bring","brought","brought","আনা"],["think","thought","thought","ভাবা"],["tell","told","told","বলা (কাউকে)"],["say","said","said","বলা"],["know","knew","known","জানা"],["write","wrote","written","লেখা"],["read","read","read","পড়া"],["speak","spoke","spoken","কথা বলা"],["sleep","slept","slept","ঘুমানো"],["leave","left","left","ছেড়ে যাওয়া"],["meet","met","met","দেখা করা"],["pay","paid","paid","টাকা দেওয়া"],["sell","sold","sold","বিক্রি করা"],["send","sent","sent","পাঠানো"],["sit","sat","sat","বসা"],["stand","stood","stood","দাঁড়ানো"],["run","ran","run","দৌড়ানো"],["begin","began","begun","শুরু করা"],["forget","forgot","forgotten","ভুলে যাওয়া"],["lose","lost","lost","হারানো"],["find","found","found","খুঁজে পাওয়া"],["understand","understood","understood","বোঝা"],["feel","felt","felt","অনুভব করা"],["put","put","put","রাখা"],["cut","cut","cut","কাটা"],["teach","taught","taught","শেখানো"],["break","broke","broken","ভাঙা"],["wake","woke","woken","জাগা"]];
    let order=verbs.map((_,i)=>i),fi=0;const seen=new Set();
    const seenEl=document.createElement("p");seenEl.className="fc-seen";$(".fc-wrap").appendChild(seenEl);
    const updSeen=()=>{seenEl.textContent="উল্টে দেখা হয়েছে: "+bnNum(seen.size)+" / "+bnNum(verbs.length);if(seen.size===verbs.length)setReady()};
    function showFc(){const v=verbs[order[fi]];fc.classList.remove("flip");
      setTimeout(()=>{$("#fcF").textContent=v[0];$("#fcM").textContent=v[3];$("#fcB").textContent=v[0]+" – "+v[1]+" – "+v[2]},150);
      $("#fcCount").textContent=bnNum(fi+1)+" / "+bnNum(verbs.length)}
    fc.onclick=()=>{fc.classList.toggle("flip");if(fc.classList.contains("flip")){seen.add(order[fi]);updSeen()}};
    $("#fcNext").onclick=()=>{fi=(fi+1)%verbs.length;showFc()};
    $("#fcPrev").onclick=()=>{fi=(fi-1+verbs.length)%verbs.length;showFc()};
    $("#fcSpeak").onclick=e=>{const v=verbs[order[fi]];speak(v[0]+", "+v[1]+", "+v[2],e.currentTarget)};
    $("#fcShuffle").onclick=()=>{order.sort(()=>Math.random()-.5);fi=0;showFc();toast("কার্ডগুলো এলোমেলো করা হলো")};
    let sx=null;fc.addEventListener("touchstart",e=>sx=e.touches[0].clientX,{passive:true});
    fc.addEventListener("touchend",e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>60){e.preventDefault();(dx<0?$("#fcNext"):$("#fcPrev")).click()}sx=null});
    showFc();updSeen();
  }

  /* quiz */
  if($("#quiz")){
    const qData=[["I am go to school.","I go to school.","am/is/are এর পরে সরাসরি verb বসে না"],["He go to office.","He goes to office.","He/She/It হলে verb-এ s/es"],["He doesn't likes it.","He doesn't like it.","does এর পরে s বাদ"],["I didn't went.","I didn't go.","did এর পরে verb-এর ১ম রূপ"],["He can speaks English.","He can speak English.","can এর পরে verb-এর ১ম রূপ"],["I am agree.","I agree.","agree নিজেই verb, am লাগে না"],["I am understand.","I understand.","understand নিজেই verb, am লাগে না"],["Where you are going?","Where are you going?","প্রশ্নে are আগে বসে"],["Myself Rahim.","I'm Rahim.","পরিচয়ে myself ব্যবহার হয় না"],["What is your good name?","What's your name?","good name বলা হয় না"],["I have fever.","I have a fever.","a লাগে"],["My head is paining.","I have a headache.","ইংরেজিতে এভাবে বলে"],["Let's discuss about it.","Let's discuss it.","discuss এর পরে about লাগে না"],["He is more taller than me.","He is taller than me.","-er থাকলে more লাগে না"],["She is my cousin sister.","She is my cousin.","cousin শব্দেই সব বোঝায়"]].map(a=>({wrong:a[0],right:a[1],why:a[2]}));
    let qs=[],qi=0,score=0;
    const qStart=()=>{qs=[...qData].sort(()=>Math.random()-.5).slice(0,10);qi=0;score=0;qShow()};
    function qShow(){const q=qs[qi];$("#qNum").textContent="প্রশ্ন "+bnNum(qi+1)+" / "+bnNum(qs.length);$("#qScore").textContent="স্কোর: "+bnNum(score);
      $("#qFill").style.width=(qi/qs.length*100)+"%";$("#qWhy").textContent="";$("#qNext").hidden=true;$(".qask").hidden=false;
      const box=$("#qOpts");box.innerHTML="";
      [q.wrong,q.right].sort(()=>Math.random()-.5).forEach(t=>{const b=document.createElement("button");b.type="button";b.className="qopt";b.textContent=t;
        b.onclick=()=>{const ok=t===q.right;if(ok)score++;$$(".qopt").forEach(x=>{x.disabled=true;if(x.textContent===q.right)x.classList.add("right")});if(!ok)b.classList.add("wrong");
          $("#qWhy").innerHTML=(ok?"✅ ঠিক! ":"❌ সঠিক হলো: <b class='en'>"+q.right+"</b> — ")+q.why;$("#qScore").textContent="স্কোর: "+bnNum(score);
          $("#qNext").hidden=false;$("#qNext").textContent=qi===qs.length-1?"ফলাফল দেখো":"পরের প্রশ্ন";if(ok)speak(q.right)};box.appendChild(b)})}
    function qEnd(){$("#qFill").style.width="100%";$(".qask").hidden=true;$("#qWhy").textContent="";$("#qNext").hidden=true;
      const pass=score>=7;const msg=score===qs.length?"অসাধারণ! একটাও ভুল নেই 🏆":pass?"পাস করেছ! এবার নিচের বাটন চেপে পাঠ শেষ করো 💪":"৭ পেলে পাস — “সাধারণ ভুল” পাঠটা আরেকবার দেখে আবার চেষ্টা করো 🌱";
      $("#qOpts").innerHTML="<div class='qdone'><div class='big'>"+bnNum(score)+" / "+bnNum(qs.length)+"</div><p>"+msg+"</p><button type='button' class='btn' id='qAgain'>আবার খেলো</button></div>";
      $("#qAgain").onclick=qStart;if(pass){setReady();if(score===qs.length)confetti()}}
    $("#qNext").onclick=()=>{qi++;qi<qs.length?qShow():qEnd()};qStart();
  }
}

/* ================= HOME PAGE ================= */
if(PAGE===-1){
  const next=unlockedUpTo();
  const cb=$("#continueBtn");
  if(next>=N){cb.textContent="কোর্স শেষ! আবার রিভিশন দাও";cb.href=COURSE[0].f;
    $("#courseMap").insertAdjacentHTML("beforebegin","<div class='cert'><h2>🎓 অভিনন্দন!</h2><p>তুমি পুরো কোর্স শেষ করেছ। এবার প্রতিদিন ইংরেজিতে কথা বলার অভ্যাস চালিয়ে যাও।</p></div>")}
  else if(done.size){cb.textContent="চালিয়ে যাও: পাঠ "+bnNum(next+1)+" →";cb.href=COURSE[next].f}
  else{cb.textContent="পাঠ ১ দিয়ে শুরু করো →";cb.href=COURSE[0].f}

  let h="";
  groupsOf().forEach(g=>{
    h+=`<div class="mg"><h3><span>${icons[g.name]||"📄"}</span>${g.name}<small>${bnNum(g.items.filter(isDone).length)} / ${bnNum(g.items.length)}</small></h3><div class="mgrid">`;
    g.items.forEach(i=>{const c=COURSE[i],d=isDone(i),o=isOpen(i);
      h+=`<a class="mc ${d?"done":""} ${!o?"locked":""} ${i===next?"next":""}" href="${o?c.f:"#"}"${o?"":` data-lock="1" aria-disabled="true"`}><i class="nb">${d?"✓":!o?"🔒":bnNum(i+1)}</i><span><small>${c.tag}${i===next?" · এখন পড়ো":""}</small>${c.t}</span></a>`});
    h+="</div></div>"});
  $("#courseMap").innerHTML=h;
  $$("#courseMap [data-lock]").forEach(a=>a.onclick=e=>{e.preventDefault();toast("🔒 আগে “"+COURSE[unlockedUpTo()].t+"” শেষ করো")});

  $("#resetBtn").onclick=()=>{if(confirm("সত্যিই সব অগ্রগতি মুছে ফেলবে? পাঠগুলো আবার তালাবদ্ধ হয়ে যাবে।")){["done","weeks","studied","practice.writings","practice.draft","practice.stats"].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});location.reload()}};

  /* dashboard */
  const dkey=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)};
  let studied=store.get("studied",[]);
  const streakCount=()=>{let n=0;const d=new Date();if(!studied.includes(dkey(d)))d.setDate(d.getDate()-1);while(studied.includes(dkey(d))){n++;d.setDate(d.getDate()-1)}return n};
  function updDash(){
    $("#lDone").textContent=bnNum(done.size);$("#ring").style.setProperty("--p",Math.round(done.size/N*100));
    $("#streak").textContent=bnNum(streakCount());
    const box=$("#days");box.innerHTML="";let c=0;
    for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const on=studied.includes(dkey(d));if(on)c++;const x=document.createElement("i");if(on)x.className="on";box.appendChild(x)}
    $("#daysTxt").textContent="গত ৭ দিনে "+bnNum(c)+" দিন পড়েছ";
    const td=studied.includes(dkey(new Date()));const b=$("#todayBtn");b.disabled=td;b.textContent=td?"✔ আজকের পড়া শেষ":"✔ আজ পড়েছি";
    $("#todayTxt").textContent=td?"দারুণ! কাল আবার দেখা হবে। 🌱":"আজকের ৪০ মিনিট পড়া শেষ হলে বাটনটা চাপো।"}
  $("#todayBtn").onclick=()=>{const k=dkey(new Date());if(!studied.includes(k)){studied.push(k);store.set("studied",studied);updDash();toast("শাবাশ! টানা "+bnNum(streakCount())+" দিন 🔥");if([7,30,60,90].includes(streakCount()))confetti()}};
  updDash();

  /* hero sentence machine */
  const pairs=[["আমি ভাত খাই।","I eat rice."],["তুমি কেমন আছো?","How are you?"],["আমি এখন পড়ছি।","I am studying now."],["গতকাল আমি বাজারে গিয়েছিলাম।","I went to the market yesterday."],["আমি তোমাকে কাল ফোন দেব।","I will call you tomorrow."],["আরেকবার বলবেন, প্লিজ?","Could you say that again, please?"],["আমি ইংরেজি শিখছি।","I'm learning English."]];
  let pi=0;const mBn=$("#mBn"),mEn=$("#mEn");
  $("#mSay").onclick=e=>speak(pairs[pi][1],e.currentTarget);
  const play=()=>{const [bn,en]=pairs[pi];mBn.textContent=bn;
    if(reduce){mEn.textContent=en;setTimeout(nxt,4000);return}
    mEn.textContent="";let i=0;setTimeout(function t(){mEn.textContent=en.slice(0,++i);if(i<en.length)setTimeout(t,55);else setTimeout(nxt,2600)},700)};
  const nxt=()=>{pi=(pi+1)%pairs.length;play()};
  play();
}

root.classList.add("ready");onScroll();
})();
