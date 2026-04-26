import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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
  { id:"fruit",   label:"Fruit",   color:"#fb923c", flavors:["Berry","Citrus","Mango","Grape","Cherry","Lemon","Tropical","Peach"] },
  { id:"earth",   label:"Earth",   color:"#a78a5a", flavors:["Earthy","Woody","Hash","Pine","Cedar","Leather"] },
  { id:"sweet",   label:"Sweet",   color:"#f472b6", flavors:["Sweet","Vanilla","Candy","Honey","Cake","Caramel"] },
  { id:"pungent", label:"Pungent", color:"#84cc16", flavors:["Diesel","Skunk","Cheese","Fuel","Chemical"] },
  { id:"spice",   label:"Spice",   color:"#f87171", flavors:["Spice","Pepper","Herbal","Floral","Lavender","Mint"] },
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
  { id:"overall",    label:"Overall",   icon:"⭐", color:"#f59e0b" },
  { id:"taste",      label:"Taste",     icon:"👅", color:"#fb923c" },
  { id:"potency",    label:"Potency",   icon:"⚡", color:"#a78bfa" },
  { id:"smoothness", label:"Smooth",    icon:"🌫️", color:"#67e8f9" },
  { id:"effect",     label:"Effect",    icon:"🧠", color:"#6ee7b7" },
  { id:"value",      label:"Value",     icon:"💰", color:"#fde68a" },
];
const MOODS       = ["😔","😐","🙂","😊","🌟"];
const MOOD_LABELS = ["Low","Meh","Okay","Good","Amazing"];

const STRAIN_DB = [
  { name:"Blue Dream",          type:"Hybrid", thc:21, cbd:2,  effects:["Relaxed","Happy","Creative"],   flavors:["Berry","Sweet","Earthy"],   description:"Balanced. Gentle cerebral lift." },
  { name:"OG Kush",             type:"Hybrid", thc:23, cbd:0,  effects:["Euphoric","Relaxed","Happy"],   flavors:["Earthy","Woody","Pine"],    description:"Classic. Deep euphoria and calm." },
  { name:"Sour Diesel",         type:"Sativa", thc:26, cbd:0,  effects:["Energetic","Happy","Uplifted"], flavors:["Diesel","Citrus","Earthy"], description:"Sharp energy. Fast cerebral hit." },
  { name:"Granddaddy Purple",   type:"Indica", thc:17, cbd:1,  effects:["Relaxed","Sleepy","Happy"],     flavors:["Grape","Berry","Sweet"],    description:"Deep relaxation. Sleep aid." },
  { name:"Wedding Cake",        type:"Hybrid", thc:25, cbd:0,  effects:["Relaxed","Euphoric","Happy"],   flavors:["Sweet","Vanilla","Earthy"], description:"Rich, creamy. Heavy euphoria." },
  { name:"Girl Scout Cookies",  type:"Hybrid", thc:28, cbd:0,  effects:["Euphoric","Happy","Relaxed"],   flavors:["Sweet","Earthy","Mint"],    description:"Powerful euphoria. Full-body." },
  { name:"Gorilla Glue #4",     type:"Hybrid", thc:27, cbd:0,  effects:["Relaxed","Euphoric","Sleepy"],  flavors:["Earthy","Pine","Woody"],    description:"Heavy relaxation. Couch-lock." },
  { name:"Jack Herer",          type:"Sativa", thc:18, cbd:0,  effects:["Energetic","Creative","Happy"], flavors:["Pine","Earthy","Spice"],    description:"Clear-headed. Creative spark." },
  { name:"Northern Lights",     type:"Indica", thc:18, cbd:0,  effects:["Relaxed","Sleepy","Happy"],     flavors:["Earthy","Sweet","Pine"],    description:"Classic indica. Night time." },
  { name:"Pineapple Express",   type:"Hybrid", thc:19, cbd:0,  effects:["Happy","Energetic","Creative"], flavors:["Tropical","Citrus","Pine"], description:"Tropical. Long-lasting energy." },
  { name:"White Widow",         type:"Hybrid", thc:20, cbd:0,  effects:["Happy","Euphoric","Creative"],  flavors:["Earthy","Woody","Floral"],  description:"Burst of euphoria and energy." },
  { name:"Green Crack",         type:"Sativa", thc:24, cbd:0,  effects:["Energetic","Focused","Happy"],  flavors:["Citrus","Earthy","Mango"],  description:"Sharp daytime focus." },
  { name:"Zkittlez",            type:"Indica", thc:23, cbd:0,  effects:["Relaxed","Happy","Euphoric"],   flavors:["Tropical","Berry","Citrus"],description:"Fruity. Calming body high." },
  { name:"Runtz",               type:"Hybrid", thc:29, cbd:0,  effects:["Euphoric","Happy","Relaxed"],   flavors:["Candy","Sweet","Tropical"], description:"Smooth. Potent euphoria." },
  { name:"Gelato",              type:"Hybrid", thc:26, cbd:0,  effects:["Happy","Relaxed","Euphoric"],   flavors:["Sweet","Earthy","Citrus"],  description:"Dessert flavour. Balanced." },
  { name:"Ice Cream Cake",      type:"Indica", thc:25, cbd:0,  effects:["Relaxed","Sleepy","Euphoric"],  flavors:["Vanilla","Sweet","Cake"],   description:"Sweet. Deep sedation." },
  { name:"Mimosa",              type:"Hybrid", thc:30, cbd:0,  effects:["Happy","Energetic","Uplifted"], flavors:["Citrus","Tropical","Sweet"],description:"Bright citrus. Uplifting." },
  { name:"Mac 1",               type:"Hybrid", thc:23, cbd:0,  effects:["Happy","Relaxed","Euphoric"],   flavors:["Floral","Earthy","Citrus"], description:"Creamy, balanced. Sought after." },
  { name:"Durban Poison",       type:"Sativa", thc:20, cbd:0,  effects:["Energetic","Happy","Creative"], flavors:["Sweet","Pine","Earthy"],    description:"African sativa. Uplifting." },
  { name:"Bubba Kush",          type:"Indica", thc:22, cbd:0,  effects:["Relaxed","Sleepy","Happy"],     flavors:["Earthy","Sweet","Woody"],   description:"Heavy tranquilising effects." },
  { name:"Purple Punch",        type:"Indica", thc:20, cbd:0,  effects:["Relaxed","Sleepy","Happy"],     flavors:["Grape","Berry","Sweet"],    description:"Sweet sedation. Night time." },
  { name:"Chemdawg",            type:"Hybrid", thc:19, cbd:0,  effects:["Relaxed","Euphoric","Happy"],   flavors:["Diesel","Chemical","Earthy"],description:"Cerebral. Heavy diesel." },
  { name:"Amnesia Haze",        type:"Sativa", thc:21, cbd:0,  effects:["Energetic","Happy","Uplifted"], flavors:["Citrus","Earthy","Sweet"],  description:"Uplifting citrus haze." },
  { name:"Do-Si-Dos",           type:"Indica", thc:28, cbd:0,  effects:["Relaxed","Sleepy","Euphoric"],  flavors:["Sweet","Earthy","Floral"],  description:"Potent. Fast-acting." },
  { name:"Bruce Banner",        type:"Hybrid", thc:29, cbd:0,  effects:["Euphoric","Happy","Creative"],  flavors:["Sweet","Earthy","Diesel"],  description:"Intense cerebral rush." },
  { name:"Harlequin",           type:"Sativa", thc:10, cbd:15, effects:["Relaxed","Focused","Happy"],    flavors:["Earthy","Sweet","Mango"],   description:"High CBD. Clear-headed." },
  { name:"ACDC",                type:"Hybrid", thc:6,  cbd:20, effects:["Relaxed","Calm","Focused"],     flavors:["Earthy","Pine","Woody"],    description:"Very high CBD. Minimal high." },
  { name:"Tangie",              type:"Sativa", thc:22, cbd:0,  effects:["Happy","Creative","Energetic"], flavors:["Citrus","Tropical","Sweet"],description:"Tangerine flavour. Creative." },
  { name:"Cherry Pie",          type:"Hybrid", thc:20, cbd:0,  effects:["Happy","Euphoric","Relaxed"],   flavors:["Cherry","Berry","Sweet"],   description:"Sweet cherry. Balanced." },
  { name:"Blueberry",           type:"Indica", thc:20, cbd:0,  effects:["Relaxed","Happy","Sleepy"],     flavors:["Berry","Sweet","Earthy"],   description:"Classic. Sweet blueberry." },
  { name:"Stardawg",            type:"Hybrid", thc:22, cbd:0,  effects:["Happy","Energetic","Uplifted"], flavors:["Diesel","Earthy","Pine"],   description:"Chemical-diesel. Uplifting." },
  { name:"Mochi",               type:"Hybrid", thc:29, cbd:0,  effects:["Relaxed","Happy","Euphoric"],   flavors:["Sweet","Earthy","Floral"],  description:"Creamy sweet. Potent." },
  { name:"Jealousy",            type:"Hybrid", thc:29, cbd:0,  effects:["Euphoric","Relaxed","Happy"],   flavors:["Sweet","Earthy","Candy"],   description:"Seed Junky classic." },
  { name:"Kosher Kush",         type:"Indica", thc:29, cbd:0,  effects:["Relaxed","Sleepy","Euphoric"],  flavors:["Earthy","Woody","Pine"],    description:"Exceptionally potent." },
  { name:"Permanent Marker",    type:"Hybrid", thc:30, cbd:0,  effects:["Euphoric","Relaxed","Creative"],flavors:["Fuel","Sweet","Earthy"],    description:"Pungent fuel. Heavy hitter." },
  { name:"Banana Runtz",        type:"Hybrid", thc:27, cbd:0,  effects:["Euphoric","Relaxed","Happy"],   flavors:["Tropical","Sweet","Candy"], description:"Banana candy. Potent." },
  { name:"Papaya",              type:"Indica", thc:25, cbd:0,  effects:["Relaxed","Happy","Sleepy"],     flavors:["Tropical","Mango","Sweet"], description:"Tropical. Deeply calming." },
  { name:"Crescendo",           type:"Hybrid", thc:32, cbd:0,  effects:["Euphoric","Relaxed","Creative"],flavors:["Diesel","Sweet","Earthy"],  description:"Extremely potent." },
  { name:"Sunset Sherbet",      type:"Hybrid", thc:21, cbd:0,  effects:["Happy","Relaxed","Creative"],   flavors:["Sweet","Berry","Citrus"],   description:"Fruity, balanced buzz." },
  { name:"Gary Payton",         type:"Hybrid", thc:25, cbd:0,  effects:["Euphoric","Focused","Happy"],   flavors:["Earthy","Pepper","Sweet"],  description:"Peppery, cerebral." },
];

const typeColor = t => t==="Indica"?"#a78bfa":t==="Sativa"?"#fbbf24":"#34d399";
const typeBg    = t => t==="Indica"?"#1e1b4b":t==="Sativa"?"#431407":"#022c22";

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
  photos:[],
});

// ─── LOGO SVG ─────────────────────────────────────────────────────────────────
const LogoMark = ({ size=32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink:0, display:"block" }}>
    <rect width="100" height="100" rx="20" fill="#0a1f0a"/>
    <g transform="translate(50,54)">
      <polygon points="0,-28 2.8,-14 0,2 -2.8,-14" fill="#0a1f0a" stroke="#a3e635" strokeWidth="2.2" strokeLinejoin="round"/>
      <polygon points="0,-28 2.8,-14 0,2 -2.8,-14" fill="#0a1f0a" stroke="#a3e635" strokeWidth="2" strokeLinejoin="round" transform="rotate(-36,0,0)"/>
      <polygon points="0,-28 2.8,-14 0,2 -2.8,-14" fill="#0a1f0a" stroke="#a3e635" strokeWidth="2" strokeLinejoin="round" transform="rotate(36,0,0)"/>
      <polygon points="0,-25 2.4,-12 0,2 -2.4,-12" fill="#0a1f0a" stroke="#6aaa18" strokeWidth="1.7" strokeLinejoin="round" transform="rotate(-72,0,0)"/>
      <polygon points="0,-25 2.4,-12 0,2 -2.4,-12" fill="#0a1f0a" stroke="#6aaa18" strokeWidth="1.7" strokeLinejoin="round" transform="rotate(72,0,0)"/>
      <polygon points="0,-21 2,-10 0,2 -2,-10" fill="#0a1f0a" stroke="#4a8010" strokeWidth="1.4" strokeLinejoin="round" transform="rotate(-108,0,0)"/>
      <polygon points="0,-21 2,-10 0,2 -2,-10" fill="#0a1f0a" stroke="#4a8010" strokeWidth="1.4" strokeLinejoin="round" transform="rotate(108,0,0)"/>
      <line x1="0" y1="2" x2="0" y2="12" stroke="#4a8a18" strokeWidth="4" strokeLinecap="round"/>
      <line x1="0" y1="-28" x2="0" y2="-34" stroke="#2a5010" strokeWidth="1.5"/>
      <circle cx="0" cy="-34" r="4" fill="#a3e635"/>
      <circle cx="0" cy="-34" r="7" fill="none" stroke="#a3e635" strokeWidth="0.8" opacity="0.3"/>
      <circle cx="-14" cy="-30" r="3" fill="#a3e635"/>
      <circle cx="14" cy="-30" r="3" fill="#a3e635"/>
      <circle cx="0" cy="0" r="4" fill="#0a1f0a" stroke="#a3e635" strokeWidth="1.5"/>
      <circle cx="0" cy="0" r="1.5" fill="#a3e635"/>
    </g>
  </svg>
);

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const C = {
  bg:"#080f09", card:"#0e1a0f", border:"#1c2e1c",
  accent:"#a3e635", accentDim:"#a3e63520",
  text:"#d4e8c2", muted:"#4a6a4a", faint:"#1e3020",
  amber:"#f59e0b", amberDim:"#f59e0b22",
};

const Slider = ({ label, icon, value, onChange, min=1, max=10, step=1, color="#a3e635" }) => {
  const pct = ((value-min)/(max-min))*100;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontSize:13, color:C.muted, display:"flex", alignItems:"center", gap:6 }}><span>{icon}</span>{label}</span>
        <span style={{ fontSize:18, fontWeight:700, color }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(+e.target.value)}
        className="styled-slider"
        style={{ "--pct":`${pct}%`, "--col":color, width:"100%", display:"block" }}/>
    </div>
  );
};

const BidirSlider = ({ icon, label, value, onChange, color }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
    <span style={{ fontSize:15, minWidth:20 }}>{icon}</span>
    <div style={{ flex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, color:C.muted }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color:value>0?color:value<0?"#f87171":C.faint }}>
          {value===0?"—":value>0?`+${value}`:value}
        </span>
      </div>
      <div style={{ position:"relative", height:6, background:C.faint, borderRadius:3 }}>
        <div style={{ position:"absolute", top:0, height:"100%", borderRadius:3,
          width:`${Math.abs(value)/5*50}%`,
          left:value>=0?"50%":`${50-Math.abs(value)/5*50}%`,
          background:value>=0?color:"#f87171" }}/>
        <div style={{ position:"absolute", left:"50%", top:-2, width:2, height:10, background:C.border, borderRadius:1 }}/>
        <input type="range" min={-5} max={5} value={value} onChange={e=>onChange(+e.target.value)}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0, cursor:"pointer", zIndex:10 }}/>
      </div>
    </div>
  </div>
);

const Tag = ({ label, active, color=C.accent, bg, onClick }) => (
  <button onClick={onClick} style={{
    padding:"6px 12px", borderRadius:20,
    border:`1.5px solid ${active?color:C.border}`,
    background:active?(bg||color+"20"):"transparent",
    color:active?color:C.muted,
    fontSize:12, cursor:"pointer", fontFamily:"system-ui",
    fontWeight:active?600:400, transition:"all 0.15s",
  }}>{label}</button>
);

const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16, ...style }}>
    {children}
  </div>
);

const StepDots = ({ current, total, onGo }) => (
  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
    {Array.from({length:total},(_,i)=>(
      <button key={i} onClick={()=>onGo(i)} style={{
        width:i===current?20:8, height:8, borderRadius:4, border:"none", cursor:"pointer",
        background:i<current?"#34d399":i===current?C.accent:C.faint,
        transition:"all 0.25s",
      }}/>
    ))}
  </div>
);

// Scrolling strain gallery background
const StrainGallery = () => {
  const cols = [
    STRAIN_DB.slice(0,8), STRAIN_DB.slice(8,16), STRAIN_DB.slice(16,24), STRAIN_DB.slice(24,32),
  ];
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      <style>{`
        @keyframes scrollUp { from{transform:translateY(0)} to{transform:translateY(-50%)} }
        @keyframes scrollDown { from{transform:translateY(-50%)} to{transform:translateY(0)} }
      `}</style>
      <div style={{ position:"absolute", inset:0, display:"flex", gap:10, padding:"0 10px" }}>
        {cols.map((col,ci)=>(
          <div key={ci} style={{ flex:1, overflow:"hidden", opacity:0.18 }}>
            <div style={{
              display:"flex", flexDirection:"column", gap:8,
              animation:`${ci%2===0?"scrollUp":"scrollDown"} ${28+ci*4}s linear infinite`,
            }}>
              {[...col,...col].map((s,i)=>(
                <div key={i} style={{ background:typeBg(s.type), border:`1px solid ${typeColor(s.type)}44`,
                  borderRadius:10, padding:"8px 10px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:typeColor(s.type), marginBottom:2 }}>{s.name}</div>
                  <div style={{ fontSize:9, color:"#ffffff55" }}>{s.type} · THC {s.thc}%</div>
                  <div style={{ display:"flex", gap:3, marginTop:4, flexWrap:"wrap" }}>
                    {s.effects.slice(0,2).map(e=>(
                      <span key={e} style={{ fontSize:8, padding:"1px 5px", background:"#ffffff11", borderRadius:6, color:"#ffffff66" }}>{e}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Fade overlays top and bottom */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:120, background:`linear-gradient(to bottom,${C.bg},transparent)` }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:120, background:`linear-gradient(to top,${C.bg},transparent)` }}/>
    </div>
  );
};

// ─── ONBOARDING QUIZ ──────────────────────────────────────────────────────────
const QUIZ_STEPS = [
  { id:"experience", q:"How long have you been consuming cannabis?", opts:["First time","< 1 year","1–3 years","3–5 years","5+ years"] },
  { id:"frequency",  q:"How often do you currently consume?", opts:["Rarely","1–2x/week","3–4x/week","Daily","Multiple times daily"] },
  { id:"goal",       q:"What's your main reason for using?", opts:["Relaxation","Pain/medical","Sleep","Creativity","Social","Exploration"] },
  { id:"method",     q:"What's your preferred method?", opts:["Joints/blunts","Vaporiser","Bong/pipe","Edibles","Mixed"] },
  { id:"strains",    q:"Any strains you've tried and loved?", type:"text", placeholder:"e.g. Blue Dream, OG Kush (optional)" },
];

const OnboardingQuiz = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textVal, setTextVal] = useState("");

  const current = QUIZ_STEPS[step];
  const isLast = step === QUIZ_STEPS.length - 1;

  const handleOpt = (opt) => {
    const updated = { ...answers, [current.id]: opt };
    setAnswers(updated);
    if (!isLast) setStep(s=>s+1);
    else onComplete({ ...updated, pastStrains: textVal });
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(8,15,9,0.96)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <LogoMark size={36}/>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:C.accent }}>Welcome to Terp Journal</div>
            <div style={{ fontSize:12, color:C.muted }}>Quick setup — {QUIZ_STEPS.length - step} questions left</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height:3, background:C.faint, borderRadius:2, marginBottom:28 }}>
          <div style={{ height:"100%", borderRadius:2, background:C.accent, width:`${(step/QUIZ_STEPS.length)*100}%`, transition:"width 0.3s" }}/>
        </div>

        <div style={{ fontSize:17, fontWeight:600, color:C.text, marginBottom:20, lineHeight:1.4 }}>{current.q}</div>

        {current.type === "text" ? (
          <div>
            <input value={textVal} onChange={e=>setTextVal(e.target.value)}
              placeholder={current.placeholder}
              style={{ width:"100%", padding:"14px", background:C.card, border:`1.5px solid ${C.border}`,
                borderRadius:12, color:C.text, fontSize:14, boxSizing:"border-box", marginBottom:14 }}/>
            <button onClick={()=>onComplete({ ...answers, pastStrains: textVal })}
              style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", cursor:"pointer",
                background:`linear-gradient(135deg,#2a6a0a,${C.accent})`, color:"#060d07", fontSize:15, fontWeight:700 }}>
              Get Started →
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {current.opts.map(opt=>(
              <button key={opt} onClick={()=>handleOpt(opt)} style={{
                padding:"14px 18px", borderRadius:12, border:`1.5px solid ${C.border}`,
                background:C.card, color:C.text, fontSize:14, cursor:"pointer",
                textAlign:"left", transition:"all 0.15s", fontFamily:"system-ui",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.accent; e.currentTarget.style.background=C.accentDim; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.card; }}>
                {opt}
              </button>
            ))}
          </div>
        )}

        <button onClick={()=>onComplete(answers)} style={{
          marginTop:16, padding:"8px", width:"100%", borderRadius:8, border:"none",
          background:"transparent", color:C.muted, cursor:"pointer", fontSize:12 }}>
          Skip setup
        </button>
      </div>
    </div>
  );
};

// ─── SESSION EDIT MODAL ────────────────────────────────────────────────────────
const EditModal = ({ session, strains, onSave, onClose }) => {
  const [f, setF] = useState({ ...session });
  const toggle = (key,val) => setF(prev=>({...prev,[key]:prev[key].includes(val)?prev[key].filter(x=>x!==val):[...prev[key],val]}));
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(8,15,9,0.95)", overflowY:"auto", padding:20 }}>
      <div style={{ maxWidth:480, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.accent }}>Edit Session</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>✕</button>
        </div>

        <Card style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>STRAIN</div>
          <select value={f.strain} onChange={e=>setF(p=>({...p,strain:e.target.value}))}
            style={{ width:"100%", padding:"10px", background:"#0a1a0b", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13 }}>
            {STRAIN_DB.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
            {strains.filter(s=>!STRAIN_DB.find(d=>d.name===s.name)).map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </Card>

        <Card style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>OVERALL RATING</div>
          <Slider label="Overall" icon="⭐" value={f.ratings?.overall||7} onChange={v=>setF(p=>({...p,ratings:{...p.ratings,overall:v}}))} color="#f59e0b"/>
        </Card>

        <Card style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>EFFECTS</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {EFFECTS.map(e=><Tag key={e} label={e} active={f.effects?.includes(e)} onClick={()=>toggle("effects",e)}/>)}
          </div>
        </Card>

        <Card style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>NOTES</div>
          <textarea value={f.notes||""} onChange={e=>setF(p=>({...p,notes:e.target.value}))}
            rows={3} placeholder="Session notes..."
            style={{ width:"100%", padding:"10px", background:"#0a1a0b", border:`1px solid ${C.border}`,
              borderRadius:8, color:C.text, fontSize:13, resize:"none", boxSizing:"border-box" }}/>
        </Card>

        <button onClick={()=>onSave(f)} style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", cursor:"pointer",
          background:`linear-gradient(135deg,#2a6a0a,${C.accent})`, color:"#060d07", fontSize:14, fontWeight:700 }}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// ─── PHOTO TIPS MODAL ──────────────────────────────────────────────────────────
const PhotoTips = ({ onClose }) => (
  <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(8,15,9,0.97)", padding:24, overflowY:"auto" }}>
    <div style={{ maxWidth:440, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:16, fontWeight:700, color:C.accent }}>📸 Bud Photo Tips</div>
        <button onClick={onClose} style={{ background:"transparent", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>✕</button>
      </div>
      {[
        ["Natural light is king","Take photos near a window during daytime. Avoid flash — it flattens the trichomes and kills the colour."],
        ["Macro mode","Switch to portrait or macro mode on your phone. Get 5–10cm away from the bud to capture trichome detail."],
        ["Dark background","Place the bud on a dark surface — black paper or a dark plate. Makes the green and orange pop."],
        ["Multiple angles","Top-down shows structure. Side-on shows density. Close-up shows trichomes. Take all three."],
        ["Clean the lens","Obvious but forgotten. Your pocket lint is killing your shots."],
        ["Steady hands","Rest your phone on a surface or use the timer to avoid blur on close shots."],
      ].map(([title,tip])=>(
        <Card key={title} style={{ marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.accent, marginBottom:4 }}>{title}</div>
          <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{tip}</div>
        </Card>
      ))}
    </div>
  </div>
);

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,      setTab]      = useState("home");
  const [sessions, setSessions] = useState(()=>{ try{return JSON.parse(localStorage.getItem("tj6_s")||"[]")}catch{return []} });
  const [custom,   setCustom]   = useState(()=>{ try{return JSON.parse(localStorage.getItem("tj6_c")||"[]")}catch{return []} });
  const [profile,  setProfile]  = useState(()=>{ try{return JSON.parse(localStorage.getItem("tj6_p")||"null")}catch{return null} });

  const [step,     setStep]     = useState(0);
  const [form,     setForm]     = useState(mkForm());
  const [saved,    setSaved]    = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showPhotoTips,  setShowPhotoTips]  = useState(false);

  // Optional steps collapsed state
  const [optionalOpen, setOptionalOpen] = useState({ effects:false, wellbeing:false });

  // Strain search
  const [sq,       setSq]       = useState("");
  const [sdrop,    setSdrop]    = useState(false);
  const [aiRes,    setAiRes]    = useState([]);
  const [aiLoad,   setAiLoad]   = useState(false);
  const searchRef  = useRef(null);
  const aiTimer    = useRef(null);

  const [expandedId, setExpandedId]   = useState(null);
  const [addingStrain, setAddingStrain] = useState(false);
  const [newS,     setNewS]     = useState({name:"",type:"Hybrid",thc:"",cbd:"",description:""});

  useEffect(()=>{ localStorage.setItem("tj6_s", JSON.stringify(sessions)); },[sessions]);
  useEffect(()=>{ localStorage.setItem("tj6_c", JSON.stringify(custom));   },[custom]);
  useEffect(()=>{ localStorage.setItem("tj6_p", JSON.stringify(profile));  },[profile]);

  useEffect(()=>{
    const h=e=>{ if(searchRef.current&&!searchRef.current.contains(e.target)) setSdrop(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const allStrains = [...STRAIN_DB, ...custom.filter(c=>!STRAIN_DB.find(d=>d.name.toLowerCase()===c.name.toLowerCase()))];
  const localMatches = sq.length>=1 ? allStrains.filter(s=>
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
    setTimeout(()=>{ setSaved(false); setForm(mkForm()); setStep(0); setTab("home"); },1600);
  };

  const saveEdit = (updated) => {
    setSessions(p=>p.map(s=>s.id===updated.id?updated:s));
    setEditingSession(null);
  };

  // Photo handler
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f=>({...f, photos:[...f.photos, ev.target.result]}));
    reader.readAsDataURL(file);
  };

  // Data export
  const exportData = () => {
    const headers = ["Date","Strain","Method","Amount","Overall","Taste","Potency","Smooth","Effect","Value","Intensity","MoodBefore","MoodAfter","Effects","Flavors","Brand","Source","Notes"];
    const rows = sessions.map(s=>[
      s.date, s.strain, s.method, s.amount,
      s.ratings?.overall||"", s.ratings?.taste||"", s.ratings?.potency||"",
      s.ratings?.smoothness||"", s.ratings?.effect||"", s.ratings?.value||"",
      s.intensity||"", s.moodBefore, s.moodAfter,
      (s.effects||[]).join("|"), (s.flavors||[]).join("|"),
      s.brand||"", s.source||"", (s.notes||"").replace(/,/g," ")
    ]);
    const csv = [headers, ...rows].map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `terp-journal-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = { sessions, custom, profile, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `terp-journal-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.sessions) setSessions(data.sessions);
        if (data.custom)   setCustom(data.custom);
        if (data.profile)  setProfile(data.profile);
        alert("Data restored successfully!");
      } catch { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  };

  // Analytics
  const streak = (() => {
    if(!sessions.length) return 0;
    const days=[...new Set(sessions.map(s=>new Date(s.date).toDateString()))];
    let count=0,d=new Date();
    for(let i=0;i<30;i++){
      if(days.includes(d.toDateString())){ count++; d.setDate(d.getDate()-1); }
      else if(i===0){ d.setDate(d.getDate()-1); if(days.includes(d.toDateString())){count++;d.setDate(d.getDate()-1);}else break; }
      else break;
    }
    return count;
  })();

  const avgRating    = sessions.length?(sessions.reduce((a,s)=>a+(s.ratings?.overall||0),0)/sessions.length).toFixed(1):"—";
  const strainNames  = [...new Set(sessions.map(s=>s.strain))].filter(Boolean);
  const qualifiedStrains = strainNames.filter(n=>sessions.filter(s=>s.strain===n).length>=2);
  const recentStrains = [...new Set(sessions.slice(0,5).map(s=>s.strain))].filter(Boolean).slice(0,3);
  const lastSession  = sessions[0];
  const trend = [...sessions].reverse().slice(-10).map((s,i)=>({
    i:i+1, r:s.ratings?.overall||0,
    label:new Date(s.date).toLocaleDateString("en-AU",{month:"short",day:"numeric"})
  }));
  const effectCounts = EFFECTS.map(e=>({e,n:sessions.filter(s=>s.effects?.includes(e)).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,6);
  const TT = { contentStyle:{background:"#0a150b",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:11} };

  const setRating = (id,v) => setForm(f=>({...f,ratings:{...f.ratings,[id]:v}}));

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", maxWidth:500, margin:"0 auto", background:C.bg, color:C.text, fontFamily:"system-ui,-apple-system,sans-serif", fontSize:15 }}>

      {/* ONBOARDING */}
      {!profile && <OnboardingQuiz onComplete={(ans)=>setProfile({...ans, completedAt: new Date().toISOString()})}/>}

      {/* EDIT MODAL */}
      {editingSession && <EditModal session={editingSession} strains={allStrains} onSave={saveEdit} onClose={()=>setEditingSession(null)}/>}

      {/* PHOTO TIPS */}
      {showPhotoTips && <PhotoTips onClose={()=>setShowPhotoTips(false)}/>}

      {/* SAVE SUCCESS */}
      {saved && (
        <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center",
          background:"rgba(8,15,9,0.92)", backdropFilter:"blur(6px)" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
            <div style={{ fontSize:22, fontWeight:700, color:C.accent }}>Session saved!</div>
            <div style={{ fontSize:14, color:C.muted, marginTop:6 }}>Your journal is growing 🌿</div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:C.bg+"f5",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`,
        padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <LogoMark size={32}/>
          <div>
            <div style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.02em", color:C.accent }}>Terp Journal</div>
            <div style={{ fontSize:10, color:C.muted }}>cannabis companion</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {streak>0 && (
            <div style={{ background:C.amberDim, border:`1px solid ${C.amber}44`, borderRadius:20, padding:"4px 10px",
              fontSize:12, color:C.amber }}>🔥 {streak}d</div>
          )}
        </div>
      </header>

      {/* NAV */}
      <nav style={{ display:"flex", background:C.bg, borderBottom:`1px solid ${C.border}`, position:"sticky", top:57, zIndex:49 }}>
        {[{id:"home",e:"🏠",l:"Home"},{id:"log",e:"✦",l:"Log"},{id:"sessions",e:"📋",l:"History"},{id:"insights",e:"📊",l:"Insights"},{id:"more",e:"⚙️",l:"More"}].map(t=>(
          <button key={t.id} onClick={()=>{ setTab(t.id); if(t.id==="log")setStep(0); }} style={{
            flex:1, padding:"9px 2px", border:"none", cursor:"pointer", background:"transparent",
            borderBottom:tab===t.id?`2px solid ${C.accent}`:"2px solid transparent",
            color:tab===t.id?C.accent:C.muted, fontSize:9, letterSpacing:"0.05em", fontFamily:"system-ui",
          }}>
            <div style={{ fontSize:15, marginBottom:1 }}>{t.e}</div>{t.l}
          </button>
        ))}
      </nav>

      <div style={{ position:"relative", zIndex:1, padding:"16px 14px 100px" }}>

        {/* ════ HOME ════ */}
        {tab==="home" && (
          <div>
            {sessions.length===0 ? (
              <div style={{ position:"relative", minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                <StrainGallery/>
                <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"0 20px" }}>
                  <LogoMark size={72}/>
                  <div style={{ fontSize:26, fontWeight:800, color:C.accent, marginTop:16, marginBottom:8 }}>Terp Journal</div>
                  <div style={{ fontSize:15, color:C.muted, lineHeight:1.6, marginBottom:28 }}>
                    Track your cannabis experiences.<br/>Discover what actually works for you.
                  </div>
                  <button onClick={()=>setTab("log")} style={{
                    padding:"14px 32px", borderRadius:50, border:"none", cursor:"pointer",
                    background:`linear-gradient(135deg,#2a6a0a,${C.accent})`, color:"#060d07",
                    fontSize:16, fontWeight:800, boxShadow:`0 4px 24px ${C.accent}44`, marginBottom:32,
                  }}>
                    Log your first session →
                  </button>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                    {[["🔍","80+ Strains","Instant search"],["📊","Real Insights","What works for you"],["🧠","AI Analysis","Verify your strains"]].map(([e,h,d])=>(
                      <Card key={h} style={{ textAlign:"center", padding:12 }}>
                        <div style={{ fontSize:22, marginBottom:6 }}>{e}</div>
                        <div style={{ fontSize:11, fontWeight:600, color:C.text, marginBottom:2 }}>{h}</div>
                        <div style={{ fontSize:10, color:C.muted }}>{d}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
                  {[
                    {v:sessions.length, l:"Sessions", i:"📋", c:C.accent},
                    {v:avgRating,       l:"Avg Rating",i:"⭐", c:C.amber},
                    {v:strainNames.length,l:"Strains", i:"🌱", c:"#34d399"},
                  ].map(x=>(
                    <Card key={x.l} style={{ textAlign:"center", padding:12 }}>
                      <div style={{ fontSize:18, marginBottom:2 }}>{x.i}</div>
                      <div style={{ fontSize:22, fontWeight:800, color:x.c }}>{x.v}</div>
                      <div style={{ fontSize:10, color:C.muted }}>{x.l}</div>
                    </Card>
                  ))}
                </div>

                {/* Profile summary if onboarding done */}
                {profile?.goal && (
                  <Card style={{ marginBottom:14, padding:12 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>YOUR PROFILE</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {[profile.experience, profile.frequency, profile.goal, profile.method].filter(Boolean).map(v=>(
                        <span key={v} style={{ fontSize:11, padding:"3px 9px", background:C.accentDim, borderRadius:10, color:C.accent }}>{v}</span>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Quick log */}
                {recentStrains.length>0 && (
                  <Card style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>QUICK LOG</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {recentStrains.map(name=>{
                        const s=allStrains.find(x=>x.name===name);
                        return (
                          <button key={name} onClick={()=>{ setForm(f=>({...f,strain:name})); setStep(1); setTab("log"); }}
                            style={{ padding:"8px 14px", borderRadius:20, border:`1.5px solid ${s?typeColor(s.type)+"44":C.border}`,
                              background:s?typeBg(s.type):"transparent", color:s?typeColor(s.type):C.text, fontSize:13, cursor:"pointer", fontWeight:500 }}>
                            {name}
                          </button>
                        );
                      })}
                      <button onClick={()=>{ setStep(0); setTab("log"); }}
                        style={{ padding:"8px 14px", borderRadius:20, border:`1.5px dashed ${C.border}`,
                          background:"transparent", color:C.muted, fontSize:13, cursor:"pointer" }}>
                        + New
                      </button>
                    </div>
                  </Card>
                )}

                {/* Last session */}
                {lastSession && (
                  <Card style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>LAST SESSION</div>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ fontSize:28 }}>{METHODS.find(m=>m.id===lastSession.method)?.emoji||"🌿"}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{lastSession.strain}</div>
                        <div style={{ fontSize:11, color:C.muted }}>{new Date(lastSession.date).toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"})}</div>
                        <div style={{ display:"flex", gap:5, marginTop:5, flexWrap:"wrap" }}>
                          {lastSession.effects?.slice(0,3).map(e=>(
                            <span key={e} style={{ fontSize:10, padding:"2px 8px", background:C.accentDim, borderRadius:10, color:C.accent }}>{e}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:24, fontWeight:800, color:C.accent }}>{lastSession.ratings?.overall||"?"}</div>
                        <div style={{ fontSize:9, color:C.muted }}>/10</div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Strain intelligence teaser */}
                {qualifiedStrains.length>0 ? (
                  <button onClick={()=>setTab("insights")} style={{
                    width:"100%", padding:"14px", borderRadius:16, border:`1px solid ${C.accent}44`,
                    background:`linear-gradient(135deg,${C.card},#0d2010)`, cursor:"pointer", textAlign:"left",
                    display:"flex", alignItems:"center", gap:12, marginBottom:14,
                  }}>
                    <div style={{ fontSize:28 }}>🧠</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.accent }}>Strain Intelligence ready</div>
                      <div style={{ fontSize:11, color:C.muted }}>See what {qualifiedStrains[0]} actually does to you →</div>
                    </div>
                  </button>
                ) : (
                  <Card style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <div style={{ fontSize:28 }}>🧠</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:4 }}>Strain Intelligence</div>
                        <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>
                          {sessions.length===0
                            ? "Log sessions to unlock your personal strain effect breakdown."
                            : `Log ${2-Math.min(2,sessions.filter(s=>s.strain===sessions[0]?.strain).length)} more "${sessions[0]?.strain}" session${sessions.filter(s=>s.strain===sessions[0]?.strain).length===1?"":"s"} to unlock insights.`}
                        </div>
                        <div style={{ height:6, background:C.faint, borderRadius:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:3, background:C.accent,
                            width:`${Math.min(100,sessions.filter(s=>s.strain===sessions[0]?.strain).length/2*100)}%`,
                            transition:"width 0.5s" }}/>
                        </div>
                        <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>
                          {sessions.filter(s=>s.strain===sessions[0]?.strain).length}/2 sessions needed
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════ LOG WIZARD ════ */}
        {tab==="log" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.text }}>
                {["Pick your strain","Method & amount","Mood","Rate it","Wellbeing (optional)"][step]}
              </div>
              <StepDots current={step} total={5} onGo={setStep}/>
            </div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:18 }}>
              {["Search 80+ strains instantly","How and how much","How are you feeling?","Score the experience","Track health effects — skip if you want"][step]}
            </div>

            {/* STEP 0: STRAIN */}
            {step===0 && (
              <div>
                <div ref={searchRef} style={{ position:"relative", marginBottom:16 }}>
                  <input value={sq} onChange={e=>onSQ(e.target.value)}
                    onFocus={()=>sq.length>=1&&setSdrop(true)}
                    placeholder="Search strain, effect, or type..."
                    style={{ width:"100%", padding:"14px 42px 14px 16px", background:C.card,
                      border:`1.5px solid ${sq?"#2a5a2a":C.border}`, borderRadius:14, color:C.text,
                      fontSize:14, boxSizing:"border-box", outline:"none" }}/>
                  <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:C.muted, fontSize:16 }}>
                    {aiLoad?"⟳":"🔍"}
                  </div>
                  {sdrop && sq.length>=1 && (
                    <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:200,
                      background:"#0d1a0e", border:`1px solid #2a4a2a`, borderRadius:14,
                      boxShadow:"0 12px 40px rgba(0,0,0,0.7)", overflow:"hidden", maxHeight:300, overflowY:"auto" }}>
                      {dropList.length===0&&!aiLoad&&<div style={{ padding:16, fontSize:12, color:C.muted, textAlign:"center" }}>No matches</div>}
                      {dropList.map((r,i)=>(
                        <button key={r.name+i} onClick={()=>pickStrain(r)} style={{
                          width:"100%", padding:"12px 14px", background:"transparent", border:"none",
                          borderBottom:i<dropList.length-1?`1px solid ${C.border}`:"none",
                          cursor:"pointer", textAlign:"left" }}
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
                      {aiLoad&&<div style={{ padding:12, fontSize:11, color:C.muted, textAlign:"center", borderTop:`1px solid ${C.border}` }}>Searching AI…</div>}
                    </div>
                  )}
                </div>

                {curStrain ? (
                  <Card style={{ border:`2px solid ${typeColor(curStrain.type)}33`, marginBottom:16, boxShadow:`0 0 20px ${typeColor(curStrain.type)}15` }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:6 }}>
                          <span style={{ fontSize:17, fontWeight:800, color:C.text }}>{curStrain.name}</span>
                          <span style={{ fontSize:10, padding:"2px 8px", background:typeBg(curStrain.type), border:`1px solid ${typeColor(curStrain.type)}`, borderRadius:10, color:typeColor(curStrain.type) }}>{curStrain.type}</span>
                        </div>
                        <div style={{ display:"flex", gap:12, fontSize:13, marginBottom:8 }}>
                          <span style={{ color:C.amber, fontWeight:600 }}>THC {curStrain.thc}%</span>
                          {curStrain.cbd>0&&<span style={{ color:"#34d399", fontWeight:600 }}>CBD {curStrain.cbd}%</span>}
                        </div>
                        <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>{curStrain.description}</div>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          {curStrain.effects?.map(e=><span key={e} style={{ fontSize:10, padding:"2px 8px", background:C.accentDim, borderRadius:10, color:C.accent }}>{e}</span>)}
                        </div>
                      </div>
                      <button onClick={()=>setForm(f=>({...f,strain:""}))} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:18, alignSelf:"flex-start" }}>✕</button>
                    </div>
                  </Card>
                ) : (
                  <div>
                    <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>Popular strains:</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20 }}>
                      {STRAIN_DB.slice(0,8).map(s=>(
                        <button key={s.name} onClick={()=>setForm(f=>({...f,strain:s.name}))}
                          style={{ padding:"7px 14px", borderRadius:20, border:`1px solid ${typeColor(s.type)}33`,
                            background:typeBg(s.type), color:typeColor(s.type), fontSize:12, cursor:"pointer" }}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                    {!addingStrain ? (
                      <button onClick={()=>setAddingStrain(true)} style={{
                        width:"100%", padding:"12px", borderRadius:12, border:`1.5px dashed ${C.border}`,
                        background:"transparent", color:C.muted, cursor:"pointer", fontSize:13 }}>
                        + Add a strain not in the list
                      </button>
                    ) : (
                      <Card>
                        <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:10 }}>Add custom strain</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                          {[["Name","name","text"],["THC %","thc","number"],["CBD %","cbd","number"]].map(([ph,k,t])=>(
                            <input key={k} type={t} placeholder={ph} value={newS[k]||""} onChange={e=>setNewS(s=>({...s,[k]:t==="number"?+e.target.value:e.target.value}))}
                              style={{ padding:"10px", background:"#0a1a0b", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }}/>
                          ))}
                          <select value={newS.type} onChange={e=>setNewS(s=>({...s,type:e.target.value}))}
                            style={{ padding:"10px", background:"#0a1a0b", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }}>
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
                      </Card>
                    )}
                  </div>
                )}

                {form.strain && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
                    <input placeholder="Brand (optional)" value={form.brand} onChange={e=>setForm(f=>({...f,brand:e.target.value}))}
                      style={{ padding:"10px 12px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12 }}/>
                    <input placeholder="Source / dispensary" value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))}
                      style={{ padding:"10px 12px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12 }}/>
                  </div>
                )}

                {/* Strain photos */}
                {form.strain && (
                  <Card style={{ marginTop:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:C.text }}>📸 Strain Photos</div>
                      <button onClick={()=>setShowPhotoTips(true)} style={{ fontSize:11, color:C.accent, background:"transparent", border:"none", cursor:"pointer" }}>Photo tips →</button>
                    </div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {form.photos.map((p,i)=>(
                        <div key={i} style={{ position:"relative" }}>
                          <img src={p} style={{ width:64, height:64, borderRadius:8, objectFit:"cover" }} alt="bud"/>
                          <button onClick={()=>setForm(f=>({...f,photos:f.photos.filter((_,j)=>j!==i)}))}
                            style={{ position:"absolute", top:-4, right:-4, width:18, height:18, borderRadius:"50%",
                              background:"#ef4444", border:"none", color:"white", cursor:"pointer", fontSize:11, lineHeight:"18px", textAlign:"center" }}>✕</button>
                        </div>
                      ))}
                      <label style={{ width:64, height:64, borderRadius:8, border:`2px dashed ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.muted, fontSize:24 }}>
                        +<input type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }}/>
                      </label>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* STEP 1: METHOD */}
            {step===1 && (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:20 }}>
                  {METHODS.map(m=>(
                    <button key={m.id} onClick={()=>setForm(f=>({...f,method:m.id,amount:m.def}))}
                      style={{ padding:"14px 8px", borderRadius:14,
                        border:`2px solid ${form.method===m.id?C.accent:C.border}`,
                        background:form.method===m.id?C.accentDim:C.card,
                        color:form.method===m.id?C.accent:C.muted,
                        cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}>
                      <div style={{ fontSize:24, marginBottom:4 }}>{m.emoji}</div>
                      <div style={{ fontSize:11, fontWeight:form.method===m.id?700:400 }}>{m.label}</div>
                    </button>
                  ))}
                </div>
                <Card>
                  <Slider label={curMethod.unit==="puffs"?"Puffs":curMethod.unit==="ml"?"Amount (ml)":curMethod.unit==="mg"?"Dose (mg THC)":"Amount (g)"}
                    icon={curMethod.emoji} value={form.amount} onChange={v=>setForm(f=>({...f,amount:v}))}
                    min={curMethod.min} max={curMethod.max} step={curMethod.step}/>
                  <div style={{ textAlign:"center", fontSize:28, fontWeight:800, color:C.accent, marginTop:4 }}>
                    {form.amount} {curMethod.unit}
                  </div>
                </Card>
                <Card style={{ marginTop:12 }}>
                  <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>Date & time</div>
                  <input type="datetime-local" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                    style={{ width:"100%", padding:"10px 12px", background:"#0a1a0b", border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12, boxSizing:"border-box" }}/>
                </Card>
              </div>
            )}

            {/* STEP 2: MOOD */}
            {step===2 && (
              <div>
                {[["How are you feeling RIGHT NOW?","moodBefore"],["How do you expect to feel after?","moodAfter"]].map(([lbl,key])=>(
                  <div key={key} style={{ marginBottom:24 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:12 }}>{lbl}</div>
                    <div style={{ display:"flex", gap:6 }}>
                      {MOODS.map((m,i)=>(
                        <button key={i} onClick={()=>setForm(f=>({...f,[key]:i}))} style={{
                          flex:1, padding:"10px 4px", borderRadius:12,
                          border:`2px solid ${form[key]===i?C.amber:C.border}`,
                          background:form[key]===i?"#2a1f00":C.card,
                          cursor:"pointer", textAlign:"center", transition:"all 0.15s",
                        }}>
                          <div style={{ fontSize:24, marginBottom:2 }}>{m}</div>
                          <div style={{ fontSize:9, color:form[key]===i?C.amber:C.muted }}>{MOOD_LABELS[i]}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>Notes (optional)</div>
                  <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                    placeholder="Setting, context, what you're doing..."
                    rows={3} style={{ width:"100%", padding:"12px", background:C.card, border:`1px solid ${C.border}`,
                      borderRadius:12, color:C.text, fontSize:13, resize:"none", boxSizing:"border-box" }}/>
                </div>
              </div>
            )}

            {/* STEP 3: RATINGS */}
            {step===3 && (
              <div>
                <Card style={{ marginBottom:14 }}>
                  {RATINGS.map(r=><Slider key={r.id} label={r.label} icon={r.icon} value={form.ratings[r.id]} onChange={v=>setRating(r.id,v)} color={r.color}/>)}
                  <Slider label="Intensity" icon="🌡️" value={form.intensity} onChange={v=>setForm(f=>({...f,intensity:v}))} color="#a78bfa"/>
                </Card>

                {/* Effects — collapsible optional */}
                <button onClick={()=>setOptionalOpen(o=>({...o,effects:!o.effects}))}
                  style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:`1px solid ${C.border}`,
                    background:C.card, color:C.text, cursor:"pointer", textAlign:"left", display:"flex",
                    justifyContent:"space-between", alignItems:"center", marginBottom:optionalOpen.effects?0:10, fontSize:14 }}>
                  <span>🏷️ Effects & Flavours <span style={{ fontSize:11, color:C.muted }}>(optional)</span></span>
                  <span style={{ color:C.muted }}>{optionalOpen.effects?"▾":"▸"}</span>
                </button>

                {optionalOpen.effects && (
                  <Card style={{ marginBottom:10, borderTopLeftRadius:0, borderTopRightRadius:0 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>EFFECTS FELT</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
                      {EFFECTS.map(e=><Tag key={e} label={e} active={form.effects.includes(e)} onClick={()=>toggle("effects",e)}/>)}
                    </div>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>FLAVOURS</div>
                    {FLAVOR_FAMILIES.map(fam=>(
                      <div key={fam.id} style={{ marginBottom:10 }}>
                        <div style={{ fontSize:10, color:fam.color, marginBottom:5 }}>◆ {fam.label.toUpperCase()}</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                          {fam.flavors.map(f=>(
                            <button key={f} onClick={()=>toggle("flavors",f)} style={{
                              padding:"5px 10px", borderRadius:20, fontSize:11, cursor:"pointer",
                              border:`1.5px solid ${form.flavors.includes(f)?fam.color:C.border}`,
                              background:form.flavors.includes(f)?fam.color+"22":C.card,
                              color:form.flavors.includes(f)?fam.color:C.muted }}>
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}

            {/* STEP 4: WELLBEING (optional) */}
            {step===4 && (
              <div>
                <div style={{ background:`linear-gradient(135deg,${C.card},#0a1f0a)`, border:`1px solid ${C.border}`, borderRadius:16, padding:14, marginBottom:10 }}>
                  <div style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:14 }}>
                    This step is completely optional. Track how cannabis affected your physical and mental wellbeing. Slide right = improved, left = worsened.
                  </div>

                  <div style={{ fontSize:13, fontWeight:600, color:"#6ee7b7", marginBottom:12 }}>🩹 Physical</div>
                  {PHYSICAL_CORE.map(f=><BidirSlider key={f.id} {...f} value={form.physical[f.id]||0} onChange={v=>setForm(fv=>({...fv,physical:{...fv.physical,[f.id]:v}}))} color="#6ee7b7"/>)}

                  <button onClick={()=>setOptionalOpen(o=>({...o,physMed:!o.physMed}))}
                    style={{ margin:"8px 0", padding:"6px 12px", borderRadius:8, border:`1px dashed ${C.border}`,
                      background:"transparent", color:C.muted, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", gap:6 }}>
                    {optionalOpen.physMed?"▾ Hide":"▸ Show"} medical conditions
                  </button>
                  {optionalOpen.physMed && PHYSICAL_MEDICAL.map(f=><BidirSlider key={f.id} {...f} value={form.physical[f.id]||0} onChange={v=>setForm(fv=>({...fv,physical:{...fv.physical,[f.id]:v}}))} color="#6ee7b7"/>)}

                  <textarea value={form.physicalNotes} onChange={e=>setForm(f=>({...f,physicalNotes:e.target.value}))}
                    placeholder="Describe physical effects..."
                    rows={2} style={{ width:"100%", marginTop:8, padding:"10px", background:"#0a1a0b", border:`1px solid ${C.border}`,
                      borderRadius:10, color:C.text, fontSize:12, resize:"none", boxSizing:"border-box" }}/>

                  <div style={{ fontSize:13, fontWeight:600, color:"#67e8f9", marginTop:16, marginBottom:12 }}>🧠 Mental</div>
                  {MENTAL_CORE.map(f=><BidirSlider key={f.id} {...f} value={form.mental[f.id]||0} onChange={v=>setForm(fv=>({...fv,mental:{...fv.mental,[f.id]:v}}))} color="#67e8f9"/>)}

                  <button onClick={()=>setOptionalOpen(o=>({...o,mentMed:!o.mentMed}))}
                    style={{ margin:"8px 0", padding:"6px 12px", borderRadius:8, border:`1px dashed ${C.border}`,
                      background:"transparent", color:C.muted, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", gap:6 }}>
                    {optionalOpen.mentMed?"▾ Hide":"▸ Show"} mental health conditions
                  </button>
                  {optionalOpen.mentMed && MENTAL_MEDICAL.map(f=><BidirSlider key={f.id} {...f} value={form.mental[f.id]||0} onChange={v=>setForm(fv=>({...fv,mental:{...fv.mental,[f.id]:v}}))} color="#67e8f9"/>)}

                  <textarea value={form.mentalNotes} onChange={e=>setForm(f=>({...f,mentalNotes:e.target.value}))}
                    placeholder="Describe mental effects..."
                    rows={2} style={{ width:"100%", marginTop:8, padding:"10px", background:"#0a1a0b", border:`1px solid ${C.border}`,
                      borderRadius:10, color:C.text, fontSize:12, resize:"none", boxSizing:"border-box" }}/>
                </div>
              </div>
            )}

            {/* WIZARD NAV */}
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              {step>0 && (
                <button onClick={()=>setStep(s=>s-1)} style={{
                  flex:1, padding:"14px", borderRadius:14, border:`1.5px solid ${C.border}`,
                  background:"transparent", color:C.muted, cursor:"pointer", fontSize:14, fontWeight:600 }}>
                  ← Back
                </button>
              )}
              {step<4 ? (
                <button onClick={()=>setStep(s=>s+1)} disabled={step===0&&!form.strain}
                  style={{ flex:2, padding:"14px", borderRadius:14, border:"none",
                    cursor:step===0&&!form.strain?"not-allowed":"pointer",
                    background:step===0&&!form.strain?C.faint:`linear-gradient(135deg,#2a6a0a,${C.accent})`,
                    color:step===0&&!form.strain?C.muted:"#060d07", fontSize:14, fontWeight:700,
                    boxShadow:step===0&&!form.strain?undefined:`0 4px 16px ${C.accent}33` }}>
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
            {step===4 && (
              <button onClick={saveSession} style={{ width:"100%", marginTop:10, padding:"12px", borderRadius:12, border:`1px dashed ${C.border}`,
                background:"transparent", color:C.muted, cursor:"pointer", fontSize:13 }}>
                Skip wellbeing & save
              </button>
            )}
          </div>
        )}

        {/* ════ HISTORY ════ */}
        {tab==="sessions" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:12, color:C.muted }}>{sessions.length} session{sessions.length!==1?"s":""}</div>
            </div>
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
                    borderRadius:16, marginBottom:8, overflow:"hidden", cursor:"pointer" }}>
                  <div style={{ padding:"12px 14px", display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ fontSize:22, minWidth:30, textAlign:"center" }}>{meth?.emoji||"🌿"}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.strain||"Unknown"}</div>
                      <div style={{ fontSize:11, color:C.muted }}>
                        {new Date(s.date).toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"})}
                        {s.brand&&<span style={{ color:"#3a7a4a" }}> · {s.brand}</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:7, alignItems:"center", flexShrink:0 }}>
                      {st&&<span style={{ fontSize:10, padding:"2px 8px", background:typeBg(st.type), border:`1px solid ${typeColor(st.type)}44`, borderRadius:10, color:typeColor(st.type) }}>{st.type}</span>}
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:20, fontWeight:800, color:C.accent }}>{s.ratings?.overall||"?"}</div>
                        <div style={{ fontSize:9, color:C.muted }}>/10</div>
                      </div>
                      <div style={{ fontSize:18 }}>{MOODS[s.moodAfter]||"😐"}</div>
                    </div>
                  </div>
                  {open && (
                    <div style={{ padding:"0 14px 14px", borderTop:`1px solid ${C.border}` }}>
                      {/* Photos */}
                      {s.photos?.length>0 && (
                        <div style={{ display:"flex", gap:8, marginTop:12, marginBottom:12, overflowX:"auto" }}>
                          {s.photos.map((p,i)=><img key={i} src={p} style={{ width:80, height:80, borderRadius:10, objectFit:"cover", flexShrink:0 }} alt="bud"/>)}
                        </div>
                      )}
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5, marginTop:12, marginBottom:10 }}>
                        {RATINGS.map(r=>(
                          <div key={r.id} style={{ background:"#0a150b", borderRadius:10, padding:"8px 4px", textAlign:"center" }}>
                            <div style={{ fontSize:13 }}>{r.icon}</div>
                            <div style={{ fontSize:15, fontWeight:800, color:r.color }}>{s.ratings?.[r.id]||"—"}</div>
                            <div style={{ fontSize:9, color:C.muted }}>{r.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
                        {s.effects?.map(e=><span key={e} style={{ fontSize:11, padding:"3px 10px", background:C.accentDim, borderRadius:10, color:C.accent }}>{e}</span>)}
                      </div>
                      {s.flavors?.length>0 && (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:8 }}>
                          {s.flavors.map(f=>{
                            const fam=FLAVOR_FAMILIES.find(fm=>fm.flavors.includes(f));
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
                      {s.notes&&<div style={{ fontSize:12, color:"#4a7a5a", fontStyle:"italic", marginBottom:10 }}>"{s.notes}"</div>}
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={e=>{ e.stopPropagation(); setEditingSession(s); }} style={{
                          padding:"7px 14px", borderRadius:8, border:`1px solid ${C.accent}44`,
                          background:"transparent", color:C.accent, cursor:"pointer", fontSize:12 }}>
                          ✏️ Edit
                        </button>
                        <button onClick={e=>{ e.stopPropagation(); setSessions(p=>p.filter(x=>x.id!==s.id)); setExpandedId(null); }}
                          style={{ padding:"7px 14px", borderRadius:8, border:"1px solid #3a1a1a", background:"transparent", color:"#5a2a2a", cursor:"pointer", fontSize:12 }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ════ INSIGHTS ════ */}
        {tab==="insights" && (
          <div>
            {sessions.length<2 ? (
              <div style={{ textAlign:"center", padding:"50px 20px" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
                <div style={{ fontSize:14, color:C.muted, marginBottom:8 }}>Log at least 2 sessions to see insights</div>
                <button onClick={()=>setTab("log")} style={{ padding:"10px 24px", borderRadius:20, border:"none", cursor:"pointer",
                  background:C.accentDim, color:C.accent, fontSize:13, fontWeight:600 }}>Start logging →</button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:16 }}>
                  {[
                    {v:sessions.length, l:"Sessions",    c:C.accent,  i:"📋"},
                    {v:avgRating,       l:"Avg Rating",  c:C.amber,   i:"⭐"},
                    {v:+(sessions.reduce((a,s)=>a+(s.moodAfter-s.moodBefore),0)/sessions.length).toFixed(1), l:"Mood Impact", c:"#6ee7b7", i:"🧠", prefix:true},
                    {v:strainNames.length, l:"Strains",  c:"#a78bfa", i:"🌱"},
                  ].map(x=>(
                    <Card key={x.l} style={{ textAlign:"center", padding:14 }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>{x.i}</div>
                      <div style={{ fontSize:24, fontWeight:800, color:x.c }}>
                        {x.prefix&&+x.v>=0?"+"}{x.v}
                      </div>
                      <div style={{ fontSize:10, color:C.muted }}>{x.l}</div>
                    </Card>
                  ))}
                </div>

                {/* Strain Intelligence — prominent nudge if not enough data */}
                {qualifiedStrains.length===0 && sessions.length>0 && (
                  <div style={{ background:`linear-gradient(135deg,#0d2a10,#0a1f0a)`, border:`2px solid ${C.accent}44`,
                    borderRadius:18, padding:18, marginBottom:16, textAlign:"center" }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>🧠</div>
                    <div style={{ fontSize:16, fontWeight:700, color:C.accent, marginBottom:6 }}>Strain Intelligence locked</div>
                    <div style={{ fontSize:13, color:C.muted, marginBottom:14, lineHeight:1.5 }}>
                      You need at least <strong style={{ color:C.text }}>2 sessions with the same strain</strong> to unlock your personal effect breakdown.
                    </div>
                    <div style={{ height:8, background:C.faint, borderRadius:4, marginBottom:8, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:4, background:C.accent,
                        width:`${Math.min(100,sessions.filter(s=>s.strain===sessions[0]?.strain).length/2*100)}%` }}/>
                    </div>
                    <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>
                      {sessions.filter(s=>s.strain===sessions[0]?.strain).length}/2 sessions with "{sessions[0]?.strain}"
                    </div>
                    <button onClick={()=>{ setForm(f=>({...f,strain:sessions[0]?.strain||""})); setStep(1); setTab("log"); }}
                      style={{ padding:"10px 24px", borderRadius:20, border:"none", cursor:"pointer",
                        background:`linear-gradient(135deg,#2a6a0a,${C.accent})`, color:"#060d07", fontSize:13, fontWeight:700 }}>
                      Log another session →
                    </button>
                  </div>
                )}

                {/* Strain Intelligence cards */}
                {qualifiedStrains.length>0 && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:C.accent, marginBottom:4 }}>🧠 Strain Intelligence</div>
                    <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>Based on your actual sessions — not what Leafly says.</div>
                    {qualifiedStrains.map(name=>{
                      const ss  = sessions.filter(s=>s.strain===name);
                      const n   = ss.length;
                      const st  = allStrains.find(x=>x.name===name);
                      const avg = (ss.reduce((a,s)=>a+(s.ratings?.overall||0),0)/n).toFixed(1);
                      const avgMood = (ss.reduce((a,s)=>a+(s.moodAfter-s.moodBefore),0)/n).toFixed(1);
                      const freqs = EFFECTS.map(e=>({e,pct:Math.round(ss.filter(s=>s.effects?.includes(e)).length/n*100)}))
                        .filter(x=>x.pct>0).sort((a,b)=>b.pct-a.pct).slice(0,6);
                      const consistent = freqs.filter(x=>x.pct>=50);
                      const allF = [...PHYSICAL_FACTORS,...MENTAL_FACTORS];
                      const wellImpact = allF.map(f=>{
                        const key=PHYSICAL_FACTORS.find(x=>x.id===f.id)?"physical":"mental";
                        const vals=ss.filter(s=>s[key]?.[f.id]).map(s=>s[key][f.id]);
                        if(!vals.length) return null;
                        return {...f,avg:+(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)};
                      }).filter(x=>x&&x.avg!==0).sort((a,b)=>Math.abs(b.avg)-Math.abs(a.avg)).slice(0,4);
                      return (
                        <Card key={name} style={{ border:`1.5px solid ${st?typeColor(st.type)+"33":C.border}`, marginBottom:12,
                          boxShadow:st?`0 0 20px ${typeColor(st.type)}10`:undefined }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                            <div>
                              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:4 }}>
                                <span style={{ fontWeight:800, fontSize:16, color:C.text }}>{name}</span>
                                {st&&<span style={{ fontSize:10, padding:"2px 8px", background:typeBg(st.type), border:`1px solid ${typeColor(st.type)}44`, borderRadius:10, color:typeColor(st.type) }}>{st.type}</span>}
                                <span style={{ fontSize:11, color:C.muted }}>{n} sessions</span>
                              </div>
                              <div style={{ fontSize:12, color:"#4a8a5a", fontStyle:"italic" }}>
                                {freqs[0]?`${freqs[0].pct}% of sessions: ${freqs[0].e.toLowerCase()}. Mood ${+avgMood>=0?"improves":"drops"}.`:"Keep logging for deeper insights."}
                              </div>
                            </div>
                            <div style={{ background:C.accentDim, borderRadius:12, padding:"8px 12px", textAlign:"center", flexShrink:0 }}>
                              <div style={{ fontSize:24, fontWeight:800, color:C.accent, lineHeight:1 }}>{avg}</div>
                              <div style={{ fontSize:9, color:C.muted }}>avg</div>
                            </div>
                          </div>
                          {freqs.map(({e,pct})=>(
                            <div key={e} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                              <span style={{ fontSize:12, color:pct>=50?C.accent:C.muted, minWidth:72, fontWeight:pct>=50?600:400 }}>{e}</span>
                              <div style={{ flex:1, height:6, background:C.faint, borderRadius:3 }}>
                                <div style={{ height:"100%", borderRadius:3, width:`${pct}%`,
                                  background:pct>=75?`linear-gradient(90deg,#2a6a0a,${C.accent})`:pct>=50?`linear-gradient(90deg,#1a4a1a,#6a9a2a)`:"#2a4a2a" }}/>
                              </div>
                              <span style={{ fontSize:11, fontWeight:700, color:pct>=50?C.accent:C.muted, minWidth:34, textAlign:"right" }}>{pct}%</span>
                            </div>
                          ))}
                          {consistent.length>0 && (
                            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:8, marginBottom:8 }}>
                              <span style={{ fontSize:10, color:C.muted, alignSelf:"center" }}>Consistent:</span>
                              {consistent.map(x=><span key={x.e} style={{ fontSize:11, padding:"3px 10px", background:C.accentDim, border:`1px solid ${C.accent}44`, borderRadius:10, color:C.accent, fontWeight:600 }}>{x.e} {x.pct}%</span>)}
                            </div>
                          )}
                          {wellImpact.length>0 && (
                            <div style={{ paddingTop:10, borderTop:`1px solid ${C.border}`, marginTop:8 }}>
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
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Charts */}
                {trend.length>1 && (
                  <Card style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:12 }}>RATING TREND</div>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={trend}>
                        <XAxis dataKey="label" tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
                        <YAxis domain={[0,10]} tick={{fill:C.muted,fontSize:9}} axisLine={false} tickLine={false}/>
                        <Tooltip {...TT}/>
                        <Line type="monotone" dataKey="r" stroke={C.accent} strokeWidth={2.5} dot={{fill:C.accent,r:4,strokeWidth:0}}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                )}
                {effectCounts.length>0 && (
                  <Card>
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
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* ════ MORE ════ */}
        {tab==="more" && (
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>Settings & Data</div>

            {/* Profile */}
            {profile && (
              <Card style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>YOUR PROFILE</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                  {[profile.experience,profile.frequency,profile.goal,profile.method].filter(Boolean).map(v=>(
                    <span key={v} style={{ fontSize:12, padding:"4px 10px", background:C.accentDim, borderRadius:10, color:C.accent }}>{v}</span>
                  ))}
                </div>
                {profile.pastStrains && <div style={{ fontSize:12, color:C.muted }}>Past strains: {profile.pastStrains}</div>}
                <button onClick={()=>{ localStorage.removeItem("tj6_p"); setProfile(null); }}
                  style={{ marginTop:10, padding:"7px 14px", borderRadius:8, border:`1px solid ${C.border}`,
                    background:"transparent", color:C.muted, cursor:"pointer", fontSize:12 }}>
                  Redo onboarding quiz
                </button>
              </Card>
            )}

            {/* Data export */}
            <Card style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>📤 Export & Backup</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:14, lineHeight:1.5 }}>
                Export your data to keep a backup or transfer to a new phone.
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <button onClick={exportJSON} style={{ padding:"12px 16px", borderRadius:12, border:`1px solid ${C.accent}44`,
                  background:C.accentDim, color:C.accent, cursor:"pointer", fontSize:13, fontWeight:600, textAlign:"left" }}>
                  💾 Full backup (JSON) — restore on new phone
                </button>
                <button onClick={exportData} style={{ padding:"12px 16px", borderRadius:12, border:`1px solid ${C.border}`,
                  background:"transparent", color:C.text, cursor:"pointer", fontSize:13, textAlign:"left" }}>
                  📊 Export as CSV — open in Excel/Sheets
                </button>
                <label style={{ padding:"12px 16px", borderRadius:12, border:`1px dashed ${C.border}`,
                  background:"transparent", color:C.muted, cursor:"pointer", fontSize:13, display:"block" }}>
                  📥 Restore from backup (JSON)
                  <input type="file" accept=".json" onChange={importJSON} style={{ display:"none" }}/>
                </label>
              </div>
            </Card>

            {/* Stats summary */}
            <Card style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>📊 All-time stats</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  ["Sessions logged", sessions.length],
                  ["Strains tried", strainNames.length],
                  ["Avg rating", avgRating],
                  ["Custom strains", custom.length],
                ].map(([l,v])=>(
                  <div key={l} style={{ background:"#0a150b", borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:C.accent }}>{v}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{l}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* About */}
            <Card>
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:10 }}>
                <LogoMark size={40}/>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.accent }}>Terp Journal</div>
                  <div style={{ fontSize:11, color:C.muted }}>Cannabis Experience Log · v1.0</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>
                Your data stays on your device. Nothing is sent to any server.
                Export regularly to keep your data safe.
              </div>
            </Card>
          </div>
        )}
      </div>

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input:focus,select:focus,textarea:focus{outline:2px solid #a3e63540!important;outline-offset:1px}
        .styled-slider{-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;outline:none;background:linear-gradient(90deg,var(--col) var(--pct),#1e3020 var(--pct));cursor:pointer}
        .styled-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:var(--col);cursor:pointer;border:3px solid #080f09;box-shadow:0 0 8px var(--col,#a3e635)44}
        .styled-slider::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:var(--col);cursor:pointer;border:3px solid #080f09}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1c2e1c;border-radius:2px}
        ::placeholder{color:#2a4a2a!important}
        button{font-family:system-ui,-apple-system,sans-serif}
        body{background:#080f09}
        @media(max-width:360px){
          .styled-slider::-webkit-slider-thumb{width:26px;height:26px}
        }
      `}</style>
    </div>
  );
}
