export const RANKS = [
  { min:0,    title:"Green Thumb",      icon:"🌱", color:"#86efac" },
  { min:3,    title:"Casual Terper",    icon:"🌿", color:"#4ade80" },
  { min:8,    title:"Strain Explorer",  icon:"🔍", color:"#f97316" },
  { min:15,   title:"Bud Connoisseur",  icon:"🌺", color:"#fb923c" },
  { min:25,   title:"Terpene Scholar",  icon:"🧪", color:"#a78bfa" },
  { min:40,   title:"Strain Hunter",    icon:"🎯", color:"#f59e0b" },
  { min:60,   title:"Hash Professor",   icon:"🎓", color:"#67e8f9" },
  { min:100,  title:"Cannabis Sommelier",icon:"🍷",color:"#f472b6" },
];

export const typeColor = t => t==="Indica"?"#a78bfa":t==="Sativa"?"#fbbf24":"#fbbf24";
export const typeBg    = t => t==="Indica"?"#1e1b4b":t==="Sativa"?"#431407":"#022c22";
