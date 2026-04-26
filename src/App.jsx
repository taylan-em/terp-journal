import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import appIcon from '../public/icon-512.svg'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const METHODS = [
  { id:"joint",     emoji:"🚬", label:"Joint",      unit:"g",    min:0.1,  max:3,   step:0.1,  def:0.5  },
  { id:"blunt",     emoji:"🍂", label:"Blunt",      unit:"g",    min:0.5,  max:5,   step:0.1,  def:1    },
  { id:"pipe",      emoji:"🪈", label:"Pipe",       unit:"g",    min:0.1,  max:2,   step:0.1,  def:0.3  },
  { id:"bong",      emoji:"🫧", label:"Bong",       unit:"g",    min:0.1,  max:2,   step:0.1,  def:0.3  },
  { id:"dryvape",   emoji:"🌬️", label:"Dry Vape",   unit:"g",    min:0.05, max:1,   step:0.05, def:0.15 },
  { id:"resinvape", emoji:"🛢️", label:"Resin Vape", unit:"puffs",min:1,    max:30,  step:1,    def:3    },
  { id:"dab",       emoji:"🧪", label:"Dab",        unit:"g",    min:0.05, max:1,   step:0.05, def:0.1  },
  { id:"edible",    emoji:"🍫", label:"Edible",     unit:"mg",   min:2.5,  max:100, step:2.5,  def:10   },
  { id:"tincture",  emoji:"💧", label:"Tincture",   unit:"ml",   min:0.5,  max:10,  step:0.5,  def:1    },
];

const EFFECTS = ["Relaxed","Euphoric","Happy","Creative","Focused","Sleepy","Uplifted","Energetic","Calm","Hungry","Talkative","Giggly"];

const FLAVOR_FAMILIES = [
  { id:"fruit",   label:"Fruit",   color:"#fb923c", dot:"🟠", flavors:["Berry","Citrus","Mango","Grape","Cherry","Lemon","Tropical","Peach"] },
  { id:"earth",   label:"Earth",   color:"#a78a5a", dot:"🟤", flavors:["Earthy","Woody","Hash","Pine","Cedar","Leather"] },
  { id:"sweet",   label:"Sweet",   color:"#f472b6", dot:"🩷", flavors:["Sweet","Vanilla","Candy","Honey","Cake","Caramel"] },
  { id:"pungent", label:"Pungent", color:"#a3e635", dot:"🟢", flavors:["Diesel","Skunk","Cheese","Fuel","Chemical"] },
  { id:"spice",   label:"Spice",   color:"#f87171", dot:"🔴", flavors:["Spice","Pepper","Herbal","Floral","Lavender","Sage","Mint"] },
];

const PHYSICAL_CORE = [
  { id:"pain",    label:"Pain Relief",   icon:"🩹" },
  { id:"sleep",   label:"Sleep",         icon:"😴" },
  { id:"energy",  label:"Energy",        icon:"⚡" },
  { id:"nausea",  label:"Nausea",        icon:"🤢" },
  { id:"tension", label:"Tension",       icon:"💪" },
  { id:"appetite",label:"Appetite",      icon:"🍽️" },
];
const PHYSICAL_MEDICAL = [
  { id:"chronic_pain",  label:"Chronic Pain",   icon:"🦴" },
  { id:"inflammation",  label:"Inflammation",   icon:"🔥" },
  { id:"headache",      label:"Migraine",       icon:"🤕" },
  { id:"neuropathy",    label:"Nerve Pain",     icon:"🫀" },
  { id:"spasms",        label:"Spasms",         icon:"⚡" },
  { id:"chemo_nausea",  label:"Chemo Nausea",   icon:"💊" },
  { id:"ibs",           label:"IBS / Gut",      icon:"🫁" },
  { id:"epilepsy",      label:"Seizures",       icon:"🧬" },
  { id:"fibromyalgia",  label:"Fibromyalgia",   icon:"🩻" },
  { id:"arthritis",     label:"Arthritis",      icon:"🦾" },
];
const MENTAL_CORE = [
  { id:"anxiety",    label:"Anxiety",    icon:"🧘" },
  { id:"stress",     label:"Stress",     icon:"😮‍💨" },
  { id:"mood",       label:"Mood",       icon:"🌤️" },
  { id:"focus",      label:"Focus",      icon:"🎯" },
  { id:"creativity", label:"Creativity", icon:"🎨" },
  { id:"social",     label:"Social",     icon:"🤝" },
];
const MENTAL_MEDICAL = [
  { id:"ptsd",       label:"PTSD",        icon:"🛡️" },
  { id:"depression", label:"Depression",  icon:"🌧️" },
  { id:"bipolar",    label:"Bipolar",     icon:"⚖️" },
  { id:"ocd",        label:"OCD",         icon:"🔄" },
  { id:"adhd",       label:"ADHD",        icon:"🎯" },
  { id:"insomnia",   label:"Insomnia",    icon:"🌙" },
  { id:"panic",      label:"Panic",       icon:"💨" },
  { id:"paranoia",   label:"Paranoia",    icon:"👁️" },
];
const PHYSICAL_FACTORS = [...PHYSICAL_CORE, ...PHYSICAL_MEDICAL];
const MENTAL_FACTORS   = [...MENTAL_CORE,   ...MENTAL_MEDICAL];

const RATINGS = [
  { id:"overall",    label:"Overall",  icon:"⭐", color:"#f59e0b" },
  { id:"taste",      label:"Taste",    icon:"👅", color:"#fb923c" },
  { id:"potency",    label:"Potency",  icon:"⚡", color:"#a78bfa" },
  { id:"smoothness", label:"Smooth",   icon:"🌫️", color:"#67e8f9" },
  { id:"effect",     label:"Effect",   icon:"🧠", color:"#6ee7b7" },
  { id:"value",      label:"Value",    icon:"💰", color:"#fde68a" },
];

const MOODS       = ["😔","😐","🙂","😊","🌟"];
const MOOD_LABELS = ["Low","Meh","Okay","Good","Amazing"];

const STRAIN_DB = [
  { name:"Blue Dream",          type:"Hybrid", thc:21, cbd:2,  effects:["Relaxed","Happy","Creative"],   flavors:["Berry","Sweet","Earthy"],    description:"Balanced. Gentle cerebral lift." },
  { name:"OG Kush",             type:"Hybrid", thc:23, cbd:0,  effects:["Euphoric","Relaxed","Happy"],   flavors:["Earthy","Woody","Pine"],      description:"Classic. Deep euphoria and calm." },
  { name:"Sour Diesel",         type:"Sativa", thc:26, cbd:0,  effects:["Energetic","Happy","Uplifted"], flavors:["Diesel","Citrus","Earthy"],   description:"Sharp energy. Fast cerebral hit." },
  { name:"Granddaddy Purple",   type:"Indica", thc:17, cbd:1,  effects:["Relaxed","Sleepy","Happy"],     flavors:["Grape","Berry","Sweet"],      description:"Deep relaxation. Sleep aid." },
  { name:"Wedding Cake",        type:"Hybrid", thc:25, cbd:0,  effects:["Relaxed","Euphoric","Happy"],   flavors:["Sweet","Vanilla","Earthy"],   description:"Rich, creamy. Heavy euphoria." },
  { name:"Girl Scout Cookies",  type:"Hybrid", thc:28, cbd:0,  effects:["Euphoric","Happy","Relaxed"],   flavors:["Sweet","Earthy","Mint"],      description:"Powerful euphoria. Full-body." },
  { name:"Gorilla Glue #4",     type:"Hybrid", thc:27, cbd:0,  effects:["Relaxed","Euphoric","Sleepy"],  flavors:["Earthy","Pine","Woody"],      description:"Heavy relaxation. Couch-lock." },
  { name:"Jack Herer",          type:"Sativa", thc:18, cbd:0,  effects:["Energetic","Creative","Happy"], flavors:["Pine","Earthy","Spice"],      description:"Clear-headed. Creative spark." },
  { name:"Northern Lights",     type:"Indica", thc:18, cbd:0,  effects:["Relaxed","Sleepy","Happy"],     flavors:["Earthy","Sweet","Pine"],      description:"Classic indica. Night time." },
  { name:"Pineapple Express",   type:"Hybrid", thc:19, cbd:0,  effects:["Happy","Energetic","Creative"], flavors:["Tropical","Citrus","Pine"],   description:"Tropical. Long-lasting energy." },
  { name:"White Widow",         type:"Hybrid", thc:20, cbd:0,  effects:["Happy","Euphoric","Creative"],  flavors:["Earthy","Woody","Floral"],    description:"Burst of euphoria and energy." },
  { name:"Green Crack",         type:"Sativa", thc:24, cbd:0,  effects:["Energetic","Focused","Happy"],  flavors:["Citrus","Earthy","Mango"],    description:"Sharp daytime focus." },
  { name:"Zkittlez",            type:"Indica", thc:23, cbd:0,  effects:["Relaxed","Happy","Euphoric"],   flavors:["Tropical","Berry","Citrus"],  description:"Fruity. Calming body high." },
  { name:"Runtz",               type:"Hybrid", thc:29, cbd:0,  effects:["Euphoric","Happy","Relaxed"],   flavors:["Candy","Sweet","Tropical"],   description:"Smooth. Potent euphoria." },
  { name:"Gelato",              type:"Hybrid", thc:26, cbd:0,  effects:["Happy","Relaxed","Euphoric"],   flavors:["Sweet","Earthy","Citrus"],    description:"Dessert flavour. Balanced." },
  { name:"Ice Cream Cake",      type:"Indica", thc:25, cbd:0,  effects:["Relaxed","Sleepy","Euphoric"],  flavors:["Vanilla","Sweet","Cake"],     description:"Sweet. Deep sedation." },
  { name:"Mimosa",              type:"Hybrid", thc:30, cbd:0,  effects:["Happy","Energetic","Uplifted"], flavors:["Citrus","Tropical","Sweet"],  description:"Bright citrus. Uplifting." },
  { name:"Mac 1",               type:"Hybrid", thc:23, cbd:0,  effects:["Happy","Relaxed","Euphoric"],   flavors:["Floral","Earthy","Citrus"],   description:"Creamy, balanced. Sought after." },
  { name:"Durban Poison",       type:"Sativa", thc:20, cbd:0,  effects:["Energetic","Happy","Creative"], flavors:["Sweet","Pine","Earthy"],      description:"African sativa. Uplifting." },
  { name:"Bubba Kush",          type:"Indica", thc:22, cbd:0,  effects:["Relaxed","Sleepy","Happy"],     flavors:["Earthy","Sweet","Woody"],     description:"Heavy tranquillising effects." },
  { name:"Purple Punch",        type:"Indica", thc:20, cbd:0,  effects:["Relaxed","Sleepy","Happy"],     flavors:["Grape","Berry","Sweet"],      description:"Sweet sedation. Night time." },
  { name:"Sunset Sherbet",      type:"Hybrid", thc:21, cbd:0,  effects:["Happy","Relaxed","Creative"],   flavors:["Sweet","Berry","Citrus"],     description:"Fruity, balanced buzz." },
  { name:"Chemdawg",            type:"Hybrid", thc:19, cbd:0,  effects:["Relaxed","Euphoric","Happy"],   flavors:["Diesel","Chemical","Earthy"], description:"Cerebral. Heavy diesel." },
  { name:"Amnesia Haze",        type:"Sativa", thc:21, cbd:0,  effects:["Energetic","Happy","Uplifted"], flavors:["Citrus","Earthy","Sweet"],    description:"Uplifting citrus haze." },
  { name:"Lemon Haze",          type:"Hybrid", thc:20, cbd:0,  effects:["Happy","Energetic","Uplifted"], flavors:["Lemon","Citrus","Sweet"],     description:"Bright lemon. Uplifting." },
  { name:"Do-Si-Dos",           type:"Indica", thc:28, cbd:0,  effects:["Relaxed","Sleepy","Euphoric"],  flavors:["Sweet","Earthy","Floral"],    description:"Potent. Fast-acting." },
  { name:"Forbidden Fruit",     type:"Indica", thc:26, cbd:0,  effects:["Relaxed","Sleepy","Happy"],     flavors:["Cherry","Citrus","Tropical"], description:"Tropical cherry. Sedating." },
  { name:"Biscotti",            type:"Indica", thc:25, cbd:0,  effects:["Relaxed","Euphoric","Happy"],   flavors:["Sweet","Earthy","Diesel"],    description:"Rich cookies flavour. Heavy." },
  { name:"Skywalker OG",        type:"Indica", thc:26, cbd:0,  effects:["Relaxed","Sleepy","Happy"],     flavors:["Earthy","Pine","Spice"],      description:"Deep relaxation. Evening." },
  { name:"Bruce Banner",        type:"Hybrid", thc:29, cbd:0,  effects:["Euphoric","Happy","Creative"],  flavors:["Sweet","Earthy","Diesel"],    description:"Intense cerebral rush." },
  { name:"Harlequin",           type:"Sativa", thc:10, cbd:15, effects:["Relaxed","Focused","Happy"],    flavors:["Earthy","Sweet","Mango"],     description:"High CBD. Clear-headed." },
  { name:"ACDC",                type:"Hybrid", thc:6,  cbd:20, effects:["Relaxed","Calm","Focused"],     flavors:["Earthy","Pine","Woody"],      description:"Very high CBD. Minimal high." },
  { name:"Tangie",              type:"Sativa", thc:22, cbd:0,  effects:["Happy","Creative","Energetic"], flavors:["Citrus","Tropical","Sweet"],  description:"Tangerine flavour. Creative." },
  { name:"Cherry Pie",          type:"Hybrid", thc:20, cbd:0,  effects:["Happy","Euphoric","Relaxed"],   flavors:["Cherry","Berry","Sweet"],     description:"Sweet cherry. Balanced." },
  { name:"Blueberry",           type:"Indica", thc:20, cbd:0,  effects:["Relaxed","Happy","Sleepy"],     flavors:["Berry","Sweet","Earthy"],     description:"Classic. Sweet blueberry." },
  { name:"Stardawg",            type:"Hybrid", thc:22, cbd:0,  effects:["Happy","Energetic","Uplifted"], flavors:["Diesel","Earthy","Pine"],     description:"Chemical-diesel. Uplifting." },
  { name:"Mochi",               type:"Hybrid", thc:29, cbd:0,  effects:["Relaxed","Happy","Euphoric"],   flavors:["Sweet","Earthy","Floral"],    description:"Creamy sweet. Potent." },
  { name:"Jealousy",            type:"Hybrid", thc:29, cbd:0,  effects:["Euphoric","Relaxed","Happy"],   flavors:["Sweet","Earthy","Candy"],     description:"Seed Junky classic. Balanced." },
  { name:"Gary Payton",         type:"Hybrid", thc:25, cbd:0,  effects:["Euphoric","Focused","Happy"],   flavors:["Earthy","Pepper","Sweet"],    description:"Peppery, cerebral, calming." },
  { name:"Kosher Kush",         type:"Indica", thc:29, cbd:0,  effects:["Relaxed","Sleepy","Euphoric"],  flavors:["Earthy","Woody","Pine"],      description:"Exceptionally potent. Sedating." },
  { name:"Permanent Marker",    type:"Hybrid", thc:30, cbd:0,  effects:["Euphoric","Relaxed","Creative"],flavors:["Fuel","Sweet","Earthy"],      description:"Pungent fuel. Heavy hitter." },
  { name:"Banana Runtz",        type:"Hybrid", thc:27, cbd:0,  effects:["Euphoric","Relaxed","Happy"],   flavors:["Tropical","Sweet","Candy"],   description:"Banana candy. Potent." },
  { name:"Papaya",              type:"Indica", thc:25, cbd:0,  effects:["Relaxed","Happy","Sleepy"],     flavors:["Tropical","Mango","Sweet"],   description:"Tropical. Deeply calming." },
  { name:"Crescendo",           type:"Hybrid", thc:32, cbd:0,  effects:["Euphoric","Relaxed","Creative"],flavors:["Diesel","Sweet","Earthy"],    description:"Extremely potent. Complex." },
];

const typeColor = t => t==="Indica"?"#a78bfa":t==="Sativa"?"#fbbf24":"#34d399";
const typeBg    = t => t==="Indica"?"#1e1b4b":t==="Sativa"?"#431407":"#022c22";
const typeGlow  = t => t==="Indica"?"#a78bfa33":t==="Sativa"?"#fbbf2433":"#34d39933";

const mkForm = () => ({
  strain:"", method:"joint", amount:0.5,
  moodBefore:2, moodAfter:2,
  effects:[], flavors:[],
  ratings:{ overall:7, taste:7, potency:5, smoothness:7, effect:7, value:7 },
  physical: Object.fromEntries(PHYSICAL_FACTORS.map(f=>[f.id,0])),
  mental:   Object.fromEntries(MENTAL_FACTORS.map(f=>[f.id,0])),
  physicalNotes:"", mentalNotes:"", notes:"",
  brand:"", source:"", batchId:"", purchaseDate:"",
  date: new Date().toISOString().slice(0,16), intensity:5,
});

// ─── QUICK TIPS PER STEP ─────────────────────────────────────────────────────
const STEP_HINTS = [
  "Start by picking your strain — type to search 40+ strains instantly",
  "How'd you consume it? Tap your method and dial in the amount",
  "How were you feeling going in? Be honest — this makes insights useful",
  "Which effects hit? These build your personal strain fingerprint",
  "Rate it across what matters — your taste might differ from everyone else's",
  "Optional: how did it affect your body and mind? This is where it gets powerful",
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const Tag = ({ label, active, color="#a3e635", bg, onClick, size=11 }) => (
  <button onClick={onClick} style={{
    padding:`${size>10?"6px 12px":"4px 9px"}`, borderRadius:20,
    border:`1.5px solid ${active?color:"#2a3a2a"}`,
    background: active?(bg||color+"22"):"transparent",
    color: active?color:"#4a6a4a",
    fontSize:size, cursor:"pointer", fontFamily:"system-ui,sans-serif",
    fontWeight: active?600:400,
    transition:"all 0.15s", whiteSpace:"nowrap",
    boxShadow: active?`0 0 10px ${color}22`:undefined,
  }}>{label}</button>
);

const BigMoodBtn = ({ emoji, label, active, onClick }) => (
  <button onClick={onClick} style={{
    flex:1, padding:"10px 4px", borderRadius:12,
    border:`2px solid ${active?"#f59e0b":"#1a2a1a"}`,
    background: active?"#2a1f00":"#0d1a0d",
    cursor:"pointer", textAlign:"center", transition:"all 0.15s",
    transform: active?"scale(1.05)":"scale(1)",
  }}>
    <div style={{ fontSize:24, marginBottom:2 }}>{emoji}</div>
    <div style={{ fontSize:9, color:active?"#f59e0b":"#3a5a3a", fontWeight:active?600:400 }}>{label}</div>
  </button>
);

const Slider = ({ label, icon, value, onChange, min=1, max=10, step=1, color="#a3e635" }) => {
  const pct = ((value-min)/(max-min))*100;
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ fontSize:13, color:"#8aaa7a", display:"flex", alignItems:"center", gap:6 }}>
          <span>{icon}</span>{label}
        </span>
        <span style={{ fontSize:20, fontWeight:700, color, fontFamily:"system-ui" }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(+e.target.value)}
        className="styled-slider"
        style={{ "--pct":`${pct}%`, "--col":color, width:"100%", display:"block", cursor:"pointer" }}/>
    </div>
  );
};

const BidirSlider = ({ icon, label, value, onChange, color }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
    <span style={{ fontSize:16, minWidth:22 }}>{icon}</span>
    <div style={{ flex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, color:"#6a8a6a" }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, fontFamily:"system-ui",
          color:value>0?color:value<0?"#f87171":"#2a4a2a" }}>
          {value===0?"—":value>0?`+${value}`:value}
        </span>
      </div>
      <div style={{ position:"relative", height:6, background:"#1a2a1a", borderRadius:3 }}>
        <div style={{ position:"absolute", left:"50%", top:0, height:"100%", borderRadius:3,
          width:`${Math.abs(value)/5*50}%`,
          marginLeft:value<0?`-${Math.abs(value)/5*50}%`:0,
          background:value>=0?`linear-gradient(90deg,${color}55,${color})`:"linear-gradient(90deg,#f87171,#f8717155)" }}/>
        <div style={{ position:"absolute", left:"50%", top:-2, width:2, height:10, background:"#2a4a2a", borderRadius:1 }}/>
        <input type="range" min={-5} max={5} value={value} onChange={e=>onChange(+e.target.value)}
          style={{ position:"absolute", left:0, right:0, top:-10, bottom:-10, width:"100%", height:"calc(100% + 20px)", opacity:0, cursor:"pointer", zIndex:10 }}/>
      </div>
    </div>
  </div>
);

// Progress dots for wizard
const StepDots = ({ current, total, onGo }) => (
  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
    {Array.from({length:total},(_,i)=>(
      <button key={i} onClick={()=>onGo(i)} style={{
        width: i===current?20:8, height:8, borderRadius:4, border:"none", cursor:"pointer",
        background: i<current?"#34d399":i===current?"#a3e635":"#1a2a1a",
        transition:"all 0.25s",
      }}/>
    ))}
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,      setTab]      = useState("home");
  const [sessions, setSessions] = useState(()=>{ try{return JSON.parse(localStorage.getItem("tj5_s")||"[]")}catch{return []} });
  const [custom,   setCustom]   = useState(()=>{ try{return JSON.parse(localStorage.getItem("tj5_c")||"[]")}catch{return []} });

  // Log wizard
  const [step,     setStep]     = useState(0);
  const [form,     setForm]     = useState(mkForm());
  const [saved,    setSaved]    = useState(false); // success flash

  // Strain search
  const [sq,       setSq]       = useState("");
  const [sdrop,    setSdrop]    = useState(false);
  const [aiRes,    setAiRes]    = useState([]);
  const [aiLoad,   setAiLoad]   = useState(false);
  const searchRef  = useRef(null);
  const aiTimer    = useRef(null);

  // Wellbeing expanders
  const [showPhysMed, setShowPhysMed] = useState(false);
  const [showMentMed, setShowMentMed] = useState(false);

  // Session expand
  const [expandedId, setExpandedId] = useState(null);

  // Manual add strain
  const [addingStrain, setAddingStrain] = useState(false);
  const [newS, setNewS] = useState({name:"",type:"Hybrid",thc:"",cbd:"",description:""});

  useEffect(()=>{ localStorage.setItem("tj5_s", JSON.stringify(sessions)); },[sessions]);
  useEffect(()=>{ localStorage.setItem("tj5_c", JSON.stringify(custom));   },[custom]);

  useEffect(()=>{
    const h=e=>{ if(searchRef.current&&!searchRef.current.contains(e.target)) setSdrop(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const allStrains = [...STRAIN_DB, ...custom.filter(c=>!STRAIN_DB.find(d=>d.name.toLowerCase()===c.name.toLowerCase()))];

  const localMatches = sq.length>=1
    ? allStrains.filter(s=>
        s.name.toLowerCase().includes(sq.toLowerCase()) ||
        s.type.toLowerCase().includes(sq.toLowerCase()) ||
        s.effects?.some(e=>e.toLowerCase().includes(sq.toLowerCase()))
      ).slice(0,5) : [];

  const tryAI = useCallback(async(q)=>{
    setAiLoad(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:500,
          system:`Cannabis strain DB. Return ONLY raw JSON array, no markdown. Up to 3 strains. Each: name, type("Indica"|"Sativa"|"Hybrid"), thc(number), cbd(number), effects(array 3), flavors(array 3), description(max 8 words).`,
          messages:[{role:"user",content:q}] })
      });
      const d = await r.json();
      const txt = d.content?.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      setAiRes(JSON.parse(txt)||[]);
    } catch { setAiRes([]); }
    setAiLoad(false);
  },[]);

  const onSQ = v => {
    setSq(v); setAiRes([]); setSdrop(true);
    clearTimeout(aiTimer.current);
    if(v.length>=3 && allStrains.filter(s=>s.name.toLowerCase().includes(v.toLowerCase())).length<2)
      aiTimer.current = setTimeout(()=>tryAI(v),800);
  };

  const pickStrain = s => {
    if(!STRAIN_DB.find(x=>x.name.toLowerCase()===s.name.toLowerCase()) &&
       !custom.find(x=>x.name.toLowerCase()===s.name.toLowerCase()))
      setCustom(p=>[s,...p]);
    setForm(f=>({...f,strain:s.name}));
    setSq(""); setSdrop(false); setAiRes([]);
  };

  const dropList = [...localMatches, ...aiRes.filter(r=>!localMatches.find(l=>l.name.toLowerCase()===r.name.toLowerCase()))];
  const curMethod = METHODS.find(m=>m.id===form.method)||METHODS[0];
  const curStrain = allStrains.find(s=>s.name===form.strain);

  const toggle = (key,val) => setForm(f=>({...f,[key]:f[key].includes(val)?f[key].filter(x=>x!==val):[...f[key],val]}));

  const saveSession = () => {
    setSessions(p=>[{...form,id:Date.now()},...p]);
    setSaved(true);
    setTimeout(()=>{ setSaved(false); setForm(mkForm()); setStep(0); setTab("home"); },1500);
  };

  // Streak calculation
  const streak = (() => {
    if(!sessions.length) return 0;
    const days = [...new Set(sessions.map(s=>new Date(s.date).toDateString()))];
    let count=0, d=new Date();
    for(let i=0;i<30;i++){
      if(days.includes(d.toDateString())) { count++; d.setDate(d.getDate()-1); }
      else if(i===0) { d.setDate(d.getDate()-1); if(days.includes(d.toDateString())){ count++; d.setDate(d.getDate()-1); } else break; }
      else break;
    }
    return count;
  })();

  const lastSession = sessions[0];
  const recentStrains = [...new Set(sessions.slice(0,5).map(s=>s.strain))].filter(Boolean).slice(0,3);

  // Analytics
  const avgRating = sessions.length?(sessions.reduce((a,s)=>a+(s.ratings?.overall||0),0)/sessions.length).toFixed(1):"—";
  const strainNames = [...new Set(sessions.map(s=>s.strain))].filter(Boolean);
  const qualifiedStrains = strainNames.filter(n=>sessions.filter(s=>s.strain===n).length>=2);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  const C = { // colour tokens
    bg:"#080f09", card:"#0e1a0f", border:"#1c2e1c",
    accent:"#a3e635", accentDim:"#a3e63522",
    text:"#d4e8c2", muted:"#4a6a4a", faint:"#1e3020",
    amber:"#f59e0b", amberDim:"#f59e0b22",
  };

  return (
    <div style={{ minHeight:"100vh", maxWidth:480, margin:"0 auto", background:C.bg, color:C.text, fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* Ambient glow */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:"radial-gradient(ellipse 100% 40% at 50% 0%,#0d2b1a33,transparent)" }}/>

      {/* ── SUCCESS OVERLAY ── */}
      {saved && (
        <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center",
          background:"rgba(8,15,9,0.9)", backdropFilter:"blur(8px)" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:64, marginBottom:16, animation:"pop 0.4s ease" }}>✅</div>
            <div style={{ fontSize:22, fontWeight:700, color:C.accent }}>Session saved!</div>
            <div style={{ fontSize:14, color:C.muted, marginTop:6 }}>Your journal is growing 🌿</div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:C.bg+"f5",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`,
        padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src={appIcon} style={{ width:32, height:32, borderRadius:8 }} alt="Terp Journal"/>
          <div>
            <div style={{ fontSize:16, fontWeight:800, letterSpacing:"-0.02em", color:C.accent }}>Terp Journal</div>
            <div style={{ fontSize:10, color:C.muted }}>your cannabis companion</div>
          </div>
        </div>
        {streak>0 && (
          <div style={{ background:C.amberDim, border:`1px solid ${C.amber}44`, borderRadius:20, padding:"4px 10px",
            fontSize:12, color:C.amber, display:"flex", alignItems:"center", gap:4 }}>
            🔥 {streak} day streak
          </div>
        )}
      </header>

      {/* ── NAV ── */}
      <nav style={{ display:"flex", background:C.bg, borderBottom:`1px solid ${C.border}`, position:"sticky", top:57, zIndex:49 }}>
        {[{id:"home",e:"🏠",l:"Home"},{id:"log",e:"✦",l:"Log"},{id:"sessions",e:"📋",l:"History"},{id:"insights",e:"📊",l:"Insights"}].map(t=>(
          <button key={t.id} onClick={()=>{ setTab(t.id); if(t.id==="log"){setStep(0);} }} style={{
            flex:1, padding:"10px 4px", border:"none", cursor:"pointer", background:"transparent",
            borderBottom:tab===t.id?`2px solid ${C.accent}`:"2px solid transparent",
            color:tab===t.id?C.accent:C.muted, fontSize:9, letterSpacing:"0.05em",
            fontFamily:"system-ui", transition:"color 0.15s",
          }}>
            <div style={{ fontSize:16, marginBottom:1 }}>{t.e}</div>{t.l}
          </button>
        ))}
      </nav>

      <div style={{ position:"relative", zIndex:1, padding:"16px 14px 100px" }}>

        {/* ════════════════════════════════ HOME ══════════════════════════ */}
        {tab==="home" && (
          <div>
            {/* Welcome / empty state */}
            {sessions.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px" }}>
                <div style={{ fontSize:56, marginBottom:16 }}>🌿</div>
                <div style={{ fontSize:22, fontWeight:700, color:C.accent, marginBottom:8 }}>Welcome to Terp Journal</div>
                <div style={{ fontSize:14, color:C.muted, lineHeight:1.6, marginBottom:28 }}>
                  Track your cannabis experiences.<br/>
                  Discover what actually works for you.
                </div>
                <button onClick={()=>setTab("log")} style={{
                  padding:"14px 32px", borderRadius:50, border:"none", cursor:"pointer",
                  background:`linear-gradient(135deg,#2a6a0a,${C.accent})`, color:"#060d07",
                  fontSize:15, fontWeight:700, boxShadow:`0 4px 20px ${C.accent}33`
                }}>
                  Log your first session →
                </button>
                <div style={{ marginTop:40, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  {[["🔍","Smart Search","80+ strains instantly"],["📊","Real Insights","What works for you"],["🧠","Effect Tracking","Verify your strains"]].map(([e,h,d])=>(
                    <div key={h} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:14 }}>
                      <div style={{ fontSize:24, marginBottom:6 }}>{e}</div>
                      <div style={{ fontSize:11, fontWeight:600, color:C.text, marginBottom:3 }}>{h}</div>
                      <div style={{ fontSize:10, color:C.muted, lineHeight:1.4 }}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Stats bar */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
                  {[
                    { v:sessions.length, l:"Sessions", icon:"📋", c:C.accent },
                    { v:avgRating, l:"Avg Rating", icon:"⭐", c:C.amber },
                    { v:strainNames.length, l:"Strains", icon:"🌱", c:"#34d399" },
                  ].map(x=>(
                    <div key={x.l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"12px 10px", textAlign:"center" }}>
                      <div style={{ fontSize:20, marginBottom:2 }}>{x.icon}</div>
                      <div style={{ fontSize:22, fontWeight:800, color:x.c }}>{x.v}</div>
                      <div style={{ fontSize:10, color:C.muted }}>{x.l}</div>
                    </div>
                  ))}
                </div>

                {/* Quick log shortcuts */}
                {recentStrains.length>0 && (
                  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:14, marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:"0.08em", marginBottom:10 }}>QUICK LOG</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {recentStrains.map(name=>{
                        const s = allStrains.find(x=>x.name===name);
                        return (
                          <button key={name} onClick={()=>{ setForm(f=>({...f,strain:name})); setStep(1); setTab("log"); }}
                            style={{ padding:"8px 14px", borderRadius:20, border:`1.5px solid ${s?typeColor(s.type)+"44":C.border}`,
                              background:s?typeBg(s.type):"transparent", color:s?typeColor(s.type):C.text,
                              fontSize:12, cursor:"pointer", fontWeight:500 }}>
                            {name}
                          </button>
                        );
                      })}
                      <button onClick={()=>{ setStep(0); setTab("log"); }}
                        style={{ padding:"8px 14px", borderRadius:20, border:`1.5px dashed ${C.border}`,
                          background:"transparent", color:C.muted, fontSize:12, cursor:"pointer" }}>
                        + New strain
                      </button>
                    </div>
                  </div>
                )}

                {/* Last session card */}
                {lastSession && (
                  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:14, marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:"0.08em", marginBottom:10 }}>LAST SESSION</div>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ fontSize:32 }}>{METHODS.find(m=>m.id===lastSession.method)?.emoji||"🌿"}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{lastSession.strain}</div>
                        <div style={{ fontSize:11, color:C.muted }}>{new Date(lastSession.date).toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"})}</div>
                        <div style={{ display:"flex", gap:6, marginTop:5, flexWrap:"wrap" }}>
                          {lastSession.effects?.slice(0,3).map(e=>(
                            <span key={e} style={{ fontSize:10, padding:"2px 8px", background:C.accentDim, borderRadius:10, color:C.accent }}>{e}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:26, fontWeight:800, color:C.accent }}>{lastSession.ratings?.overall||"?"}</div>
                        <div style={{ fontSize:9, color:C.muted }}>/10</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insights teaser */}
                {qualifiedStrains.length>0 ? (
                  <button onClick={()=>setTab("insights")} style={{
                    width:"100%", padding:"14px", borderRadius:16, border:`1px solid ${C.accent}44`,
                    background:`linear-gradient(135deg,${C.card},#0d2010)`, cursor:"pointer", textAlign:"left",
                    display:"flex", alignItems:"center", gap:12
                  }}>
                    <div style={{ fontSize:28 }}>🧠</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.accent }}>Strain Intelligence ready</div>
                      <div style={{ fontSize:11, color:C.muted }}>See what {qualifiedStrains[0]} actually does to you →</div>
                    </div>
                  </button>
                ) : (
                  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:14 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>🧠 Strain Intelligence</div>
                    <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>
                      Log {2-Math.min(2,sessions.filter(s=>s.strain===sessions[0]?.strain).length)} more {sessions[0]?.strain?`"${sessions[0].strain}"`:"sessions"} to unlock your personal effect breakdown.
                    </div>
                    <div style={{ height:6, background:C.faint, borderRadius:3 }}>
                      <div style={{ height:"100%", borderRadius:3, background:C.accent,
                        width:`${Math.min(100,sessions.filter(s=>s.strain===sessions[0]?.strain).length/2*100)}%` }}/>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════ LOG WIZARD ════════════════════ */}
        {tab==="log" && (
          <div>
            {/* Wizard header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>
                {["Pick your strain","Method & amount","Mood check-in","Effects felt","Rate it","Wellbeing"][step]}
              </div>
              <StepDots current={step} total={6} onGo={setStep}/>
            </div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:18, minHeight:20 }}>{STEP_HINTS[step]}</div>

            {/* ── STEP 0: STRAIN ── */}
            {step===0 && (
              <div>
                <div ref={searchRef} style={{ position:"relative", marginBottom:16 }}>
                  <input value={sq} onChange={e=>onSQ(e.target.value)}
                    onFocus={()=>sq.length>=1&&setSdrop(true)}
                    placeholder="Search strain name, type, or effect..."
                    style={{ width:"100%", padding:"14px 42px 14px 16px", background:C.card,
                      border:`1.5px solid ${sq?"#2a5a2a":C.border}`, borderRadius:14, color:C.text,
                      fontSize:14, boxSizing:"border-box", outline:"none",
                      boxShadow:sq?`0 0 0 3px ${C.accentDim}`:undefined }}/>
                  <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:C.muted, fontSize:16 }}>
                    {aiLoad?"⟳":"🔍"}
                  </div>

                  {sdrop && sq.length>=1 && (
                    <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:200,
                      background:"#0d1a0e", border:`1px solid #2a4a2a`, borderRadius:14,
                      boxShadow:"0 12px 40px rgba(0,0,0,0.7)", overflow:"hidden", maxHeight:300, overflowY:"auto" }}>
                      {dropList.length===0 && !aiLoad && (
                        <div style={{ padding:16, fontSize:12, color:C.muted, textAlign:"center" }}>No matches · try a different name</div>
                      )}
                      {dropList.map((r,i)=>(
                        <button key={r.name+i} onClick={()=>pickStrain(r)} style={{
                          width:"100%", padding:"12px 14px", background:"transparent", border:"none",
                          borderBottom:i<dropList.length-1?`1px solid ${C.border}`:"none",
                          cursor:"pointer", textAlign:"left", transition:"background 0.1s" }}
                          onMouseEnter={e=>e.currentTarget.style.background="#0d2a0d"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:3 }}>
                            <span style={{ fontWeight:700, color:C.text, fontSize:14 }}>{r.name}</span>
                            <span style={{ fontSize:10, padding:"2px 8px", background:typeBg(r.type), border:`1px solid ${typeColor(r.type)}44`, borderRadius:10, color:typeColor(r.type) }}>{r.type}</span>
                            <span style={{ fontSize:11, color:C.amber }}>THC {r.thc}%</span>
                            {r.cbd>0&&<span style={{ fontSize:11, color:"#34d399" }}>CBD {r.cbd}%</span>}
                          </div>
                          <div style={{ fontSize:11, color:C.muted }}>{r.description}</div>
                        </button>
                      ))}
                      {aiLoad&&<div style={{ padding:12, fontSize:11, color:C.muted, textAlign:"center", borderTop:`1px solid ${C.border}` }}>Searching AI database…</div>}
                    </div>
                  )}
                </div>

                {/* Selected strain */}
                {curStrain && (
                  <div style={{ background:C.card, border:`2px solid ${typeColor(curStrain.type)}33`, borderRadius:16, padding:16, marginBottom:16,
                    boxShadow:`0 0 20px ${typeGlow(curStrain.type)}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:4 }}>{curStrain.name}</div>
                        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                          <span style={{ fontSize:11, padding:"3px 10px", background:typeBg(curStrain.type), border:`1px solid ${typeColor(curStrain.type)}`, borderRadius:10, color:typeColor(curStrain.type), fontWeight:600 }}>{curStrain.type}</span>
                          <span style={{ fontSize:13, color:C.amber, fontWeight:600 }}>THC {curStrain.thc}%</span>
                          {curStrain.cbd>0&&<span style={{ fontSize:13, color:"#34d399", fontWeight:600 }}>CBD {curStrain.cbd}%</span>}
                        </div>
                        <div style={{ fontSize:12, color:C.muted }}>{curStrain.description}</div>
                      </div>
                      <button onClick={()=>setForm(f=>({...f,strain:""}))} style={{
                        padding:"4px 8px", borderRadius:8, border:`1px solid ${C.border}`,
                        background:"transparent", color:C.muted, cursor:"pointer", fontSize:12, flexShrink:0 }}>✕</button>
                    </div>
                    {curStrain.effects?.length>0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:10 }}>
                        {curStrain.effects.map(e=><span key={e} style={{ fontSize:10, padding:"2px 8px", background:C.accentDim, borderRadius:10, color:C.accent }}>{e}</span>)}
                      </div>
                    )}
                  </div>
                )}

                {!form.strain && (
                  <div>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>Or jump in with a recent strain:</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20 }}>
                      {STRAIN_DB.slice(0,8).map(s=>(
                        <button key={s.name} onClick={()=>setForm(f=>({...f,strain:s.name}))}
                          style={{ padding:"7px 14px", borderRadius:20, border:`1px solid ${typeColor(s.type)}33`,
                            background:typeBg(s.type), color:typeColor(s.type), fontSize:12, cursor:"pointer" }}>
                          {s.name}
                        </button>
                      ))}
                    </div>

                    {/* Add custom strain */}
                    {!addingStrain ? (
                      <button onClick={()=>setAddingStrain(true)} style={{
                        width:"100%", padding:"12px", borderRadius:12, border:`1.5px dashed ${C.border}`,
                        background:"transparent", color:C.muted, cursor:"pointer", fontSize:13 }}>
                        + Add a strain not in the list
                      </button>
                    ) : (
                      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:14 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:10 }}>Add custom strain</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                          {[["Name","name","text"],["THC %","thc","number"],["CBD %","cbd","number"]].map(([ph,k,t])=>(
                            <input key={k} type={t} placeholder={ph} value={newS[k]||""} onChange={e=>setNewS(s=>({...s,[k]:t==="number"?+e.target.value:e.target.value}))}
                              style={{ padding:"9px 10px", background:"#0a1a0b", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12, fontFamily:"system-ui" }}/>
                          ))}
                          <select value={newS.type} onChange={e=>setNewS(s=>({...s,type:e.target.value}))}
                            style={{ padding:"9px 10px", background:"#0a1a0b", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }}>
                            <option>Hybrid</option><option>Indica</option><option>Sativa</option>
                          </select>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={()=>{ if(newS.name){ setCustom(p=>[{...newS,effects:[],flavors:[],description:""},...p]); setForm(f=>({...f,strain:newS.name})); setNewS({name:"",type:"Hybrid",thc:"",cbd:"",description:""}); setAddingStrain(false); }}}
                            style={{ flex:1, padding:"10px", borderRadius:10, border:"none", background:C.accent, color:"#060d07", fontWeight:700, cursor:"pointer", fontSize:13 }}>
                            Save & Use
                          </button>
                          <button onClick={()=>setAddingStrain(false)}
                            style={{ padding:"10px 14px", borderRadius:10, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer", fontSize:13 }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Brand/source inline */}
                {form.strain && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
                    <input placeholder="Brand (optional)" value={form.brand} onChange={e=>setForm(f=>({...f,brand:e.target.value}))}
                      style={{ padding:"10px 12px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12, fontFamily:"system-ui" }}/>
                    <input placeholder="Source / dispensary" value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))}
                      style={{ padding:"10px 12px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12, fontFamily:"system-ui" }}/>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 1: METHOD ── */}
            {step===1 && (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:20 }}>
                  {METHODS.map(m=>(
                    <button key={m.id} onClick={()=>setForm(f=>({...f,method:m.id,amount:m.def}))}
                      style={{ padding:"14px 8px", borderRadius:14,
                        border:`2px solid ${form.method===m.id?C.accent:C.border}`,
                        background:form.method===m.id?C.accentDim:C.card,
                        color:form.method===m.id?C.accent:C.muted,
                        cursor:"pointer", textAlign:"center", transition:"all 0.15s",
                        transform:form.method===m.id?"scale(1.04)":"scale(1)" }}>
                      <div style={{ fontSize:26, marginBottom:4 }}>{m.emoji}</div>
                      <div style={{ fontSize:11, fontWeight:form.method===m.id?700:400 }}>{m.label}</div>
                    </button>
                  ))}
                </div>

                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16 }}>
                  <Slider label={curMethod.unit==="puffs"?"Puffs":curMethod.unit==="ml"?"Amount (ml)":curMethod.unit==="mg"?"Dose (mg THC)":"Amount (g)"}
                    icon={curMethod.emoji} value={form.amount} onChange={v=>setForm(f=>({...f,amount:v}))}
                    min={curMethod.min} max={curMethod.max} step={curMethod.step} color={C.accent}/>
                  <div style={{ textAlign:"center", fontSize:28, fontWeight:800, color:C.accent, marginTop:-4 }}>
                    {form.amount} {curMethod.unit}
                  </div>
                </div>

                {(form.method==="dryvape"||form.method==="resinvape") && (
                  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:12, marginTop:10 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>Vape details (optional)</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <input placeholder="Temp °C" value={form.vapeTemp||""} onChange={e=>setForm(f=>({...f,vapeTemp:e.target.value}))}
                        style={{ padding:"9px 10px", background:"#0a1a0b", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }}/>
                      <input placeholder={form.method==="resinvape"?"Cart type":"Device"} value={form.method==="resinvape"?(form.cartType||""):(form.vapeDevice||"")}
                        onChange={e=>setForm(f=>form.method==="resinvape"?{...f,cartType:e.target.value}:{...f,vapeDevice:e.target.value})}
                        style={{ padding:"9px 10px", background:"#0a1a0b", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }}/>
                    </div>
                  </div>
                )}

                <div style={{ marginTop:14 }}>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>Date & time</div>
                  <input type="datetime-local" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                    style={{ width:"100%", padding:"10px 12px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12, boxSizing:"border-box" }}/>
                </div>
              </div>
            )}

            {/* ── STEP 2: MOOD ── */}
            {step===2 && (
              <div>
                {[["How are you feeling RIGHT NOW?","moodBefore"],["How do you want to feel?","moodAfter"]].map(([lbl,key],qi)=>(
                  <div key={key} style={{ marginBottom:24 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:12 }}>{lbl}</div>
                    <div style={{ display:"flex", gap:6 }}>
                      {MOODS.map((m,i)=>(
                        <BigMoodBtn key={i} emoji={m} label={MOOD_LABELS[i]} active={form[key]===i} onClick={()=>setForm(f=>({...f,[key]:i}))}/>
                      ))}
                    </div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>Anything else on your mind? (optional)</div>
                  <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                    placeholder="Setting, who you're with, what you're doing..."
                    rows={3} style={{ width:"100%", padding:"10px 12px", background:C.card, border:`1px solid ${C.border}`,
                      borderRadius:12, color:C.text, fontSize:13, resize:"none", boxSizing:"border-box", fontFamily:"system-ui" }}/>
                </div>
              </div>
            )}

            {/* ── STEP 3: EFFECTS ── */}
            {step===3 && (
              <div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>Tap everything you're feeling. This builds your personal strain fingerprint.</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:24 }}>
                  {EFFECTS.map(e=>(
                    <button key={e} onClick={()=>toggle("effects",e)} style={{
                      padding:"9px 16px", borderRadius:20, fontSize:13, cursor:"pointer", fontFamily:"system-ui",
                      border:`1.5px solid ${form.effects.includes(e)?C.accent:C.border}`,
                      background:form.effects.includes(e)?C.accentDim:C.card,
                      color:form.effects.includes(e)?C.accent:C.muted,
                      fontWeight:form.effects.includes(e)?700:400, transition:"all 0.15s",
                      transform:form.effects.includes(e)?"scale(1.05)":"scale(1)" }}>
                      {e}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:12 }}>Flavours noticed</div>
                {FLAVOR_FAMILIES.map(fam=>(
                  <div key={fam.id} style={{ marginBottom:12 }}>
                    <div style={{ fontSize:10, fontWeight:600, color:fam.color, marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:fam.color }}/>
                      {fam.label.toUpperCase()}
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {fam.flavors.map(f=>{
                        const active = form.flavors.includes(f);
                        return (
                          <button key={f} onClick={()=>toggle("flavors",f)} style={{
                            padding:"6px 12px", borderRadius:20, fontSize:12, cursor:"pointer",
                            border:`1.5px solid ${active?fam.color:C.border}`,
                            background:active?fam.color+"22":C.card,
                            color:active?fam.color:C.muted, fontWeight:active?600:400, transition:"all 0.12s" }}>
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 4: RATINGS ── */}
            {step===4 && (
              <div>
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16, marginBottom:14 }}>
                  {RATINGS.map(r=><Slider key={r.id} label={r.label} icon={r.icon} value={form.ratings[r.id]}
                    onChange={v=>setRating(r.id,v)} color={r.color}/>)}
                  <Slider label="Intensity" icon="🌡️" value={form.intensity} onChange={v=>setForm(f=>({...f,intensity:v}))} color="#a78bfa"/>
                </div>

                {/* Intensity guide */}
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:12 }}>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>Intensity guide</div>
                  {[["1-3","Barely felt it"],["4-6","Comfortable buzz"],["7-8","Noticeably high"],["9-10","Very strong"]].map(([r,d])=>(
                    <div key={r} style={{ display:"flex", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:11, color:C.accent, minWidth:28 }}>{r}</span>
                      <span style={{ fontSize:11, color:C.muted }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 5: WELLBEING ── */}
            {step===5 && (
              <div>
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:14, marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#6ee7b7", marginBottom:4 }}>🩹 Physical</div>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>Slide right = improved · left = worsened · centre = no change</div>
                  {PHYSICAL_CORE.map(f=><BidirSlider key={f.id} {...f} value={form.physical[f.id]||0} onChange={v=>setForm(fv=>({...fv,physical:{...fv.physical,[f.id]:v}}))} color="#6ee7b7"/>)}

                  <button onClick={()=>setShowPhysMed(!showPhysMed)}
                    style={{ margin:"8px 0", padding:"7px 12px", borderRadius:8, border:`1px dashed #2a4a2a`,
                      background:"transparent", color:"#3a6a3a", cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", gap:6 }}>
                    {showPhysMed?"▾ Hide":"▸ Show"} medical conditions <span style={{ fontSize:10, color:C.muted }}>(optional)</span>
                  </button>
                  {showPhysMed && (
                    <div style={{ padding:"10px 10px 4px", background:"#0a150b", borderRadius:10, border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:10, color:"#1a5a2a", marginBottom:8 }}>Only track what's relevant to you</div>
                      {PHYSICAL_MEDICAL.map(f=><BidirSlider key={f.id} {...f} value={form.physical[f.id]||0} onChange={v=>setForm(fv=>({...fv,physical:{...fv.physical,[f.id]:v}}))} color="#6ee7b7"/>)}
                    </div>
                  )}
                  <textarea value={form.physicalNotes} onChange={e=>setForm(f=>({...f,physicalNotes:e.target.value}))}
                    placeholder="Describe any physical effects — pain, tension, sleep, body sensations..."
                    rows={2} style={{ width:"100%", marginTop:8, padding:"9px 10px", background:"#0a1a0b", border:`1px solid ${C.border}`,
                      borderRadius:10, color:C.text, fontSize:12, resize:"none", boxSizing:"border-box", fontFamily:"system-ui" }}/>
                </div>

                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:14 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#67e8f9", marginBottom:4 }}>🧠 Mental</div>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>Slide right = improved · left = worsened</div>
                  {MENTAL_CORE.map(f=><BidirSlider key={f.id} {...f} value={form.mental[f.id]||0} onChange={v=>setForm(fv=>({...fv,mental:{...fv.mental,[f.id]:v}}))} color="#67e8f9"/>)}

                  <button onClick={()=>setShowMentMed(!showMentMed)}
                    style={{ margin:"8px 0", padding:"7px 12px", borderRadius:8, border:`1px dashed #1a3a4a`,
                      background:"transparent", color:"#2a5a6a", cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", gap:6 }}>
                    {showMentMed?"▾ Hide":"▸ Show"} mental health conditions <span style={{ fontSize:10, color:C.muted }}>(optional)</span>
                  </button>
                  {showMentMed && (
                    <div style={{ padding:"10px 10px 4px", background:"#090f14", borderRadius:10, border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:10, color:"#1a4a5a", marginBottom:8 }}>Only track what's relevant to you</div>
                      {MENTAL_MEDICAL.map(f=><BidirSlider key={f.id} {...f} value={form.mental[f.id]||0} onChange={v=>setForm(fv=>({...fv,mental:{...fv.mental,[f.id]:v}}))} color="#67e8f9"/>)}
                    </div>
                  )}
                  <textarea value={form.mentalNotes} onChange={e=>setForm(f=>({...f,mentalNotes:e.target.value}))}
                    placeholder="Describe mental effects — anxiety, clarity, mood, thoughts..."
                    rows={2} style={{ width:"100%", marginTop:8, padding:"9px 10px", background:"#090f14", border:`1px solid ${C.border}`,
                      borderRadius:10, color:C.text, fontSize:12, resize:"none", boxSizing:"border-box", fontFamily:"system-ui" }}/>
                </div>
              </div>
            )}

            {/* ── WIZARD NAV ── */}
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              {step>0 && (
                <button onClick={()=>setStep(s=>s-1)} style={{
                  flex:1, padding:"14px", borderRadius:14, border:`1.5px solid ${C.border}`,
                  background:"transparent", color:C.muted, cursor:"pointer", fontSize:14, fontWeight:600 }}>
                  ← Back
                </button>
              )}
              {step<5 ? (
                <button onClick={()=>setStep(s=>s+1)} disabled={step===0&&!form.strain}
                  style={{ flex:2, padding:"14px", borderRadius:14, border:"none", cursor: (step===0&&!form.strain)?"not-allowed":"pointer",
                    background:(step===0&&!form.strain)?"#1a2a1a":`linear-gradient(135deg,#2a6a0a,${C.accent})`,
                    color:(step===0&&!form.strain)?C.muted:"#060d07", fontSize:14, fontWeight:700,
                    boxShadow:(step===0&&!form.strain)?undefined:`0 4px 16px ${C.accent}33` }}>
                  {step===0&&!form.strain?"Pick a strain first":"Continue →"}
                </button>
              ) : (
                <button onClick={saveSession} style={{
                  flex:2, padding:"14px", borderRadius:14, border:"none", cursor:"pointer",
                  background:`linear-gradient(135deg,#2a6a0a,${C.accent})`, color:"#060d07",
                  fontSize:14, fontWeight:700, boxShadow:`0 4px 16px ${C.accent}33` }}>
                  ✦ Save Session
                </button>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════ HISTORY ═══════════════════════ */}
        {tab==="sessions" && (
          <div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>{sessions.length} session{sessions.length!==1?"s":""} logged</div>
            {sessions.length===0 && (
              <div style={{ textAlign:"center", padding:"50px 20px", color:C.muted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
                <div>No sessions yet — log your first one!</div>
              </div>
            )}
            {sessions.map(s=>{
              const st   = allStrains.find(x=>x.name===s.strain);
              const meth = METHODS.find(m=>m.id===s.method);
              const open = expandedId===s.id;
              return (
                <div key={s.id} onClick={()=>setExpandedId(open?null:s.id)}
                  style={{ background:C.card, border:`1.5px solid ${open?C.accent+"44":C.border}`,
                    borderRadius:16, marginBottom:8, overflow:"hidden", cursor:"pointer", transition:"border-color 0.2s" }}>
                  <div style={{ padding:"12px 14px", display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ fontSize:24, minWidth:30, textAlign:"center" }}>{meth?.emoji||"🌿"}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.strain||"Unknown"}</div>
                      <div style={{ fontSize:11, color:C.muted }}>
                        {new Date(s.date).toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"})}
                        {s.brand&&<span style={{ color:"#3a7a4a" }}> · {s.brand}</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
                      {st&&<span style={{ fontSize:10, padding:"2px 8px", background:typeBg(st.type), border:`1px solid ${typeColor(st.type)}44`, borderRadius:10, color:typeColor(st.type) }}>{st.type}</span>}
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:20, fontWeight:800, color:C.accent }}>{s.ratings?.overall||"?"}</div>
                        <div style={{ fontSize:9, color:C.muted }}>/10</div>
                      </div>
                      <div style={{ fontSize:20 }}>{MOODS[s.moodAfter]||"😐"}</div>
                    </div>
                  </div>
                  {open && (
                    <div style={{ padding:"0 14px 14px", borderTop:`1px solid ${C.border}` }}>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginTop:12, marginBottom:12 }}>
                        {RATINGS.map(r=>(
                          <div key={r.id} style={{ background:"#0a150b", borderRadius:10, padding:"8px 4px", textAlign:"center" }}>
                            <div style={{ fontSize:14 }}>{r.icon}</div>
                            <div style={{ fontSize:16, fontWeight:800, color:r.color }}>{s.ratings?.[r.id]||"—"}</div>
                            <div style={{ fontSize:9, color:C.muted }}>{r.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                        {s.effects?.map(e=><span key={e} style={{ fontSize:11, padding:"3px 10px", background:C.accentDim, borderRadius:10, color:C.accent }}>{e}</span>)}
                      </div>
                      {s.flavors?.length>0 && (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:8 }}>
                          {s.flavors.map(f=>{
                            const fam = FLAVOR_FAMILIES.find(fm=>fm.flavors.includes(f));
                            return <span key={f} style={{ fontSize:10, padding:"2px 8px", background:fam?.color+"22"||C.card, borderRadius:10, color:fam?.color||C.muted }}>{f}</span>;
                          })}
                        </div>
                      )}
                      {(s.physicalNotes||s.mentalNotes) && (
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                          {s.physicalNotes&&<div style={{ background:"#0a150b", borderRadius:10, padding:10 }}><div style={{ fontSize:9, color:"#6ee7b7", marginBottom:3 }}>PHYSICAL</div><div style={{ fontSize:11, color:"#4a7a6a" }}>{s.physicalNotes}</div></div>}
                          {s.mentalNotes&&<div style={{ background:"#090f14", borderRadius:10, padding:10 }}><div style={{ fontSize:9, color:"#67e8f9", marginBottom:3 }}>MENTAL</div><div style={{ fontSize:11, color:"#4a7a8a" }}>{s.mentalNotes}</div></div>}
                        </div>
                      )}
                      {s.notes&&<div style={{ fontSize:12, color:"#4a7a5a", fontStyle:"italic", marginBottom:8 }}>"{s.notes}"</div>}
                      <button onClick={e=>{ e.stopPropagation(); setSessions(p=>p.filter(x=>x.id!==s.id)); setExpandedId(null); }}
                        style={{ padding:"6px 12px", borderRadius:8, border:"1px solid #3a1a1a", background:"transparent", color:"#5a2a2a", cursor:"pointer", fontSize:11 }}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════ INSIGHTS ══════════════════════ */}
        {tab==="insights" && (
          <div>
            {sessions.length<2 ? (
              <div style={{ textAlign:"center", padding:"50px 20px" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
                <div style={{ fontSize:14, color:C.muted }}>Log at least 2 sessions to see insights</div>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:16 }}>
                  {[
                    { v:sessions.length, l:"Sessions",    c:C.accent,  i:"📋" },
                    { v:avgRating,       l:"Avg Rating",  c:C.amber,   i:"⭐" },
                    { v:+sessions.length>0?(sessions.reduce((a,s)=>a+(s.moodAfter-s.moodBefore),0)/sessions.length).toFixed(1):0, l:"Mood Impact", c:"#6ee7b7", i:"🧠", prefix:true },
                    { v:strainNames.length, l:"Strains",   c:"#a78bfa", i:"🌱" },
                  ].map(x=>(
                    <div key={x.l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:14, textAlign:"center" }}>
                      <div style={{ fontSize:22, marginBottom:4 }}>{x.i}</div>
                      <div style={{ fontSize:26, fontWeight:800, color:x.c }}>
                        {x.prefix ? (+x.v>=0 ? `+${x.v}` : x.v) : x.v}
                      </div>
                      <div style={{ fontSize:10, color:C.muted }}>{x.l}</div>
                    </div>
                  ))}
                </div>

                {/* STRAIN INTELLIGENCE */}
                {qualifiedStrains.length>0 && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.accent, marginBottom:4 }}>🧠 Strain Intelligence</div>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>Based on your actual sessions — not what Leafly says.</div>
                    {qualifiedStrains.map(name=>{
                      const ss  = sessions.filter(s=>s.strain===name);
                      const n   = ss.length;
                      const st  = allStrains.find(x=>x.name===name);
                      const avg = (ss.reduce((a,s)=>a+(s.ratings?.overall||0),0)/n).toFixed(1);
                      const avgMood = (ss.reduce((a,s)=>a+(s.moodAfter-s.moodBefore),0)/n).toFixed(1);
                      const freqs = EFFECTS.map(e=>({ e, pct:Math.round(ss.filter(s=>s.effects?.includes(e)).length/n*100) }))
                        .filter(x=>x.pct>0).sort((a,b)=>b.pct-a.pct).slice(0,6);
                      const consistent = freqs.filter(x=>x.pct>=50);
                      const allF = [...PHYSICAL_FACTORS,...MENTAL_FACTORS];
                      const wellImpact = allF.map(f=>{
                        const key = PHYSICAL_FACTORS.find(x=>x.id===f.id)?"physical":"mental";
                        const vals = ss.filter(s=>s[key]?.[f.id]).map(s=>s[key][f.id]);
                        if(!vals.length) return null;
                        return {...f, avg:+(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)};
                      }).filter(x=>x&&x.avg!==0).sort((a,b)=>Math.abs(b.avg)-Math.abs(a.avg)).slice(0,4);

                      return (
                        <div key={name} style={{ background:C.card, border:`1.5px solid ${st?typeColor(st.type)+"33":C.border}`,
                          borderRadius:18, padding:16, marginBottom:12, boxShadow:st?`0 0 20px ${typeGlow(st.type)}`:undefined }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                            <div>
                              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:4 }}>
                                <span style={{ fontWeight:800, fontSize:16, color:C.text }}>{name}</span>
                                {st&&<span style={{ fontSize:10, padding:"2px 8px", background:typeBg(st.type), border:`1px solid ${typeColor(st.type)}44`, borderRadius:10, color:typeColor(st.type) }}>{st.type}</span>}
                                <span style={{ fontSize:11, color:C.muted }}>{n} sessions</span>
                              </div>
                              <div style={{ fontSize:12, color:"#4a8a5a", fontStyle:"italic" }}>
                                {freqs[0]?`${freqs[0].pct}% of sessions: ${freqs[0].e.toLowerCase()}. Mood ${+avgMood>=0?"improves":"drops"}.`:`Keep logging for deeper insights.`}
                              </div>
                            </div>
                            <div style={{ background:C.accentDim, borderRadius:12, padding:"8px 12px", textAlign:"center", flexShrink:0 }}>
                              <div style={{ fontSize:24, fontWeight:800, color:C.accent, lineHeight:1 }}>{avg}</div>
                              <div style={{ fontSize:9, color:C.muted }}>avg</div>
                            </div>
                          </div>

                          {freqs.length>0 && (
                            <div style={{ marginBottom:12 }}>
                              {freqs.map(({e,pct})=>(
                                <div key={e} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                                  <span style={{ fontSize:12, color:pct>=50?C.accent:C.muted, minWidth:72, fontWeight:pct>=50?600:400 }}>{e}</span>
                                  <div style={{ flex:1, height:6, background:C.faint, borderRadius:3 }}>
                                    <div style={{ height:"100%", borderRadius:3, transition:"width 0.4s",
                                      width:`${pct}%`, background:pct>=75?`linear-gradient(90deg,#2a6a0a,${C.accent})`:pct>=50?`linear-gradient(90deg,#1a4a1a,#6a9a2a)`:"#2a4a2a" }}/>
                                  </div>
                                  <span style={{ fontSize:11, fontWeight:700, color:pct>=50?C.accent:C.muted, minWidth:34, textAlign:"right" }}>{pct}%</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {consistent.length>0 && (
                            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:8 }}>
                              <span style={{ fontSize:10, color:C.muted, alignSelf:"center", marginRight:2 }}>Consistent:</span>
                              {consistent.map(x=><span key={x.e} style={{ fontSize:11, padding:"3px 10px", background:C.accentDim, border:`1px solid ${C.accent}44`, borderRadius:10, color:C.accent, fontWeight:600 }}>{x.e} {x.pct}%</span>)}
                            </div>
                          )}

                          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:wellImpact.length?10:0 }}>
                            {[{l:"Mood",v:+avgMood>=0?`+${avgMood}`:avgMood,c:+avgMood>=0?"#6ee7b7":"#f87171"}].map(x=>(
                              <div key={x.l} style={{ background:"#0a150b", borderRadius:8, padding:"5px 10px" }}>
                                <span style={{ fontSize:12, fontWeight:700, color:x.c }}>{x.v}</span>
                                <span style={{ fontSize:10, color:C.muted, marginLeft:4 }}>{x.l}</span>
                              </div>
                            ))}
                          </div>

                          {wellImpact.length>0 && (
                            <div style={{ paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                              <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>Wellbeing impact</div>
                              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                                {wellImpact.map(f=>(
                                  <span key={f.id} style={{ fontSize:11, padding:"3px 9px",
                                    background:f.avg>0?"#022c22":"#1a0808",
                                    border:`1px solid ${f.avg>0?"#6ee7b733":"#f8717133"}`,
                                    borderRadius:10, color:f.avg>0?"#6ee7b7":"#f87171" }}>
                                    {f.icon} {f.label} {f.avg>0?`+${f.avg}`:f.avg}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <button onClick={()=>{ setForm(f=>({...f,strain:name})); setStep(1); setTab("log"); }}
                            style={{ marginTop:12, padding:"7px 14px", borderRadius:10, border:`1px solid ${C.border}`,
                              background:"transparent", color:C.muted, cursor:"pointer", fontSize:11 }}>
                            + Log another session →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Charts */}
                {sessions.length>=3 && (() => {
                  const trend = [...sessions].reverse().slice(-10).map((s,i)=>({
                    i:i+1, r:s.ratings?.overall||0,
                    label:new Date(s.date).toLocaleDateString("en-AU",{month:"short",day:"numeric"})
                  }));
                  const effectCounts = EFFECTS.map(e=>({e,n:sessions.filter(s=>s.effects?.includes(e)).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,6);
                  const TT = { contentStyle:{background:"#0a150b",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:11} };
                  return (
                    <>
                      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:14, marginBottom:10 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:12 }}>RATING TREND</div>
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={trend}>
                            <XAxis dataKey="label" tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
                            <YAxis domain={[0,10]} tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
                            <Tooltip {...TT}/>
                            <Line type="monotone" dataKey="r" stroke={C.accent} strokeWidth={2.5} dot={{fill:C.accent,r:4,strokeWidth:0}}/>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {effectCounts.length>0 && (
                        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:14 }}>
                          <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:12 }}>YOUR TOP EFFECTS</div>
                          <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={effectCounts} layout="vertical">
                              <XAxis type="number" tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
                              <YAxis type="category" dataKey="e" tick={{fill:"#6a9a6a",fontSize:11}} axisLine={false} tickLine={false} width={65}/>
                              <Tooltip {...TT}/>
                              <Bar dataKey="n" radius={[0,6,6,0]}>
                                {effectCounts.map((_,i)=><Cell key={i} fill={`hsl(${100+i*15},55%,${40+i*4}%)`}/>)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input:focus,select:focus,textarea:focus{outline:2px solid #a3e63544!important;outline-offset:1px}
        .styled-slider{-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;outline:none;background:linear-gradient(90deg,var(--col) var(--pct),#1a2a1a var(--pct))}
        .styled-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:var(--col);cursor:pointer;border:3px solid #080f09;box-shadow:0 0 10px var(--col,#a3e635)66}
        .styled-slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:var(--col);cursor:pointer;border:3px solid #080f09}
        .styled-slider::-moz-range-track{height:6px;border-radius:3px;background:#1a2a1a}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1c2e1c;border-radius:2px}
        ::placeholder{color:#2a4a2a!important}
        button{font-family:system-ui,-apple-system,sans-serif}
        @keyframes pop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
