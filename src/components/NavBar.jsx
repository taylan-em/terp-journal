import { C } from "../constants/colors";
import Sound from "../lib/sound";

// Clean SVG nav icons — outline style, 20x20 viewBox
const Icons = {
  home: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l7-7 7 7" />
      <path d="M5 7v8a1 1 0 001 1h2v-4h4v4h2a1 1 0 001-1V7" />
    </svg>
  ),
  log: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 7v3l2 2" />
    </svg>
  ),
  sessions: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="12" rx="2" />
      <path d="M7 8h6" />
      <path d="M7 11h4" />
    </svg>
  ),
  passport: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="14" height="16" rx="2" />
      <circle cx="10" cy="8" r="2.5" />
      <path d="M6 16c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" />
    </svg>
  ),
  community: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16c0-1.5-1-3-3-3s-3 1.5-3 3" />
      <circle cx="6" cy="7" r="2" />
      <circle cx="14" cy="7" r="2" />
      <path d="M18 16c0-1-1-2-2-2s-2 1-2 2" />
      <path d="M8 5c0-1 1-2 2-2s2 1 2 2" />
    </svg>
  ),
  more: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2" />
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  ),
};

const TABS = [
  { id: "home", icon: Icons.home, l: "Home" },
  { id: "log", icon: Icons.log, l: "Log" },
  { id: "sessions", icon: Icons.sessions, l: "History" },
  { id: "passport", icon: Icons.passport, l: "Passport" },
  { id: "community", icon: Icons.community, l: "Community" },
  { id: "more", icon: Icons.more, l: "More" },
];

export default function NavBar({ tab, setTab, onLog }) {
  return (
    <nav style={{
      display: "flex", background: C.bg, borderBottom: `1px solid ${C.border}`,
      position: "sticky", top: 57, zIndex: 49
    }}>
      {TABS.map(t => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => {
            Sound.play("swipe");
            setTab(t.id);
            if (t.id === "log" && onLog) onLog();
          }} style={{
            flex: 1, padding: "10px 2px 8px", border: "none", cursor: "pointer",
            background: "transparent", fontFamily: "system-ui",
            borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
            transition: "border-color 0.15s",
          }}>
            <div style={{
              fontSize: 13, marginBottom: 3,
              color: active ? C.accent : C.muted,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {t.icon}
            </div>
            <div style={{
              fontSize: 9, letterSpacing: "0.05em",
              color: active ? C.accent : C.muted,
              fontWeight: active ? 600 : 400,
            }}>
              {t.l}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
