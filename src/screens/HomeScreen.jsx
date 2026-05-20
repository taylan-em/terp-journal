import { useState } from 'react';
import Card from '../components/Card';
import XPBar from '../components/XPBar';
import LogoMark from '../components/LogoMark';
import { C } from '../constants/colors';
import { STRAIN_DB } from '../constants/data';
import { MILESTONES } from '../constants/milestones';
import { typeColor, typeBg } from '../constants/ranks';
import Sound from '../lib/sound';

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

const DailyRitual = ({ sessions, onLog }) => {
  const today = new Date().toDateString();
  const loggedToday = sessions.some(s=>new Date(s.date).toDateString()===today);
  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
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

const HomeScreen = ({ sessions, custom, allStrains, profile, unlockedMilestones, xp, rank, streak, avgRating, strainNames, earnedMilestones, personalRecords, recentStrains, qualifiedStrains, onLog, onTabChange, onQuickLog }) => {
  // If no sessions, show empty state
  if (sessions.length===0) {
    return (
      <div style={{ position:"relative", minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
        <StrainGallery/>
        <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"0 20px" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:8 }}>
            <LogoMark size={80}/>
            <div style={{ fontSize:32, fontWeight:800, color:C.accent, marginTop:14, letterSpacing:"-0.5px" }}>Terp Journal</div>
            <div style={{ width:40, height:2, background:C.accent, borderRadius:1, marginTop:6, opacity:0.4 }}/>
          </div>
          <div style={{ fontSize:15, color:C.muted, lineHeight:1.6, marginBottom:8 }}>Track your cannabis. Discover what works.</div>
          <div style={{ fontSize:13, color:rank.color, marginBottom:28 }}>{rank.icon} You start as a {rank.title}</div>
          <button onClick={onLog} style={{
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
    );
  }

  return (
    <div>
      {/* XP + rank */}
      <Card style={{ marginBottom:14 }}>
        <XPBar xp={xp}/>
      </Card>

      {/* Daily ritual */}
      <DailyRitual sessions={sessions} onLog={onLog}/>

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
                <button key={name} onClick={()=>onQuickLog(name)}
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
                <div key={m.id} style={{ fontSize:20, opacity:earned?1:0.2 }}
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
        <button onClick={()=>onTabChange('passport')} style={{
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
                  width:`${Math.min(100, sessions.filter(s=>s.strain===sessions[0]?.strain).length/2*100)}%` }}/>
              </div>
              <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>
                {sessions.filter(s=>s.strain===sessions[0]?.strain).length}/2 sessions with "{sessions[0]?.strain}"
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HomeScreen;
