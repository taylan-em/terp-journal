import { C } from "../constants/colors";
import { MILESTONES } from "../constants/milestones";
import Card from "../components/Card";
import XPBar from "../components/XPBar";
import LogoMark from "../components/LogoMark";
import Sound from "../lib/sound";

export default function MoreScreen({ xp, rank, profile, unlockedMilestones, earnedMilestones,
  onExportJSON, onExportCSV, onImportJSON, onRedoQuiz }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Settings & Data</div>

      {/* Rank card */}
      <Card style={{ marginBottom: 14, background: `linear-gradient(135deg,${C.card},#0d2a10)`, border: `1px solid ${rank.color}33` }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 36 }}>{rank.icon}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: rank.color }}>{rank.title}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{xp} XP total</div>
          </div>
        </div>
        <XPBar xp={xp} />
      </Card>

      {/* Milestones */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>🏆 Achievements ({earnedMilestones.length}/{MILESTONES.length})</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {MILESTONES.map(m => {
            const earned = unlockedMilestones.includes(m.id);
            return (
              <div key={m.id} style={{ background: earned ? "#140a02" : "#0a0f0a", border: `1px solid ${earned ? C.accent + "33" : C.border}`,
                borderRadius: 10, padding: "10px 12px", opacity: earned ? 1 : 0.5 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: earned ? C.accent : C.muted }}>{m.title}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{m.desc}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Export */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>📤 Export & Backup</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Keep your data safe or move to a new phone.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={onExportJSON} style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.accent}44`,
            background: C.accentDim, color: C.accent, cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "left" }}>
            💾 Full backup (JSON) — restore on new phone
          </button>
          <button onClick={onExportCSV} style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`,
            background: "transparent", color: C.text, cursor: "pointer", fontSize: 13, textAlign: "left" }}>
            📊 Export as CSV
          </button>
          <label style={{ padding: "12px 16px", borderRadius: 12, border: `1.5px dashed ${C.border}`,
            color: C.muted, cursor: "pointer", fontSize: 13, display: "block" }}>
            📥 Restore from backup
            <input type="file" accept=".json" onChange={onImportJSON} style={{ display: "none" }} />
          </label>
        </div>
      </Card>

      {/* Profile */}
      {profile && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>👤 Your Profile</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {[profile.experience, profile.frequency, profile.goal, profile.method].filter(Boolean).map(v => (
              <span key={v} style={{ fontSize: 12, padding: "4px 10px", background: C.accentDim, borderRadius: 10, color: C.accent }}>{v}</span>
            ))}
          </div>
          <button onClick={onRedoQuiz} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12 }}>
            Redo setup quiz
          </button>
        </Card>
      )}

      <Card>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
          <LogoMark size={40} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>Resin</div>
            <div style={{ fontSize: 11, color: C.muted }}>Cannabis Experience Log · v2.0</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          Your data stays on your device. Nothing sent to any server. Export regularly to keep it safe.
        </div>
      </Card>
    </div>
  );
}
