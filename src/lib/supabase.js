// Supabase client — plug in your project URL and anon key
// Create a free project at https://supabase.com

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

let supabase = null;

export async function getSupabase() {
  if (supabase) return supabase;
  const { createClient } = await import("@supabase/supabase-js");
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

export function isSupabaseConfigured() {
  return (
    SUPABASE_URL !== "https://YOUR_PROJECT.supabase.co" &&
    SUPABASE_ANON_KEY !== "your-anon-key"
  );
}

// ── Auth helpers ──────────────────────────────────────────────────────────

export async function signUp(email, password) {
  const sb = await getSupabase();
  return sb.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + "/auth/callback"
    }
  });
}

export async function signIn(email, password) {
  const sb = await getSupabase();
  return sb.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  const sb = await getSupabase();
  return sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/auth/callback" }
  });
}

export async function signOut() {
  const sb = await getSupabase();
  return sb.auth.signOut();
}

export async function getSession() {
  const sb = await getSupabase();
  return sb.auth.getSession();
}

export async function getUser() {
  const sb = await getSupabase();
  return sb.auth.getUser();
}

// ── Data sync helpers ─────────────────────────────────────────────────────

export async function syncSessions(sessions) {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  // Upsert all sessions keyed by id
  const rows = sessions.map(s => ({
    id: s.id,
    user_id: user.id,
    data: s,
    updated_at: new Date().toISOString()
  }));

  const { error } = await sb.from("sessions").upsert(rows, { onConflict: "id" });
  if (error) console.error("syncSessions error:", error);
  return !error;
}

export async function fetchSessions() {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];

  const { data, error } = await sb
    .from("sessions")
    .select("data")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) { console.error("fetchSessions error:", error); return []; }
  return (data || []).map(r => r.data);
}

export async function syncProfile(profile) {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  const { error } = await sb.from("profiles").upsert({
    user_id: user.id,
    data: profile,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });

  if (error) console.error("syncProfile error:", error);
  return !error;
}

export async function fetchProfile() {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data, error } = await sb
    .from("profiles")
    .select("data")
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data?.data;
}

export async function syncReviews(myReviews) {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  const { error } = await sb.from("reviews").upsert({
    user_id: user.id,
    data: myReviews,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });

  if (error) console.error("syncReviews error:", error);
  return !error;
}

export async function fetchReviews() {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return {};

  const { data, error } = await sb
    .from("reviews")
    .select("data")
    .eq("user_id", user.id)
    .single();

  if (error) return {};
  return data?.data || {};
}
