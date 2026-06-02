import { useState } from 'react';
import { C } from '../constants/colors';
import { QUIZ } from '../constants/quiz';
import { STRAIN_DB } from '../constants/data';
import { EFFECTS } from '../constants/enums';
import { typeColor, typeBg } from '../constants/ranks';
import LogoMark from '../components/LogoMark';
import Sound from '../lib/sound';

// ── Sample data for preview cards ──────────────────────────────────────
const SAMPLE_STRAIN = STRAIN_DB[0]; // Blue Dream
const SAMPLE_REVIEW = {
  user: "CloudChaser_42",
  rating: 4,
  review: "Blue Dream is my go-to for creative work. Smooth smoke, no anxiety creep, and the energy lasts a solid 2 hours before settling into a warm, functional calm. Perfect for afternoon sessions when I still need to be productive.",
  method: "Dry vape at 185°C"
};

// ── Value prop steps ────────────────────────────────────────────────────
const VALUE_STEPS = [
  {
    icon: "📋",
    title: "Track Every Session",
    body: "Log strain, method, dose, effects, and mood. Build a real picture of what works — not guesswork.",
  },
  {
    icon: "🛂",
    title: "Your Strain Passport",
    body: "Every strain you log gets its own passport card. Ratings, effects breakdown, community reviews — all in one place.",
  },
  {
    icon: "🤖",
    title: "AI That Knows You",
    body: "After 2+ sessions with a strain, Resin writes you a personal review based on your data. Not generic — actually yours.",
  },
];

const PHASES = {
  WALKTHROUGH: 'walkthrough',
  PREVIEW_PASSPORT: 'previewPassport',
  PREVIEW_REVIEW: 'previewReview',
  QUIZ: 'quiz',
};

const OnboardingFlow = ({ quizAnswers, setQuizAnswers, quizStep, setQuizStep, setProfile, setCustom }) => {
  const [phase, setPhase] = useState(PHASES.WALKTHROUGH);
  const [walkStep, setWalkStep] = useState(0);

  const handleSkipToEnd = () => {
    Sound.play("save");
    setProfile({ completedAt: new Date().toISOString() });
  };

  const handleWalkNext = () => {
    Sound.play("select");
    if (walkStep < VALUE_STEPS.length - 1) {
      setWalkStep(s => s + 1);
    } else {
      setPhase(PHASES.PREVIEW_PASSPORT);
    }
  };

  const handleQuizFinish = () => {
    Sound.play("save");
    const p = { ...quizAnswers, completedAt: new Date().toISOString() };
    setProfile(p);
    // Pre-populate past strains
    if (quizAnswers.pastStrains) {
      const names = quizAnswers.pastStrains.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
      names.forEach(name => {
        const found = STRAIN_DB.find(s => s.name.toLowerCase().includes(name.toLowerCase()));
        if (found) {
          setCustom(prev => {
            if (prev.find(c => c.name.toLowerCase() === found.name.toLowerCase())) return prev;
            return [...prev, found];
          });
        }
      });
    }
  };

  const handleQuizAnswer = (opt) => {
    Sound.play("select");
    const current = QUIZ[quizStep];
    const upd = { ...quizAnswers, [current.id]: opt };
    setQuizAnswers(upd);
    if (quizStep < QUIZ.length - 1) {
      setQuizStep(s => s + 1);
    } else {
      const p = { ...upd, completedAt: new Date().toISOString() };
      setProfile(p);
    }
  };

  // ── Walkthrough phase ──────────────────────────────────────────────────
  if (phase === PHASES.WALKTHROUGH) {
    const step = VALUE_STEPS[walkStep];
    return (
      <div style={{ minHeight: "100vh", maxWidth: 500, margin: "0 auto", background: C.bg, color: C.text, fontFamily: "system-ui,sans-serif", padding: 24, display: "flex", flexDirection: "column" }}>
        {/* Skip */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button onClick={handleSkipToEnd}
            style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12 }}>
            Skip
          </button>
        </div>

        {/* Hero */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", paddingBottom: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 20, animation: "bounce 0.6s ease" }}>{step.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.accent, marginBottom: 12 }}>{step.title}</div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 320 }}>{step.body}</div>
        </div>

        {/* Dots + Next */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            {VALUE_STEPS.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: i === walkStep ? C.accent : C.faint, transition: "background 0.3s" }} />
            ))}
          </div>
          <button onClick={handleWalkNext}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg,#c2410c,${C.accent})`, color: "#080502", fontSize: 15, fontWeight: 700 }}>
            {walkStep < VALUE_STEPS.length - 1 ? "Next →" : "See it in action →"}
          </button>
        </div>

        <style>{`*{box-sizing:border-box} @keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>
      </div>
    );
  }

  // ── Preview Passport phase ──────────────────────────────────────────────
  if (phase === PHASES.PREVIEW_PASSPORT) {
    return (
      <div style={{ minHeight: "100vh", maxWidth: 500, margin: "0 auto", background: C.bg, color: C.text, fontFamily: "system-ui,sans-serif", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={handleSkipToEnd} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12 }}>
            Skip
          </button>
          <div style={{ fontSize: 11, color: C.muted }}>Preview</div>
          <div style={{ width: 50 }} />
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4, textAlign: "center" }}>This is a Strain Passport card</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 20, textAlign: "center" }}>Every strain you log gets one of these</div>

        {/* Sample passport card */}
        <div style={{
          background: `linear-gradient(135deg,${C.card},${typeBg(SAMPLE_STRAIN.type)})`,
          border: `2px solid ${typeColor(SAMPLE_STRAIN.type)}44`, borderRadius: 20, padding: 20, marginBottom: 16,
          boxShadow: `0 4px 20px ${typeColor(SAMPLE_STRAIN.type)}15`
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{SAMPLE_STRAIN.name}</span>
                <span style={{ fontSize: 10, padding: "2px 8px", background: typeBg(SAMPLE_STRAIN.type), border: `1px solid ${typeColor(SAMPLE_STRAIN.type)}`, borderRadius: 10, color: typeColor(SAMPLE_STRAIN.type) }}>{SAMPLE_STRAIN.type}</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{SAMPLE_STRAIN.description}</div>
              <div style={{ display: "flex", gap: 10, fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: C.amber }}>THC {SAMPLE_STRAIN.thc}%</span>
                <span style={{ color: C.accent, fontWeight: 700 }}>8.3/10 avg</span>
                <span style={{ color: C.muted }}>7 sessions</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {SAMPLE_STRAIN.effects?.slice(0, 3).map(e => (
                  <span key={e} style={{ fontSize: 10, padding: "2px 8px", background: C.accentDim, borderRadius: 10, color: C.accent }}>{e}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>YOUR EXPERIENCE MAP</div>
            <div style={{ display: "flex", gap: 4 }}>
              {["⭐","👅","⚡","🌫️","🧠","💰"].map((icon, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 12 }}>{icon}</div>
                  <div style={{ height: 30, background: C.faint, borderRadius: 3, position: "relative", margin: "4px 0" }}>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${[85, 75, 90, 70, 80, 65][i]}%`, background: ["#f59e0b","#fb923c","#a78bfa","#67e8f9","#6ee7b7","#fde68a"][i], borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 9, color: C.muted }}>{[8.5, 7.5, 9, 7, 8, 6.5][i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => setPhase(PHASES.PREVIEW_REVIEW)}
          style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg,#c2410c,${C.accent})`, color: "#080502", fontSize: 15, fontWeight: 700 }}>
          Next: AI Reviews →
        </button>
      </div>
    );
  }

  // ── Preview Review phase ────────────────────────────────────────────────
  if (phase === PHASES.PREVIEW_REVIEW) {
    return (
      <div style={{ minHeight: "100vh", maxWidth: 500, margin: "0 auto", background: C.bg, color: C.text, fontFamily: "system-ui,sans-serif", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={handleSkipToEnd} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12 }}>
            Skip
          </button>
          <div style={{ fontSize: 11, color: C.muted }}>Preview</div>
          <div style={{ width: 50 }} />
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4, textAlign: "center" }}>AI-Powered Personal Reviews</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 20, textAlign: "center" }}>After 2+ sessions, Resin writes a review in your voice</div>

        {/* Sample AI review */}
        <div style={{ background: `linear-gradient(135deg,${C.card},#160900)`, borderRadius: 20, padding: 20, marginBottom: 16, border: `1px solid ${C.accent}22` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.accent }}>🤖 Your {SAMPLE_STRAIN.name} Review</span>
            <span style={{ fontSize: 11, color: C.amber }}>⭐⭐⭐⭐</span>
          </div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginBottom: 6 }}>
            "Blue Dream hits exactly where I need it — clear-headed enough to work but relaxed enough to enjoy it. After 7 sessions, it's consistently an 8.3/10 for me. Great taste through the vape, no harshness."
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>Based on 7 sessions · auto-generated</div>
        </div>

        {/* Sample community review */}
        <div style={{ background: "#160900", borderRadius: 16, padding: 16, marginBottom: 20, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.purple }}>💬 @{SAMPLE_REVIEW.user}</span>
            <span style={{ fontSize: 11, color: C.amber }}>{"⭐".repeat(SAMPLE_REVIEW.rating)}</span>
          </div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5, marginBottom: 4 }}>{SAMPLE_REVIEW.review}</div>
          <div style={{ fontSize: 11, color: C.muted }}>via {SAMPLE_REVIEW.method}</div>
        </div>

        <button onClick={() => { Sound.play("select"); setPhase(PHASES.QUIZ); }}
          style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg,#c2410c,${C.accent})`, color: "#080502", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
          Quick setup →
        </button>
        <button onClick={handleSkipToEnd}
          style={{ width: "100%", padding: "10px", borderRadius: 12, border: `1px solid ${C.border}`,
            background: "transparent", color: C.muted, cursor: "pointer", fontSize: 13 }}>
          Skip — I'll explore on my own
        </button>
      </div>
    );
  }

  // ── Quiz phase (existing) ────────────────────────────────────────────────
  const current = QUIZ[quizStep];
  const isLast = quizStep === QUIZ.length - 1;

  return (
    <div style={{ minHeight: "100vh", maxWidth: 500, margin: "0 auto", background: C.bg, color: C.text, fontFamily: "system-ui,sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <LogoMark size={40} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>Quick Setup</div>
            <div style={{ fontSize: 12, color: C.muted }}>Takes 30 seconds — helps us personalise</div>
          </div>
        </div>
        <div style={{ height: 4, background: C.faint, borderRadius: 2, marginBottom: 28 }}>
          <div style={{ height: "100%", borderRadius: 2, background: C.accent, width: `${((quizStep + 1) / QUIZ.length) * 100}%`, transition: "width 0.3s" }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>{current.q}</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Question {quizStep + 1} of {QUIZ.length}</div>
        {current.type === "text" ? (
          <div>
            <input placeholder={current.placeholder} value={quizAnswers[current.id] || ""}
              onChange={e => setQuizAnswers(a => ({ ...a, [current.id]: e.target.value }))}
              style={{ width: "100%", padding: "14px", background: C.card, border: `1.5px solid ${C.border}`,
                borderRadius: 12, color: C.text, fontSize: 14, boxSizing: "border-box", marginBottom: 14 }} />
            <button onClick={handleQuizFinish}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg,#c2410c,${C.accent})`, color: "#080502", fontSize: 15, fontWeight: 700 }}>
              Get Started →
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {current.opts.map(opt => (
              <button key={opt} onClick={() => handleQuizAnswer(opt)}
                style={{ padding: "14px 18px", borderRadius: 12, border: `1.5px solid ${C.border}`,
                  background: C.card, color: C.text, fontSize: 14, cursor: "pointer", textAlign: "left",
                  fontFamily: "system-ui" }}>
                {opt}
              </button>
            ))}
          </div>
        )}
        <button onClick={handleSkipToEnd}
          style={{ marginTop: 16, width: "100%", padding: "8px", borderRadius: 8, border: "none",
            background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12 }}>
          Skip setup
        </button>
      </div>
      <style>{`*{box-sizing:border-box} input:focus{outline:2px solid #a3e63540!important}`}</style>
    </div>
  );
};

export default OnboardingFlow;
