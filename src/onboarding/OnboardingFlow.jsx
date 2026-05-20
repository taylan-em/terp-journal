import { useState } from 'react';
import { C } from '../constants/colors';
import { QUIZ } from '../constants/quiz';
import { STRAIN_DB } from '../constants/data';
import LogoMark from '../components/LogoMark';
import Sound from '../lib/sound';

const OnboardingFlow = ({ quizAnswers, setQuizAnswers, quizStep, setQuizStep, setProfile, setCustom }) => {
  const current = QUIZ[quizStep];
  const isLast  = quizStep === QUIZ.length - 1;

  const handleFinish = () => {
    Sound.play("save");
    const p = {...quizAnswers, completedAt: new Date().toISOString()};
    setProfile(p);
    // Pre-populate past strains
    if (quizAnswers.pastStrains) {
      const names = quizAnswers.pastStrains.split(/[,;]+/).map(s=>s.trim()).filter(Boolean);
      names.forEach(name => {
        const found = STRAIN_DB.find(s=>s.name.toLowerCase().includes(name.toLowerCase()));
        if (found) {
          setCustom(prev => {
            if (prev.find(c => c.name.toLowerCase() === found.name.toLowerCase())) return prev;
            return [...prev, found];
          });
        }
      });
    }
  };

  return (
    <div style={{ minHeight:"100vh", maxWidth:500, margin:"0 auto", background:C.bg, color:C.text, fontFamily:"system-ui,sans-serif", padding:24 }}>
      <div style={{ maxWidth:440, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <LogoMark size={40}/>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:C.accent }}>Welcome</div>
            <div style={{ fontSize:12, color:C.muted }}>Quick setup — takes 30 seconds</div>
          </div>
        </div>
        <div style={{ height:4, background:C.faint, borderRadius:2, marginBottom:28 }}>
          <div style={{ height:"100%", borderRadius:2, background:C.accent, width:`${((quizStep+1)/QUIZ.length)*100}%`, transition:"width 0.3s" }}/>
        </div>
        <div style={{ fontSize:18, fontWeight:600, color:C.text, marginBottom:6, lineHeight:1.4 }}>{current.q}</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:20 }}>Question {quizStep+1} of {QUIZ.length}</div>
        {current.type==="text" ? (
          <div>
            <input placeholder={current.placeholder} value={quizAnswers[current.id]||""}
              onChange={e=>setQuizAnswers(a=>({...a,[current.id]:e.target.value}))}
              style={{ width:"100%", padding:"14px", background:C.card, border:`1.5px solid ${C.border}`,
                borderRadius:12, color:C.text, fontSize:14, boxSizing:"border-box", marginBottom:14 }}/>
            <button onClick={handleFinish}
              style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", cursor:"pointer",
                background:`linear-gradient(135deg,#c2410c,${C.accent})`, color:"#080502", fontSize:15, fontWeight:700 }}>
              Get Started →
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {current.opts.map(opt=>(
              <button key={opt} onClick={()=>{
                Sound.play("select");
                const upd={...quizAnswers,[current.id]:opt};
                setQuizAnswers(upd);
                if(!isLast) setQuizStep(s=>s+1);
                else {
                  const p = {...upd,completedAt:new Date().toISOString()};
                  setProfile(p);
                }
              }}
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
};

export default OnboardingFlow;
