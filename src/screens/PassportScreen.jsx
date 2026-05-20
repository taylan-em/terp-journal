import { C } from "../constants/colors";
import { EFFECTS, RATINGS } from "../constants/enums";
import { typeColor, typeBg } from "../constants/ranks";
import { STRAIN_DB } from "../constants/data";
import Card from "../components/Card";
import Sound from "../lib/sound";

const PassportCardUI = ({ strain, sessions, allStrains, loadAnecdotes, onLogStrain }) => {
  const st = allStrains.find(s => s.name === strain);
  const ss = sessions.filter(s => s.strain === strain);
  const n = ss.length;
  const avg = n ? (ss.reduce((a, s) => a + (s.ratings?.overall || 0), 0) / n).toFixed(1) : "—";
  const topEffects = EFFECTS.map(e => ({ e, pct: Math.round(ss.filter(s => s.effects?.includes(e)).length / n * 100) }))
    .filter(x => x.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, 3);
  const mastered = n >= 5;
  const photos = ss.flatMap(s => s.photos || []).slice(0, 1);

  return (
    <div onClick={() => { Sound.play("select"); loadAnecdotes(strain); }} style={{
      background: `linear-gradient(135deg,${C.card},${st ? typeBg(st.type) : "#160900"})`,
      border: `2px solid ${st ? typeColor(st.type) + "44" : C.border}`, borderRadius: 20, padding: 16, marginBottom: 10,
      boxShadow: st ? `0 4px 20px ${typeColor(st.type)}15` : undefined
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {photos.length > 0 && <img src={photos[0]} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} alt="bud" />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{strain}</span>
            {st && <span style={{ fontSize: 10, padding: "2px 8px", background: typeBg(st.type), border: `1px solid ${typeColor(st.type)}`, borderRadius: 10, color: typeColor(st.type) }}>{st.type}</span>}
            {mastered && <span style={{ fontSize: 10, padding: "2px 8px", background: "#f59e0b22", border: "1px solid #f59e0b44", borderRadius: 10, color: "#f59e0b" }}>⭐ Mastered</span>}
          </div>
          {st && <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{st.description}</div>}
          <div style={{ display: "flex", gap: 12, fontSize: 12, marginBottom: 8 }}>
            {st && <span style={{ color: C.amber }}>THC {st.thc}%</span>}
            <span style={{ color: C.accent, fontWeight: 700 }}>{avg}/10 avg</span>
            <span style={{ color: C.muted }}>{n} session{n !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {topEffects.map(({ e, pct }) => (
              <span key={e} style={{ fontSize: 10, padding: "2px 8px", background: C.accentDim, borderRadius: 10, color: C.accent }}>{e} {pct}%</span>
            ))}
          </div>
        </div>
      </div>
      {n >= 2 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>YOUR EXPERIENCE MAP</div>
          <div style={{ display: "flex", gap: 4 }}>
            {RATINGS.map(r => {
              const avgVal = ss.filter(s => s.ratings?.[r.id]).length
                ? (ss.reduce((a, s) => a + (s.ratings?.[r.id] || 0), 0) / ss.filter(s => s.ratings?.[r.id]).length)
                : 0;
              return (
                <div key={r.id} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 12 }}>{r.icon}</div>
                  <div style={{ height: 30, background: C.faint, borderRadius: 3, position: "relative", margin: "4px 0" }}>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${avgVal / 10 * 100}%`,
                      background: r.color, borderRadius: 3, transition: "height 0.4s" }} />
                  </div>
                  <div style={{ fontSize: 9, color: C.muted }}>{avgVal.toFixed(0)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function PassportScreen({ sessions, allStrains, strainNames, onPassportStrain, onLogStrain }) {
  const handlePassportClick = (name) => {
    Sound.play("select");
    onPassportStrain(name);
  };

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>🛂 Strain Passport</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Your personal strain collection — {strainNames.length} tried</div>
      {strainNames.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ background: `linear-gradient(135deg,${C.card},#1a0d02)`, border: `1px solid ${C.accent}33`,
            borderRadius: 20, padding: "32px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🛂</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, marginBottom: 8 }}>Your Passport is Empty</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
              Every strain you log gets a passport card — your personal record of effects, ratings, photos and community anecdotes.
            </div>
            <button onClick={() => onLogStrain()} style={{
              padding: "12px 28px", borderRadius: 50, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg,#c2410c,${C.accent})`, color: "#080502",
              fontSize: 14, fontWeight: 700
            }}>
              Log your first session →
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {STRAIN_DB.slice(0, 4).map(s => (
              <div key={s.name} style={{ background: C.card, border: `1px solid ${typeColor(s.type)}22`,
                borderRadius: 14, padding: 12, textAlign: "left" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{s.name}</span>
                  <span style={{ fontSize: 9, padding: "1px 6px", background: typeBg(s.type), border: `1px solid ${typeColor(s.type)}`, borderRadius: 6, color: typeColor(s.type) }}>{s.type}</span>
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>{s.description}</div>
                <button onClick={() => onLogStrain(s.name)} style={{
                  fontSize: 10, padding: "4px 10px", borderRadius: 8, border: `1px solid ${C.accent}44`,
                  background: C.accentDim, color: C.accent, cursor: "pointer"
                }}>
                  Log this strain →
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        strainNames.map(name => (
          <div key={name} onClick={() => handlePassportClick(name)}>
            <PassportCardUI strain={name} sessions={sessions} allStrains={allStrains} loadAnecdotes={onPassportStrain} onLogStrain={onLogStrain} />
          </div>
        ))
      )}
    </div>
  );
}
