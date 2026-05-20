export const MILESTONES = [
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

export const checkMilestones = (sessions, profile) => MILESTONES.filter(m => m.check(sessions, profile||{}));
