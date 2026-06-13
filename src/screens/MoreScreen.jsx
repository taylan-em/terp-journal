import { useState, useEffect } from "react";
import { C } from "../constants/colors";
import { MILESTONES } from "../constants/milestones";
import Card from "../components/Card";
import XPBar from "../components/XPBar";
import LogoMark from "../components/LogoMark";
import Sound from "../lib/sound";
import { getSession, resendVerification, isSupabaseConfigured } from "../lib/supabase";

// ── Quantity formatting ────────────────────────────────────────────────────
const fmtAmount = (v) => (v % 1 === 0 ? v.toString() : v.toFixed(1));

// ── Single stash item row ──────────────────────────────────────────────────
function StashItem({ item, onEdit, onDelete }) {
  const pricePerG = item.price && item.amount ? (item.price / item.amount) : 0;
  return (
    <div style={{ background: "#0f0a04", border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.name || item.strain}</div>
          {item.strain && <div style={{ fontSize: 11, color: C.muted }}>{item.strain}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>{fmtAmount(item.amount)}<span style={{ fontSize: 11, color: C.muted }}>{item.unit}</span></div>
          {item.price > 0 && <div style={{ fontSize: 10, color: C.muted }}>${item.price.toFixed(2)}</div>}
        </div>
      </div>
      {pricePerG > 0 && <div style={{ fontSize: 10, color: C.faint, marginBottom: 6 }}>${pricePerG.toFixed(2)}/{item.unit}</div>}
      {item.dateBought && <div style={{ fontSize: 10, color: C.faint }}>Bought {new Date(item.dateBought).toLocaleDateString("en-AU")}</div>}
      {item.note && <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 4 }}>"{item.note}"</div>}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button onClick={() => onEdit(item)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.accent}44`, background: C.accentDim, color: C.accent, cursor: "pointer", fontSize: 10 }}>✏️ Edit</button>
        <button onClick={() => onDelete(item.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #3a1a1a", background: "transparent", color: "#5a2a2a", cursor: "pointer", fontSize: 10 }}>🗑️</button>
      </div>
    </div>
  );
}

// ── T-break tracker ────────────────────────────────────────────────────────
function TBreakCard({ stash, sessions, onStartBreak, breakActive, breakStart, onEndBreak }) {
  const now = Date.now();
  
  // Calc daily consumption from sessions history (avg 14 days)
  const recentSessions = sessions.filter(s => (now - new Date(s.date).getTime()) < 14 * 86400000);
  const sessionDays = new Set(recentSessions.map(s => new Date(s.date).toDateString())).size;
  const sessionsPerDay = sessionDays > 0 ? (recentSessions.length / sessionDays) : 0;

  // Estimate avg amount per session from stash context
  const avgJointWeight = 0.5; // g per joint default
  const dailyG = sessionsPerDay * avgJointWeight;

  // Break duration
  const breakHours = breakStart ? (now - breakStart) / 3600000 : 0;
  const breakDays = breakHours / 24;
  const savedG = breakDays * dailyG;

  // Cost savings from stash
  const stashTotalCost = stash.reduce((sum, i) => sum + (i.price || 0), 0);
  const stashTotalG = stash.reduce((sum, i) => sum + (i.amount || 0), 0);
  const avgPricePerG = stashTotalG > 0 ? (stashTotalCost / stashTotalG) : 15; // fallback $15/g
  const savedMoney = savedG * avgPricePerG;

  return (
    <Card style={{ marginBottom: 14, border: `1px solid ${C.amber}33` }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.amber, marginBottom: 4 }}>🧊 T-Break Tracker</div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>Track your tolerance break and see what you're saving.</div>

      {breakActive ? (
        <>
          <div style={{ background: "#1a0f00", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: C.amber, fontWeight: 600, marginBottom: 8 }}>Break in progress</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ textAlign: "center", background: "#0f0a04", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.accent }}>{breakDays < 1 ? fmtAmount(breakHours) : fmtAmount(breakDays)}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{breakDays < 1 ? "hours" : "days"}</div>
              </div>
              <div style={{ textAlign: "center", background: "#0f0a04", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#6ee7b7" }}>{fmtAmount(savedG)}<span style={{ fontSize: 11, color: C.muted }}>g</span></div>
                <div style={{ fontSize: 10, color: C.muted }}>not smoked</div>
              </div>
            </div>
            {savedMoney > 0 && (
              <div style={{ textAlign: "center", marginTop: 10, padding: "8px 12px", background: "#0a1a0a", borderRadius: 10, border: `1px solid #22c55e33` }}>
                <div style={{ fontSize: 11, color: "#6ee7b7" }}>💰 Saved</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#22c55e" }}>${savedMoney.toFixed(2)}</div>
              </div>
            )}
          </div>
          <button onClick={onEndBreak} style={{
            width:"100%", padding:"10px 16px", borderRadius: 10, border: "1px solid #3a1a1a",
            background: "transparent", color: "#5a2a2a", cursor: "pointer", fontSize: 12
          }}>
            End break
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
            Your average: <strong style={{ color: C.text }}>{sessionsPerDay.toFixed(1)} sessions/day</strong>
            {dailyG > 0 && <> · <strong style={{ color: C.text }}>~{fmtAmount(dailyG)}g/day</strong></>}
            {avgPricePerG > 0 && <> · <strong style={{ color: C.text }}>${avgPricePerG.toFixed(2)}/g</strong></>}
          </div>
          <button onClick={onStartBreak} style={{
            width:"100%", padding:"10px 16px", borderRadius: 10, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg,${C.amber},${C.accent})`, color: "#080502",
            fontSize: 12, fontWeight: 700
          }}>
            Start a T-break
          </button>
        </>
      )}
    </Card>
  );
}

// ── Add/Edit stash item modal ──────────────────────────────────────────────
function StashForm({ initial, onSave, onCancel, existingStrains }) {
  const [name, setName] = useState(initial?.name || initial?.strain || "");
  const [strain, setStrain] = useState(initial?.strain || "");
  const [amount, setAmount] = useState(initial?.amount?.toString() || "");
  const [unit, setUnit] = useState(initial?.unit || "g");
  const [price, setPrice] = useState(initial?.price?.toString() || "");
  const [dateBought, setDateBought] = useState(initial?.dateBought ? new Date(initial.dateBought).toISOString().slice(0,10) : new Date().toISOString().slice(0,10));
  const [note, setNote] = useState(initial?.note || "");
  const [suggestOpen, setSuggestOpen] = useState(false);

  const filteredSuggestions = existingStrains.filter(s =>
    s.toLowerCase().includes(name.toLowerCase()) && s.toLowerCase() !== name.toLowerCase()
  ).slice(0, 5);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0f0a04", border: `1px solid ${C.border}`, borderRadius: 20, padding: 20, width: "100%", maxWidth: 400, maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 16 }}>{initial ? "Edit stash item" : "Add to stash"}</div>

        <label style={{ fontSize: 11, color: C.muted, marginBottom: 4, display: "block" }}>Name / Strain *</label>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input value={name} onChange={e => { setName(e.target.value); setSuggestOpen(true); }}
            placeholder="e.g. Lemon Haze"
            style={{ width:"100%", padding:"10px 12px", background: C.card, border:`1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, boxSizing:"border-box" }} />
          {suggestOpen && filteredSuggestions.length > 0 && name.length > 0 && (
            <div style={{ position:"absolute", top:"100%", left:0, right:0, background: C.card, border:`1px solid ${C.border}`, borderRadius: 10, zIndex: 10, marginTop: 2 }}>
              {filteredSuggestions.map(s => (
                <div key={s} onClick={() => { setName(s); setStrain(s); setSuggestOpen(false); }}
                  style={{ padding:"8px 12px", cursor:"pointer", fontSize: 12, color: C.text, borderBottom:`1px solid ${C.border}` }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <label style={{ fontSize: 11, color: C.muted, marginBottom: 4, display: "block" }}>Strain type (optional)</label>
        <input value={strain} onChange={e => setStrain(e.target.value)}
          placeholder="Auto-filled from logged strains"
          style={{ width:"100%", padding:"10px 12px", background: C.card, border:`1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, marginBottom: 12, boxSizing:"border-box" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: C.muted, marginBottom: 4, display: "block" }}>Amount *</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.1" min="0"
              placeholder="3.5"
              style={{ width:"100%", padding:"10px 12px", background: C.card, border:`1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, boxSizing:"border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, marginBottom: 4, display: "block" }}>Unit</label>
            <select value={unit} onChange={e => setUnit(e.target.value)}
              style={{ width:"100%", padding:"10px 12px", background: C.card, border:`1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, cursor:"pointer" }}>
              <option value="g">Grams (g)</option>
              <option value="oz">Ounces (oz)</option>
              <option value="ml">Millilitres (ml)</option>
              <option value="puffs">Puffs</option>
              <option value="units">Units</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: C.muted, marginBottom: 4, display: "block" }}>Price paid ($)</label>
            <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" min="0"
              placeholder="50"
              style={{ width:"100%", padding:"10px 12px", background: C.card, border:`1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, boxSizing:"border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, marginBottom: 4, display: "block" }}>Date bought</label>
            <input value={dateBought} onChange={e => setDateBought(e.target.value)} type="date"
              style={{ width:"100%", padding:"10px 12px", background: C.card, border:`1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, boxSizing:"border-box" }} />
          </div>
        </div>

        <label style={{ fontSize: 11, color: C.muted, marginBottom: 4, display: "block" }}>Note (optional)</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} maxLength={200}
          placeholder="e.g. From Mickleham, good batch"
          style={{ width:"100%", padding:"10px 12px", background: C.card, border:`1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12, boxSizing:"border-box", resize:"none", marginBottom: 14 }} />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onSave({ id: initial?.id || Date.now(), name: name || strain, strain, amount: parseFloat(amount) || 0, unit, price: parseFloat(price) || 0, dateBought: new Date(dateBought).toISOString(), note })}
            disabled={!name || !amount}
            style={{ flex:1, padding:"10px 16px", borderRadius: 10, border:"none", cursor:"pointer",
              background: (!name || !amount) ? C.faint : `linear-gradient(135deg,#c2410c,${C.accent})`,
              color: (!name || !amount) ? C.muted : "#080502", fontSize: 12, fontWeight: 700 }}>
            {initial ? "Save" : "Add to stash"}
          </button>
          <button onClick={onCancel}
            style={{ padding:"10px 16px", borderRadius: 10, border:`1px solid ${C.border}`, background:"transparent", color: C.muted, cursor:"pointer", fontSize: 12 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main MoreScreen ────────────────────────────────────────────────────────
export default function MoreScreen({ xp, rank, profile, unlockedMilestones, earnedMilestones,
  onExportJSON, onExportCSV, onImportJSON, onRedoQuiz, premium, onUnlockClick, onFeedbackClick,
  stash, onAddStash, onEditStash, onDeleteStash,
  sessions, breakActive, breakStart, onStartBreak, onEndBreak, onShareStats }) {

  const [showStash, setShowStash] = useState(false);
  const [showStashForm, setShowStashForm] = useState(false);
  const [editingStashItem, setEditingStashItem] = useState(null);
  const [strainList, setStrainList] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);

  // Collect unique strain names
  useEffect(() => {
    const names = [...new Set(stash.map(i => i.strain).filter(Boolean))];
    setStrainList(names);
  }, [stash]);

  // Load user email from supabase session
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    getSession().then(({ data }) => {
      if (data?.session?.user?.email) setUserEmail(data.session.user.email);
    }).catch(() => {});
  }, []);

  const handleResendFromMore = async () => {
    if (!userEmail) return;
    setResending(true);
    setResendMsg("");
    const { error } = await resendVerification(userEmail);
    if (error) {
      setResendMsg(error.message || "Failed to resend.");
    } else {
      setResendMsg("Verification email sent! Check your inbox.");
    }
    setResending(false);
  };

  const totalStashG = stash.reduce((sum, i) => sum + (i.unit === "g" ? i.amount : 0), 0);
  const totalStashValue = stash.reduce((sum, i) => sum + (i.price || 0), 0);

  const handleAddStash = () => { setEditingStashItem(null); setShowStashForm(true); };
  const handleEditStash = (item) => { setEditingStashItem(item); setShowStashForm(true); };
  const handleDeleteStash = (id) => { onDeleteStash(id); Sound.play("tap"); };
  const handleSaveStash = (item) => {
    if (editingStashItem) onEditStash(item);
    else onAddStash(item);
    setShowStashForm(false);
    setEditingStashItem(null);
    Sound.play("save");
  };

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Settings & Data</div>

      {/* ── Stash section ── */}
      <Card style={{ marginBottom: 14 }}>
        <div onClick={() => { setShowStash(!showStash); Sound.play("tap"); }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>
            📦 Stash {stash.length > 0 && <span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>({stash.length} items)</span>}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>{showStash ? "▲" : "▼"}</div>
        </div>
        {!showStash && stash.length > 0 && (
          <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
            {totalStashG > 0 && <span>{fmtAmount(totalStashG)}g · </span>}
            {totalStashValue > 0 && <span>${totalStashValue.toFixed(2)} total</span>}
            {totalStashG === 0 && totalStashValue === 0 && <span>{stash.length} item{stash.length !== 1 ? "s" : ""}</span>}
          </div>
        )}
      </Card>

      {showStash && (
        <div style={{ marginBottom: 14 }}>
          {stash.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {totalStashG > 0 && (
                <div style={{ flex: 1, background: "#0f0a04", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: C.muted }}>Total weight</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{fmtAmount(totalStashG)}<span style={{ fontSize: 10, color: C.muted }}>g</span></div>
                </div>
              )}
              {totalStashValue > 0 && (
                <div style={{ flex: 1, background: "#0f0a04", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: C.muted }}>Total value</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#22c55e" }}>${totalStashValue.toFixed(2)}</div>
                </div>
              )}
            </div>
          )}

          {stash.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", background: "#0f0a04", borderRadius: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>No stash logged yet</div>
              <button onClick={handleAddStash} style={{ padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg,#c2410c,${C.accent})`, color: "#080502", fontSize: 12, fontWeight: 700 }}>
                + Add item
              </button>
            </div>
          ) : (
            <>
              <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 8 }}>
                {stash.map(item => (
                  <StashItem key={item.id} item={item} onEdit={handleEditStash} onDelete={handleDeleteStash} />
                ))}
              </div>
              <button onClick={handleAddStash} style={{
                width: "100%", padding: "10px 16px", borderRadius: 10, border: `1.5px dashed ${C.border}`,
                background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}>
                + Add another
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Account section ── */}
      {userEmail && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>🔐 Account</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{userEmail}</div>
          <button onClick={handleResendFromMore} disabled={resending}
            style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: "transparent", color: C.muted, cursor: resending ? "default" : "pointer",
              fontSize: 11, opacity: resending ? 0.5 : 1 }}>
            {resending ? "Sending..." : "Resend verification email"}
          </button>
          {resendMsg && (
            <div style={{ fontSize: 11, color: resendMsg.includes("sent") ? "#6ee7b7" : "#f87171", marginTop: 8 }}>{resendMsg}</div>
          )}
        </Card>
      )}

      {/* ── T-Break tracker ── */}
      <TBreakCard
        stash={stash} sessions={sessions}
        onStartBreak={onStartBreak} breakActive={breakActive} breakStart={breakStart}
        onEndBreak={onEndBreak} />

      {/* ── Premium unlock ── */}
      {!premium && (
        <Card style={{ marginBottom: 14, border: `1px solid ${C.accent}33`, background: "linear-gradient(135deg,#1a0f00,#0f0a04)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 28 }}>✨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.accent, marginBottom: 2 }}>Resin Premium</div>
              <div style={{ fontSize: 11, color: C.muted }}>AI Review Generator + Advanced Analytics</div>
            </div>
            <button onClick={onUnlockClick} style={{
              padding: "10px 20px", borderRadius: 20, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg,#c2410c,${C.accent})`, color: "#080502",
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap"
            }}>Unlock $4.99</button>
          </div>
        </Card>
      )}

      {/* ── Rank card ── */}
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

      {/* ── Milestones ── */}
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

      {/* ── Export ── */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>📤 Export & Share</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Backup your data or share your stats as an image.</div>
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
          <button onClick={() => onShareStats?.(xp, rank, sessions?.length, sessions)}
            style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid #a78bfa44`,
              background: "#a78bfa11", color: "#c4b5fd", cursor: "pointer", fontSize: 13, textAlign: "left" }}>
            🎨 Share Your Stats Card
          </button>
        </div>
      </Card>

      {/* ── Profile ── */}
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

      {/* ── About ── */}
      <Card>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
          <LogoMark size={40} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>About</div>
            <div style={{ fontSize: 11, color: C.muted }}>v2.0 — your data stays on device</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          Your data stays on your device. Nothing sent to any server. Export regularly to keep it safe.
        </div>
        <button onClick={onFeedbackClick} style={{
          width: "100%", marginTop: 12, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`,
          background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600
        }}>
          💬 Send Feedback
        </button>
      </Card>

      {/* ── Stash form modal ── */}
      {showStashForm && (
        <StashForm
          initial={editingStashItem}
          onSave={handleSaveStash}
          onCancel={() => { setShowStashForm(false); setEditingStashItem(null); }}
          existingStrains={strainList} />
      )}
    </div>
  );
}
