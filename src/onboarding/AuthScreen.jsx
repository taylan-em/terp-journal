import { useState } from "react";
import { C } from "../constants/colors";
import { signUp, signIn, signInWithGoogle, signOut, isSupabaseConfigured } from "../lib/supabase";
import LogoMark from "../components/LogoMark";

export default function AuthScreen({ onAuthenticated, onSkip }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        setError("Auth not configured. Add Supabase keys to continue.");
        setLoading(false);
        return;
      }

      const fn = mode === "signup" ? signUp : signIn;
      const { data, error: authError } = await fn(email, password);

      if (authError) {
        const msg = authError.message || "";
        if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("User already")) {
          setError("This email is already registered. Sign in instead.");
        } else {
          setError(msg);
        }
        setLoading(false);
        return;
      }

      // New signup — identities populated means fresh account
      // identities empty = email already taken (Supabase returns user obj anyway)
      if (mode === "signup") {
        if (!data?.user?.identities || data.user.identities.length === 0) {
          setError("This email is already registered. Sign in instead.");
          setLoading(false);
          return;
        }
        // Email confirmation is disabled on Supabase side — proceed immediately
        // (Re-enable this check if email confirmation is turned on in Supabase dashboard)
      }

      onAuthenticated(data?.user);
    } catch (e) {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    if (!isSupabaseConfigured()) {
      setError("Auth not configured.");
      return;
    }
    try {
      await signInWithGoogle();
    } catch (e) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 500, margin: "0 auto", background: C.bg, color: C.text, fontFamily: "system-ui,sans-serif", padding: 24, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <LogoMark size={56} />
          <div style={{ fontSize: 22, fontWeight: 800, color: C.accent, marginTop: 12 }}>Resin</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Your data, synced. Everywhere.</div>
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", marginBottom: 20, background: C.card, borderRadius: 12, padding: 4 }}>
          <button onClick={() => { setMode("signin"); setError(""); }}
            style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
              background: mode === "signin" ? C.accentDim : "transparent",
              color: mode === "signin" ? C.accent : C.muted, fontSize: 13, fontWeight: 600 }}>
            Sign in
          </button>
          <button onClick={() => { setMode("signup"); setError(""); }}
            style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
              background: mode === "signup" ? C.accentDim : "transparent",
              color: mode === "signup" ? C.accent : C.muted, fontSize: 13, fontWeight: 600 }}>
            Sign up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            style={{ width: "100%", padding: "14px", background: C.card, border: `1.5px solid ${C.border}`,
              borderRadius: 12, color: C.text, fontSize: 14, boxSizing: "border-box", marginBottom: 12 }} />

          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            style={{ width: "100%", padding: "14px", background: C.card, border: `1.5px solid ${C.border}`,
              borderRadius: 12, color: C.text, fontSize: 14, boxSizing: "border-box", marginBottom: 12 }} />

          {error && (
            <div style={{ fontSize: 12, color: "#f87171", marginBottom: 12, padding: "8px 12px", background: "#f8717122", borderRadius: 8 }}>{error}</div>
          )}
          {message && (
            <div style={{ fontSize: 12, color: "#6ee7b7", marginBottom: 12, padding: "8px 12px", background: "#6ee7b722", borderRadius: 8 }}>{message}</div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: loading ? "default" : "pointer",
              background: loading ? C.faint : `linear-gradient(135deg,#c2410c,${C.accent})`,
              color: loading ? C.muted : "#080502", fontSize: 15, fontWeight: 700, marginBottom: 12, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Loading..." : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: 11, color: C.muted }}>or</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {/* Google */}
        <button onClick={handleGoogle}
          style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px solid ${C.border}`,
            background: C.card, color: C.text, cursor: "pointer", fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>G</span> Continue with Google
        </button>

        {/* Skip */}
        <button onClick={onSkip}
          style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none",
            background: "transparent", color: C.muted, cursor: "pointer", fontSize: 13 }}>
          Skip — use offline mode
        </button>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: C.faint }}>
          Your data stays encrypted. Nothing is shared.
        </div>
      </div>
      <style>{`*{box-sizing:border-box} input:focus{outline:2px solid #a3e63540!important}`}</style>
    </div>
  );
}
