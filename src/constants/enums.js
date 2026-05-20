export const METHODS = [
  { id:"joint",     emoji:"🚬", label:"Joint",      unit:"g",    min:0.1,  max:10,  step:0.1,  def:0.5,  tips:["Roll tight for an even burn","Use a crutch/filter for cooler smoke","Grind evenly for best airflow"] },
  { id:"blunt",     emoji:"🍂", label:"Blunt",      unit:"g",    min:0.5,  max:10,  step:0.1,  def:1,    tips:["Lick the wrap lightly — not too wet","Let it dry 30 seconds after sealing","Rotate while smoking for even burn"] },
  { id:"pipe",      emoji:"🪈", label:"Pipe",       unit:"g",    min:0.1,  max:5,   step:0.1,  def:0.3,  tips:["Corner the bowl — don't burn it all at once","Clean your pipe weekly for best flavour","Pack loosely for better airflow"] },
  { id:"bong",      emoji:"🫧", label:"Bong",       unit:"g",    min:0.1,  max:5,   step:0.1,  def:0.3,  tips:["Change water every session","Ice in the tube cools the smoke significantly","Clear the chamber fully for best effect"] },
  { id:"dryvape",   emoji:"🌬️", label:"Dry Vape",   unit:"g",    min:0.05, max:2,   step:0.05, def:0.15, tips:["Start at 170°C, work up slowly","Grind fine for even heat distribution","ABV (already been vaped) can be reused in edibles"] },
  { id:"resinvape", emoji:"🛢️", label:"Resin Vape", unit:"puffs",min:1,    max:60,  step:1,    def:3,    tips:["Store carts upright to prevent leaks","Keep below 200°C to preserve terpenes","Preheat mode warms thick oil better"] },
  { id:"dab",       emoji:"🧪", label:"Dab",        unit:"g",    min:0.05, max:3,   step:0.05, def:0.1,  tips:["Low temp dabs (450-550°F) preserve terpenes","Let the nail cool 30-45 seconds after heating","Use a carb cap for full flavour extraction"] },
  { id:"edible",    emoji:"🍫", label:"Edible",     unit:"mg",   min:2.5,  max:500, step:2.5,  def:10,   tips:["Wait 90 minutes before considering more","Eat a light meal first for consistent absorption","Effects last 4-8 hours — plan accordingly"] },
  { id:"tincture",  emoji:"💧", label:"Tincture",   unit:"ml",   min:0.5,  max:30,  step:0.5,  def:1,    tips:["Hold under tongue 60-90 seconds for fastest effect","Faster onset than edibles when held sublingually","Start with 0.5ml and wait 45 minutes"] },
];

export const EFFECTS = ["Relaxed","Euphoric","Happy","Creative","Focused","Sleepy","Uplifted","Energetic","Calm","Hungry","Talkative","Giggly"];

export const FLAVOR_FAMILIES = [
  { id:"fruit",   label:"Fruit",   color:"#fb923c", flavors:["Berry","Citrus","Mango","Grape","Cherry","Lemon","Tropical","Peach"] },
  { id:"earth",   label:"Earth",   color:"#a78a5a", flavors:["Earthy","Woody","Hash","Pine","Cedar","Leather"] },
  { id:"sweet",   label:"Sweet",   color:"#f472b6", flavors:["Sweet","Vanilla","Candy","Honey","Cake","Caramel"] },
  { id:"pungent", label:"Pungent", color:"#84cc16", flavors:["Diesel","Skunk","Cheese","Fuel","Chemical"] },
  { id:"spice",   label:"Spice",   color:"#f87171", flavors:["Spice","Pepper","Herbal","Floral","Lavender","Mint"] },
];

export const FLAVORS = FLAVOR_FAMILIES.flatMap(f => f.flavors);

export const PHYSICAL_CORE = [
  { id:"pain",    label:"Pain Relief",   icon:"🩹" },
  { id:"sleep",   label:"Sleep",         icon:"😴" },
  { id:"energy",  label:"Energy",        icon:"⚡" },
  { id:"nausea",  label:"Nausea",        icon:"🤢" },
  { id:"tension", label:"Tension",       icon:"💪" },
  { id:"appetite",label:"Appetite",      icon:"🍽️" },
];

export const PHYSICAL_MEDICAL = [
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

export const MENTAL_CORE = [
  { id:"anxiety",    label:"Anxiety",    icon:"🧘" },
  { id:"stress",     label:"Stress",     icon:"😮‍💨" },
  { id:"mood",       label:"Mood",       icon:"🌤️" },
  { id:"focus",      label:"Focus",      icon:"🎯" },
  { id:"creativity", label:"Creativity", icon:"🎨" },
  { id:"social",     label:"Social",     icon:"🤝" },
];

export const MENTAL_MEDICAL = [
  { id:"ptsd",       label:"PTSD",        icon:"🛡️" },
  { id:"depression", label:"Depression",  icon:"🌧️" },
  { id:"bipolar",    label:"Bipolar",     icon:"⚖️" },
  { id:"ocd",        label:"OCD",         icon:"🔄" },
  { id:"adhd",       label:"ADHD",        icon:"🎯" },
  { id:"insomnia",   label:"Insomnia",    icon:"🌙" },
  { id:"panic",      label:"Panic",       icon:"💨" },
  { id:"paranoia",   label:"Paranoia",    icon:"👁️" },
];

export const PHYSICAL_FACTORS = [...PHYSICAL_CORE, ...PHYSICAL_MEDICAL];
export const MENTAL_FACTORS   = [...MENTAL_CORE,   ...MENTAL_MEDICAL];

export const RATINGS = [
  { id:"overall",    label:"Overall",   icon:"⭐", color:"#f59e0b" },
  { id:"taste",      label:"Taste",     icon:"👅", color:"#fb923c" },
  { id:"potency",    label:"Potency",   icon:"⚡", color:"#a78bfa" },
  { id:"smoothness", label:"Smooth",    icon:"🌫️", color:"#67e8f9" },
  { id:"effect",     label:"Effect",    icon:"🧠", color:"#6ee7b7" },
  { id:"value",      label:"Value",     icon:"💰", color:"#fde68a" },
];

export const MOODS = ["😔","😐","🙂","😊","🌟"];
export const MOOD_LABELS = ["Low","Meh","Okay","Good","Amazing"];
