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
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>✨ Resin Premium</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.accent, marginBottom: 2 }}>$5.99<span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}> AUD/month</span></div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>or $49 AUD/year (30% off)</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Everything in free, plus:</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ fontSize: 12, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>🧠 Unlimited AI personal reviews per strain</li>
            <li style={{ fontSize: 12, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>☁️ Cloud sync — your data on all devices</li>
            <li style={{ fontSize: 12, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>📊 Tolerance curve & effect correlations</li>
            <li style={{ fontSize: 12, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>📤 Full data export (JSON, CSV)</li>
            <li style={{ fontSize: 12, color: C.muted, padding: "6px 0" }}>🔮 Early access to new features</li>
          </ul>
        </div>

        <a href="https://gardenstateau.gumroad.com/l/resin-premium" target="_blank" rel="noopener noreferrer"
          style={{ display: "block", width: "100%", padding: "12px", borderRadius: 12, border: `2px solid ${C.accent}`,
            background: "transparent", color: C.accent, fontSize: 14, fontWeight: 700, cursor: "pointer",
            textAlign: "center", textDecoration: "none", marginBottom: 20, boxSizing: "border-box" }}>
          🛒 Buy Resin Premium — $5.99 AUD/mo
        </a>

        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.faint, marginBottom: 4 }}>Already purchased?</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
            Check your email from Gumroad for a license key
          </div>
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
