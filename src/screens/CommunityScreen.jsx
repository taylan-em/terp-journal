import { useState, useEffect, useCallback } from "react";
import { C } from "../constants/colors";
import { STRAIN_DB } from "../constants/data";
import { typeColor, typeBg } from "../constants/ranks";
import { fetchCommunityFeed, fetchLeaderboard } from "../lib/community";

const TABS = [
  { key: "feed", label: "Feed" },
  { key: "trending", label: "Trending" },
];

const EFFECT_FILTERS = [
  { key: null, label: "All" },
  { key: "sativa", label: "Sativa" },
  { key: "indica", label: "Indica" },
  { key: "hybrid", label: "Hybrid" },
];

export default function CommunityScreen({ onViewStrain }) {
  const [tab, setTab] = useState("feed");
  const [feed, setFeed] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "feed") {
        const data = await fetchCommunityFeed();
        setFeed(data);
      } else {
        const data = await fetchLeaderboard("log_count", filter);
        setLeaderboard(data);
      }
    } catch (e) {
      // fallback handled in community.js
    }
    setLoading(false);
  }, [tab, filter]);

  useEffect(() => { load(); }, [load]);

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const getStrainData = (name) => STRAIN_DB.find(s => s.name.toLowerCase() === name?.toLowerCase());

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
              background: tab === t.key ? C.accentDim : "transparent",
              color: tab === t.key ? C.accent : C.muted,
              fontSize: 13, fontWeight: 600, fontFamily: "system-ui"
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter chips (trending only) */}
      {tab === "trending" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
          {EFFECT_FILTERS.map(f => (
            <button key={f.key || "all"} onClick={() => setFilter(f.key)}
              style={{
                padding: "6px 14px", borderRadius: 20, border: `1px solid ${filter === f.key ? C.accent : C.border}`,
                background: filter === f.key ? C.accentDim : "transparent",
                color: filter === f.key ? C.accent : C.muted,
                fontSize: 11, cursor: "pointer", fontFamily: "system-ui", whiteSpace: "nowrap"
              }}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13 }}>Loading...</div>
      )}

      {/* ── Feed tab ── */}
      {!loading && tab === "feed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {feed.map(review => {
            const strain = getStrainData(review.strain);
            return (
              <div key={review.id} style={{
                background: C.card, borderRadius: 16, padding: 16,
                border: `1px solid ${C.border}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {strain && (
                      <span style={{ fontSize: 10, padding: "2px 8px", background: typeBg(strain.type), border: `1px solid ${typeColor(strain.type)}33`, borderRadius: 10, color: typeColor(strain.type), fontWeight: 600 }}>
                        {review.strain}
                      </span>
                    )}
                    <span style={{ fontSize: 10, color: C.faint }}>{review.user_alias}</span>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i} style={{ fontSize: 11, color: i < review.rating ? C.amber : C.faint }}>★</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5, marginBottom: 8 }}>
                  {review.text}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: C.muted }}>via {review.method}</span>
                  <span style={{ fontSize: 10, color: C.faint }}>{timeAgo(review.created_at)}</span>
                </div>
              </div>
            );
          })}
          <div style={{ textAlign: "center", padding: "20px 0", fontSize: 11, color: C.faint }}>
            More reviews unlock with cloud sync (premium) · Trending in Australia
          </div>
        </div>
      )}

      {/* ── Trending tab (leaderboard) ── */}
      {!loading && tab === "trending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {leaderboard.map((s, i) => {
            const strain = getStrainData(s.strain);
            return (
              <div key={s.strain} onClick={() => strain && onViewStrain?.(s.strain)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  background: i < 3 ? `linear-gradient(135deg, ${C.card}, ${C.accent}08)` : C.card,
                  borderRadius: 14, border: `1px solid ${i < 3 ? C.accent + "22" : C.border}`,
                  cursor: strain ? "pointer" : "default"
                }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: i < 3 ? C.amber : C.muted, minWidth: 28, textAlign: "center" }}>
                  {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i + 1}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 2 }}>
                    {s.strain}
                    {strain && (
                      <span style={{ marginLeft: 6, fontSize: 10, padding: "2px 6px", background: typeBg(strain.type), borderRadius: 8, color: typeColor(strain.type) }}>
                        {strain.type}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: 11, color: C.muted }}>
                    <span>⭐ {s.avg_rating?.toFixed(1)}</span>
                    <span>📋 {s.log_count} logs</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.amber }}>{s.avg_rating?.toFixed(1)}</div>
                  <div style={{ fontSize: 10, color: C.faint }}>avg</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`*{box-sizing:border-box}`}</style>
    </div>
  );
}
