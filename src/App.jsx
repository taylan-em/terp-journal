import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import { C } from "./constants/colors";
import { STRAIN_DB } from "./constants/data";
import { METHODS, MOODS, EFFECTS } from "./constants/enums";
import { MILESTONES, checkMilestones } from "./constants/milestones";
import { getXP, getRank, mkForm, checkStorageLimit, calcStreak } from "./lib/utils";
import Sound from "./lib/sound";
import LogoMark from "./components/LogoMark";
import NavBar from "./components/NavBar";
import HomeScreen from "./screens/HomeScreen";
import LogScreen from "./screens/LogScreen";
import SessionsScreen from "./screens/SessionsScreen";
import PassportScreen from "./screens/PassportScreen";
import MoreScreen from "./screens/MoreScreen";
import CommunityScreen from "./screens/CommunityScreen";
import OnboardingFlow from "./onboarding/OnboardingFlow";
import MilestoneToast from "./overlays/MilestoneToast";
import LevelUpOverlay from "./overlays/LevelUpOverlay";
import StrainPassportModal from "./overlays/StrainPassportModal";
import EditSessionModal from "./overlays/EditSessionModal";
import PhotoTips from "./overlays/PhotoTips";
import SavedFlash from "./overlays/SavedFlash";
import ErrorBoundary from "./components/ErrorBoundary";
import UnlockPremiumModal from "./overlays/UnlockPremiumModal";
import FeedbackModal from "./overlays/FeedbackModal";
import { isUnlocked } from "./lib/license";
import { useInstallPrompt, InstallBanner, OfflineIndicator } from "./lib/pwa.jsx";
import { CameraCapture, StrainPhotoGallery, addStrainPhoto } from "./lib/photos.jsx";
let _supabaseConfigured = null;
function checkSupabase() {
  if (_supabaseConfigured !== null) return _supabaseConfigured;
  const url = import.meta.env.VITE_SUPABASE_URL || "";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  _supabaseConfigured = url && !url.includes("YOUR_PROJECT") && key && key !== "your-anon-key";
  return _supabaseConfigured;
}

export default function App() {
  try {
    return <AppInner />;
  } catch (e) {
    console.error("App crash:", e);
    return <div>App crash</div>;
  }
}

function AppInner() {
  // ── Persisted state ────────────────────────────────────────────────────
  const [tab,        setTab]        = useState("home");
  const [sessions,   setSessions]   = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_s")||"[]")}catch{return []} });
  const [custom,     setCustom]     = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_c")||"[]")}catch{return []} });
  const [profile,    setProfile]    = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_p")||"null")}catch{return null} });
  const [myReviews, setMyReviews]   = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_reviews")||"{}")}catch{return {}} });
  const [unlockedMilestones, setUnlockedMilestones] = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_m")||"[]")}catch{return []} });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizStep, setQuizStep]     = useState(0);

  // ── UI state ───────────────────────────────────────────────────────────
  const [step,        setStep]        = useState(0);
  const [form,        setForm]        = useState(mkForm);
  const [saved,       setSaved]       = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [newMilestone, setNewMilestone] = useState(null);
  const [levelUpRank, setLevelUpRank]   = useState(null);
  const [passportStrain, setPassportStrain] = useState(null);
  const [strainAnecdotes, setStrainAnecdotes] = useState({});
  const [loadingAnecdotes, setLoadingAnecdotes] = useState(false);
  const [anecdoteError, setAnecdoteError] = useState(false);
  const [showPhotoTips, setShowPhotoTips] = useState(false);
  const [generatingReview, setGeneratingReview] = useState(null);
  
  // ── Stash + T-break state ──
  const [stash, setStash] = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_stash")||"[]")}catch{return []} });
  const [breakActive, setBreakActive] = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_break_active")||"false")}catch{return false} });
  const [breakStart, setBreakStart] = useState(()=>{ try{return JSON.parse(localStorage.getItem("rs_break_start")||"null")}catch{return null} });
  const [premium, setPremium] = useState(isUnlocked);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // ── Auth ──
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSocialReview, setShowSocialReview] = useState(false);
  const [socialReviewData, setSocialReviewData] = useState(null);
  const [showCamera, setShowCamera] = useState(null); // strain name when open
  const [showGallery, setShowGallery] = useState(null); // strain name when open

  const prevXP = useRef(0);

  // ── Persist ────────────────────────────────────────────────────────────
  useEffect(()=>{ localStorage.setItem("rs_s", JSON.stringify(sessions)); },[sessions]);
  useEffect(()=>{ localStorage.setItem("rs_c", JSON.stringify(custom));   },[custom]);
  useEffect(()=>{ localStorage.setItem("rs_p", JSON.stringify(profile));  },[profile]);
  useEffect(()=>{ localStorage.setItem("rs_m", JSON.stringify(unlockedMilestones)); },[unlockedMilestones]);
  useEffect(()=>{ localStorage.setItem("rs_reviews", JSON.stringify(myReviews)); },[myReviews]);
  useEffect(()=>{ localStorage.setItem("rs_stash", JSON.stringify(stash)); },[stash]);
  useEffect(()=>{ localStorage.setItem("rs_break_active", JSON.stringify(breakActive)); },[breakActive]);
  useEffect(()=>{ localStorage.setItem("rs_break_start", JSON.stringify(breakStart)); },[breakStart]);

  // ── Derived data ───────────────────────────────────────────────────────
  const allStrains = useMemo(()=>[...STRAIN_DB, ...custom.filter(c=>!STRAIN_DB.find(d=>d.name.toLowerCase()===c.name.toLowerCase()))], [custom]);
  const xp = useMemo(()=>getXP(sessions), [sessions]);
  const rank = useMemo(()=>getRank(xp), [xp]);
  const streak = useMemo(()=>calcStreak(sessions), [sessions]);
  const avgRating = sessions.length ? (sessions.reduce((a,s)=>a+(s.ratings?.overall||0),0)/sessions.length).toFixed(1) : "—";
  const strainNames = useMemo(()=>[...new Set(sessions.map(s=>s.strain))].filter(Boolean), [sessions]);
  const qualifiedStrains = useMemo(()=>strainNames.filter(n=>sessions.filter(s=>s.strain===n).length>=2), [sessions, strainNames]);
  const recentStrains = useMemo(()=>[...new Set(sessions.slice(0,5).map(s=>s.strain))].filter(Boolean).slice(0,3), [sessions]);
  const earnedMilestones = useMemo(()=>checkMilestones(sessions, {streak}), [sessions, streak]);

  // ── Milestone / level-up checking ──────────────────────────────────────
  useEffect(()=>{
    const newOnes = earnedMilestones.filter(m=>!unlockedMilestones.includes(m.id));
    if (newOnes.length > 0) {
      setUnlockedMilestones(prev=>[...prev, ...newOnes.map(m=>m.id)]);
      setNewMilestone(newOnes[0]);
    }
    const curRank = getRank(xp);
    const oldRank = getRank(prevXP.current);
    if (curRank.title !== oldRank.title && prevXP.current > 0) setLevelUpRank(curRank);
    prevXP.current = xp;
  }, [sessions]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const saveSession = useCallback(() => {
    Sound.play("save");
    const newSession = { ...form, id: Date.now() };
    setSessions(p=>[newSession, ...p]);
    setSaved(true);
    if (checkStorageLimit()) {
      setTimeout(()=>{ alert("⚠️ Storage is getting full. Go to More → Export to back up."); }, 2000);
    }
    setTimeout(()=>{ setSaved(false); setForm(mkForm()); setStep(0); setTab("home"); }, 1800);
  }, [form]);

  const saveEdit = useCallback((updated) => {
    setSessions(p=>p.map(s=>s.id===updated.id ? updated : s));
    setEditingSession(null);
  }, []);

  const deleteSession = useCallback((id) => {
    setSessions(p=>p.filter(x=>x.id!==id));
  }, []);

  const undoDeleteSession = useCallback((session) => {
    // Re-insert the session at its original position (by date)
    setSessions(p => {
      const restored = [...p, session];
      restored.sort((a, b) => new Date(b.date) - new Date(a.date));
      return restored;
    });
  }, []);

  const loadAnecdotes = useCallback(async (strainName) => {
    if (strainAnecdotes[strainName]) return;
    setLoadingAnecdotes(true);
    setAnecdoteError(false);
    try {
      const r = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:800,
          system:"You are a cannabis strain expert. Generate 3 authentic-sounding user anecdotes/reviews for the strain given. Return ONLY a raw JSON array of 3 objects, no markdown. Each object: { \"user\": \"anonymous username like DesertFox42\", \"rating\": number 1-5, \"review\": \"2-3 sentence personal experience written in first person, conversational, specific about effects and context\", \"method\": \"how they consumed it\" }. Make them feel real and varied — different experiences, methods, outcomes.",
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
  }, [strainAnecdotes]);

  const generateMyReview = useCallback(async (strainName) => {
    if (!premium) { setShowUnlock(true); return; }
    const ss = sessions.filter(s=>s.strain===strainName);
    if (ss.length < 2) { alert("Log at least 2 sessions with this strain to generate a review."); return; }
    setGeneratingReview(strainName);
    const avgOverall = (ss.reduce((a,s)=>a+(s.ratings?.overall||0),0)/ss.length).toFixed(1);
    const avgTaste   = (ss.reduce((a,s)=>a+(s.ratings?.taste||0),0)/ss.length).toFixed(1);
    const topEffects = EFFECTS.map(e=>({e,pct:Math.round(ss.filter(s=>s.effects?.includes(e)).length/ss.length*100)}))
      .filter(x=>x.pct>0).sort((a,b)=>b.pct-a.pct).slice(0,4).map(x=>x.e).join(", ");
    const topFlavors = [...new Set(ss.flatMap(s=>s.flavors||[]))].slice(0,3).join(", ");
    const methods    = [...new Set(ss.map(s=>METHODS.find(m=>m.id===s.method)?.label).filter(Boolean))].join(", ");
    const notes      = ss.filter(s=>s.notes?.length>10).map(s=>s.notes).join(" | ").slice(0,300);
    try {
      const r = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-haiku-4-5-20251001", max_tokens:300,
          system:"You write short, honest, personal cannabis strain reviews in first person. 2-3 sentences max. Conversational, specific, no fluff. Based on real session data provided.",
          messages:[{ role:"user", content:`Write a personal review for ${strainName} based on my data: ${ss.length} sessions, ${avgOverall}/10 avg rating, ${avgTaste}/10 taste, main effects: ${topEffects}, flavours: ${topFlavors}, methods used: ${methods}. My notes: ${notes||"none"}. Write as me, first person, honest and specific.` }]
        })
      });
      const d = await r.json();
      const txt = d.content?.map(b=>b.text||"").join("").trim();
      if (txt) {
        setMyReviews(prev=>({...prev,[strainName]:{text:txt,date:new Date().toISOString(),sessions:ss.length,rating:avgOverall}}));
        Sound.play("unlock");
      }
    } catch(e) { alert("Failed to generate review."); }
    setGeneratingReview(null);
  }, [sessions]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify({sessions,custom,profile,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`resin-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
  }, [sessions, custom, profile]);

  const exportCSV = useCallback(() => {
    const headers=["Date","Strain","Method","Amount","Overall","Taste","Potency","Smooth","Effect","Value","Intensity","MoodBefore","MoodAfter","Effects","Flavors","Brand","Notes"];
    const rows=sessions.map(s=>[s.date,s.strain,s.method,s.amount,s.ratings?.overall||"",s.ratings?.taste||"",s.ratings?.potency||"",s.ratings?.smoothness||"",s.ratings?.effect||"",s.ratings?.value||"",s.intensity||"",s.moodBefore,s.moodAfter,(s.effects||[]).join("|"),(s.flavors||[]).join("|"),s.brand||"",(s.notes||"").replace(/,/g," ")]);
    const csv=[headers,...rows].map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`resin-export-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  // ── Stash handlers ──
  const addStashItem = useCallback((item) => {
    setStash(p => [...p, item]);
  }, []);

  const editStashItem = useCallback((item) => {
    setStash(p => p.map(i => i.id === item.id ? item : i));
  }, []);

  const deleteStashItem = useCallback((id) => {
    setStash(p => p.filter(i => i.id !== id));
  }, []);

  const startBreak = useCallback(() => {
    Sound.play("select");
    setBreakActive(true);
    setBreakStart(Date.now());
  }, []);

  const endBreak = useCallback(() => {
    Sound.play("tap");
    setBreakActive(false);
    setBreakStart(null);
  }, []);

  const importJSON = useCallback((e) => {
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{ try{ const d=JSON.parse(ev.target.result); if(d.sessions) setSessions(d.sessions); if(d.custom) setCustom(d.custom); if(d.profile) setProfile(d.profile); if(d.stash) setStash(d.stash); if(d.breakActive!==undefined) setBreakActive(d.breakActive); if(d.breakStart!==undefined) setBreakStart(d.breakStart); if(d.myReviews) setMyReviews(d.myReviews); alert("Restored!"); }catch{ alert("Invalid file."); } };
    reader.readAsText(file);
  }, []);

  const viewPassport = useCallback((strainName) => {
    Sound.play("select");
    setPassportStrain(strainName);
    loadAnecdotes(strainName);
  }, [loadAnecdotes]);

  const openSocialReview = useCallback((strainName) => {
    const strain = allStrains.find(s => s.name === strainName);
    const _sessions = sessions.filter(s => s.strain === strainName);
    if (!strain || _sessions.length === 0) return;
    setSocialReviewData({ strain, sessions: _sessions });
    setShowSocialReview(true);
  }, [allStrains, sessions]);

  const openShareStats = useCallback(async (xpVal, rankVal, totalSess, sessList) => {
    const { renderStatsCard, shareImage } = await import("./lib/sharecard");
    const topStrain = sessList?.reduce((a, s) => {
      a[s.strain] = (a[s.strain] || 0) + 1;
      return a;
    }, {});
    const top = Object.entries(topStrain || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    const dataUrl = await renderStatsCard(xpVal, rankVal, totalSess, top, streak, stash?.reduce((a, i) => a + (i?.grams || 0), 0) || 0);
    shareImage(dataUrl, "resin-stats");
  }, [streak, stash]);

  // ── Onboarding ─────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div style={{ background:C.bg, minHeight:"100vh", color:C.text }}>
        <OnboardingFlow
          quizAnswers={quizAnswers}
          setQuizAnswers={setQuizAnswers}
          quizStep={quizStep}
          setQuizStep={setQuizStep}
          setProfile={(p)=>{ setProfile(p); setQuizStep(0); }}
          setCustom={setCustom}
        />
      </div>
    );
  }

  // ── Auth gate (after onboarding, before main app) ──────────────────────
  // On first launch after onboarding, offer sign-in. Can be skipped.
  const authSkipped = useRef(false);

  useEffect(() => {
    if (!profile || authChecked || authSkipped.current || !checkSupabase()) {
      if (!checkSupabase()) setAuthChecked(true); // No keys = skip auth
      return;
    }
    import("./lib/supabase").then(({ getSession }) => {
      getSession().then(({ data }) => {
        if (data?.session?.user) setUser(data.session.user);
        setShowAuth(!data?.session?.user);
        setAuthChecked(true);
      }).catch(() => { setAuthChecked(true); setShowAuth(true); });
    }).catch(() => { setAuthChecked(true); });
  }, [profile, authChecked]);

  if (profile && !authChecked && checkSupabase()) {
    return <div style={{ minHeight:"100vh", maxWidth:500, margin:"0 auto", background:C.bg, color:C.text, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}><div>Loading...</div></div>;
  }

  if (profile && showAuth && authChecked) {
    return (
      <AuthScreen
        onAuthenticated={(u) => { setUser(u); setShowAuth(false); }}
        onSkip={() => { authSkipped.current = true; setShowAuth(false); }}
      />
    );
  }

  // ── PWA hooks ──────────────────────────────────────────────────────────
  const { canInstall, install: doInstall } = useInstallPrompt();
  const [installDismissed, setInstallDismissed] = useState(false);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", maxWidth:500, margin:"0 auto", background:C.bg, color:C.text, fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <OfflineIndicator />
      {canInstall && !installDismissed && (
        <InstallBanner onInstall={doInstall} onDismiss={() => setInstallDismissed(true)} />
      )}
      
      {/* Header */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:C.bg+"f5",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`,
        padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <LogoMark size={26}/>
          <div style={{ fontSize:10, color:rank.color, fontWeight:600 }}>{rank.icon} {rank.title}</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {streak>0&&<div style={{ background:"#f59e0b22", border:`1px solid ${C.amber}44`, borderRadius:20, padding:"4px 10px", fontSize:12, color:C.amber }}>🔥{streak}d</div>}
          <div style={{ background:C.accentDim, border:`1px solid ${C.accent}44`, borderRadius:20, padding:"4px 10px", fontSize:12, color:C.accent }}>{xp}xp</div>
        </div>
      </header>

      {/* Nav */}
      <NavBar tab={tab} setTab={setTab} onLog={()=>setStep(0)} />

      <div style={{ position:"relative", zIndex:1, padding:"16px 14px 100px" }}>
        {renderScreen()}
      </div>

      {/* Overlays */}
      {newMilestone && <MilestoneToast milestone={newMilestone} onClose={()=>setNewMilestone(null)} />}
      {levelUpRank && <LevelUpOverlay rank={levelUpRank} onClose={()=>setLevelUpRank(null)} />}
      {saved && <SavedFlash />}
      {passportStrain && (
        <StrainPassportModal
          strain={passportStrain} sessions={sessions} allStrains={allStrains}
          strainAnecdotes={strainAnecdotes} loadingAnecdotes={loadingAnecdotes}
          anecdoteError={anecdoteError} premium={premium}
          myReviews={myReviews} generatingReview={generatingReview}
          onGenerateReview={generateMyReview}
          onShareReview={openSocialReview}
          onLoadAnecdotes={loadAnecdotes}
          onClose={()=>setPassportStrain(null)}
          onOpenCamera={(name) => setShowCamera(name)}
          onOpenGallery={(name) => setShowGallery(name)} />
      )}
      {editingSession && (
        <EditSessionModal
          editingSession={editingSession} setEditingSession={setEditingSession}
          onSave={saveEdit} onClose={()=>setEditingSession(null)}
          allStrains={allStrains} />
      )}
      {showPhotoTips && <PhotoTips onClose={()=>setShowPhotoTips(false)} />}
      {showCamera && (
        <CameraCapture
          onCapture={(dataUrl) => { addStrainPhoto(showCamera, dataUrl); }}
          onClose={() => setShowCamera(null)} />
      )}
      {showGallery && (
        <StrainPhotoGallery
          strainName={showGallery}
          onClose={() => setShowGallery(null)} />
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

  function renderScreen() {
    switch (tab) {
      case "home":
        return (
          <HomeScreen
            sessions={sessions} custom={custom} allStrains={allStrains}
            profile={profile} unlockedMilestones={unlockedMilestones}
            xp={xp} rank={rank} streak={streak} avgRating={avgRating}
            strainNames={strainNames} earnedMilestones={earnedMilestones}
            personalRecords={earnedMilestones.length ? [] : []}
            recentStrains={recentStrains} qualifiedStrains={qualifiedStrains}
            onLog={()=>{ Sound.play("select"); setTab("log"); }}
            onTabChange={setTab}
            onQuickLog={(name)=>{ Sound.play("select"); setForm(f=>({...f,strain:name})); setStep(1); setTab("log"); }} />
        );
      case "log":
        return (
          <ErrorBoundary><LogScreen
            sessions={sessions} custom={custom} setCustom={setCustom}
            allStrains={allStrains} profile={profile}
            step={step} setStep={setStep}
            form={form} setForm={setForm}
            onSave={saveSession}
            setShowPhotoTips={setShowPhotoTips}
            setPassportStrain={setPassportStrain}
            loadAnecdotes={loadAnecdotes} /></ErrorBoundary>
        );
      case "sessions":
        return (
          <SessionsScreen
            sessions={sessions} allStrains={allStrains}
            onEdit={setEditingSession}
            onPassport={viewPassport}
            onDelete={deleteSession}
            onUndoDelete={undoDeleteSession} />
        );
      case "passport":
        return (
          <PassportScreen
            sessions={sessions} allStrains={allStrains}
            strainNames={strainNames}
            onPassportStrain={viewPassport}
            onLogStrain={(name)=>{ Sound.play("select"); setForm(f=>({...f,strain:name})); setStep(1); setTab("log"); }} />
        );
      case "community":
        return (
          <CommunityScreen
            onViewStrain={viewPassport} />
        );
      case "more":
        return (
          <MoreScreen
            xp={xp} rank={rank} profile={profile}
            unlockedMilestones={unlockedMilestones}
            earnedMilestones={earnedMilestones}
            onExportJSON={exportJSON}
            onExportCSV={exportCSV}
            onImportJSON={importJSON}
            onRedoQuiz={()=>{ localStorage.removeItem("rs_p"); setProfile(null); setQuizStep(0); setQuizAnswers({}); }}
            stash={stash}
            onAddStash={addStashItem}
            onEditStash={editStashItem}
            onDeleteStash={deleteStashItem}
            sessions={sessions}
            breakActive={breakActive}
            breakStart={breakStart}
            onStartBreak={startBreak}
            onEndBreak={endBreak}
            premium={premium}
            onUnlockClick={()=>setShowUnlock(true)}
            onFeedbackClick={()=>setShowFeedback(true)}
            onShareStats={openShareStats} />
        );
      default:
        return null;
    }
  }
  // ── Overlays ──
  if (showUnlock) {
    return (
      <>
        <div>{renderScreen()}</div>
        <UnlockPremiumModal
          onClose={()=>setShowUnlock(false)}
          onUnlocked={()=>{ setPremium(true); setShowUnlock(false); }} />
      </>
    );
  }
  if (showFeedback) {
    return (
      <>
        <div>{renderScreen()}</div>
        <FeedbackModal
          onClose={()=>setShowFeedback(false)}
          sessions={sessions}
          profile={profile} />
      </>
    );
  }
  if (showSocialReview && socialReviewData) {
    return (
      <>
        <div>{renderScreen()}</div>
        <SocialReviewModal
          strain={socialReviewData.strain}
          reviewData={socialReviewData}
          onClose={()=>setShowSocialReview(false)} />
      </>
    );
  }
}

