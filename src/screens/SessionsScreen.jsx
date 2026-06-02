import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { C } from "../constants/colors";
import { METHODS, MOODS, EFFECTS, RATINGS } from "../constants/enums";
import { typeColor, typeBg } from "../constants/ranks";
import Card from "../components/Card";
import Sound from "../lib/sound";

const ExpandableSession = ({ s, allStrains, onEdit, onPassport, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const st = allStrains.find(x => x.name === s.strain);
  const meth = METHODS.find(m => m.id === s.method);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(s.id);
      setConfirmDelete(false);
      Sound.play("tap");
    } else {
      setConfirmDelete(true);
      Sound.play("tap");
      // Auto-cancel after 4 seconds
      setTimeout(() => setConfirmDelete(false), 4000);
    }
  };

  // Reset confirm state when session changes
  useEffect(() => {
    setConfirmDelete(false);
  }, [s.id]);

  return (
    <div onClick={() => { Sound.play("tap"); setOpen(!open); }}
      style={{ background: C.card, border: `1.5px solid ${open ? C.accent + "44" : C.border}`,
        borderRadius: 16, marginBottom: 8, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ fontSize: 22, minWidth: 30, textAlign: "center" }}>{meth?.emoji || "🌿"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.strain || "Unknown"}</div>
          <div style={{ fontSize: 11, color: C.muted }}>
            {new Date(s.date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
            {s.brand && <span style={{ color: "#3a7a4a" }}> · {s.brand}</span>}
            {s.prescription && <span style={{ color: "#6ee7b7", fontWeight: 600 }}> · 🏥 Rx</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "center", flexShrink: 0 }}>
          {st && <span style={{ fontSize: 10, padding: "2px 8px", background: typeBg(st.type), border: `1px solid ${typeColor(st.type)}44`, borderRadius: 10, color: typeColor(st.type) }}>{st.type}</span>}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>{s.ratings?.overall || "?"}</div>
            <div style={{ fontSize: 9, color: C.muted }}>/10</div>
          </div>
          <div style={{ fontSize: 18 }}>{MOODS[s.moodAfter] || "😐"}</div>
        </div>
      </div>
      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${C.border}` }}>
          {s.photos?.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 12, overflowX: "auto" }}>
              {s.photos.map((p, i) => <img key={i} src={p} style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} alt="bud" />)}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginTop: 12, marginBottom: 10 }}>
            {RATINGS.map(r => (
              <div key={r.id} style={{ background: "#160900", borderRadius: 10, padding: "8px 4px", textAlign: "center" }}>
                <div style={{ fontSize: 13 }}>{r.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: r.color }}>{s.ratings?.[r.id] || "—"}</div>
                <div style={{ fontSize: 9, color: C.muted }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
            {s.effects?.map(e => <span key={e} style={{ fontSize: 11, padding: "3px 10px", background: C.accentDim, borderRadius: 10, color: C.accent }}>{e}</span>)}
          </div>
          {s.prescription && (
            <div style={{ background: "#0a2a1a", borderRadius: 10, padding: "10px 12px", marginBottom: 10, border: "1px solid #6ee7b722" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6ee7b7", marginBottom: 4 }}>🏥 Prescription Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", fontSize: 11 }}>
                {s.clinic && <><span style={{ color: C.faint }}>Clinic</span><span style={{ color: C.text }}>{s.clinic}</span></>}
                {s.scriptName && <><span style={{ color: C.faint }}>Product</span><span style={{ color: C.text }}>{s.scriptName}</span></>}
                {s.dispensed && <><span style={{ color: C.faint }}>Dispensed</span><span style={{ color: C.text }}>{s.dispensed}</span></>}
                {s.cost && <><span style={{ color: C.faint }}>Cost</span><span style={{ color: C.text }}>${s.cost} AUD</span></>}
              </div>
            </div>
          )}
          {s.notes
            ? <div style={{ fontSize: 12, color: "#8a6a3a", fontStyle: "italic", marginBottom: 10 }}>"{s.notes}"</div>
            : <div style={{ fontSize: 11, color: C.faint, marginBottom: 10 }}>No notes logged</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={e => { e.stopPropagation(); onEdit(s); }} style={{
              padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.accent}44`,
              background: "transparent", color: C.accent, cursor: "pointer", fontSize: 12
            }}>✏️ Edit</button>
            <button onClick={e => { e.stopPropagation(); onPassport(s.strain); }} style={{
              padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12
            }}>🛂 Passport</button>
            <button onClick={handleDeleteClick}
              style={{
                padding: "7px 14px", borderRadius: 8, border: confirmDelete ? "1px solid #ef4444" : "1px solid #3a1a1a",
                background: confirmDelete ? "#ef444422" : "transparent",
                color: confirmDelete ? "#ef4444" : "#5a2a2a",
                cursor: "pointer", fontSize: 12, fontWeight: confirmDelete ? 700 : 400,
                transition: "all 0.15s ease"
              }}>
              {confirmDelete ? "⚠️ Tap again to delete" : "🗑️ Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SessionsScreen({ sessions, allStrains, onEdit, onPassport, onDelete, onUndoDelete }) {
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [sessionSort, setSessionSort] = useState("newest");
  const [deletedSession, setDeletedSession] = useState(null);
  const undoTimeout = useRef(null);

  const filteredSessions = useMemo(() => {
    return sessions
      .filter(s => {
        if (!sessionSearch) return true;
        const q = sessionSearch.toLowerCase();
        return s.strain?.toLowerCase().includes(q) ||
          s.effects?.some(e => e.toLowerCase().includes(q)) ||
          s.notes?.toLowerCase().includes(q) ||
          s.brand?.toLowerCase().includes(q) ||
          s.flavors?.some(f => f.toLowerCase().includes(q));
      })
      .filter(s => {
        if (sessionFilter === "all") return true;
        if (sessionFilter === "high") return (s.ratings?.overall || 0) >= 8;
        if (sessionFilter === "photos") return s.photos?.length > 0;
        const st = allStrains.find(x => x.name === s.strain);
        return st?.type?.toLowerCase() === sessionFilter;
      })
      .sort((a, b) => {
        if (sessionSort === "oldest") return new Date(a.date) - new Date(b.date);
        if (sessionSort === "highest") return (b.ratings?.overall || 0) - (a.ratings?.overall || 0);
        if (sessionSort === "lowest") return (a.ratings?.overall || 0) - (b.ratings?.overall || 0);
        return new Date(b.date) - new Date(a.date);
      });
  }, [sessions, sessionSearch, sessionFilter, sessionSort, allStrains]);

  const handleDelete = (id) => {
    // Find the session before deleting
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    setDeletedSession(session);
    onDelete(id);
    
    // Clear any existing undo timeout
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    
    // Auto-dismiss undo after 6 seconds
    undoTimeout.current = setTimeout(() => {
      setDeletedSession(null);
    }, 6000);
  };

  const handleUndo = () => {
    if (deletedSession && onUndoDelete) {
      onUndoDelete(deletedSession);
      setDeletedSession(null);
      Sound.play("unlock");
    }
    if (undoTimeout.current) {
      clearTimeout(undoTimeout.current);
      undoTimeout.current = null;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeout.current) clearTimeout(undoTimeout.current);
    };
  }, []);

  const filters = [
    { id: "all", label: "All" },
    { id: "indica", label: "Indica" },
    { id: "sativa", label: "Sativa" },
    { id: "hybrid", label: "Hybrid" },
    { id: "high", label: "Rated 8+" },
    { id: "photos", label: "Has Photos" },
  ];

  return (
    <div>
      {/* Search */}
      <input value={sessionSearch} onChange={e => setSessionSearch(e.target.value)}
        placeholder="Search strains, effects, notes..."
        style={{ width: "100%", padding: "12px 14px", background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 12, color: C.text, fontSize: 13, marginBottom: 12, boxSizing: "border-box" }} />

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 4 }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setSessionFilter(f.id)} style={{
            padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${sessionFilter === f.id ? C.accent : C.border}`,
            background: sessionFilter === f.id ? C.accentDim : "transparent",
            color: sessionFilter === f.id ? C.accent : C.muted,
            fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0
          }}>
            {f.label}
          </button>
        ))}
        <select value={sessionSort} onChange={e => setSessionSort(e.target.value)}
          style={{ marginLeft: "auto", padding: "5px 10px", borderRadius: 20, border: `1px solid ${C.border}`,
            background: C.card, color: C.muted, fontSize: 11, cursor: "pointer", flexShrink: 0 }}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
      </div>

      {/* Count */}
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
        {filteredSessions.length} of {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        {(sessionSearch || sessionFilter !== "all") && (
          <button onClick={() => { setSessionSearch(""); setSessionFilter("all"); }}
            style={{ marginLeft: 8, fontSize: 11, color: C.accent, background: "transparent", border: "none", cursor: "pointer" }}>
            Clear filters
          </button>
        )}
      </div>

      {filteredSessions.length === 0 && sessions.length > 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 13 }}>No sessions match your search</div>
        </div>
      )}

      {sessions.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px 20px", color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div>No sessions yet</div>
        </div>
      )}

      {filteredSessions.map(s => (
        <ExpandableSession key={s.id} s={s} allStrains={allStrains}
          onEdit={onEdit} onPassport={onPassport} onDelete={handleDelete} />
      ))}

      {/* Undo toast */}
      {deletedSession && (
        <div style={{
          position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", zIndex: 200,
          background: "#1a0f00", border: `1px solid ${C.amber}44`, borderRadius: 14,
          padding: "10px 18px", display: "flex", alignItems: "center", gap: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          animation: "slideDown 0.2s ease"
        }}>
          <span style={{ fontSize: 12, color: C.text }}>Deleted <strong>{deletedSession.strain || "session"}</strong></span>
          <button onClick={handleUndo}
            style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${C.accent}88`,
              background: C.accentDim, color: C.accent, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            ↩ Undo
          </button>
        </div>
      )}
    </div>
  );
}
