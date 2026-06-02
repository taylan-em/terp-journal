import { useState } from "react";
import { C } from "../constants/colors";
import Sound from "../lib/sound";

// Discord webhook URL — replace with your actual webhook
const FEEDBACK_WEBHOOK = "https://discord.com/api/webhooks/PLACEHOLDER";

const CATEGORIES = ["Bug report", "Feature request", "Strain data correction", "General feedback", "Other"];

export default function FeedbackModal({ onClose, sessions, profile }) {
  const [category, setCategory] = useState("General feedback");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setStatus("sending");

    const payload = {
      content: null,
      embeds: [{
        title: `📬 ${category}`,
        description: text.trim(),
        color: 0xf97316,
        fields: [
          { name: "Sessions logged", value: String(sessions?.length || 0), inline: true },
          { name: "Profile", value: profile ? `${profile.experience} · ${profile.frequency}` : "Not set", inline: true },
          { name: "App version", value: "v2.0", inline: true },
        ],
        timestamp: new Date().toISOString(),
      }]
    };

    try {
      await fetch(FEEDBACK_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      Sound.play("save");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(8,15,9,0.96)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💚</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, marginBottom: 8 }}>Thanks for the feedback</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>
            Every report helps make Resin better. I read them all.
          </div>
          <button onClick={onClose} style={{
            padding: "12px 32px", borderRadius: 24, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, #c2410c, ${C.accent})`, color: "#080502",
            fontSize: 14, fontWeight: 700,
          }}>Back to Resin</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(8,15,9,0.96)", overflowY: "auto", padding: 20 }}>
      <div style={{ maxWidth: 400, margin: "60px auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>💬 Send Feedback</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        {/* Category selector */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: "6px 12px", borderRadius: 16, border: `1px solid ${category === c ? C.accent : C.border}`,
              background: category === c ? C.accentDim : "transparent",
              color: category === c ? C.accent : C.muted,
              cursor: "pointer", fontSize: 12, fontWeight: category === c ? 600 : 400,
            }}>
              {c}
            </button>
          ))}
        </div>

        {/* Text area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? Found a bug? Got an idea? Strain data wrong? Tell me everything..."
          rows={6}
          autoFocus
          style={{
            width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${C.border}`,
            background: "#0a0500", color: C.text, fontSize: 14, outline: "none",
            marginBottom: 12, boxSizing: "border-box", resize: "vertical",
            fontFamily: "inherit", lineHeight: 1.5,
          }}
        />

        {status === "error" && (
          <div style={{ fontSize: 12, color: "#f87171", marginBottom: 12, textAlign: "center" }}>
            Couldn't send — check your connection and try again.
          </div>
        )}

        <button onClick={handleSubmit} disabled={!text.trim() || status === "sending"} style={{
          width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: text.trim() ? "pointer" : "default",
          background: text.trim() ? `linear-gradient(135deg, #c2410c, ${C.accent})` : C.border,
          color: text.trim() ? "#080502" : C.muted,
          fontSize: 14, fontWeight: 700, textAlign: "center", transition: "opacity 0.2s",
        }}>
          {status === "sending" ? "Sending..." : "Send Feedback"}
        </button>
      </div>
    </div>
  );
}
