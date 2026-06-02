import Card from '../components/Card';
import { C } from '../constants/colors';
import { typeColor, typeBg } from '../constants/ranks';
import { EFFECTS, RATINGS, MOODS } from '../constants/enums';

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

const StrainPassportModal = ({ strain, sessions, allStrains, strainAnecdotes, loadingAnecdotes, anecdoteError, onLoadAnecdotes, onClose, premium, myReviews={}, generatingReview=null, onGenerateReview, onShareReview, onOpenCamera, onOpenGallery }) => {
  const passportStrain = strain;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:150, background:"rgba(8,15,9,0.96)", overflowY:"auto", padding:20 }}>
      <div style={{ maxWidth:480, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.accent }}>🛂 Strain Passport</div>
            {sessions.filter(s=>s.strain===strain).length >= 1 && (
              <>
                <button onClick={()=>onOpenCamera?.(strain)}
                  style={{ padding:"4px 10px", borderRadius:20, border:`1px solid ${C.accent}44`, background:C.accentDim, color:C.accent, cursor:"pointer", fontSize:11, fontWeight:600 }}>
                  📸 Photos
                </button>
                <button onClick={()=>onShareReview?.(strain)}
                  style={{ padding:"4px 10px", borderRadius:20, border:`1px solid ${C.accent}44`, background:C.accentDim, color:C.accent, cursor:"pointer", fontSize:11, fontWeight:600 }}>
                  📤 Share
                </button>
              </>
            )}
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>✕</button>
        </div>
        <PassportCard strain={passportStrain} sessions={sessions} allStrains={allStrains}/>
        {/* AI anecdotes */}
        <Card style={{ marginTop:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.text }}>💬 Reviews</div>
            {!strainAnecdotes[passportStrain] && (
              <button onClick={()=>onLoadAnecdotes(passportStrain)} disabled={loadingAnecdotes}
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
                  <button onClick={()=>onLoadAnecdotes(passportStrain)} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid #f8717144", background:"transparent", color:"#f87171", cursor:"pointer", fontSize:12 }}>Try again</button>
                </div>
              ) : "Tap 'Load reviews' to see community anecdotes"}
            </div>
          )}
        </Card>

        {/* Personal AI review */}
        <Card style={{ marginTop:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.text }}>🤖 Your AI Review</div>
            {myReviews[passportStrain] ? (
              <button onClick={()=>onGenerateReview(passportStrain)} disabled={generatingReview===passportStrain}
                style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${C.accent}44`,
                  background:C.accentDim, color:C.accent, cursor:"pointer", fontSize:12, opacity:generatingReview===passportStrain?0.6:1 }}>
                {generatingReview===passportStrain?"Generating...":"Regenerate"}
              </button>
            ) : (
              <button onClick={()=>onGenerateReview(passportStrain)} disabled={generatingReview===passportStrain}
                style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${C.accent}44`,
                  background:C.accentDim, color:C.accent, cursor:"pointer", fontSize:12, opacity:generatingReview===passportStrain?0.6:1 }}>
                {generatingReview===passportStrain?"Generating...":(premium?"Generate my review":"Unlock Premium")}
              </button>
            )}
          </div>
          {myReviews[passportStrain] ? (
            <div>
              <div style={{ background:"#160900", borderRadius:12, padding:12, marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:C.accent }}>@{passportStrain}</span>
                  <span style={{ fontSize:11, color:C.amber }}>{"⭐".repeat(Math.round(myReviews[passportStrain].rating))}</span>
                </div>
                <div style={{ fontSize:13, color:C.text, lineHeight:1.5, marginBottom:4 }}>{myReviews[passportStrain].text}</div>
                <div style={{ fontSize:11, color:C.muted }}>Based on {myReviews[passportStrain].sessions} sessions</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize:12, color:C.muted, textAlign:"center", padding:"12px 0" }}>
              {generatingReview===passportStrain ? (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0", fontSize:12, color:C.muted }}>
                  <span style={{ fontSize:18, animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> Crafting your review…
                </div>
              ) : (premium ? "Tap 'Generate my review' for an AI-crafted personal review based on your sessions" : "Unlock Premium to generate AI-powered personal strain reviews")}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StrainPassportModal;
