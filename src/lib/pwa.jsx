// PWA install banner and offline indicator
import { useState, useEffect } from "react";
import { C } from "../constants/colors";

let installPrompt = null;

// Listen for the beforeinstallprompt event
export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      installPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    installPrompt = null;
    setCanInstall(false);
    return outcome;
  };

  return { canInstall, install };
}

// Detect offline status
export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const go = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", go);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", go);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

// Install banner component
export function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 150,
      background: `linear-gradient(135deg, ${C.card}, #1a0a00)`,
      border: `2px solid ${C.accent}44`, borderRadius: 16,
      padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
      boxShadow: `0 8px 30px rgba(0,0,0,0.5)`, maxWidth: 380, width: "calc(100% - 32px)"
    }}>
      <div style={{ fontSize: 28 }}>📱</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>Install Resin</div>
        <div style={{ fontSize: 11, color: C.muted }}>Add to home screen for quick access</div>
      </div>
      <button onClick={onInstall} style={{
        padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer",
        background: `linear-gradient(135deg,#c2410c,${C.accent})`, color: "#080502",
        fontSize: 12, fontWeight: 700, fontFamily: "system-ui", whiteSpace: "nowrap"
      }}>
        Install
      </button>
      <button onClick={onDismiss} style={{
        padding: "4px", border: "none", background: "transparent", color: C.faint,
        cursor: "pointer", fontSize: 16
      }}>✕</button>
    </div>
  );
}

// Offline indicator
export function OfflineIndicator() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: "#f59e0b", color: "#080502", textAlign: "center",
      padding: "4px", fontSize: 11, fontWeight: 600
    }}>
      Offline — changes saved locally, sync when reconnected
    </div>
  );
}
