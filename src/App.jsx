import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── SOUND ENGINE ─────────────────────────────────────────────────────────────
const Sound = {
  ctx: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  play(type) {
    try {
      this.init();
      const ctx = this.ctx;
      const now = ctx.currentTime;
      switch(type) {
        case "tap": {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.setValueAtTime(800, now); o.frequency.exponentialRampToValueAtTime(400, now+0.1);
          g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.1);
          o.start(now); o.stop(now+0.1); break;
        }
        case "select": {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination); o.type = "sine";
          o.frequency.setValueAtTime(440, now); o.frequency.exponentialRampToValueAtTime(660, now+0.12);
          g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.15);
          o.start(now); o.stop(now+0.15); break;
        }
        case "save": {
          [523, 659, 784, 1047].forEach((f, i) => {
            const o = ctx.createOscillator(); const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination); o.type = "sine";
            const t = now + i * 0.08;
            o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t+0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t+0.25);
            o.start(t); o.stop(t+0.25);
          }); break;
        }
        case "levelup": {
          [523,659,784,1047,1319].forEach((f, i) => {
            const o = ctx.createOscillator(); const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination); o.type = "triangle";
            const t = now + i * 0.1;
            o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.3, t+0.03);
            g.gain.exponentialRampToValueAtTime(0.001, t+0.3);
            o.start(t); o.stop(t+0.3);
          }); break;
        }
        case "milestone": {
          const freqs = [392,494,587,740,880,1047];
          freqs.forEach((f, i) => {
            const o = ctx.createOscillator(); const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination); o.type = "sine";
            const t = now + i * 0.07;
            o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28, t+0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t+0.28);
            o.start(t); o.stop(t+0.28);
          }); break;
        }
        case "unlock": {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o.connect(g); g.connect(ctx.destination); o.type = "sine";
          o2.connect(g2); g2.connect(ctx.destination); o2.type = "sine";
          o.frequency.setValueAtTime(220, now); o.frequency.exponentialRampToValueAtTime(880, now+0.4);
          g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.5);
          o2.frequency.setValueAtTime(330, now+0.1); o2.frequency.exponentialRampToValueAtTime(1320, now+0.5);
          g2.gain.setValueAtTime(0.15, now+0.1); g2.gain.exponentialRampToValueAtTime(0.001, now+0.6);
          o.start(now); o.stop(now+0.5);
          o2.start(now+0.1); o2.stop(now+0.6); break;
        }
        case "swipe": {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination); o.type = "sine";
          o.frequency.setValueAtTime(300, now); o.frequency.exponentialRampToValueAtTime(600, now+0.08);
          g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.1);
          o.start(now); o.stop(now+0.1); break;
        }
        default: break;
      }
    } catch(e) {}
  }
};

// ─── RANK SYSTEM ──────────────────────────────────────────────────────────────
const RANKS = [
  { min:0,    title:"Green Thumb",      icon:"🌱", color:"#86efac" },
  { min:3,    title:"Casual Terper",    icon:"🌿", color:"#4ade80" },
  { min:8,    title:"Strain Explorer",  icon:"🔍", color:"#f97316" },
  { min:15,   title:"Bud Connoisseur",  icon:"🌺", color:"#fb923c" },
  { min:25,   title:"Terpene Scholar",  icon:"🧪", color:"#a78bfa" },
  { min:40,   title:"Strain Hunter",    icon:"🎯", color:"#f59e0b" },
  { min:60,   title:"Hash Professor",   icon:"🎓", color:"#67e8f9" },
  { min:100,  title:"Cannabis Sommelier",icon:"🍷",color:"#f472b6" },
];

const getXP = (sessions) => {
  let xp = 0;
  sessions.forEach(s => {
    xp += 10; // base
    if (s.effects?.length >= 3) xp += 5;
    if (s.flavors?.length >= 2) xp += 3;
    if (s.physicalNotes || s.mentalNotes) xp += 5;
    if (s.photos?.length > 0) xp += 8;
    if (s.ratings?.overall >= 8) xp += 4;
    if (s.notes?.length > 20) xp += 3;
  });
  return xp;
};

const getRank = (xp) => {
  const r = [...RANKS].reverse().find(r => xp >= r.min * 10);
  return r || RANKS[0];
};

const getNextRank = (xp) => {
  const idx = RANKS.findIndex(r => r.title === getRank(xp).title);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
};

// ─── MILESTONES ───────────────────────────────────────────────────────────────
const MILESTONES = [
  { id:"first",       icon:"🌱", title:"First Session",        desc:"Logged your first session",          check: s => s.length >= 1 },
  { id:"five",        icon:"✋", title:"High Five",             desc:"5 sessions logged",                  check: s => s.length >= 5 },
  { id:"tenner",      icon:"🔟", title:"Perfect Ten",          desc:"10 sessions logged",                 check: s => s.length >= 10 },
  { id:"fifty",       icon:"🏆", title:"Half Century",         desc:"50 sessions logged",                 check: s => s.length >= 50 },
  { id:"streak3",     icon:"🔥", title:"On Fire",              desc:"3 day streak",                       check: (s,p) => p.streak >= 3 },
  { id:"streak7",     icon:"⚡", title:"Week Warrior",         desc:"7 day streak",                       check: (s,p) => p.streak >= 7 },
  { id:"strains5",    icon:"🌿", title:"Strain Collector",     desc:"Tried 5 different strains",          check: s => new Set(s.map(x=>x.strain)).size >= 5 },
  { id:"strains10",   icon:"🎨", title:"Palette Expanded",     desc:"Tried 10 different strains",         check: s => new Set(s.map(x=>x.strain)).size >= 10 },
  { id:"photographer",icon:"📸", title:"Bud Photographer",     desc:"Added a strain photo",               check: s => s.some(x=>x.photos?.length>0) },
  { id:"reviewer",    icon:"✍️", title:"Thoughtful Logger",    desc:"Wrote detailed notes 3 times",       check: s => s.filter(x=>x.notes?.length>30).length >= 3 },
  { id:"wellness",    icon:"🧘", title:"Wellness Tracker",     desc:"Tracked wellbeing 5 times",          check: s => s.filter(x=>x.physicalNotes||x.mentalNotes).length >= 5 },
  { id:"perfect10",   icon:"💯", title:"Perfect Score",        desc:"Gave a 10/10 rating",                check: s => s.some(x=>x.ratings?.overall===10) },
  { id:"flavor",      icon:"👅", title:"Flavour Chaser",       desc:"Logged 5 different flavours",        check: s => new Set(s.flatMap(x=>x.flavors||[])).size >= 5 },
  { id:"morning",     icon:"🌅", title:"Early Bird",           desc:"Logged before 9am",                  check: s => s.some(x=>new Date(x.date).getHours()<9) },
  { id:"night",       icon:"🌙", title:"Night Owl",            desc:"Logged after midnight",              check: s => s.some(x=>new Date(x.date).getHours()>=0&&new Date(x.date).getHours()<4) },
];

const checkMilestones = (sessions, profile) => MILESTONES.filter(m => m.check(sessions, profile||{}));

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const METHODS = [
  { id:"joint",     emoji:"🚬", label:"Joint",      unit:"g",    min:0.1,  max:3,   step:0.1,  def:0.5,  tips:["Roll tight for an even burn","Use a crutch/filter for cooler smoke","Grind evenly for best airflow"] },
  { id:"blunt",     emoji:"🍂", label:"Blunt",      unit:"g",    min:0.5,  max:5,   step:0.1,  def:1,    tips:["Lick the wrap lightly — not too wet","Let it dry 30 seconds after sealing","Rotate while smoking for even burn"] },
  { id:"pipe",      emoji:"🪈", label:"Pipe",       unit:"g",    min:0.1,  max:2,   step:0.1,  def:0.3,  tips:["Corner the bowl — don't burn it all at once","Clean your pipe weekly for best flavour","Pack loosely for better airflow"] },
  { id:"bong",      emoji:"🫧", label:"Bong",       unit:"g",    min:0.1,  max:2,   step:0.1,  def:0.3,  tips:["Change water every session","Ice in the tube cools the smoke significantly","Clear the chamber fully for best effect"] },
  { id:"dryvape",   emoji:"🌬️", label:"Dry Vape",   unit:"g",    min:0.05, max:1,   step:0.05, def:0.15, tips:["Start at 170°C, work up slowly","Grind fine for even heat distribution","ABV (already been vaped) can be reused in edibles"] },
  { id:"resinvape", emoji:"🛢️", label:"Resin Vape", unit:"puffs",min:1,    max:30,  step:1,    def:3,    tips:["Store carts upright to prevent leaks","Keep below 200°C to preserve terpenes","Preheat mode warms thick oil better"] },
  { id:"dab",       emoji:"🧪", label:"Dab",        unit:"g",    min:0.05, max:1,   step:0.05, def:0.1,  tips:["Low temp dabs (450-550°F) preserve terpenes","Let the nail cool 30-45 seconds after heating","Use a carb cap for full flavour extraction"] },
  { id:"edible",    emoji:"🍫", label:"Edible",     unit:"mg",   min:2.5,  max:100, step:2.5,  def:10,   tips:["Wait 90 minutes before considering more","Eat a light meal first for consistent absorption","Effects last 4-8 hours — plan accordingly"] },
  { id:"tincture",  emoji:"💧", label:"Tincture",   unit:"ml",   min:0.5,  max:10,  step:0.5,  def:1,    tips:["Hold under tongue 60-90 seconds for fastest effect","Faster onset than edibles when held sublingually","Start with 0.5ml and wait 45 minutes"] },
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

const MOODS = ["😔","😐","🙂","😊","🌟"];
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

const typeColor = t => t==="Indica"?"#a78bfa":t==="Sativa"?"#fbbf24":"#fbbf24";
const typeBg    = t => t==="Indica"?"#1e1b4b":t==="Sativa"?"#431407":"#022c22";

const C = {
  bg:"#0c0905", card:"#110a04", border:"#2a1a08",
  accent:"#f97316", accentDim:"#f9731620",
  text:"#d4e8c2", muted:"#6b3a10", faint:"#2a1608",
  amber:"#f59e0b", amberDim:"#f59e0b22",
  purple:"#a78bfa",
};

const mkForm = () => ({
  strain:"", method:"joint", amount:0.5,
  moodBefore:2, moodAfter:2,
  effects:[], flavors:[],
  ratings:{ overall:7, taste:7, potency:5, smoothness:7, effect:7, value:7 },
  physical: Object.fromEntries(PHYSICAL_FACTORS.map(f=>[f.id,0])),
  mental:   Object.fromEntries(MENTAL_FACTORS.map(f=>[f.id,0])),
  physicalNotes:"", mentalNotes:"", notes:"",
  brand:"", source:"", date: new Date().toISOString().slice(0,16),
  intensity:5, photos:[],
});

// ─── LOGO MARK ────────────────────────────────────────────────────────────────
const LogoMark = ({ size=32 }) => {
  const s = size / 100;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink:0, display:"block" }}>
      <defs>
        <linearGradient id="lmtbl" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fff7ed"/>
          <stop offset="35%" stopColor="#fed7aa"/>
          <stop offset="100%" stopColor="#ea580c"/>
        </linearGradient>
        <linearGradient id="lmlf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c2410c"/>
          <stop offset="100%" stopColor="#7c2d12"/>
        </linearGradient>
        <linearGradient id="lmrf" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb923c"/>
          <stop offset="100%" stopColor="#9a3412"/>
        </linearGradient>
        <linearGradient id="lmll" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c2d12"/>
          <stop offset="100%" stopColor="#3d1407"/>
        </linearGradient>
        <linearGradient id="lmlr" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9a3412"/>
          <stop offset="100%" stopColor="#3d1407"/>
        </linearGradient>
        <linearGradient id="lmiris" x1="30%" y1="20%" x2="70%" y2="80%">
          <stop offset="0%" stopColor="#fed7aa"/>
          <stop offset="50%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#7c2d12"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="#0c0905"/>
      {/* pavilion */}
      <polygon points="50,88 21,55 37,50" fill="url(#lmll)" stroke="#431407" strokeWidth="0.8" strokeLinejoin="round"/>
      <polygon points="50,88 79,55 63,50" fill="url(#lmlr)" stroke="#561e0a" strokeWidth="0.8" strokeLinejoin="round"/>
      <polygon points="37,50 50,88 63,50 50,53" fill="#6b2210" stroke="#7c2d12" strokeWidth="0.6" strokeLinejoin="round"/>
      {/* crown */}
      <polygon points="50,12 21,55 37,50 50,39" fill="url(#lmlf)" stroke="#ea580c" strokeWidth="0.8" strokeLinejoin="round"/>
      <polygon points="50,12 79,55 63,50 50,39" fill="url(#lmrf)" stroke="#fb923c" strokeWidth="1" strokeLinejoin="round"/>
      <polygon points="50,12 21,55 29,40" fill="#9a3412" stroke="#c2410c" strokeWidth="0.6" strokeLinejoin="round"/>
      <polygon points="50,12 79,55 71,40" fill="#7c2d12" stroke="#ea580c" strokeWidth="0.6" strokeLinejoin="round"/>
      {/* table */}
      <polygon points="29,40 50,12 71,40 63,50 50,39 37,50" fill="url(#lmtbl)" stroke="#fed7aa" strokeWidth="1.2" strokeLinejoin="round"/>
      <line x1="29" y1="40" x2="50" y2="12" stroke="#fff7ed" strokeWidth="0.8" opacity="0.3"/>
      <line x1="50" y1="12" x2="79" y2="55" stroke="#fed7aa" strokeWidth="0.8" opacity="0.3"/>
      {/* eye */}
      <path d="M50,38 C40,38 30,44 24,50 C30,56 40,62 50,62 C60,62 70,56 76,50 C70,44 60,38 50,38 Z" fill="#1c0e04" stroke="#f97316" strokeWidth="1"/>
      <circle cx="50" cy="50" r="9" fill="url(#lmiris)"/>
      <circle cx="50" cy="50" r="5" fill="#0a0602"/>
      <ellipse cx="50" cy="50" rx="2" ry="5" fill="#060402"/>
      <circle cx="47" cy="47" r="2" fill="#ffffff" opacity="0.6"/>
      {/* eyelid lines */}
      <path d="M24,48 C35,39 43,37 50,37 C57,37 65,39 76,48" fill="none" stroke="#f97316" strokeWidth="0.8" opacity="0.55"/>
      <path d="M25,52 C36,60 43,62 50,62 C57,62 64,60 75,52" fill="none" stroke="#ea580c" strokeWidth="0.7" opacity="0.4"/>
      {/* lashes */}
      <line x1="26" y1="46" x2="23" y2="41" stroke="#f97316" strokeWidth="0.8" opacity="0.6"/>
      <line x1="35" y1="40" x2="33" y2="35" stroke="#f97316" strokeWidth="0.8" opacity="0.6"/>
      <line x1="50" y1="37" x2="50" y2="32" stroke="#f97316" strokeWidth="0.9" opacity="0.7"/>
      <line x1="65" y1="40" x2="67" y2="35" stroke="#f97316" strokeWidth="0.8" opacity="0.6"/>
      <line x1="74" y1="46" x2="77" y2="41" stroke="#f97316" strokeWidth="0.8" opacity="0.6"/>
      {/* culet */}
      <circle cx="50" cy="88" r="2.5" fill="#fbbf24"/>
    </svg>
  );
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const Card = ({ children, style={}, onClick }) => (
  <div onClick={onClick} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16, ...style }}>
    {children}
  </div>
);

const Slider = ({ label, icon, value, onChange, min=1, max=10, step=1, color=C.accent }) => {
  const pct = ((value-min)/(max-min))*100;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:13, color:C.muted }}><span>{icon}</span> {label}</span>
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
        <div style={{ position:"absolute", left:"50%", top:-2, width:2, height:10, background:C.border }}/>
        <input type="range" min={-5} max={5} value={value} onChange={e=>onChange(+e.target.value)}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0, cursor:"pointer", zIndex:10 }}/>
      </div>
    </div>
  </div>
);

const StepDots = ({ current, total, onGo }) => (
  <div style={{ display:"flex", gap:6 }}>
    {Array.from({length:total},(_,i)=>(
      <button key={i} onClick={()=>{ Sound.play("tap"); onGo(i); }} style={{
        width:i===current?20:8, height:8, borderRadius:4, border:"none", cursor:"pointer",
        background:i<current?"#fbbf24":i===current?C.accent:C.faint, transition:"all 0.25s",
      }}/>
    ))}
  </div>
);

// XP Progress Bar
const XPBar = ({ xp }) => {
  const rank = getRank(xp);
  const next = getNextRank(xp);
  const rankXP = rank.min * 10;
  const nextXP = next ? next.min * 10 : xp;
  const pct = next ? Math.min(100, ((xp - rankXP) / (nextXP - rankXP)) * 100) : 100;
  return (
    <div style={{ marginBottom:4 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:11, color:rank.color, fontWeight:600 }}>{rank.icon} {rank.title}</span>
        <span style={{ fontSize:11, color:C.muted }}>{xp} XP{next?` · ${nextXP - xp} to ${next.title}`:""}</span>
      </div>
      <div style={{ height:5, background:C.faint, borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:3, background:`linear-gradient(90deg,${rank.color}88,${rank.color})`, width:`${pct}%`, transition:"width 0.5s" }}/>
      </div>
    </div>
  );
};

// Milestone toast
const MilestoneToast = ({ milestone, onClose }) => {
  useEffect(() => {
    Sound.play("milestone");
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", zIndex:300,
      background:`linear-gradient(135deg,${C.card},#0d2a10)`, border:`1px solid ${C.accent}66`,
      borderRadius:16, padding:"14px 20px", boxShadow:`0 8px 32px ${C.accent}33`,
      display:"flex", alignItems:"center", gap:12, minWidth:280, maxWidth:400,
      animation:"slideDown 0.3s ease" }}>
      <div style={{ fontSize:32 }}>{milestone.icon}</div>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:C.accent }}>Achievement Unlocked!</div>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{milestone.title}</div>
        <div style={{ fontSize:11, color:C.muted }}>{milestone.desc}</div>
      </div>
      <button onClick={onClose} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:18, marginLeft:"auto" }}>✕</button>
    </div>
  );
};

// Level Up overlay
const LevelUpOverlay = ({ rank, onClose }) => {
  useEffect(() => {
    Sound.play("levelup");
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:250, background:"rgba(8,15,9,0.92)", display:"flex", alignItems:"center", justifyContent:"center",
      animation:"fadeIn 0.3s ease" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:72, marginBottom:8, animation:"bounce 0.5s ease" }}>{rank.icon}</div>
        <div style={{ fontSize:14, color:C.muted, letterSpacing:"0.2em", marginBottom:8 }}>RANK UP</div>
        <div style={{ fontSize:28, fontWeight:800, color:rank.color, marginBottom:8 }}>{rank.title}</div>
        <div style={{ fontSize:14, color:C.muted }}>Keep logging to advance</div>
        <button onClick={onClose} style={{ marginTop:20, padding:"10px 28px", borderRadius:20, border:"none",
          background:rank.color, color:"#080502", fontWeight:700, cursor:"pointer", fontSize:14 }}>
          Let's go →
        </button>
      </div>
    </div>
  );
};

// Strain Passport Card
const PassportCard = ({ strain, sessions, allStrains }) => {
  const st = allStrains.find(s=>s.name===strain);
  const ss = sessions.filter(s=>s.strain===strain);
  const n  = ss.length;
  const avg = n?(ss.reduce((a,s)=>a+(s.ratings?.overall||0),0)/n).toFixed(1):"—";
  const topEffects = EFFECTS.map(e=>({e,pct:Math.round(ss.filter(s=>s.effects?.includes(e)).length/n*100)}))
    .filter(x=>x.pct>0).sort((a,b)=>b.pct-a.pct).slice(0,3);
  const mastered = n >= 5;
  const photos = ss.flatMap(s=>s.photos||[]).slice(0,1);

  return (
    <div style={{ background:`linear-gradient(135deg,${C.card},${st?typeBg(st.type):"#160900"})`,
      border:`2px solid ${st?typeColor(st.type)+"44":C.border}`, borderRadius:20, padding:16, marginBottom:10,
      boxShadow:st?`0 4px 20px ${typeColor(st.type)}15`:undefined }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        {photos.length>0 && <img src={photos[0]} style={{ width:56, height:56, borderRadius:10, objectFit:"cover", flexShrink:0 }} alt="bud"/>}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:4 }}>
            <span style={{ fontSize:16, fontWeight:800, color:C.text }}>{strain}</span>
            {st&&<span style={{ fontSize:10, padding:"2px 8px", background:typeBg(st.type), border:`1px solid ${typeColor(st.type)}`, borderRadius:10, color:typeColor(st.type) }}>{st.type}</span>}
            {mastered && <span style={{ fontSize:10, padding:"2px 8px", background:"#f59e0b22", border:"1px solid #f59e0b44", borderRadius:10, color:"#f59e0b" }}>⭐ Mastered</span>}
          </div>
          {st && <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>{st.description}</div>}
          <div style={{ display:"flex", gap:12, fontSize:12, marginBottom:8 }}>
            {st&&<span style={{ color:C.amber }}>THC {st.thc}%</span>}
            <span style={{ color:C.accent, fontWeight:700 }}>{avg}/10 avg</span>
            <span style={{ color:C.muted }}>{n} session{n!==1?"s":""}</span>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {topEffects.map(({e,pct})=>(
              <span key={e} style={{ fontSize:10, padding:"2px 8px", background:C.accentDim, borderRadius:10, color:C.accent }}>{e} {pct}%</span>
            ))}
          </div>
        </div>
      </div>
      {n >= 2 && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
          <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>YOUR EXPERIENCE MAP</div>
          <div style={{ display:"flex", gap:4 }}>
            {RATINGS.map(r=>{
              const avg = ss.filter(s=>s.ratings?.[r.id]).length
                ? (ss.reduce((a,s)=>a+(s.ratings?.[r.id]||0),0)/ss.filter(s=>s.ratings?.[r.id]).length)
                : 0;
              return (
                <div key={r.id} style={{ flex:1, textAlign:"center" }}>
                  <div style={{ fontSize:12 }}>{r.icon}</div>
                  <div style={{ height:30, background:C.faint, borderRadius:3, position:"relative", margin:"4px 0" }}>
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:`${avg/10*100}%`,
                      background:r.color, borderRadius:3, transition:"height 0.4s" }}/>
                  </div>
                  <div style={{ fontSize:9, color:C.muted }}>{avg.toFixed(0)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Scrolling background gallery
const StrainGallery = () => {
  const cols = [STRAIN_DB.slice(0,8),STRAIN_DB.slice(8,16),STRAIN_DB.slice(16,24),STRAIN_DB.slice(24,32)];
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      <div style={{ position:"absolute", inset:0, display:"flex", gap:10, padding:"0 10px" }}>
        {cols.map((col,ci)=>(
          <div key={ci} style={{ flex:1, overflow:"hidden", opacity:0.15 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:8,
              animation:`${ci%2===0?"scrollUp":"scrollDown"} ${28+ci*4}s linear infinite` }}>
              {[...col,...col].map((s,i)=>(
                <div key={i} style={{ background:typeBg(s.type), border:`1px solid ${typeColor(s.type)}44`, borderRadius:10, padding:"8px 10px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:typeColor(s.type), marginBottom:2 }}>{s.name}</div>
                  <div style={{ fontSize:9, color:"#ffffff55" }}>{s.type} · THC {s.thc}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:120, background:`linear-gradient(to bottom,${C.bg},transparent)` }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:120, background:`linear-gradient(to top,${C.bg},transparent)` }}/>
    </div>
  );
};

// Daily Ritual component
const DailyRitual = ({ sessions, onLog }) => {
  const today = new Date().toDateString();
  const loggedToday = sessions.some(s=>new Date(s.date).toDateString()===today);
  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning":"hour"<17?"Good afternoon":"Good evening";
  const lastSession = sessions[0];
  const daysSince = lastSession ? Math.floor((Date.now()-new Date(lastSession.date))/86400000) : null;

  return (
    <div style={{ background:`linear-gradient(135deg,#0d2a10,#0a1f1a)`, border:`1px solid ${C.accent}33`,
      borderRadius:20, padding:18, marginBottom:16, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", right:-20, top:-20, fontSize:80, opacity:0.06 }}>🌿</div>
      <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:4 }}>{greeting}</div>
      {loggedToday ? (
        <div>
          <div style={{ fontSize:13, color:"#6ee7b7", marginBottom:8 }}>✓ You've logged today</div>
          {lastSession && <div style={{ fontSize:12, color:C.muted }}>Last: {lastSession.strain} — {lastSession.ratings?.overall}/10</div>}
        </div>
      ) : (
        <div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:12 }}>
            {daysSince===0?"You haven't logged yet today.":daysSince===1?"Last logged yesterday.":daysSince?`Last logged ${daysSince} days ago.`:"Start your journal today."}
          </div>
          <button onClick={onLog} style={{ padding:"10px 20px", borderRadius:20, border:"none", cursor:"pointer",
            background:`linear-gradient(135deg,#c2410c,${C.accent})`, color:"#080502", fontSize:13, fontWeight:700,
            boxShadow:`0 4px 16px ${C.accent}33` }}>
            {loggedToday?"Log another session":"Log today's session"} →
          </button>
        </div>
      )}
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,      setTab]      = useState("home");
  const [sessions, setSessions] = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_s")||"[]")}catch{return []} });
  const [custom,   setCustom]   = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_c")||"[]")}catch{return []} });
  const [profile,  setProfile]  = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_p")||"null")}catch{return null} });
  const [unlockedMilestones, setUnlockedMilestones] = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_m")||"[]")}catch{return []} });

  const [step,       setStep]       = useState(0);
  const [form,       setForm]       = useState(mkForm());
  const [saved,      setSaved]      = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [newMilestone,   setNewMilestone]   = useState(null);
  const [levelUpRank,    setLevelUpRank]    = useState(null);
  const [passportStrain, setPassportStrain] = useState(null);
  const [strainAnecdotes, setStrainAnecdotes] = useState({});
  const [loadingAnecdotes, setLoadingAnecdotes] = useState(false);
  const [optionalOpen, setOptionalOpen] = useState({effects:false,wellbeing:false});
  const [showPhotoTips, setShowPhotoTips] = useState(false);
  const prevXP = useRef(0);

  // Strain search
  const [sq,    setSq]    = useState("");
  const [sdrop, setSdrop] = useState(false);
  const [aiRes, setAiRes] = useState([]);
  const [aiLoad,setAiLoad]= useState(false);
  const [aiError, setAiError] = useState(false);
  const [anecdoteError, setAnecdoteError] = useState(false);
  const searchRef = useRef(null);
  const aiTimer   = useRef(null);
  const [expandedId, setExpandedId] = useState(null);
  const [addingStrain, setAddingStrain] = useState(false);
  const [newS, setNewS] = useState({name:"",type:"Hybrid",thc:"",cbd:"",description:""});

  useEffect(()=>{ localStorage.setItem("rs_s", JSON.stringify(sessions)); },[sessions]);
  useEffect(()=>{ localStorage.setItem("rs_c", JSON.stringify(custom));   },[custom]);
  useEffect(()=>{ localStorage.setItem("rs_p", JSON.stringify(profile));  },[profile]);
  useEffect(()=>{ localStorage.setItem("rs_m", JSON.stringify(unlockedMilestones)); },[unlockedMilestones]);

  useEffect(()=>{
    const h=e=>{ if(searchRef.current&&!searchRef.current.contains(e.target)) setSdrop(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  // Check milestones after sessions change
  useEffect(()=>{
    const streak = calcStreak(sessions);
    const earned = checkMilestones(sessions, {streak});
    const newOnes = earned.filter(m=>!unlockedMilestones.includes(m.id));
    if (newOnes.length > 0) {
      setUnlockedMilestones(prev=>[...prev, ...newOnes.map(m=>m.id)]);
      setNewMilestone(newOnes[0]);
    }
    // Check level up
    const xp = getXP(sessions);
    const curRank = getRank(xp);
    const oldRank = getRank(prevXP.current);
    if (curRank.title !== oldRank.title && prevXP.current > 0) setLevelUpRank(curRank);
    prevXP.current = xp;
  }, [sessions]);

  const allStrains = [...STRAIN_DB, ...custom.filter(c=>!STRAIN_DB.find(d=>d.name.toLowerCase()===c.name.toLowerCase()))];
  const curMethod  = METHODS.find(m=>m.id===form.method)||METHODS[0];
  const curStrain  = allStrains.find(s=>s.name===form.strain);

  const calcStreak = (sess) => {
    if(!sess.length) return 0;
    const days=[...new Set(sess.map(s=>new Date(s.date).toDateString()))];
    let count=0,d=new Date();
    for(let i=0;i<30;i++){
      if(days.includes(d.toDateString())){ count++; d.setDate(d.getDate()-1); }
      else if(i===0){ d.setDate(d.getDate()-1); if(days.includes(d.toDateString())){count++;d.setDate(d.getDate()-1);}else break; }
      else break;
    }
    return count;
  };

  const xp         = getXP(sessions);
  const rank       = getRank(xp);
  const streak     = calcStreak(sessions);
  const avgRating  = sessions.length?(sessions.reduce((a,s)=>a+(s.ratings?.overall||0),0)/sessions.length).toFixed(1):"—";
  const strainNames= [...new Set(sessions.map(s=>s.strain))].filter(Boolean);
  const qualifiedStrains = strainNames.filter(n=>sessions.filter(s=>s.strain===n).length>=2);
  const recentStrains = [...new Set(sessions.slice(0,5).map(s=>s.strain))].filter(Boolean).slice(0,3);
  const earnedMilestones = checkMilestones(sessions, {streak});

  // AI strain search
  const localMatches = sq.length>=1 ? allStrains.filter(s=>
    s.name.toLowerCase().includes(sq.toLowerCase()) ||
    s.type.toLowerCase().includes(sq.toLowerCase()) ||
    s.effects?.some(e=>e.toLowerCase().includes(sq.toLowerCase()))
  ).slice(0,5) : [];

  const tryAI = useCallback(async(q)=>{
    setAiLoad(true);
    try {
      const r = await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:600,
          system:`Cannabis strain database. Return ONLY a raw JSON array, no markdown, no extra text. Up to 4 matching strains. Each object must have exactly: name(string), type("Indica"|"Sativa"|"Hybrid"), thc(number 10-32), cbd(number 0-20), effects(array of 3 strings), flavors(array of 3 strings), description(string max 8 words). Respond with ONLY the JSON array starting with [`,
          messages:[{role:"user",content:`Cannabis strains matching: ${q}`}] })
      });
      const d = await r.json();
      const txt = d.content?.map(b=>b.text||"").join("").trim();
      const start = txt.indexOf("[");
      const end   = txt.lastIndexOf("]");
      if(start!==-1&&end!==-1) setAiRes(JSON.parse(txt.slice(start,end+1))||[]);
    } catch { setAiRes([]); setAiError(true); }
    setAiLoad(false);
  },[]);

  const onSQ = v => {
    setSq(v); setAiRes([]); setSdrop(true);
    clearTimeout(aiTimer.current);
    if(v.length>=2 && allStrains.filter(s=>s.name.toLowerCase().includes(v.toLowerCase())).length<2)
      aiTimer.current = setTimeout(()=>tryAI(v),600);
  };

  const pickStrain = s => {
    Sound.play("select");
    if(!STRAIN_DB.find(x=>x.name.toLowerCase()===s.name.toLowerCase()) &&
       !custom.find(x=>x.name.toLowerCase()===s.name.toLowerCase()))
      setCustom(p=>[s,...p]);
    setForm(f=>({...f,strain:s.name}));
    setSq(""); setSdrop(false); setAiRes([]);
  };

  const dropList = [...localMatches, ...aiRes.filter(r=>!localMatches.find(l=>l.name.toLowerCase()===r.name.toLowerCase()))];

  const toggle = (key,val) => {
    Sound.play("tap");
    setForm(f=>({...f,[key]:f[key].includes(val)?f[key].filter(x=>x!==val):[...f[key],val]}));
  };

  const setRating = (id,v) => setForm(f=>({...f,ratings:{...f.ratings,[id]:v}}));

  // Load AI anecdotes for a strain
  const loadAnecdotes = async (strainName) => {
    if (strainAnecdotes[strainName]) return;
    setLoadingAnecdotes(true);
    setAnecdoteError(false);
    try {
      const r = await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:800,
          system:`You are a cannabis strain expert. Generate 3 authentic-sounding user anecdotes/reviews for the strain given. Return ONLY a raw JSON array of 3 objects, no markdown. Each object: { "user": "anonymous username like DesertFox42", "rating": number 1-5, "review": "2-3 sentence personal experience written in first person, conversational, specific about effects and context", "method": "how they consumed it" }. Make them feel real and varied — different experiences, methods, outcomes.`,
          messages:[{role:"user",content:`Generate reviews for: ${strainName}`}] })
      });
      const d = await r.json();
      const txt = d.content?.map(b=>b.text||"").join("").trim();
      const start = txt.indexOf("["); const end = txt.lastIndexOf("]");
      if(start!==-1&&end!==-1){
        const parsed = JSON.parse(txt.slice(start,end+1));
        setStrainAnecdotes(prev=>({...prev,[strainName]:parsed}));
      }
    } catch { setAnecdoteError(true); }
    setLoadingAnecdotes(false);
  };

  // Photo handler
  const handlePhoto = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f=>({...f,photos:[...f.photos,ev.target.result]}));
    reader.readAsDataURL(file);
  };

  const checkStorageLimit = () => {
    try {
      const used = JSON.stringify(sessions).length;
      if (used > 3500000) return true; // warn at 3.5MB
    } catch { return false; }
    return false;
  };

  const saveSession = () => {
    Sound.play("save");
    setSessions(p=>[{...form,id:Date.now()},...p]);
    setSaved(true);
    if (checkStorageLimit()) {
      setTimeout(()=>{ alert("⚠️ You're using a lot of storage. Go to More → Export to back up your data before it fills up."); },2000);
    }
    setTimeout(()=>{ setSaved(false); setForm(mkForm()); setStep(0); setTab("home"); },1800);
  };

  const saveEdit = updated => { setSessions(p=>p.map(s=>s.id===updated.id?updated:s)); setEditingSession(null); };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({sessions,custom,profile,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`terp-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers=["Date","Strain","Method","Amount","Overall","Taste","Potency","Smooth","Effect","Value","Intensity","MoodBefore","MoodAfter","Effects","Flavors","Brand","Notes"];
    const rows=sessions.map(s=>[s.date,s.strain,s.method,s.amount,s.ratings?.overall||"",s.ratings?.taste||"",s.ratings?.potency||"",s.ratings?.smoothness||"",s.ratings?.effect||"",s.ratings?.value||"",s.intensity||"",s.moodBefore,s.moodAfter,(s.effects||[]).join("|"),(s.flavors||[]).join("|"),s.brand||"",(s.notes||"").replace(/,/g," ")]);
    const csv=[headers,...rows].map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`terp-export-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = e => {
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{ try{ const d=JSON.parse(ev.target.result); if(d.sessions) setSessions(d.sessions); if(d.custom) setCustom(d.custom); if(d.profile) setProfile(d.profile); alert("Restored!"); }catch{ alert("Invalid file."); } };
    reader.readAsText(file);
  };

  // Personal records
  const personalRecords = sessions.length ? [
    { label:"Highest rated session",  value: sessions.reduce((a,b)=>(b.ratings?.overall||0)>(a.ratings?.overall||0)?b:a).strain, sub: `${sessions.reduce((a,b)=>(b.ratings?.overall||0)>(a.ratings?.overall||0)?b:a).ratings?.overall}/10` },
    { label:"Most used strain",        value: strainNames.sort((a,b)=>sessions.filter(s=>s.strain===b).length-sessions.filter(s=>s.strain===a).length)[0], sub: `${sessions.filter(s=>s.strain===strainNames[0]).length} times` },
    { label:"Most consistent effects", value: EFFECTS.map(e=>({e,n:sessions.filter(s=>s.effects?.includes(e)).length})).sort((a,b)=>b.n-a.n)[0]?.e||"—", sub:"most logged effect" },
  ] : [];

  // Onboarding
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const QUIZ = [
    { id:"experience", q:"How long have you been using cannabis?", opts:["First time","< 1 year","1–3 years","3–5 years","5+ years"] },
    { id:"frequency",  q:"How often do you consume?",              opts:["Rarely","1–2x/week","3–4x/week","Daily","Multiple daily"] },
    { id:"goal",       q:"What's your main reason for using?",     opts:["Relaxation","Pain/medical","Sleep","Creativity","Social","Exploration"] },
    { id:"method",     q:"Preferred method?",                      opts:["Joints","Vaporiser","Bong/pipe","Edibles","Mixed"] },
    { id:"pastStrains",q:"Any strains you've loved before?",       type:"text", placeholder:"e.g. Blue Dream, OG Kush (optional — skip if unsure)" },
  ];

  if (!profile) {
    const current = QUIZ[quizStep];
    const isLast  = quizStep === QUIZ.length - 1;
    return (
      <div style={{ minHeight:"100vh", maxWidth:500, margin:"0 auto", background:C.bg, color:C.text, fontFamily:"system-ui,sans-serif", padding:24 }}>
        <div style={{ maxWidth:440, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <LogoMark size={40}/>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:C.accent }}>Welcome to Resin</div>
              <div style={{ fontSize:12, color:C.muted }}>Quick setup — takes 30 seconds</div>
            </div>
          </div>
          <div style={{ height:4, background:C.faint, borderRadius:2, marginBottom:28 }}>
            <div style={{ height:"100%", borderRadius:2, background:C.accent, width:`${(quizStep/QUIZ.length)*100}%`, transition:"width 0.3s" }}/>
          </div>
          <div style={{ fontSize:18, fontWeight:600, color:C.text, marginBottom:6, lineHeight:1.4 }}>{current.q}</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:20 }}>Question {quizStep+1} of {QUIZ.length}</div>
          {current.type==="text" ? (
            <div>
              <input placeholder={current.placeholder} value={quizAnswers[current.id]||""}
                onChange={e=>setQuizAnswers(a=>({...a,[current.id]:e.target.value}))}
                style={{ width:"100%", padding:"14px", background:C.card, border:`1.5px solid ${C.border}`,
                  borderRadius:12, color:C.text, fontSize:14, boxSizing:"border-box", marginBottom:14 }}/>
              <button onClick={()=>{ Sound.play("save"); setProfile({...quizAnswers,completedAt:new Date().toISOString()}); }}
                style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", cursor:"pointer",
                  background:`linear-gradient(135deg,#c2410c,${C.accent})`, color:"#080502", fontSize:15, fontWeight:700 }}>
                Get Started →
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {current.opts.map(opt=>(
                <button key={opt} onClick={()=>{ Sound.play("select"); const upd={...quizAnswers,[current.id]:opt}; setQuizAnswers(upd); if(!isLast) setQuizStep(s=>s+1); else setProfile({...upd,completedAt:new Date().toISOString()}); }}
                  style={{ padding:"14px 18px", borderRadius:12, border:`1.5px solid ${C.border}`,
                    background:C.card, color:C.text, fontSize:14, cursor:"pointer", textAlign:"left",
                    fontFamily:"system-ui" }}>
                  {opt}
                </button>
              ))}
            </div>
          )}
          <button onClick={()=>setProfile({completedAt:new Date().toISOString()})}
            style={{ marginTop:16, width:"100%", padding:"8px", borderRadius:8, border:"none",
              background:"transparent", color:C.muted, cursor:"pointer", fontSize:12 }}>
            Skip setup
          </button>
        </div>
        <style>{`*{box-sizing:border-box} input:focus{outline:2px solid #a3e63540!important}`}</style>
      </div>
    );
  }

  // ── MAIN RENDER ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", maxWidth:500, margin:"0 auto", background:C.bg, color:C.text, fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {newMilestone && <MilestoneToast milestone={newMilestone} onClose={()=>setNewMilestone(null)}/>}
      {levelUpRank  && <LevelUpOverlay rank={levelUpRank}      onClose={()=>setLevelUpRank(null)}/>}

      {saved && (
        <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center",
          background:"rgba(8,15,9,0.92)", backdropFilter:"blur(6px)" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
            <div style={{ fontSize:22, fontWeight:700, color:C.accent }}>Session saved!</div>
            <div style={{ fontSize:14, color:C.muted, marginTop:6 }}>+10 XP earned 🌿</div>
          </div>
        </div>
      )}

      {/* Passport modal */}
      {passportStrain && (
        <div style={{ position:"fixed", inset:0, zIndex:150, background:"rgba(8,15,9,0.96)", overflowY:"auto", padding:20 }}>
          <div style={{ maxWidth:480, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:700, color:C.accent }}>🛂 Strain Passport</div>
              <button onClick={()=>setPassportStrain(null)} style={{ background:"transparent", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>✕</button>
            </div>
            <PassportCard strain={passportStrain} sessions={sessions} allStrains={allStrains}/>
            {/* AI anecdotes */}
            <Card style={{ marginTop:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text }}>💬 Community Anecdotes</div>
                {!strainAnecdotes[passportStrain] && (
                  <button onClick={()=>loadAnecdotes(passportStrain)} disabled={loadingAnecdotes}
                    style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${C.accent}44`,
                      background:C.accentDim, color:C.accent, cursor:"pointer", fontSize:12, opacity:loadingAnecdotes?0.6:1 }}>
                    {loadingAnecdotes?"Loading...":"Load reviews"}
                  </button>
                )}
              </div>
              {strainAnecdotes[passportStrain] ? (
                strainAnecdotes[passportStrain].map((a,i)=>(
                  <div key={i} style={{ background:"#160900", borderRadius:12, padding:12, marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:12, fontWeight:600, color:C.accent }}>@{a.user}</span>
                      <span style={{ fontSize:11, color:C.amber }}>{"⭐".repeat(a.rating)}</span>
                    </div>
                    <div style={{ fontSize:13, color:C.text, lineHeight:1.5, marginBottom:4 }}>{a.review}</div>
                    <div style={{ fontSize:11, color:C.muted }}>via {a.method}</div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize:12, color:C.muted, textAlign:"center", padding:"12px 0" }}>
                  {loadingAnecdotes ? (
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0", fontSize:12, color:C.muted }}>
                        <span style={{ fontSize:18, animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> Generating reviews…
                      </div>
                    ) : anecdoteError ? (
                      <div style={{ textAlign:"center", padding:"12px 0" }}>
                        <div style={{ fontSize:12, color:"#f87171", marginBottom:8 }}>Failed to load reviews</div>
                        <button onClick={()=>{ setAnecdoteError(false); loadAnecdotes(passportStrain); }} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid #f8717144", background:"transparent", color:"#f87171", cursor:"pointer", fontSize:12 }}>Try again</button>
                      </div>
                    ) : "Tap 'Load reviews' to see community anecdotes"}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:C.bg+"f5",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`,
        padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <LogoMark size={32}/>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:C.accent }}>Resin</div>
            <div style={{ fontSize:10, color:rank.color }}>{rank.icon} {rank.title}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {streak>0&&<div style={{ background:C.amberDim, border:`1px solid ${C.amber}44`, borderRadius:20, padding:"4px 10px", fontSize:12, color:C.amber }}>🔥{streak}d</div>}
          <div style={{ background:C.accentDim, border:`1px solid ${C.accent}44`, borderRadius:20, padding:"4px 10px", fontSize:12, color:C.accent }}>{xp}xp</div>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ display:"flex", background:C.bg, borderBottom:`1px solid ${C.border}`, position:"sticky", top:57, zIndex:49 }}>
        {[{id:"home",e:"🏠",l:"Home"},{id:"log",e:"🌿",l:"Log"},{id:"sessions",e:"📋",l:"History"},{id:"passport",e:"🛂",l:"Passport"},{id:"more",e:"⚙️",l:"More"}].map(t=>(
          <button key={t.id} onClick={()=>{ Sound.play("swipe"); setTab(t.id); if(t.id==="log")setStep(0); }} style={{
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
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:8 }}>
                    <LogoMark size={80}/>
                    <div style={{ fontSize:32, fontWeight:800, color:C.accent, marginTop:14, letterSpacing:"-0.5px" }}>Resin</div>
                    <div style={{ width:40, height:2, background:C.accent, borderRadius:1, marginTop:6, opacity:0.4 }}/>
                  </div>
                  <div style={{ fontSize:15, color:C.muted, lineHeight:1.6, marginBottom:8 }}>Track your cannabis. Discover what works.</div>
                  <div style={{ fontSize:13, color:rank.color, marginBottom:28 }}>{rank.icon} You start as a {rank.title}</div>
                  <button onClick={()=>{ Sound.play("select"); setTab("log"); }} style={{
                    padding:"14px 32px", borderRadius:50, border:"none", cursor:"pointer",
                    background:`linear-gradient(135deg,#c2410c,${C.accent})`, color:"#080502",
                    fontSize:16, fontWeight:800, boxShadow:`0 4px 24px ${C.accent}44`, marginBottom:32 }}>
                    Log your first session →
                  </button>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                    {[["🛂","Strain Passport","Collect every strain"],["🏆","Earn Ranks","From Novice to Sommelier"],["🧠","Real Insights","What works for YOU"]].map(([e,h,d])=>(
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
                {/* XP + rank */}
                <Card style={{ marginBottom:14 }}>
                  <XPBar xp={xp}/>
                </Card>

                {/* Daily ritual */}
                <DailyRitual sessions={sessions} onLog={()=>{ Sound.play("select"); setTab("log"); }}/>

                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
                  {[
                    {v:sessions.length, l:"Sessions",   c:C.accent,  i:"📋"},
                    {v:avgRating,        l:"Avg Rating", c:C.amber,   i:"⭐"},
                    {v:strainNames.length,l:"Strains",   c:"#fbbf24", i:"🌱"},
                  ].map(x=>(
                    <Card key={x.l} style={{ textAlign:"center", padding:12 }}>
                      <div style={{ fontSize:18, marginBottom:2 }}>{x.i}</div>
                      <div style={{ fontSize:22, fontWeight:800, color:x.c }}>{x.v}</div>
                      <div style={{ fontSize:10, color:C.muted }}>{x.l}</div>
                    </Card>
                  ))}
                </div>

                {/* Quick log */}
                {recentStrains.length>0 && (
                  <Card style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>QUICK LOG</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {recentStrains.map(name=>{
                        const s=allStrains.find(x=>x.name===name);
                        return (
                          <button key={name} onClick={()=>{ Sound.play("select"); setForm(f=>({...f,strain:name})); setStep(1); setTab("log"); }}
                            style={{ padding:"8px 14px", borderRadius:20, border:`1.5px solid ${s?typeColor(s.type)+"44":C.border}`,
                              background:s?typeBg(s.type):"transparent", color:s?typeColor(s.type):C.text, fontSize:13, cursor:"pointer" }}>
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Recent milestones */}
                {earnedMilestones.length>0 && (
                  <Card style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>ACHIEVEMENTS ({earnedMilestones.length}/{MILESTONES.length})</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {MILESTONES.map(m=>{
                        const earned = unlockedMilestones.includes(m.id);
                        return (
                          <div key={m.id} style={{ fontSize:20, opacity:earned?1:0.2, title:m.title }}
                            title={`${m.title}: ${m.desc}`}>
                            {m.icon}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Personal records */}
                {personalRecords.length>0 && (
                  <Card style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>PERSONAL RECORDS</div>
                    {personalRecords.map(r=>(
                      <div key={r.label} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${C.border}` }}>
                        <span style={{ fontSize:12, color:C.muted }}>{r.label}</span>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:13, fontWeight:700, color:C.accent }}>{r.value}</div>
                          <div style={{ fontSize:10, color:C.muted }}>{r.sub}</div>
                        </div>
                      </div>
                    ))}
                  </Card>
                )}

                {/* Strain intelligence teaser */}
                {qualifiedStrains.length>0 ? (
                  <button onClick={()=>{ Sound.play("tap"); setTab("passport"); }} style={{
                    width:"100%", padding:"14px", borderRadius:16, border:`1px solid ${C.accent}44`,
                    background:`linear-gradient(135deg,${C.card},#0d2010)`, cursor:"pointer", textAlign:"left",
                    display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <div style={{ fontSize:28 }}>🧠</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.accent }}>Strain Intelligence ready</div>
                      <div style={{ fontSize:11, color:C.muted }}>See your {qualifiedStrains[0]} passport →</div>
                    </div>
                  </button>
                ) : (
                  <Card style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", gap:12 }}>
                      <div style={{ fontSize:28 }}>🧠</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:4 }}>Strain Intelligence</div>
                        <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
                          Log 2 sessions with the same strain to unlock your personal effect profile.
                        </div>
                        <div style={{ height:5, background:C.faint, borderRadius:3 }}>
                          <div style={{ height:"100%", borderRadius:3, background:C.accent,
                            width:`${Math.min(100,sessions.filter(s=>s.strain===sessions[0]?.strain).length/2*100)}%` }}/>
                        </div>
                        <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>
                          {sessions.filter(s=>s.strain===sessions[0]?.strain).length}/2 sessions with "{sessions[0]?.strain}"
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════ LOG ════ */}
        {tab==="log" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.text }}>
                {["Pick your strain","Method & amount","Mood check","Rate it","Wellbeing"][step]}
              </div>
              <StepDots current={step} total={5} onGo={s=>{ Sound.play("swipe"); setStep(s); }}/>
            </div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>
              {["Search 80+ strains","How and how much?","How are you feeling?","Score the experience","Track health effects (optional)"][step]}
            </div>

            {/* STEP 0: STRAIN */}
            {step===0 && (
              <div>
                <div ref={searchRef} style={{ position:"relative", marginBottom:16 }}>
                  <input value={sq} onChange={e=>onSQ(e.target.value)} onFocus={()=>sq.length>=1&&setSdrop(true)}
                    placeholder="Search by name, effect, or type..."
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
                      {aiLoad && dropList.length===0 && (
                        <div style={{ padding:16, fontSize:12, color:C.muted, textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                          <span style={{ fontSize:18, animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> Searching AI database…
                        </div>
                      )}
                      {!aiLoad && dropList.length===0 && !aiError && sq.length>=2 && (
                        <div style={{ padding:16, fontSize:12, color:C.muted, textAlign:"center" }}>No matches found</div>
                      )}
                      {aiError && (
                        <div style={{ padding:14, textAlign:"center" }}>
                          <div style={{ fontSize:12, color:"#f87171", marginBottom:8 }}>Search failed — check your connection</div>
                          <button onClick={()=>tryAI(sq)} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid #f8717144`, background:"transparent", color:"#f87171", cursor:"pointer", fontSize:12 }}>Try again</button>
                        </div>
                      )}
                      {dropList.map((r,i)=>(
                        <button key={r.name+i} onClick={()=>pickStrain(r)} style={{
                          width:"100%", padding:"12px 14px", background:"transparent", border:"none",
                          borderBottom:i<dropList.length-1?`1px solid ${C.border}`:"none", cursor:"pointer", textAlign:"left" }}
                          onMouseEnter={e=>e.currentTarget.style.background="#1e1002"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:3 }}>
                            <span style={{ fontWeight:700, color:C.text, fontSize:14 }}>{r.name}</span>
                            <span style={{ fontSize:10, padding:"2px 8px", background:typeBg(r.type), border:`1px solid ${typeColor(r.type)}44`, borderRadius:10, color:typeColor(r.type) }}>{r.type}</span>
                            <span style={{ fontSize:11, color:C.amber }}>THC {r.thc}%</span>
                            {r.cbd>0&&<span style={{ fontSize:11, color:"#fbbf24" }}>CBD {r.cbd}%</span>}
                          </div>
                          <div style={{ fontSize:11, color:C.muted }}>{r.description}</div>
                        </button>
                      ))}
                      {aiLoad && dropList.length>0 && <div style={{ padding:8, fontSize:11, color:C.muted, textAlign:"center", borderTop:`1px solid ${C.border}` }}>Loading more…</div>}
                    </div>
                  )}
                </div>

                {curStrain ? (
                  <Card style={{ border:`2px solid ${typeColor(curStrain.type)}33`, marginBottom:14, boxShadow:`0 0 20px ${typeColor(curStrain.type)}10` }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:6 }}>
                          <span style={{ fontSize:17, fontWeight:800, color:C.text }}>{curStrain.name}</span>
                          <span style={{ fontSize:10, padding:"2px 8px", background:typeBg(curStrain.type), border:`1px solid ${typeColor(curStrain.type)}`, borderRadius:10, color:typeColor(curStrain.type) }}>{curStrain.type}</span>
                        </div>
                        <div style={{ display:"flex", gap:12, fontSize:13, marginBottom:6 }}>
                          <span style={{ color:C.amber, fontWeight:600 }}>THC {curStrain.thc}%</span>
                          {curStrain.cbd>0&&<span style={{ color:"#fbbf24", fontWeight:600 }}>CBD {curStrain.cbd}%</span>}
                        </div>
                        <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>{curStrain.description}</div>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          {curStrain.effects?.map(e=><span key={e} style={{ fontSize:10, padding:"2px 8px", background:C.accentDim, borderRadius:10, color:C.accent }}>{e}</span>)}
                        </div>
                      </div>
                      <button onClick={()=>setForm(f=>({...f,strain:""}))} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:18, alignSelf:"flex-start" }}>✕</button>
                    </div>
                    <button onClick={()=>{ setPassportStrain(form.strain); loadAnecdotes(form.strain); }}
                      style={{ marginTop:10, padding:"7px 14px", borderRadius:8, border:`1px solid ${C.accent}44`,
                        background:C.accentDim, color:C.accent, cursor:"pointer", fontSize:11 }}>
                      🛂 View Strain Passport →
                    </button>
                  </Card>
                ) : (
                  <div>
                    <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>Popular strains:</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
                      {STRAIN_DB.slice(0,8).map(s=>(
                        <button key={s.name} onClick={()=>{ Sound.play("select"); setForm(f=>({...f,strain:s.name})); }}
                          style={{ padding:"7px 14px", borderRadius:20, border:`1px solid ${typeColor(s.type)}33`,
                            background:typeBg(s.type), color:typeColor(s.type), fontSize:12, cursor:"pointer" }}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                    {!addingStrain ? (
                      <button onClick={()=>setAddingStrain(true)} style={{ width:"100%", padding:"12px", borderRadius:12,
                        border:`1.5px dashed ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer", fontSize:13 }}>
                        + Add a custom strain
                      </button>
                    ) : (
                      <Card>
                        <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:10 }}>Add custom strain</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                          {[["Name","name","text"],["THC %","thc","number"],["CBD %","cbd","number"]].map(([ph,k,t])=>(
                            <input key={k} type={t} placeholder={ph} value={newS[k]||""} onChange={e=>setNewS(s=>({...s,[k]:t==="number"?+e.target.value:e.target.value}))}
                              style={{ padding:"10px", background:"#140800", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }}/>
                          ))}
                          <select value={newS.type} onChange={e=>setNewS(s=>({...s,type:e.target.value}))}
                            style={{ padding:"10px", background:"#140800", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }}>
                            <option>Hybrid</option><option>Indica</option><option>Sativa</option>
                          </select>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={()=>{ if(newS.name){ Sound.play("select"); setCustom(p=>[{...newS,effects:[],flavors:[],description:""},...p]); setForm(f=>({...f,strain:newS.name})); setNewS({name:"",type:"Hybrid",thc:"",cbd:"",description:""}); setAddingStrain(false); }}}
                            style={{ flex:1, padding:"10px", borderRadius:10, border:"none", background:C.accent, color:"#080502", fontWeight:700, cursor:"pointer", fontSize:13 }}>
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

                {/* Photos */}
                {form.strain && (
                  <Card style={{ marginTop:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:C.text }}>📸 Add Bud Photos</div>
                      <button onClick={()=>setShowPhotoTips(true)} style={{ fontSize:11, color:C.accent, background:"transparent", border:"none", cursor:"pointer" }}>Tips →</button>
                    </div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {form.photos.map((p,i)=>(
                        <div key={i} style={{ position:"relative" }}>
                          <img src={p} style={{ width:70, height:70, borderRadius:10, objectFit:"cover" }} alt="bud"/>
                          <button onClick={()=>setForm(f=>({...f,photos:f.photos.filter((_,j)=>j!==i)}))}
                            style={{ position:"absolute", top:-6, right:-6, width:20, height:20, borderRadius:"50%",
                              background:"#ef4444", border:"none", color:"white", cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                        </div>
                      ))}
                      <label style={{ width:70, height:70, borderRadius:10, border:`2px dashed ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.muted, fontSize:28, flexDirection:"column", gap:2 }}>
                        <span>+</span>
                        <span style={{ fontSize:9 }}>Photo</span>
                        <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display:"none" }}/>
                      </label>
                    </div>
                    <div style={{ fontSize:10, color:C.muted, marginTop:8 }}>+8 XP for adding a photo</div>
                  </Card>
                )}

                {form.strain && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
                    <input placeholder="Brand (optional)" value={form.brand} onChange={e=>setForm(f=>({...f,brand:e.target.value}))}
                      style={{ padding:"10px 12px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12 }}/>
                    <input placeholder="Source / dispensary" value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))}
                      style={{ padding:"10px 12px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12 }}/>
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: METHOD */}
            {step===1 && (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
                  {METHODS.map(m=>(
                    <button key={m.id} onClick={()=>{ Sound.play("select"); setForm(f=>({...f,method:m.id,amount:m.def})); }}
                      style={{ padding:"14px 8px", borderRadius:14, border:`2px solid ${form.method===m.id?C.accent:C.border}`,
                        background:form.method===m.id?C.accentDim:C.card, color:form.method===m.id?C.accent:C.muted,
                        cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}>
                      <div style={{ fontSize:24, marginBottom:4 }}>{m.emoji}</div>
                      <div style={{ fontSize:11, fontWeight:form.method===m.id?700:400 }}>{m.label}</div>
                    </button>
                  ))}
                </div>
                <Card style={{ marginBottom:12 }}>
                  <Slider label={curMethod.unit==="puffs"?"Puffs":curMethod.unit==="ml"?"Amount (ml)":curMethod.unit==="mg"?"Dose (mg THC)":"Amount (g)"}
                    icon={curMethod.emoji} value={form.amount} onChange={v=>setForm(f=>({...f,amount:v}))}
                    min={curMethod.min} max={curMethod.max} step={curMethod.step}/>
                  <div style={{ textAlign:"center", fontSize:28, fontWeight:800, color:C.accent }}>{form.amount} {curMethod.unit}</div>
                </Card>
                {/* Method-specific tip */}
                <Card style={{ background:`linear-gradient(135deg,${C.card},#0d2a10)`, border:`1px solid ${C.accent}22` }}>
                  <div style={{ fontSize:11, color:C.accent, marginBottom:8 }}>💡 {curMethod.label} Tips</div>
                  {curMethod.tips.map((tip,i)=>(
                    <div key={i} style={{ fontSize:12, color:C.muted, marginBottom:4, paddingLeft:8, borderLeft:`2px solid ${C.accent}44` }}>
                      {tip}
                    </div>
                  ))}
                </Card>
                <Card style={{ marginTop:12 }}>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>DATE & TIME</div>
                  <input type="datetime-local" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                    style={{ width:"100%", padding:"10px 12px", background:"#140800", border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12, boxSizing:"border-box" }}/>
                </Card>
              </div>
            )}

            {/* STEP 2: MOOD */}
            {step===2 && (
              <div>
                {[["How are you feeling RIGHT NOW?","moodBefore"],["How do you expect to feel?","moodAfter"]].map(([lbl,key])=>(
                  <div key={key} style={{ marginBottom:24 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:12 }}>{lbl}</div>
                    <div style={{ display:"flex", gap:6 }}>
                      {MOODS.map((m,i)=>(
                        <button key={i} onClick={()=>{ Sound.play("tap"); setForm(f=>({...f,[key]:i})); }} style={{
                          flex:1, padding:"10px 4px", borderRadius:12,
                          border:`2px solid ${form[key]===i?C.amber:C.border}`,
                          background:form[key]===i?"#2a1f00":C.card, cursor:"pointer", textAlign:"center" }}>
                          <div style={{ fontSize:24, marginBottom:2 }}>{m}</div>
                          <div style={{ fontSize:9, color:form[key]===i?C.amber:C.muted }}>{MOOD_LABELS[i]}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                  placeholder="Setting, context, what you're doing... (+3 XP for detailed notes)"
                  rows={3} style={{ width:"100%", padding:"12px", background:C.card, border:`1px solid ${C.border}`,
                    borderRadius:12, color:C.text, fontSize:13, resize:"none", boxSizing:"border-box" }}/>
              </div>
            )}

            {/* STEP 3: RATINGS */}
            {step===3 && (
              <div>
                <Card style={{ marginBottom:12 }}>
                  {RATINGS.map(r=><Slider key={r.id} label={r.label} icon={r.icon} value={form.ratings[r.id]} onChange={v=>setRating(r.id,v)} color={r.color}/>)}
                  <Slider label="Intensity" icon="🌡️" value={form.intensity} onChange={v=>setForm(f=>({...f,intensity:v}))} color={C.purple}/>
                </Card>
                {/* Optional effects */}
                <button onClick={()=>{ Sound.play("tap"); setOptionalOpen(o=>({...o,effects:!o.effects})); }}
                  style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:`1px solid ${C.border}`,
                    background:C.card, color:C.text, cursor:"pointer", textAlign:"left", display:"flex",
                    justifyContent:"space-between", marginBottom:optionalOpen.effects?0:0, fontSize:14 }}>
                  <span>🏷️ Effects & Flavours <span style={{ fontSize:11, color:C.muted }}>(optional +5 XP)</span></span>
                  <span style={{ color:C.muted }}>{optionalOpen.effects?"▾":"▸"}</span>
                </button>
                {optionalOpen.effects && (
                  <Card style={{ marginTop:8 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>EFFECTS FELT</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
                      {EFFECTS.map(e=>(
                        <button key={e} onClick={()=>toggle("effects",e)} style={{
                          padding:"6px 12px", borderRadius:20, fontSize:12, cursor:"pointer",
                          border:`1.5px solid ${form.effects.includes(e)?C.accent:C.border}`,
                          background:form.effects.includes(e)?C.accentDim:C.card,
                          color:form.effects.includes(e)?C.accent:C.muted, fontWeight:form.effects.includes(e)?600:400 }}>
                          {e}
                        </button>
                      ))}
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

            {/* STEP 4: WELLBEING */}
            {step===4 && (
              <div>
                <Card style={{ background:`linear-gradient(135deg,${C.card},#0a1f0a)`, border:`1px solid ${C.border}`, marginBottom:10 }}>
                  <div style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:14 }}>
                    Optional — track how cannabis affected you. +5 XP for completing this step.
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
                    placeholder="Physical effects..." rows={2}
                    style={{ width:"100%", marginTop:8, padding:"10px", background:"#140800", border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12, resize:"none", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:13, fontWeight:600, color:"#67e8f9", marginTop:16, marginBottom:12 }}>🧠 Mental</div>
                  {MENTAL_CORE.map(f=><BidirSlider key={f.id} {...f} value={form.mental[f.id]||0} onChange={v=>setForm(fv=>({...fv,mental:{...fv.mental,[f.id]:v}}))} color="#67e8f9"/>)}
                  <button onClick={()=>setOptionalOpen(o=>({...o,mentMed:!o.mentMed}))}
                    style={{ margin:"8px 0", padding:"6px 12px", borderRadius:8, border:`1px dashed ${C.border}`,
                      background:"transparent", color:C.muted, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", gap:6 }}>
                    {optionalOpen.mentMed?"▾ Hide":"▸ Show"} mental health conditions
                  </button>
                  {optionalOpen.mentMed && MENTAL_MEDICAL.map(f=><BidirSlider key={f.id} {...f} value={form.mental[f.id]||0} onChange={v=>setForm(fv=>({...fv,mental:{...fv.mental,[f.id]:v}}))} color="#67e8f9"/>)}
                  <textarea value={form.mentalNotes} onChange={e=>setForm(f=>({...f,mentalNotes:e.target.value}))}
                    placeholder="Mental effects..." rows={2}
                    style={{ width:"100%", marginTop:8, padding:"10px", background:"#090f14", border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12, resize:"none", boxSizing:"border-box" }}/>
                </Card>
              </div>
            )}

            {/* Wizard nav */}
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              {step>0 && (
                <button onClick={()=>{ Sound.play("swipe"); setStep(s=>s-1); }} style={{
                  flex:1, padding:"14px", borderRadius:14, border:`1.5px solid ${C.border}`,
                  background:"transparent", color:C.muted, cursor:"pointer", fontSize:14, fontWeight:600 }}>
                  ← Back
                </button>
              )}
              {step<4 ? (
                <button onClick={()=>{ Sound.play("swipe"); setStep(s=>s+1); }} disabled={step===0&&!form.strain}
                  style={{ flex:2, padding:"14px", borderRadius:14, border:"none",
                    cursor:step===0&&!form.strain?"not-allowed":"pointer",
                    background:step===0&&!form.strain?C.faint:`linear-gradient(135deg,#2a6a0a,${C.accent})`,
                    color:step===0&&!form.strain?C.muted:"#080502", fontSize:14, fontWeight:700,
                    boxShadow:step===0&&!form.strain?undefined:`0 4px 16px ${C.accent}33` }}>
                  {step===0&&!form.strain?"Pick a strain first":"Continue →"}
                </button>
              ) : (
                <button onClick={saveSession} style={{
                  flex:2, padding:"14px", borderRadius:14, border:"none", cursor:"pointer",
                  background:`linear-gradient(135deg,#c2410c,${C.accent})`, color:"#080502",
                  fontSize:14, fontWeight:700, boxShadow:`0 4px 16px ${C.accent}33` }}>
                  ✦ Save Session
                </button>
              )}
            </div>
            {step===4 && (
              <button onClick={saveSession} style={{ width:"100%", marginTop:10, padding:"12px", borderRadius:12,
                border:`1px dashed ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer", fontSize:13 }}>
                Skip & save
              </button>
            )}
          </div>
        )}

        {/* ════ HISTORY ════ */}
        {tab==="sessions" && (
          <div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>{sessions.length} session{sessions.length!==1?"s":""}</div>
            {sessions.length===0 && (
              <div style={{ textAlign:"center", padding:"50px 20px", color:C.muted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
                <div>No sessions yet</div>
              </div>
            )}
            {sessions.map(s=>{
              const st   = allStrains.find(x=>x.name===s.strain);
              const meth = METHODS.find(m=>m.id===s.method);
              const open = expandedId===s.id;
              return (
                <div key={s.id} onClick={()=>{ Sound.play("tap"); setExpandedId(open?null:s.id); }}
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
                      {s.photos?.length>0 && (
                        <div style={{ display:"flex", gap:8, marginTop:12, marginBottom:12, overflowX:"auto" }}>
                          {s.photos.map((p,i)=><img key={i} src={p} style={{ width:80, height:80, borderRadius:10, objectFit:"cover", flexShrink:0 }} alt="bud"/>)}
                        </div>
                      )}
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5, marginTop:12, marginBottom:10 }}>
                        {RATINGS.map(r=>(
                          <div key={r.id} style={{ background:"#160900", borderRadius:10, padding:"8px 4px", textAlign:"center" }}>
                            <div style={{ fontSize:13 }}>{r.icon}</div>
                            <div style={{ fontSize:15, fontWeight:800, color:r.color }}>{s.ratings?.[r.id]||"—"}</div>
                            <div style={{ fontSize:9, color:C.muted }}>{r.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
                        {s.effects?.map(e=><span key={e} style={{ fontSize:11, padding:"3px 10px", background:C.accentDim, borderRadius:10, color:C.accent }}>{e}</span>)}
                      </div>
                      {s.notes&&<div style={{ fontSize:12, color:"#4a7a5a", fontStyle:"italic", marginBottom:10 }}>"{s.notes}"</div>}
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={e=>{ e.stopPropagation(); Sound.play("tap"); setEditingSession(s); }} style={{
                          padding:"7px 14px", borderRadius:8, border:`1px solid ${C.accent}44`,
                          background:"transparent", color:C.accent, cursor:"pointer", fontSize:12 }}>
                          ✏️ Edit
                        </button>
                        <button onClick={e=>{ e.stopPropagation(); setPassportStrain(s.strain); }} style={{
                          padding:"7px 14px", borderRadius:8, border:`1px solid ${C.border}`,
                          background:"transparent", color:C.muted, cursor:"pointer", fontSize:12 }}>
                          🛂 Passport
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

        {/* ════ PASSPORT ════ */}
        {tab==="passport" && (
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>🛂 Strain Passport</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Your personal strain collection — {strainNames.length} tried</div>
            {strainNames.length===0 ? (
              <div style={{ textAlign:"center", padding:"50px 20px", color:C.muted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🛂</div>
                <div>Log sessions to build your passport</div>
              </div>
            ) : (
              strainNames.map(name=>(
                <div key={name} onClick={()=>{ Sound.play("select"); setPassportStrain(name); loadAnecdotes(name); }}>
                  <PassportCard strain={name} sessions={sessions} allStrains={allStrains}/>
                </div>
              ))
            )}
          </div>
        )}

        {/* ════ MORE ════ */}
        {tab==="more" && (
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>Settings & Data</div>

            {/* Rank card */}
            <Card style={{ marginBottom:14, background:`linear-gradient(135deg,${C.card},#0d2a10)`, border:`1px solid ${rank.color}33` }}>
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
                <div style={{ fontSize:36 }}>{rank.icon}</div>
                <div>
                  <div style={{ fontSize:16, fontWeight:800, color:rank.color }}>{rank.title}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{xp} XP total</div>
                </div>
              </div>
              <XPBar xp={xp}/>
            </Card>

            {/* Milestones */}
            <Card style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>🏆 Achievements ({earnedMilestones.length}/{MILESTONES.length})</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {MILESTONES.map(m=>{
                  const earned = unlockedMilestones.includes(m.id);
                  return (
                    <div key={m.id} style={{ background:earned?"#140a02":"#0a0f0a", border:`1px solid ${earned?C.accent+"33":C.border}`,
                      borderRadius:10, padding:"10px 12px", opacity:earned?1:0.5 }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>{m.icon}</div>
                      <div style={{ fontSize:12, fontWeight:600, color:earned?C.accent:C.muted }}>{m.title}</div>
                      <div style={{ fontSize:10, color:C.muted }}>{m.desc}</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Export */}
            <Card style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>📤 Export & Backup</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>Keep your data safe or move to a new phone.</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <button onClick={exportJSON} style={{ padding:"12px 16px", borderRadius:12, border:`1px solid ${C.accent}44`,
                  background:C.accentDim, color:C.accent, cursor:"pointer", fontSize:13, fontWeight:600, textAlign:"left" }}>
                  💾 Full backup (JSON) — restore on new phone
                </button>
                <button onClick={exportCSV} style={{ padding:"12px 16px", borderRadius:12, border:`1px solid ${C.border}`,
                  background:"transparent", color:C.text, cursor:"pointer", fontSize:13, textAlign:"left" }}>
                  📊 Export as CSV
                </button>
                <label style={{ padding:"12px 16px", borderRadius:12, border:`1.5px dashed ${C.border}`,
                  color:C.muted, cursor:"pointer", fontSize:13, display:"block" }}>
                  📥 Restore from backup
                  <input type="file" accept=".json" onChange={importJSON} style={{ display:"none" }}/>
                </label>
              </div>
            </Card>

            {/* Profile */}
            {profile && (
              <Card style={{ marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>👤 Your Profile</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                  {[profile.experience,profile.frequency,profile.goal,profile.method].filter(Boolean).map(v=>(
                    <span key={v} style={{ fontSize:12, padding:"4px 10px", background:C.accentDim, borderRadius:10, color:C.accent }}>{v}</span>
                  ))}
                </div>
                <button onClick={()=>{ localStorage.removeItem("rs_p"); setProfile(null); setQuizStep(0); setQuizAnswers({}); }}
                  style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${C.border}`,
                    background:"transparent", color:C.muted, cursor:"pointer", fontSize:12 }}>
                  Redo setup quiz
                </button>
              </Card>
            )}

            <Card>
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:10 }}>
                <LogoMark size={40}/>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.accent }}>Resin</div>
                  <div style={{ fontSize:11, color:C.muted }}>Cannabis Experience Log · v2.0</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>
                Your data stays on your device. Nothing sent to any server. Export regularly to keep it safe.
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingSession && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(8,15,9,0.95)", overflowY:"auto", padding:20 }}>
          <div style={{ maxWidth:480, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:700, color:C.accent }}>Edit Session</div>
              <button onClick={()=>setEditingSession(null)} style={{ background:"transparent", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>✕</button>
            </div>
            <Card style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>STRAIN</div>
              <select value={editingSession.strain} onChange={e=>setEditingSession(s=>({...s,strain:e.target.value}))}
                style={{ width:"100%", padding:"10px", background:"#140800", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13 }}>
                {allStrains.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </Card>
            <Card style={{ marginBottom:12 }}>
              <Slider label="Overall Rating" icon="⭐" value={editingSession.ratings?.overall||7}
                onChange={v=>setEditingSession(s=>({...s,ratings:{...s.ratings,overall:v}}))} color="#f59e0b"/>
            </Card>
            <Card style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>EFFECTS</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {EFFECTS.map(e=>(
                  <button key={e} onClick={()=>setEditingSession(s=>({...s,effects:s.effects?.includes(e)?s.effects.filter(x=>x!==e):[...(s.effects||[]),e]}))}
                    style={{ padding:"6px 12px", borderRadius:20, fontSize:12, cursor:"pointer",
                      border:`1.5px solid ${editingSession.effects?.includes(e)?C.accent:C.border}`,
                      background:editingSession.effects?.includes(e)?C.accentDim:C.card,
                      color:editingSession.effects?.includes(e)?C.accent:C.muted }}>
                    {e}
                  </button>
                ))}
              </div>
            </Card>
            <Card style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>NOTES</div>
              <textarea value={editingSession.notes||""} onChange={e=>setEditingSession(s=>({...s,notes:e.target.value}))}
                rows={3} style={{ width:"100%", padding:"10px", background:"#140800", border:`1px solid ${C.border}`,
                  borderRadius:8, color:C.text, fontSize:13, resize:"none", boxSizing:"border-box" }}/>
            </Card>
            <button onClick={()=>saveEdit(editingSession)} style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", cursor:"pointer",
              background:`linear-gradient(135deg,#c2410c,${C.accent})`, color:"#080502", fontSize:14, fontWeight:700 }}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Photo tips */}
      {showPhotoTips && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(8,15,9,0.97)", padding:24, overflowY:"auto" }}>
          <div style={{ maxWidth:440, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:700, color:C.accent }}>📸 Bud Photo Tips</div>
              <button onClick={()=>setShowPhotoTips(false)} style={{ background:"transparent", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>✕</button>
            </div>
            {[
              ["Natural light","Take near a window in daylight. Avoid flash — it kills trichome detail."],
              ["Macro mode","Use portrait or macro on your phone. Get 5–10cm away."],
              ["Dark background","Put the bud on black paper or a dark plate. Makes colours pop."],
              ["Multiple angles","Top-down = structure. Side-on = density. Close-up = trichomes."],
              ["Clean your lens","Wipe the lens before shooting. Pocket lint ruins macro shots."],
              ["Use a timer","Set a 2-second timer to avoid shake on close shots."],
            ].map(([t,d])=>(
              <Card key={t} style={{ marginBottom:10 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.accent, marginBottom:4 }}>{t}</div>
                <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{d}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input:focus,select:focus,textarea:focus{outline:2px solid #a3e63540!important;outline-offset:1px}
        .styled-slider{-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;outline:none;background:linear-gradient(90deg,var(--col) var(--pct),#2a1506 var(--pct));cursor:pointer}
        .styled-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:var(--col);cursor:pointer;border:3px solid #080f09;box-shadow:0 0 8px var(--col,#a3e635)55}
        .styled-slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:var(--col);cursor:pointer;border:3px solid #080f09}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1c2e1c;border-radius:2px}
        ::placeholder{color:#2a4a2a!important}
        button{font-family:system-ui,-apple-system,sans-serif}
        body{background:#0c0905}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes scrollUp{from{transform:translateY(0)}to{transform:translateY(-50%)}}
        @keyframes scrollDown{from{transform:translateY(-50%)}to{transform:translateY(0)}}
        @keyframes slideDown{from{transform:translateX(-50%) translateY(-20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
        @media(max-width:360px){.styled-slider::-webkit-slider-thumb{width:28px;height:28px}}
      `}</style>
    </div>
  );
}
