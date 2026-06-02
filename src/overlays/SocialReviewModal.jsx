import { useState } from "react";
import { C } from "../constants/colors";

const PLATFORMS = [
  { id: "twitter", label: "Twitter/X", icon: "𝕏", maxChars: 280 },
  { id: "reddit",  label: "Reddit",   icon: "🅡", maxChars: 9999 },
  { id: "discord", label: "Discord",  icon: "💬", maxChars: 2000 },
  { id: "leafly",  label: "Leafly",   icon: "🌿", maxChars: 9999 },
  { id: "raw",     label: "Copy Text", icon: "📋", maxChars: 9999 },
];

export default function SocialReviewModal({ strain, reviewData, onClose }) {
  const [platform, setPlatform] = useState("twitter");
  const [copied, setCopied] = useState(false);
  const [editedText, setEditedText] = useState("");

  // Build the auto-generated review text from session data
  const buildReviewText = () => {
    const { sessions, avgRating, avgTaste, topEffects, topFlavors, methods, notes } = reviewData;
    const n = sessions?.length || 0;
    if (n === 0) return "No session data available yet.";

    const ratingLabel = avgRating >= 8 ? "🔥" : avgRating >= 6 ? "👍" : avgRating >= 4 ? "meh" : "👎";
    const words = [];
    
    // Headline
    words.push(`${ratingLabel} ${strain} — ${avgRating}/10`);
    words.push("");
    
    // Stats line
    words.push(`${n} session${n !== 1 ? "s" : ""} logged · ${avgTaste}/10 taste · ${methods}`);
    words.push("");
    
    // Effects + flavours
    if (topEffects) words.push(`Effects: ${topEffects}`);
    if (topFlavors) words.push(`Flavours: ${topFlavors}`);
    words.push("");
    
    // Key takeaway
    if (avgRating >= 8) {
      words.push("This one's a keeper. Smooth, reliable, and hits exactly where you want it.");
    } else if (avgRating >= 6) {
      words.push("Solid strain. Does the job well — worth grabbing if you see it around.");
    } else if (avgRating >= 4) {
      words.push("Decent but nothing special. Wouldn't chase it but wouldn't turn it down.");
    } else {
      words.push("Not my favourite. Effects were underwhelming for the hype.");
    }
    
    // Personal notes teaser
    if (notes && notes.length > 10) {
      words.push("");
      words.push(`My notes: "${notes.slice(0, 150)}${notes.length > 150 ? "..." : ""}"`);
    }

    words.push("");
    words.push("📍 Logged with Resin — strain journal for cannabis consumers");
    
    return words.join("\n");
  };

  const fullText = editedText || buildReviewText();
  
  // Lazy init edited text
  if (!editedText && reviewData) {
    setEditedText(buildReviewText());
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = fullText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToPlatform = () => {
    const text = encodeURIComponent(fullText);
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
        break;
      case "reddit":
        window.open(`https://www.reddit.com/r/trees/submit?title=${encodeURIComponent(`${strain} Review — ${reviewData?.avgRating}/10`)}&selftext=true&text=${text}`, "_blank");
        break;
      default:
        copyToClipboard();
    }
  };

  const currentPlatform = PLATFORMS.find(p => p.id === platform);
  const charCount = fullText.length;
  const overLimit = currentPlatform ? charCount > currentPlatform.maxChars : false;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(8,15,9,0.96)", overflowY: "auto", padding: 20 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>📤 Share Review</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        {/* Platform selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setPlatform(p.id)}
              style={{
                padding: "8px 14px", borderRadius: 20, border: `1px solid ${platform === p.id ? C.accent + "88" : C.border}`,
                background: platform === p.id ? C.accentDim : C.card,
                color: platform === p.id ? C.accent : C.muted,
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6
              }}>
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>

        {/* Character counter */}
        {currentPlatform && currentPlatform.maxChars < 9999 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
            <span style={{ color: C.muted }}>Character limit for {currentPlatform.label}</span>
            <span style={{ color: overLimit ? "#f87171" : C.muted, fontWeight: overLimit ? 700 : 400 }}>
              {charCount}/{currentPlatform.maxChars}
            </span>
          </div>
        )}

        {/* Editable text area */}
        <textarea
          value={editedText}
          onChange={e => setEditedText(e.target.value)}
          rows={12}
          style={{
            width: "100%", padding: "14px", background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 14, color: C.text, fontSize: 13, lineHeight: 1.6,
            resize: "vertical", boxSizing: "border-box", fontFamily: "system-ui, -apple-system, sans-serif",
            marginBottom: 14
          }}
        />

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={copyToClipboard}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`,
              background: "transparent", color: C.text, cursor: "pointer", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
            {copied ? "✅ Copied!" : "📋 Copy"}
          </button>
          {platform !== "raw" && platform !== "discord" && platform !== "leafly" && (
            <button onClick={shareToPlatform}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 12, border: "none",
                background: `linear-gradient(135deg,${C.accent},#c2410c)`, color: "#080502",
                cursor: "pointer", fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
              {currentPlatform?.icon} Share to {currentPlatform?.label}
            </button>
          )}
          {(platform === "discord" || platform === "leafly" || platform === "raw") && (
            <button onClick={() => { copyToClipboard(); }}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 12, border: "none",
                background: `linear-gradient(135deg,${C.accent},#c2410c)`, color: "#080502",
                cursor: "pointer", fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
              📋 Copy & Paste to {currentPlatform?.label}
            </button>
          )}
        </div>

        {/* Quick actions row */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setEditedText(buildReviewText())}
            style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${C.border}`,
              background: "transparent", color: C.muted, cursor: "pointer", fontSize: 11 }}>
            🔄 Reset to auto
          </button>
          <button onClick={() => setEditedText(editedText.split("\n").filter(l => !l.startsWith("📍")).join("\n"))}
            style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${C.border}`,
              background: "transparent", color: C.muted, cursor: "pointer", fontSize: 11 }}>
            ✂️ Remove branding
          </button>
          <button onClick={() => {
            const hashtags = `#${strain.replace(/\s+/g, "")} #CannabisReview #StrainJournal #ResinApp`;
            setEditedText(prev => prev.includes("#") ? prev : prev + "\n\n" + hashtags);
          }}
            style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${C.border}`,
              background: "transparent", color: C.muted, cursor: "pointer", fontSize: 11 }}>
            #️⃣ Add hashtags
          </button>
        </div>

        {/* Preview card — how it looks */}
        <div style={{ marginTop: 16, padding: 14, background: "#1a0f00", borderRadius: 14, border: `1px solid ${C.amber}22` }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
            {platform === "reddit" ? "r/trees preview" : platform === "twitter" ? "Tweet preview" : "Preview"}
          </div>
          <div style={{ fontSize: 12, color: C.text, whiteSpace: "pre-wrap", lineHeight: 1.5, fontFamily: "system-ui, -apple-system, sans-serif" }}>
            {fullText}
          </div>
        </div>
      </div>
    </div>
  );
}
