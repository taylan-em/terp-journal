import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { C } from "../constants/colors";
import { METHODS, MOODS, EFFECTS, RATINGS } from "../constants/enums";
import { typeColor, typeBg } from "../constants/ranks";
import Card from "../components/Card";
import Sound from "../lib/sound";

const ExpandableSession = ({ s, allStrains, onEdit, onPassport, onDelete }) => {
  const [open, setOpen] = useState(false);
  const st = allStrains.find(x => x.name === s.strain);
  const meth = METHODS.find(m => m.id === s.method);
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
            <button onClick={e => { e.stopPropagation(); onDelete(s.id); }}
              style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #3a1a1a", background: "transparent", color: "#5a2a2a", cursor: "pointer", fontSize: 12 }}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SessionsScreen({ sessions, allStrains, onEdit, onPassport, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [sessionSort, setSessionSort] = useState("newest");

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

  const handleEdit = (s) => {
    onEdit(s);
  };

  const handlePassport = (strain) => {
    onPassport(strain);
  };

  const handleDelete = (id) => {
    onDelete(id);
  };

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
          onEdit={handleEdit} onPassport={handlePassport} onDelete={handleDelete} />
      ))}
    </div>
  );
}
