import { useState, useRef, useCallback } from 'react';
import Card from '../components/Card';
import StepDots from '../components/StepDots';
import { Slider, BidirSlider } from '../components/Slider';
import { C } from '../constants/colors';
import { STRAIN_DB } from '../constants/data';
import { METHODS, EFFECTS, FLAVOR_FAMILIES, PHYSICAL_CORE, PHYSICAL_MEDICAL, MENTAL_CORE, MENTAL_MEDICAL, RATINGS, MOODS, MOOD_LABELS } from '../constants/enums';
import { typeColor, typeBg } from '../constants/ranks';
import Sound from '../lib/sound';

export default function LogScreen({ sessions, custom, setCustom, allStrains, profile, step, setStep, form, setForm, onSave, setShowPhotoTips, setPassportStrain, loadAnecdotes }) {
  const topRef = useRef(null);
  const [sq, setSq] = useState("");
  const [sdrop, setSdrop] = useState(false);
  const [aiRes, setAiRes] = useState([]);
  const [aiLoad, setAiLoad] = useState(false);
  const [aiError, setAiError] = useState(false);
  const searchRef = useRef(null);
  const aiTimer = useRef(null);
  const [addingStrain, setAddingStrain] = useState(false);
  const [newS, setNewS] = useState({name:"",type:"Hybrid",thc:"",cbd:"",description:""});
  const [optionalOpen, setOptionalOpen] = useState({effects:false, wellbeing:false, physMed:false, mentMed:false});

  // Click outside search
  const clickRef = useRef(null);
  useState(() => {
    const h=e=>{ if(searchRef.current&&!searchRef.current.contains(e.target)) setSdrop(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  });

  const curMethod = METHODS.find(m=>m.id===form.method)||METHODS[0];
  const curStrain = allStrains.find(s=>s.name===form.strain);

  const localMatches = sq.length>=1 ? allStrains.filter(s=>
    s.name.toLowerCase().includes(sq.toLowerCase()) ||
    s.type.toLowerCase().includes(sq.toLowerCase()) ||
    s.effects?.some(e=>e.toLowerCase().includes(sq.toLowerCase()))
  ).slice(0,5) : [];

  const tryAI = useCallback(async(q)=>{
    setAiLoad(true); setAiError(false);
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

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f=>({...f,photos:[...f.photos,ev.target.result]}));
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div ref={topRef} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>
          {["Pick your strain","Method & amount","Mood check","Rate it","Wellbeing"][step]}
        </div>
        <StepDots current={step} total={5} onGo={s=>{ Sound.play("swipe"); setStep(s); setTimeout(()=>topRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),50); }}/>
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
          <Card style={{ background:`linear-gradient(135deg,${C.card},#1a0d02)`, border:`1px solid ${C.accent}22` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:11, color:C.accent }}>💡 {curMethod.label} Tips</span>
              {profile?.experience && <span style={{ fontSize:9, color:C.muted, background:C.faint, padding:"1px 6px", borderRadius:6 }}>{profile.experience}</span>}
            </div>
            {(()=>{
              const exp = profile?.experience||"";
              const advanced = exp.includes("5+") || exp.includes("3–5");
              const advancedTips = {
                joint:["Try hemp papers — slower burn, cleaner flavour profile","62% Boveda humidity packs preserve terpenes long-term"],
                blunt:["Hemp wraps eliminate tobacco nicotine cross-tolerance","Rehydrate dry wraps with damp cloth 30 secs before rolling"],
                pipe:["Quartz pipes preserve terpene flavour better than glass","Try vaping at low temp first, then combust for full extraction"],
                bong:["Percolators maximise surface area for smoother filtration","Food-grade glycerin in tube gives even cooler draws than ice"],
                dryvape:["Stir bowl midway — even extraction across the herb bed","Save ABV (already vaped) — decarb is done, use in edibles"],
                resinvape:["Live resin carts preserve the most terpenes — seek full-spectrum","Lower voltage (2.4V) = more flavour, higher (3.3V) = more vapour"],
                dab:["Cold-start dabs preserve maximum terpene flavour","Reclaim residue can be re-dabbed or dissolved in edible fat"],
                edible:["Take with high-fat meal — absorption increases significantly","MCT tincture sublingual alongside edible accelerates onset"],
                tincture:["Full-spectrum produces entourage effect vs isolate","Bioavailability increases with fatty foods or grapefruit juice"],
              };
              const tips = advanced ? [...curMethod.tips, ...(advancedTips[form.method]||[])] : curMethod.tips;
              return tips.map((tip,i)=>(
                <div key={i} style={{ fontSize:12, color:advanced&&i>=3?"#fbbf24":C.muted, marginBottom:4,
                  paddingLeft:8, borderLeft:`2px solid ${advanced&&i>=3?"#fbbf2444":C.accent+"44"}` }}>
                  {tip}
                </div>
              ));
            })()}
          </Card>
          <Card style={{ marginTop:12 }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>DATE & TIME</div>
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              {[
                { label:"Now",        val:()=>new Date().toISOString().slice(0,16) },
                { label:"30 min ago",  val:()=>new Date(Date.now()-30*60000).toISOString().slice(0,16) },
                { label:"1 hour ago",  val:()=>new Date(Date.now()-60*60000).toISOString().slice(0,16) },
              ].map(t=>(
                <button key={t.label} onClick={()=>setForm(f=>({...f,date:t.val()}))}
                  style={{ flex:1, padding:"8px 4px", borderRadius:8, border:`1px solid ${C.border}`,
                    background:C.faint, color:C.text, cursor:"pointer", fontSize:11, fontFamily:"system-ui" }}>
                  {t.label}
                </button>
              ))}
            </div>
            <input type="datetime-local" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
              style={{ width:"100%", padding:"10px 12px", background:"#140800", border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12, boxSizing:"border-box" }}/>
          </Card>
        </div>
      )}

      {/* STEP 2: MOOD */}
      {step===2 && (
        <div>
          <Card style={{ marginBottom:20, background:`linear-gradient(135deg,${C.card},#1a0d02)`, border:`1px solid ${C.accent}22` }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:12 }}>When are you logging this?</div>
            <div style={{ display:"flex", gap:8 }}>
              {[
                { id:"before",  label:"Before session",   icon:"⏱️",  desc:"Haven't consumed yet" },
                { id:"during",  label:"Just smoked",      icon:"🌿",  desc:"In the first few minutes" },
                { id:"after",   label:"20+ mins in",      icon:"🧠",  desc:"Effects fully kicked in" },
              ].map(t=>(
                <button key={t.id} onClick={()=>setForm(f=>({...f,sessionTiming:t.id}))}
                  style={{ flex:1, padding:"10px 6px", borderRadius:12,
                    border:`2px solid ${form.sessionTiming===t.id?C.accent:C.border}`,
                    background:form.sessionTiming===t.id?C.accentDim:C.card,
                    cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{t.icon}</div>
                  <div style={{ fontSize:11, fontWeight:form.sessionTiming===t.id?700:400, color:form.sessionTiming===t.id?C.accent:C.text, marginBottom:2 }}>{t.label}</div>
                  <div style={{ fontSize:9, color:C.muted }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </Card>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>
              {form.sessionTiming==="before" ? "How are you feeling right now?"
                : form.sessionTiming==="after" ? "How were you feeling before?"
                : "How are you feeling right now?"}
            </div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>Your baseline before cannabis</div>
            <div style={{ display:"flex", gap:6 }}>
              {MOODS.map((m,i)=>(
                <button key={i} onClick={()=>{ Sound.play("tap"); setForm(f=>({...f,moodBefore:i})); }} style={{
                  flex:1, padding:"10px 4px", borderRadius:12,
                  border:`2px solid ${form.moodBefore===i?C.amber:C.border}`,
                  background:form.moodBefore===i?"#2a1f00":C.card, cursor:"pointer", textAlign:"center" }}>
                  <div style={{ fontSize:24, marginBottom:2 }}>{m}</div>
                  <div style={{ fontSize:9, color:form.moodBefore===i?C.amber:C.muted }}>{MOOD_LABELS[i]}</div>
                </button>
              ))}
            </div>
          </div>

          {(form.sessionTiming==="during" || form.sessionTiming==="after") && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>
                {form.sessionTiming==="after" ? "How are you feeling NOW?" : "Any noticeable shift yet?"}
              </div>
              <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>
                {form.sessionTiming==="after" ? "Effects fully in" : "Early onset feelings"}
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {MOODS.map((m,i)=>(
                  <button key={i} onClick={()=>{ Sound.play("tap"); setForm(f=>({...f,moodAfter:i})); }} style={{
                    flex:1, padding:"10px 4px", borderRadius:12,
                    border:`2px solid ${form.moodAfter===i?C.amber:C.border}`,
                    background:form.moodAfter===i?"#2a1f00":C.card, cursor:"pointer", textAlign:"center" }}>
                    <div style={{ fontSize:24, marginBottom:2 }}>{m}</div>
                    <div style={{ fontSize:9, color:form.moodAfter===i?C.amber:C.muted }}>{MOOD_LABELS[i]}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.sessionTiming==="before" && (
            <div style={{ padding:"10px 14px", background:C.faint, borderRadius:10, marginBottom:16, fontSize:12, color:C.muted }}>
              💡 Come back after your session to log how you felt — or log it now and edit later
            </div>
          )}

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
              style={{ width:"100%", marginTop:12, padding:"10px", background:"#140800", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12, resize:"none", boxSizing:"border-box" }}/>
          </Card>

          <Card style={{ background:`linear-gradient(135deg,${C.card},#0a001f)`, border:`1px solid ${C.border}`, marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#a78bfa", marginBottom:12, marginTop:8 }}>🧠 Mental</div>
            {MENTAL_CORE.map(f=><BidirSlider key={f.id} {...f} value={form.mental[f.id]||0} onChange={v=>setForm(fv=>({...fv,mental:{...fv.mental,[f.id]:v}}))} color="#a78bfa"/>)}
            <button onClick={()=>setOptionalOpen(o=>({...o,mentMed:!o.mentMed}))}
              style={{ margin:"8px 0", padding:"6px 12px", borderRadius:8, border:`1px dashed ${C.border}`,
                background:"transparent", color:C.muted, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", gap:6 }}>
              {optionalOpen.mentMed?"▾ Hide":"▸ Show"} medical conditions
            </button>
            {optionalOpen.mentMed && MENTAL_MEDICAL.map(f=><BidirSlider key={f.id} {...f} value={form.mental[f.id]||0} onChange={v=>setForm(fv=>({...fv,mental:{...fv.mental,[f.id]:v}}))} color="#a78bfa"/>)}
            <textarea value={form.mentalNotes} onChange={e=>setForm(f=>({...f,mentalNotes:e.target.value}))}
              placeholder="Mental/emotional effects..." rows={2}
              style={{ width:"100%", marginTop:12, padding:"10px", background:"#140800", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12, resize:"none", boxSizing:"border-box" }}/>
          </Card>

          <Card style={{ background:`linear-gradient(135deg,${C.card},#1a0a0a)`, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#f87171", marginBottom:12, marginTop:8 }}>💊 Medical</div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>
              Did this session help with any medical conditions? (optional)
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {[
                { id:"anxiety", label:"Anxiety" },
                { id:"pain", label:"Pain" },
                { id:"insomnia", label:"Insomnia" },
                { id:"depression", label:"Depression" },
                { id:"nausea", label:"Nausea" },
                { id:"stress", label:"Stress" },
                { id:"migraine", label:"Migraine" },
                { id:"inflammation", label:"Inflammation" },
                { id:"adhd", label:"ADHD" },
              ].map(c=>(
                <button key={c.id} onClick={()=>toggle("medical",c.id)} style={{
                  padding:"6px 12px", borderRadius:20, fontSize:12, cursor:"pointer",
                  border:`1.5px solid ${form.medical.includes(c.id)?"#f87171":C.border}`,
                  background:form.medical.includes(c.id)?"#3a0a0a":C.card,
                  color:form.medical.includes(c.id)?"#f87171":C.muted }}>
                  {c.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* WIZARD NAVIGATION */}
      <div style={{ display:"flex", gap:10, marginTop:20, marginBottom:30 }}>
        {step>0 && (
          <button onClick={()=>{ Sound.play("swipe"); setStep(s=>s-1); }}
            style={{ flex:1, padding:"14px", borderRadius:12, border:`1px solid ${C.border}`,
              background:"transparent", color:C.text, cursor:"pointer", fontSize:14, fontWeight:600 }}>
            ← Back
          </button>
        )}
        {step<4 ? (
          <button onClick={()=>{ Sound.play("select"); if(step===0&&!form.strain) return; setStep(s=>s+1); }}
            style={{ flex:2, padding:"14px", borderRadius:12, border:"none",
              background:step===0&&!form.strain?"#333":C.accent,
              color:step===0&&!form.strain?C.muted:"#080502", cursor:step===0&&!form.strain?"not-allowed":"pointer",
              fontSize:14, fontWeight:700 }}>
            {step===0 && !form.strain ? "Select a strain to continue" : step===0 ? "Strain chosen! →" : "Next →"}
          </button>
        ) : (
          <button onClick={()=>{ Sound.play("select"); onSave(); }}
            style={{ flex:2, padding:"14px", borderRadius:12, border:"none",
              background:"#166534", color:"#bbf7d0", cursor:"pointer", fontSize:14, fontWeight:700 }}>
            ✓ Save Session
          </button>
        )}
      </div>
      {step===4 && (
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <button onClick={()=>{ Sound.play("select"); onSave(); }}
            style={{ padding:"10px 24px", borderRadius:10, border:"none",
              background:"transparent", color:C.muted, cursor:"pointer", fontSize:12 }}>
            Skip wellbeing & save anyway →
          </button>
        </div>
      )}
    </div>
  );
}
