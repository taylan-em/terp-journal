import { useState } from "react";
import { C } from "../constants/colors";
import { verifyLicense, isUnlocked, setUnlocked } from "../lib/license";
import Sound from "../lib/sound";

export default function UnlockPremiumModal({ onClose, onUnlocked }) {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("idle"); // idle | verifying | error | done
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {
    const trimmed = key.trim();
    if (!trimmed) { setStatus("error"); setMsg("Enter your license key from Gumroad."); return; }
    setStatus("verifying");
    const result = await verifyLicense(trimmed);
    if (result.valid) {
      setUnlocked(true);
      Sound.play("unlock");
      setStatus("done");
      setMsg("Premium unlocked! 🎉");
      // Check if the user sent onUnlocked callback
    } else {
      setStatus("error");
      setMsg(result.error || "License key invalid. Check your Gumroad email for the correct key.");
    }
  };

  if (status === "done") {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(8,15,9,0.96)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, marginBottom: 8 }}>Premium Unlocked</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>
            AI Review Generator and Advanced Analytics are now active. Thanks for supporting Resin.
          </div>
          <button onClick={() => { onClose?.(); onUnlocked?.(); }} style={{
            padding: "12px 32px", borderRadius: 24, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, #c2410c, ${C.accent})`, color: "#080502",
            fontSize: 14, fontWeight: 700
          }}>Start exploring</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(8,15,9,0.96)", overflowY: "auto", padding: 20 }}>
      <div style={{ maxWidth: 400, margin: "60px auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>✨ Unlock Premium</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ background: "#0f0a04", borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>You get:</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ fontSize: 12, color: C.muted, padding: "6px 0", borderBottom: "1px solid #1a1a0a" }}>🧠 AI Strain Review Generator</li>
            <li style={{ fontSize: 12, color: C.muted, padding: "6px 0", borderBottom: "1px solid #1a1a0a" }}>📊 Advanced Analytics</li>
            <li style={{ fontSize: 12, color: C.muted, padding: "6px 0" }}>🚀 Priority future features</li>
          </ul>
        </div>

        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.4 }}>
          Purchase at <span style={{ color: C.accent }}>gardenstateau.gumroad.com/l/resin-premium</span> — you'll receive a license key by email. Paste it below.
        </div>

        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Paste your license key here"
          style={{
            width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${C.border}`,
            background: "#0a0500", color: C.text, fontSize: 14, outline: "none",
            marginBottom: 12, boxSizing: "border-box",
          }}
        />

        {status === "error" && (
          <div style={{ fontSize: 12, color: "#f87171", marginBottom: 12, textAlign: "center" }}>{msg}</div>
        )}

        <button onClick={handleSubmit} disabled={status === "verifying"} style={{
          width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
          background: status === "verifying" ? C.muted : `linear-gradient(135deg, #c2410c, ${C.accent})`,
          color: status === "verifying" ? "#080502" : "#080502",
          fontSize: 14, fontWeight: 700, textAlign: "center", transition: "opacity 0.2s",
        }}>
          {status === "verifying" ? "Verifying..." : "Activate Premium"}
        </button>
      </div>
    </div>
  );
}
