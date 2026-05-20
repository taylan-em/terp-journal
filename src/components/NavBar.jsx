import { C } from "../constants/colors";
import Sound from "../lib/sound";

const TABS = [
  { id: "home", e: "🏠", l: "Home" },
  { id: "log", e: "🌿", l: "Log" },
  { id: "sessions", e: "📋", l: "History" },
  { id: "passport", e: "🛂", l: "Passport" },
  { id: "more", e: "⚙️", l: "More" },
];

export default function NavBar({ tab, setTab, onLog }) {
  return (
    <nav style={{
      display: "flex", background: C.bg, borderBottom: `1px solid ${C.border}`,
      position: "sticky", top: 57, zIndex: 49
    }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => {
          Sound.play("swipe");
          setTab(t.id);
          if (t.id === "log" && onLog) onLog();
        }} style={{
          flex: 1, padding: "9px 2px", border: "none", cursor: "pointer", background: "transparent",
          borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
          color: tab === t.id ? C.accent : C.muted, fontSize: 9, letterSpacing: "0.05em", fontFamily: "system-ui",
        }}>
          <div style={{ fontSize: 15, marginBottom: 1 }}>{t.e}</div>
          {t.l}
        </button>
      ))}
    </nav>
  );
}
