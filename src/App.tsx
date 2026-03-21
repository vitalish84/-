/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";

const HL = [
  {l:"א",n:"אלף"},{l:"ב",n:"בית"},{l:"ג",n:"גימל"},{l:"ד",n:"דלת"},
  {l:"ה",n:"הא"},{l:"ו",n:"וו"},{l:"ז",n:"זין"},{l:"ח",n:"חית"},
  {l:"ט",n:"טית"},{l:"י",n:"יוד"},{l:"כ",n:"כף"},{l:"ל",n:"למד"},
  {l:"מ",n:"מם"},{l:"נ",n:"נון"},{l:"ס",n:"סמך"},{l:"ע",n:"עין"},
  {l:"פ",n:"פא"},{l:"צ",n:"צדי"},{l:"ק",n:"קוף"},{l:"ר",n:"ריש"},
  {l:"ש",n:"שין"},{l:"ת",n:"תו"},
];

const WG = {
  "א":[{w:"ארנב",e:"🐰"},{w:"אריה",e:"🦁"},{w:"אוטובוס",e:"🚌"},{w:"ארנק",e:"👛"}],
  "ב":[{w:"בלון",e:"🎈"},{w:"בננה",e:"🍌"},{w:"בית",e:"🏠"},{w:"ברווז",e:"🦆"}],
  "ג":[{w:"גזר",e:"🥕"},{w:"גלידה",e:"🍦"},{w:"גמל",e:"🐪"},{w:"גשם",e:"🌧️"}],
  "ד":[{w:"דג",e:"🐟"},{w:"דובי",e:"🧸"},{w:"דבורה",e:"🐝"},{w:"דלעת",e:"🎃"}],
  "ה":[{w:"הר",e:"⛰️"},{w:"הגה",e:"🎮"},{w:"הפתעה",e:"🎁"},{w:"הליקופטר",e:"🚁"}],
  "ו":[{w:"ורד",e:"🌹"},{w:"ויולין",e:"🎻"},{w:"וילון",e:"🪟"},{w:"ונילה",e:"🍦"}],
  "ז":[{w:"זאב",e:"🐺"},{w:"זהב",e:"🥇"},{w:"זמר",e:"🎤"},{w:"זיתים",e:"🫒"}],
  "ח":[{w:"חתול",e:"🐱"},{w:"חמניה",e:"🌻"},{w:"חלב",e:"🥛"},{w:"חמור",e:"🫏"}],
  "ט":[{w:"טרקטור",e:"🚜"},{w:"טלפון",e:"📱"},{w:"טירה",e:"🏰"},{w:"טבעת",e:"💍"}],
  "י":[{w:"ירח",e:"🌙"},{w:"יונה",e:"🕊️"},{w:"ים",e:"🌊"},{w:"יער",e:"🌲"}],
  "כ":[{w:"כלב",e:"🐶"},{w:"כוכב",e:"⭐"},{w:"כדור",e:"⚽"},{w:"כבשה",e:"🐑"}],
  "ל":[{w:"לב",e:"❤️"},{w:"לחם",e:"🍞"},{w:"לימון",e:"🍋"},{w:"ליצן",e:"🤡"}],
  "מ":[{w:"מכונית",e:"🚗"},{w:"מנורה",e:"💡"},{w:"מפתח",e:"🔑"},{w:"מלון",e:"🍈"}],
  "נ":[{w:"נחש",e:"🐍"},{w:"נמר",e:"🐆"},{w:"נרות",e:"🕯️"},{w:"נהר",e:"🏞️"}],
  "ס":[{w:"סוס",e:"🐴"},{w:"סרטן",e:"🦀"},{w:"ספר",e:"📚"},{w:"סנאי",e:"🐿️"}],
  "ע":[{w:"עכבר",e:"🐭"},{w:"עץ",e:"🌳"},{w:"ענן",e:"☁️"},{w:"עוגה",e:"🎂"}],
  "פ":[{w:"פרח",e:"🌸"},{w:"פיל",e:"🐘"},{w:"פרפר",e:"🦋"},{w:"פינגווין",e:"🐧"}],
  "צ":[{w:"צב",e:"🐢"},{w:"ציפור",e:"🐦"},{w:"צבי",e:"🦌"},{w:"צלחת",e:"🍽️"}],
  "ק":[{w:"קנגורו",e:"🦘"},{w:"קיפוד",e:"🦔"},{w:"קשת",e:"🌈"},{w:"קוף",e:"🐒"}],
  "ר":[{w:"רכב",e:"🚗"},{w:"רובוט",e:"🤖"},{w:"ריקוד",e:"💃"},{w:"רוח",e:"🌬️"}],
  "ש":[{w:"שמש",e:"☀️"},{w:"שפן",e:"🐇"},{w:"שוקולד",e:"🍫"},{w:"שיר",e:"🎵"}],
  "ת":[{w:"תפוח",e:"🍎"},{w:"תות",e:"🍓"},{w:"תנין",e:"🐊"},{w:"תיק",e:"🎒"}],
};

const WKEYS = Object.keys(WG);

const EMOS = ["🌟","🦋","🌈","🐰","🌸","🦄","🎀","🍭","🌺","🐝"];
const shuf = (a: any[]) => [...a].sort(()=>Math.random()-.5);
const rnd = (n: number) => Math.floor(Math.random()*n);

// ── speech ──────────────────────────────────────────────────────────────────
let _unlocked=false;

// Global listener to unlock audio on first touch/click
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (!_unlocked) {
      unlockAudio();
      // Play a silent sound to "wake up" the audio context on mobile
      if (window.speechSynthesis) {
        window.speechSynthesis.resume();
      }
    }
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('mousedown', unlock);
  };
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('mousedown', unlock, { passive: true });
}

function spk(txt: string | number){
  if(!window.speechSynthesis)return;
  
  // Ensure we are not paused (some browsers get stuck)
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const go=()=>{
    try {
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(String(txt));
      const vs=window.speechSynthesis.getVoices();
      
      // Prefer Hebrew, then any, but avoid picking Arabic for Hebrew text if possible
      const he=vs.find(v=>v.lang&&v.lang.toLowerCase().includes("he"))
             ||vs.find(v=>v.lang&&v.lang.toLowerCase().includes("il"))
             ||vs[0];
             
      if(he) u.voice=he;
      u.lang="he-IL";
      u.rate=0.9; // Slightly faster for better natural feel on some devices
      u.pitch=1.1;
      u.volume=1;
      
      // On some mobile browsers, we need to call speak inside a timeout or after a cancel
      setTimeout(() => {
        window.speechSynthesis.speak(u);
      }, 50);
    } catch (e) {
      console.error("Speech error:", e);
    }
  };

  if(!_unlocked) unlockAudio();

  if(window.speechSynthesis.getVoices().length===0){
    window.speechSynthesis.onvoiceschanged=()=>{
      window.speechSynthesis.onvoiceschanged=null;
      go();
    };
    // Fallback if onvoiceschanged doesn't fire
    setTimeout(go,500);
  } else {
    go();
  }
}

function unlockAudio(){
  if(_unlocked || !window.speechSynthesis)return;
  _unlocked=true;
  try {
    window.speechSynthesis.resume();
    const u=new SpeechSynthesisUtterance("");
    u.volume=0;
    window.speechSynthesis.speak(u);
  } catch(e) {
    console.error("Audio unlock failed", e);
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────
function bs(bg: string, col: string, fs: number, x: any = {}){
  return {background:bg,color:col,border:"none",borderRadius:14,padding:"6px 14px",
    fontSize:fs,fontWeight:700,cursor:"pointer",...x};
}
function Star({x,y}: {x: number, y: number}){
  return <div style={{position:"fixed",left:x-18,top:y-18,fontSize:32,
    pointerEvents:"none",zIndex:9999,animation:"ps .7s forwards"}}>⭐</div>;
}
function Back({go}: {go: (p: string) => void}){
  return <button onClick={()=>go("home")}
    style={bs("#e8e8e8","#888",14,{marginBottom:8})}>🏠 הבית</button>;
}
function Spk({t}: {t: string}){
  return <button onClick={e=>{spk(t);}}
    style={bs("#4db8ff","#fff",12,{borderRadius:10,padding:"4px 10px"})}>🔊</button>;
}
const LVLS=[
  {id:"easy",l:"קל",e:"🌱",c:"#6bcb77"},
  {id:"med", l:"בינוני",e:"🌟",c:"#ffa94d"},
  {id:"hard",l:"קשה",e:"🔥",c:"#ff7b7b"},
];
function LvlPick({lv,set}: {lv: string, set: (l: string) => void}){
  return (
    <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:12}}>
      {LVLS.map(x=>(
        <button key={x.id} onClick={()=>set(x.id)}
          style={{background:lv===x.id?x.c:"#f0f0f0",color:lv===x.id?"#fff":x.c,
            border:`2px solid ${x.c}`,borderRadius:12,padding:"5px 11px",
            fontSize:13,fontWeight:700,cursor:"pointer"}}>
          {x.e} {x.l}
        </button>
      ))}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("home");
  const [stars,setStars]=useState<any[]>([]);
  const [score,setScore]=useState(0);
  const addStar=useCallback((e: any)=>{
    const id=Date.now()+Math.random();
    setStars(s=>[...s,{id,x:e?.clientX||200,y:e?.clientY||200}]);
    setTimeout(()=>setStars(s=>s.filter(x=>x.id!==id)),800);
    setScore(s=>s+1);
  },[]);
  useEffect(()=>{window.speechSynthesis?.getVoices();},[]);
  const P: any={
    home:<Home go={setPage}/>,
    letters:<Letters go={setPage} addStar={addStar}/>,
    numbers:<Numbers go={setPage} addStar={addStar}/>,
    math:<MathGame go={setPage} addStar={addStar}/>,
    quiz:<Quiz go={setPage} addStar={addStar}/>,
    sortL:<SortL go={setPage} addStar={addStar}/>,
    sortN:<SortN go={setPage} addStar={addStar}/>,
    words:<Words go={setPage} addStar={addStar}/>,
    exam:<Exam go={setPage} addStar={addStar}/>,
  };
  return (
    <div onClick={unlockAudio} style={{minHeight:"100vh",background:"linear-gradient(135deg,#fff9f0,#fff0fa,#f0f8ff)",
      fontFamily:"'Segoe UI','Arial Hebrew',sans-serif",direction:"rtl"}}>
      <style>{`
        @keyframes ps{0%{transform:scale(0);opacity:1}60%{transform:scale(1.5) rotate(180deg);opacity:1}100%{transform:scale(0) translateY(-60px);opacity:0}}
        @keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes sk{0%,100%{transform:translateX(0)}30%{transform:translateX(-7px)}70%{transform:translateX(7px)}}
        @keyframes pp{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
        button{transition:transform .15s;} button:hover{transform:scale(1.06);} button:active{transform:scale(.93);}
      `}</style>
      {stars.map(s=><Star key={s.id} {...s}/>)}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"10px 16px",background:"rgba(255,255,255,.8)",backdropFilter:"blur(10px)",
        position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px #ffb3d933"}}>
        <span style={{fontSize:20,fontWeight:900,color:"#e05fa0"}}>🌈 לומדים ביחד!</span>
        <span style={{background:"linear-gradient(135deg,#ffe566,#ff9f43)",borderRadius:24,
          padding:"4px 14px",fontSize:17,fontWeight:800,color:"#fff"}}>⭐ {score}</span>
      </div>
      <div style={{paddingBottom:40}}>{P[page]||P.home}</div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
function Home({go}: {go: (p: string) => void}){
  const items=[
    {id:"letters",e:"✏️",l:"אותיות",c:"#e05fa0",bg:"#fff0f4",d:"אלפ-בית"},
    {id:"numbers",e:"🔢",l:"מספרים",c:"#4db8ff",bg:"#f0f8ff",d:"1 עד 10"},
    {id:"math",   e:"➕",l:"חשבון", c:"#6bcb77",bg:"#f0fff4",d:"חיבור וחיסור"},
    {id:"quiz",   e:"🎯",l:"חידון", c:"#ffa94d",bg:"#fff8f0",d:"זהי אות"},
    {id:"sortL",  e:"🔡",l:"סדרי אותיות",c:"#b77fe8",bg:"#f8f0ff",d:"לפי א-ב"},
    {id:"sortN",  e:"📶",l:"סדרי מספרים",c:"#3ec9c9",bg:"#f0ffff",d:"מקטן לגדול"},
    {id:"words",  e:"🖼️",l:"מה מתחיל ב?",c:"#ff7b7b",bg:"#fff5f5",d:"מילים ואותיות"},
    {id:"exam",   e:"🏆",l:"מבחן גדול",c:"#f9d423",bg:"#fffbe6",d:"15 שאלות על הכל!"},
  ];
  return (
    <div style={{padding:"18px 12px",textAlign:"center",animation:"fi .5s"}}>
      <div style={{fontSize:56,animation:"fl 3s ease-in-out infinite"}}>🦄</div>
      <h1 style={{fontSize:28,color:"#e05fa0",margin:"4px 0 2px",fontWeight:900}}>שלום! בואי נלמד!</h1>
      <p style={{color:"#bbb",fontSize:14,marginBottom:18}}>בחרי פעילות 👇</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:420,margin:"0 auto"}}>
        {items.map(it=>(
          <button key={it.id} onClick={()=>{spk(it.l);go(it.id);}}
            style={{background:it.bg,border:`3px solid ${it.c}`,borderRadius:18,
              padding:"14px 8px",boxShadow:`0 4px 16px ${it.c}33`,textAlign:"center"}}>
            <div style={{fontSize:36}}>{it.e}</div>
            <div style={{fontSize:18,fontWeight:900,color:it.c,marginTop:3}}>{it.l}</div>
            <div style={{fontSize:11,color:"#bbb",marginTop:2}}>{it.d}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Letters ───────────────────────────────────────────────────────────────────
function Letters({go,addStar}: {go: (p: string) => void, addStar: (e: any) => void}){
  const [i,setI]=useState(0);
  const nav=(n: number)=>{setI(n);spk(HL[n].n);};
  useEffect(()=>{
    if(_unlocked) spk(HL[0].n);
  },[]);
  const l=HL[i];
  return (
    <div style={{padding:"16px 12px",textAlign:"center",animation:"fi .4s"}}>
      <Back go={go}/>
      <h2 style={{color:"#e05fa0",fontSize:22,margin:"4px 0 2px"}}>✏️ אותיות האלפ-בית</h2>
      <p style={{color:"#ccc",fontSize:12}}>{i+1} / {HL.length}</p>
      <div style={{background:"#ffe4f0",borderRadius:8,height:6,margin:"4px auto 14px",maxWidth:300}}>
        <div style={{background:"linear-gradient(90deg,#ff8fab,#e05fa0)",borderRadius:8,height:6,
          width:`${((i+1)/HL.length)*100}%`,transition:"width .4s"}}/>
      </div>
      <button onClick={e=>{spk(l.n);addStar(e);}}
        style={{background:"linear-gradient(135deg,#fff0f8,#ffe8f4)",border:"4px solid #ffb3d9",
          borderRadius:24,padding:"20px 12px",margin:"0 auto 12px",maxWidth:220,display:"block",
          boxShadow:"0 8px 30px #ff64b425",width:"100%"}}>
        <div style={{fontSize:96,lineHeight:1,color:"#e05fa0",fontWeight:900}}>{l.l}</div>
        <div style={{fontSize:20,color:"#c45a8a",fontWeight:700,marginTop:4}}>{l.n}</div>
        <div style={{fontSize:11,color:"#ddd",marginTop:2}}>🔊 לחצי לשמוע</div>
      </button>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
        <button disabled={i===0} onClick={()=>nav(i-1)}
          style={bs(i===0?"#eee":"linear-gradient(135deg,#ff8fab,#e05fa0)",i===0?"#bbb":"#fff",14,
            {borderRadius:14,padding:"8px 18px",cursor:i===0?"not-allowed":"pointer"})}>⬅ הקודמת</button>
        <button disabled={i===HL.length-1} onClick={()=>nav(i+1)}
          style={bs(i===HL.length-1?"#eee":"linear-gradient(135deg,#e05fa0,#c03080)",i===HL.length-1?"#bbb":"#fff",14,
            {borderRadius:14,padding:"8px 18px",cursor:i===HL.length-1?"not-allowed":"pointer"})}>הבאה ➡</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center",maxWidth:360,margin:"0 auto"}}>
        {HL.map((x,j)=>(
          <button key={j} onClick={()=>nav(j)}
            style={{width:38,height:38,borderRadius:8,fontSize:18,fontWeight:800,
              background:j===i?"linear-gradient(135deg,#ff8fab,#e05fa0)":"#fff",
              color:j===i?"#fff":"#e05fa0",border:`2px solid ${j===i?"#e05fa0":"#ffcce0"}`,cursor:"pointer"}}>
            {x.l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Numbers ───────────────────────────────────────────────────────────────────
function Numbers({go,addStar}: {go: (p: string) => void, addStar: (e: any) => void}){
  const [sel,setSel]=useState<number | null>(null);
  const [mode,setMode]=useState<"learn"|"guess">("learn");
  const [guessQ,setGuessQ]=useState<any>(null);
  const [fb,setFb]=useState<string | null>(null);

  const newGuess=useCallback(()=>{
    const n = rnd(10)+1;
    const opts = new Set([n]);
    while(opts.size<4) opts.add(rnd(10)+1);
    setGuessQ({n, opts:shuf([...opts])});
    setFb(null);
    spk("כמה חברים יש כאן?");
  }, []);

  useEffect(()=>{ if(mode==="guess") newGuess(); }, [mode, newGuess]);

  const pickGuess=(e: any, o: number)=>{
    if(fb) return;
    const ok = o === guessQ.n;
    setFb(ok?"✅ נכון!":"❌ נסי שוב");
    if(ok){
      addStar(e);
      spk("נכון מאוד!");
      setTimeout(newGuess, 1500);
    } else {
      spk("לא בדיוק, נסי לספור שוב");
      setTimeout(()=>setFb(null), 1000);
    }
  };

  return (
    <div style={{padding:"16px 12px",textAlign:"center",animation:"fi .4s"}}>
      <Back go={go}/>
      <h2 style={{color:"#4db8ff",fontSize:22,margin:"4px 0 10px"}}>🔢 מספרים</h2>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:14}}>
        <button onClick={()=>setMode("learn")} style={bs(mode==="learn"?"#4db8ff":"#f0f8ff",mode==="learn"?"#fff":"#4db8ff",13,{border:"2px solid #4db8ff"})}>למידה 📖</button>
        <button onClick={()=>setMode("guess")} style={bs(mode==="guess"?"#4db8ff":"#f0f8ff",mode==="guess"?"#fff":"#4db8ff",13,{border:"2px solid #4db8ff"})}>משחק 🎮</button>
      </div>

      {mode==="learn" ? (
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,maxWidth:340,margin:"0 auto 16px"}}>
            {[1,2,3,4,5,6,7,8,9,10].map(n=>(
              <button key={n} onClick={e=>{setSel(n);spk(String(n));addStar(e);}}
                style={{background:sel===n?"linear-gradient(135deg,#74c7ff,#4db8ff)":"linear-gradient(135deg,#f0f8ff,#dff0ff)",
                  border:`3px solid ${sel===n?"#4db8ff":"#a8d8ff"}`,borderRadius:14,padding:"11px 4px",
                  color:sel===n?"#fff":"#4db8ff",fontWeight:900,fontSize:24,
                  boxShadow:sel===n?"0 4px 16px #4db8ff44":"none"}}>
                {n}
              </button>
            ))}
          </div>
          {sel!=null&&(
            <div style={{animation:"fi .3s",background:"#f0f8ff",borderRadius:18,padding:"14px",maxWidth:320,margin:"0 auto"}}>
              <div style={{fontSize:32,marginBottom:5}}>
                {Array(sel).fill(0).map((_,i)=>(
                  <span key={i} style={{display:"inline-block",animation:`pp .3s ${i*.07}s both`}}>
                    {EMOS[(sel-1)%EMOS.length]}
                  </span>
                ))}
              </div>
              <div style={{fontSize:32,fontWeight:900,color:"#4db8ff"}}>{sel}</div>
              <div style={{marginTop:8}}><Spk t={String(sel)}/></div>
            </div>
          )}
        </>
      ) : guessQ && (
        <div style={{animation:"fi .3s"}}>
          <div style={{background:"#f0f8ff",borderRadius:18,padding:"20px",maxWidth:320,margin:"0 auto 16px",border:"3px solid #a8d8ff"}}>
            <div style={{fontSize:40,marginBottom:10}}>
              {Array(guessQ.n).fill(0).map((_,i)=>(
                <span key={i} style={{display:"inline-block",margin:"2px"}}>
                  {EMOS[(guessQ.n-1)%EMOS.length]}
                </span>
              ))}
            </div>
            <div style={{fontSize:16,color:"#4db8ff",fontWeight:700}}>כמה יש כאן?</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:260,margin:"0 auto"}}>
            {guessQ.opts.map((o: number)=>(
              <button key={o} onClick={e=>pickGuess(e,o)}
                style={{fontSize:28,fontWeight:900,padding:"12px",borderRadius:16,
                  background:fb && o===guessQ.n ? "#6bcb77" : "#fff",
                  color:fb && o===guessQ.n ? "#fff" : "#4db8ff",
                  border:`3px solid ${fb && o===guessQ.n ? "#2d8a40" : "#a8d8ff"}`}}>
                {o}
              </button>
            ))}
          </div>
          {fb&&<div style={{fontSize:22,fontWeight:800,marginTop:12,color:fb.includes("נכון")?"#2d8a40":"#e05fa0"}}>{fb}</div>}
        </div>
      )}
    </div>
  );
}

// ── MathGame ──────────────────────────────────────────────────────────────────
function MathGame({go,addStar}: {go: (p: string) => void, addStar: (e: any) => void}){
  const [lv,setLv]=useState("easy");
  const [p,setP]=useState<any>(null);
  const [ans,setAns]=useState<number | null>(null);
  const [fb,setFb]=useState<string | null>(null);
  const [streak,setStreak]=useState(0);

  const newP=useCallback((cl: string)=>{
    const canSub=cl!=="easy";
    const isHard=cl==="hard";
    const max=cl==="easy"?5:cl==="med"?9:20;
    
    // Randomly choose operation
    let opType = "add";
    if(isHard && Math.random() > 0.7) opType = "mul";
    else if(canSub && Math.random() > 0.5) opType = "sub";

    let a,b,c,t;
    if(opType === "add"){
      a=rnd(max)+1; b=rnd(max+1-a)+1;
      c=a+b; t="+";
    } else if(opType === "sub"){
      a=rnd(max)+2; b=rnd(a-1)+1;
      c=a-b; t="-";
    } else {
      // Multiplication
      a=rnd(5)+1; b=rnd(4)+1;
      c=a*b; t="×";
    }

    const opts=new Set([c]);
    const sp=cl==="hard"?6:3;
    let tries=0;
    while(opts.size<4&&tries<50){
      tries++;
      const w=c+(Math.random()>.5?1:-1)*(rnd(sp)+1);
      if(w>0)opts.add(w);
    }
    setP({a,b,t,c,opts:[...opts].sort(()=>Math.random()-.5)});
    setAns(null);setFb(null);
    const opWord = t==="+"?"ועוד":t==="-"?"פחות":"כפול";
    spk(`כמה זה ${a} ${opWord} ${b}`);
  }, []);

  useEffect(()=>newP(lv),[lv, newP]);

  const pick=(e: any,o: number)=>{
    if(ans!=null)return;
    setAns(o);
    const ok=o===p.c;
    setFb(ok?"✅ כל הכבוד!":`❌ התשובה היא ${p.c}`);
    if(ok){setStreak(s=>s+1);addStar(e);spk("כל הכבוד מצוין");}
    else{setStreak(0);spk(`לא בדיוק. התשובה היא ${p.c}`);}
    setTimeout(()=>newP(lv),2200);
  };

  const showE=lv!=="hard"&&p&&p.a<=10&&p.b<=10;
  if(!p)return null;
  return (
    <div style={{padding:"16px 12px",textAlign:"center",animation:"fi .4s"}}>
      <Back go={go}/>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,margin:"4px 0 8px"}}>
        <h2 style={{color:"#6bcb77",fontSize:22,margin:0}}>➕ חשבון</h2>
        {streak>=2&&<span style={{background:"linear-gradient(135deg,#ffe566,#ff9f43)",borderRadius:16,
          padding:"2px 10px",fontSize:13,fontWeight:700,color:"#fff"}}>🔥 {streak}</span>}
      </div>
      <LvlPick lv={lv} set={l=>{setLv(l);setStreak(0);}}/>
      <div style={{background:"#f0fff4",borderRadius:18,padding:"12px",maxWidth:320,margin:"0 auto 12px",border:"3px solid #c3f0ca"}}>
        {showE&&<><div style={{fontSize:22}}>{Array(p.a).fill(0).map((_,i)=><span key={i}>{EMOS[(p.a-1)%EMOS.length]}</span>)}</div>
        <div style={{fontSize:20,color:"#6bcb77",fontWeight:900,margin:"2px 0"}}>{p.t}</div>
        <div style={{fontSize:22}}>{Array(p.b).fill(0).map((_,i)=><span key={i} style={{opacity:p.t==="-"?.3:1}}>{EMOS[(p.b-1)%EMOS.length]}</span>)}</div></>}
        <div style={{fontSize:36,fontWeight:900,color:"#2d8a40",marginTop:5}}>{p.a} {p.t} {p.b} = ?</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:300,margin:"0 auto 10px"}}>
        {p.opts.map((o: number)=>(
          <button key={o} onClick={e=>pick(e,o)}
            style={{fontSize:26,fontWeight:900,padding:"13px",borderRadius:14,
              background:ans==null?"linear-gradient(135deg,#f0fff4,#dcffe4)":o===p.c?"linear-gradient(135deg,#6bcb77,#2d8a40)":o===ans?"linear-gradient(135deg,#ff8fab,#e05fa0)":"#f5f5f5",
              color:ans!=null&&(o===p.c||o===ans)?"#fff":"#2d8a40",
              border:`3px solid ${ans!=null&&o===p.c?"#2d8a40":ans!=null&&o===ans?"#e05fa0":"#c3f0ca"}`}}>
            {o}
          </button>
        ))}
      </div>
      {fb&&<div style={{fontSize:20,fontWeight:800,animation:"pp .3s",color:fb.includes("✅")?"#2d8a40":"#e05fa0"}}>{fb}</div>}
      <button onClick={()=>newP(lv)} style={bs("linear-gradient(135deg,#6bcb77,#2d8a40)","#fff",15,{borderRadius:14,padding:"8px 20px",marginTop:10})}>שאלה חדשה 🔄</button>
    </div>
  );
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
function Quiz({go,addStar}: {go: (p: string) => void, addStar: (e: any) => void}){
  const [q,setQ]=useState<any>(null);
  const [ch,setCh]=useState<any>(null);
  const [fb,setFb]=useState<string | null>(null);
  const [sc,setSc]=useState(0);
  const [tot,setTot]=useState(0);

  const next=useCallback(()=>{
    const c=HL[rnd(HL.length)];
    const s=new Set([c]);
    while(s.size<4)s.add(HL[rnd(HL.length)]);
    setQ({c,opts:[...s].sort(()=>Math.random()-.5)});
    setCh(null);setFb(null);
    setTimeout(()=>spk(c.n),200);
  }, []);
  useEffect(()=>next(),[next]);

  const pick=(e: any,o: any)=>{
    if(ch)return;
    setCh(o);setTot(t=>t+1);
    const ok=o.l===q.c.l;
    setFb(ok?"🎉 נכון!":`❌ זאת האות ${q.c.n}`);
    if(ok){setSc(s=>s+1);addStar(e);spk("נכון מאוד יופי");}
    else spk(`לא בדיוק. זאת האות ${q.c.n}`);
    setTimeout(next,2200);
  };

  if(!q)return null;
  return (
    <div style={{padding:"16px 12px",textAlign:"center",animation:"fi .4s"}}>
      <Back go={go}/>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,margin:"4px 0 10px"}}>
        <h2 style={{color:"#ffa94d",fontSize:22,margin:0}}>🎯 חידון אותיות</h2>
        <span style={{background:"linear-gradient(135deg,#ffe566,#ff9f43)",borderRadius:14,padding:"2px 10px",fontSize:13,fontWeight:700,color:"#fff"}}>{sc}/{tot}</span>
      </div>
      <button onClick={()=>spk(q.c.n)}
        style={{fontSize:90,lineHeight:1,color:"#e05fa0",fontWeight:900,
          background:"linear-gradient(135deg,#fff8f0,#ffe8d0)",border:"4px solid #ffd0a0",
          borderRadius:24,padding:"14px",margin:"0 auto 14px",maxWidth:180,display:"block",
          animation:"fl 3s ease-in-out infinite"}}>
        {q.c.l}
        <div style={{fontSize:11,color:"#ddd",marginTop:2}}>🔊 לחצי</div>
      </button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:300,margin:"0 auto 10px"}}>
        {q.opts.map((o: any,i: number)=>(
          <button key={i} onClick={e=>pick(e,o)}
            style={{fontSize:18,fontWeight:800,padding:"12px",borderRadius:14,
              background:!ch?"linear-gradient(135deg,#fff8f0,#ffe8d0)":o.l===q.c.l?"linear-gradient(135deg,#ffe566,#ff9f43)":o.l===ch.l?"linear-gradient(135deg,#ff8fab,#e05fa0)":"#f5f5f5",
              color:ch&&(o.l===q.c.l||o.l===ch.l)?"#fff":"#ffa94d",
              border:`3px solid ${ch&&o.l===q.c.l?"#ff9f43":ch&&o.l===ch.l?"#e05fa0":"#ffd0a0"}`}}>
            {o.n}
          </button>
        ))}
      </div>
      {fb&&<div style={{fontSize:21,fontWeight:800,animation:"pp .3s",color:fb.includes("🎉")?"#ff9f43":"#e05fa0"}}>{fb}</div>}
      <button onClick={next} style={bs("linear-gradient(135deg,#ffe566,#ff9f43)","#fff",15,{borderRadius:14,padding:"8px 20px",marginTop:10})}>שאלה חדשה 🔄</button>
    </div>
  );
}

// ── SortL ─────────────────────────────────────────────────────────────────────
function SortL({go,addStar}: {go: (p: string) => void, addStar: (e: any) => void}){
  const [lv,setLv]=useState("easy");
  const [game,setGame]=useState<any>(null);
  const [wrong,setWrong]=useState<string | null>(null);
  const SZM: any={easy:3,med:5,hard:7};

  const init=useCallback((cl?: string)=>{
    const sz=SZM[cl||lv];
    const si=rnd(HL.length-sz);
    const slice = HL.slice(si, si+sz);
    setGame({si,sz,items:shuf(slice),target:slice,placed:[]});
    setWrong(null);
    spk("סדרי את האותיות לפי הסדר");
  }, [lv]);

  useEffect(()=>init(),[init]);

  const pick=(e: any, it: any)=>{
    const nextIdx = game.placed.length;
    if(it.l === game.target[nextIdx].l){
      const newPlaced = [...game.placed, it];
      setGame((g: any)=>({...g, items: g.items.filter((x: any)=>x.l!==it.l), placed: newPlaced}));
      addStar(e);
      spk(it.n);
      if(newPlaced.length === game.sz){
        spk("כל הכבוד! סידרת הכל!");
        setTimeout(()=>init(),2500);
      }
    } else {
      setWrong(it.l);
      spk("לא זה, נסי שוב");
      setTimeout(()=>setWrong(null),500);
    }
  };

  if(!game)return null;
  return (
    <div style={{padding:"16px 12px",textAlign:"center",animation:"fi .4s"}}>
      <Back go={go}/>
      <h2 style={{color:"#b77fe8",fontSize:22,margin:"4px 0 10px"}}>🔡 סדרי אותיות</h2>
      <LvlPick lv={lv} set={l=>{setLv(l);}}/>
      <div style={{display:"flex",gap:6,justifyContent:"center",minHeight:60,background:"#f8f0ff",borderRadius:18,padding:10,marginBottom:16,border:"2px dashed #dcb3ff"}}>
        {game.placed.map((x: any,i: number)=>(
          <div key={i} style={{width:42,height:42,background:"#b77fe8",color:"#fff",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,animation:"pp .3s"}}>
            {x.l}
          </div>
        ))}
        {Array(game.sz-game.placed.length).fill(0).map((_,i)=>(
          <div key={i} style={{width:42,height:42,background:"#fff",border:"2px solid #e0c8ff",borderRadius:10}}/>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
        {game.items.map((it: any)=>(
          <button key={it.l} onClick={e=>pick(e,it)}
            style={{width:54,height:54,borderRadius:12,fontSize:26,fontWeight:900,
              background:"#fff",color:"#b77fe8",border:`3px solid ${wrong===it.l?"#ff7b7b":"#dcb3ff"}`,
              animation:wrong===it.l?"sk .4s":""}}>
            {it.l}
          </button>
        ))}
      </div>
      <button onClick={()=>init()} style={bs("#b77fe8","#fff",14,{marginTop:20})}>משחק חדש 🔄</button>
    </div>
  );
}

// ── SortN ─────────────────────────────────────────────────────────────────────
function SortN({go,addStar}: {go: (p: string) => void, addStar: (e: any) => void}){
  const [lv,setLv]=useState("easy");
  const [game,setGame]=useState<any>(null);
  const [wrong,setWrong]=useState<number | null>(null);
  const SZM: any={easy:3,med:5,hard:7};

  const init=useCallback((cl?: string)=>{
    const sz=SZM[cl||lv];
    const si=rnd(10-sz);
    const slice = Array.from({length:sz},(_,i)=>si+i+1);
    setGame({si,sz,items:shuf(slice),target:slice,placed:[]});
    setWrong(null);
    spk("סדרי את המספרים מהקטן לגדול");
  }, [lv]);

  useEffect(()=>init(),[init]);

  const pick=(e: any, n: number)=>{
    const nextVal = game.target[game.placed.length];
    if(n === nextVal){
      const newPlaced = [...game.placed, n];
      setGame((g: any)=>({...g, items: g.items.filter((x: any)=>x!==n), placed: newPlaced}));
      addStar(e);
      spk(String(n));
      if(newPlaced.length === game.sz){
        spk("מצוין! כל המספרים במקום!");
        setTimeout(()=>init(),2500);
      }
    } else {
      setWrong(n);
      spk("לא זה, נסי שוב");
      setTimeout(()=>setWrong(null),500);
    }
  };

  if(!game)return null;
  return (
    <div style={{padding:"16px 12px",textAlign:"center",animation:"fi .4s"}}>
      <Back go={go}/>
      <h2 style={{color:"#3ec9c9",fontSize:22,margin:"4px 0 10px"}}>📶 סדרי מספרים</h2>
      <LvlPick lv={lv} set={l=>{setLv(l);}}/>
      <div style={{display:"flex",gap:6,justifyContent:"center",minHeight:60,background:"#f0ffff",borderRadius:18,padding:10,marginBottom:16,border:"2px dashed #a8e6e6"}}>
        {game.placed.map((n: number,i: number)=>(
          <div key={i} style={{width:42,height:42,background:"#3ec9c9",color:"#fff",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,animation:"pp .3s"}}>
            {n}
          </div>
        ))}
        {Array(game.sz-game.placed.length).fill(0).map((_,i)=>(
          <div key={i} style={{width:42,height:42,background:"#fff",border:"2px solid #c8f0f0",borderRadius:10}}/>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
        {game.items.map((n: number)=>(
          <button key={n} onClick={e=>pick(e,n)}
            style={{width:54,height:54,borderRadius:12,fontSize:26,fontWeight:900,
              background:"#fff",color:"#3ec9c9",border:`3px solid ${wrong===n?"#ff7b7b":"#a8e6e6"}`,
              animation:wrong===n?"sk .4s":""}}>
            {n}
          </button>
        ))}
      </div>
      <button onClick={()=>init()} style={bs("#3ec9c9","#fff",14,{marginTop:20})}>משחק חדש 🔄</button>
    </div>
  );
}

// ── Exam ──────────────────────────────────────────────────────────────────────
function Exam({go,addStar}: {go: (p: string) => void, addStar: (e: any) => void}){
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [ans, setAns] = useState<any>(null);
  const [fb, setFb] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const genQuestions = useCallback(() => {
    const qs = [];
    for(let i=0; i<15; i++){
      const type = rnd(4); // 0: Letter, 1: Math, 2: Word, 3: Count
      if(type === 0){
        const c = HL[rnd(HL.length)];
        const s = new Set([c.l]);
        while(s.size<4) s.add(HL[rnd(HL.length)].l);
        qs.push({ type: "letter", q: c.n, c: c.l, opts: shuf([...s]), audio: c.n });
      } else if(type === 1){
        const a = rnd(10)+1; const b = rnd(10)+1;
        const op = Math.random() > 0.5 ? "+" : "-";
        const c = op === "+" ? a+b : Math.max(1, a-b);
        const finalA = op === "+" ? a : Math.max(a, b);
        const finalB = op === "+" ? b : Math.min(a, b);
        const finalC = op === "+" ? finalA+finalB : finalA-finalB;
        const s = new Set([finalC]);
        while(s.size<4) s.add(rnd(20)+1);
        qs.push({ type: "math", q: `${finalA} ${op} ${finalB} = ?`, c: finalC, opts: shuf([...s]), audio: `כמה זה ${finalA} ${op==="+"?"ועוד":"פחות"} ${finalB}` });
      } else if(type === 2){
        const l = WKEYS[rnd(WKEYS.length)];
        const word = WG[l as keyof typeof WG][rnd(WG[l as keyof typeof WG].length)];
        const s = new Set([l]);
        while(s.size<4) s.add(WKEYS[rnd(WKEYS.length)]);
        qs.push({ type: "word", q: word.e, text: `_ ${word.w.slice(1)}`, c: l, opts: shuf([...s]), audio: word.w });
      } else {
        const n = rnd(10)+1;
        const s = new Set([n]);
        while(s.size<4) s.add(rnd(10)+1);
        qs.push({ type: "count", q: n, c: n, opts: shuf([...s]), audio: "כמה יש כאן?" });
      }
    }
    setQuestions(qs);
    setQIdx(0);
    setScore(0);
    setFinished(false);
    setAns(null);
    setFb(null);
  }, []);

  useEffect(() => { genQuestions(); }, [genQuestions]);

  const pick = (e: any, o: any) => {
    if(ans !== null) return;
    setAns(o);
    const q = questions[qIdx];
    const ok = o === q.c;
    if(ok) {
      setScore(s => s+1);
      addStar(e);
      setFb("✅ נכון!");
      spk("מצוין");
    } else {
      setFb(`❌ לא נכון`);
      spk("לא נורא");
    }

    setTimeout(() => {
      if(qIdx < questions.length - 1){
        setQIdx(i => i+1);
        setAns(null);
        setFb(null);
      } else {
        setFinished(true);
        spk(`סיימת את המבחן! הציון שלך הוא ${score + (ok?1:0)} מתוך 15`);
      }
    }, 1500);
  };

  if(finished) {
    return (
      <div style={{padding:"20px", textAlign:"center", animation:"fi .5s"}}>
        <Back go={go}/>
        <div style={{fontSize:80}}>🏆</div>
        <h2 style={{fontSize:32, color:"#f9d423", fontWeight:900}}>כל הכבוד!</h2>
        <div style={{fontSize:24, margin:"20px 0"}}>הציון שלך: {score} / 15</div>
        <div style={{fontSize:40, marginBottom:20}}>
          {score === 15 ? "👑 מושלם!" : score > 10 ? "🌟 מעולה!" : "👍 יפה מאוד!"}
        </div>
        <button onClick={genQuestions} style={bs("#f9d423", "#fff", 18, {padding:"12px 30px"})}>מבחן חדש 🔄</button>
      </div>
    );
  }

  const q = questions[qIdx];
  if(!q) return null;

  return (
    <div style={{padding:"16px 12px", textAlign:"center", animation:"fi .4s"}}>
      <Back go={go}/>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
        <span style={{color:"#f9d423", fontWeight:800}}>שאלה {qIdx+1} מתוך 15</span>
        <div style={{width:100, height:8, background:"#eee", borderRadius:4}}>
          <div style={{width:`${((qIdx+1)/15)*100}%`, height:"100%", background:"#f9d423", borderRadius:4, transition:"width .3s"}}/>
        </div>
      </div>

      <div style={{background:"#fffbe6", border:"3px solid #f9d423", borderRadius:24, padding:"20px", maxWidth:300, margin:"0 auto 20px"}}>
        {q.type === "letter" && <div style={{fontSize:80, fontWeight:900, color:"#e05fa0"}}>{q.c}</div>}
        {q.type === "math" && <div style={{fontSize:40, fontWeight:900, color:"#2d8a40"}}>{q.q}</div>}
        {q.type === "word" && (
          <>
            <div style={{fontSize:70}}>{q.q}</div>
            <div style={{fontSize:24, fontWeight:800, color:"#ff7b7b"}}>{q.text}</div>
          </>
        )}
        {q.type === "count" && (
          <div style={{fontSize:30}}>
            {Array(q.q).fill(0).map((_,i)=><span key={i}>{EMOS[(q.q-1)%EMOS.length]}</span>)}
          </div>
        )}
        <div style={{marginTop:10}}><Spk t={q.audio}/></div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, maxWidth:300, margin:"0 auto"}}>
        {q.opts.map((o: any, i: number)=>(
          <button key={i} onClick={e=>pick(e, o)}
            style={{fontSize:24, fontWeight:900, padding:"14px", borderRadius:16,
              background:ans===null ? "#fff" : o===q.c ? "#6bcb77" : o===ans ? "#ff7b7b" : "#f5f5f5",
              color:ans!==null && (o===q.c || o===ans) ? "#fff" : "#f9d423",
              border:`3px solid ${ans!==null && o===q.c ? "#2d8a40" : "#f9d423"}`}}>
            {o}
          </button>
        ))}
      </div>
      {fb && <div style={{fontSize:22, fontWeight:800, marginTop:15, animation:"pp .3s", color:fb.includes("✅")?"#2d8a40":"#e05fa0"}}>{fb}</div>}
    </div>
  );
}

// ── Words ─────────────────────────────────────────────────────────────────────
function Words({go,addStar}: {go: (p: string) => void, addStar: (e: any) => void}){
  const [q,setQ]=useState<any>(null);
  const [ans,setAns]=useState<string | null>(null);
  const [fb,setFb]=useState<string | null>(null);

  const next=useCallback(()=>{
    const letter = WKEYS[rnd(WKEYS.length)];
    const wordArr = (WG as any)[letter];
    const correct = wordArr[rnd(wordArr.length)];
    const opts = new Set([letter]);
    while(opts.size<4) opts.add(WKEYS[rnd(WKEYS.length)]);
    setQ({correct, opts:shuf([...opts])});
    setAns(null);setFb(null);
    spk(`באיזו אות מתחילה המילה ${correct.w}?`);
  }, []);

  useEffect(()=>next(),[next]);

  const pick=(e: any, l: string)=>{
    if(ans)return;
    setAns(l);
    const ok = l === q.correct.w[0];
    setFb(ok?"מצוין! נכון!":"לא בדיוק, נסי שוב");
    if(ok){
      addStar(e);
      spk("מצוין! נכון מאוד!");
      setTimeout(next,2500);
    } else {
      spk("לא זה, נסי שוב");
      setTimeout(()=>setAns(null),1000);
    }
  };

  if(!q)return null;
  return (
    <div style={{padding:"16px 12px",textAlign:"center",animation:"fi .4s"}}>
      <Back go={go}/>
      <h2 style={{color:"#ff7b7b",fontSize:22,margin:"4px 0 10px"}}>🖼️ מה מתחיל ב?</h2>
      <div style={{background:"#fff5f5",border:"3px solid #ffcaca",borderRadius:24,padding:"20px",maxWidth:260,margin:"0 auto 16px",boxShadow:"0 8px 20px #ff7b7b22"}}>
        <div style={{fontSize:80,marginBottom:10}}>{q.correct.e}</div>
        <div style={{fontSize:32,fontWeight:900,color:"#ff7b7b"}}>_ {q.correct.w.slice(1)}</div>
        <div style={{marginTop:10}}><Spk t={q.correct.w}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:300,margin:"0 auto"}}>
        {q.opts.map((l: string)=>(
          <button key={l} onClick={e=>pick(e,l)}
            style={{fontSize:36,fontWeight:900,padding:"12px",borderRadius:16,
              background:ans===l?(l===q.correct.w[0]?"#6bcb77":"#ff7b7b"):"#fff",
              color:ans===l?"#fff":"#ff7b7b",
              border:`3px solid ${ans===l?(l===q.correct.w[0]?"#2d8a40":"#e05fa0"):"#ffcaca"}`}}>
            {l}
          </button>
        ))}
      </div>
      {fb&&<div style={{fontSize:20,fontWeight:800,marginTop:12,color:fb.includes("מצוין")?"#2d8a40":"#e05fa0"}}>{fb}</div>}
      <button onClick={next} style={bs("#ff7b7b","#fff",15,{marginTop:15})}>מילה חדשה 🔄</button>
    </div>
  );
}

