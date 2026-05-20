import { RANKS } from '../constants/ranks';
import { EFFECTS, METHODS, PHYSICAL_FACTORS, MENTAL_FACTORS } from '../constants/enums';

export const getXP = (sessions) => {
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

export const totalXP = getXP;

export const getRank = (xp) => {
  const r = [...RANKS].reverse().find(r => xp >= r.min * 10);
  return r || RANKS[0];
};

export const getNextRank = (xp) => {
  const idx = RANKS.findIndex(r => r.title === getRank(xp).title);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
};

export const getRankProgress = (xp, nextRank) => {
  const rank = getRank(xp);
  const rankXP = rank.min * 10;
  const nextXP = nextRank ? nextRank.min * 10 : xp;
  return nextRank ? Math.min(100, ((xp - rankXP) / (nextXP - rankXP)) * 100) : 100;
};

export const mkForm = () => ({
  strain:"", method:"joint", amount:0.5,
  moodBefore:2, moodAfter:2,
  effects:[], flavors:[],
  ratings:{ overall:7, taste:7, potency:5, smoothness:7, effect:7, value:7 },
  physical: Object.fromEntries(PHYSICAL_FACTORS.map(f=>[f.id,0])),
  mental:   Object.fromEntries(MENTAL_FACTORS.map(f=>[f.id,0])),
  physicalNotes:"", mentalNotes:"", notes:"",
  brand:"", source:"", date: new Date().toISOString().slice(0,16),
  intensity:5, photos:[], sessionTiming:"after",
});

export const calcStreak = (sess) => {
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

export const personalRecords = (sessions) => {
  if (!sessions.length) return [];
  const strainNames = [...new Set(sessions.map(s=>s.strain))].filter(Boolean);
  const topEffects = EFFECTS.map(e=>({e,n:sessions.filter(s=>s.effects?.includes(e)).length})).sort((a,b)=>b.n-a.n);
  return [
    { label:"Highest rated session",  value: sessions.reduce((a,b)=>(b.ratings?.overall||0)>(a.ratings?.overall||0)?b:a).strain, sub: `${sessions.reduce((a,b)=>(b.ratings?.overall||0)>(a.ratings?.overall||0)?b:a).ratings?.overall}/10` },
    { label:"Most used strain",        value: strainNames.sort((a,b)=>sessions.filter(s=>s.strain===b).length-sessions.filter(s=>s.strain===a).length)[0], sub: `${sessions.filter(s=>s.strain===strainNames[0]).length} times` },
    { label:"Most consistent effects", value: topEffects[0]?.e||"—", sub:"most logged effect" },
  ];
};

export const checkStorageLimit = () => {
  try {
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k?.startsWith("rs_") && localStorage.getItem(k)?.length > 3500000) return true;
    }
  } catch { return false; }
  return false;
};
