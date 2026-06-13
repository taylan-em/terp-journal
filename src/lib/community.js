// Community feed + leaderboard data helpers
// Works with Supabase when configured, falls back to sample data

let _sb = null;
async function getSB() {
  if (_sb) return _sb;
  const { getSupabase } = await import("./supabase");
  _sb = await getSupabase();
  return _sb;
}
async function checkSBConfig() {
  const { isSupabaseConfigured } = await import("./supabase");
  return isSupabaseConfigured();
}

// ── Sample community reviews ────────────────────────────────────────────
const SAMPLE_REVIEWS = [
  { id: "cr1", strain: "Blue Dream", user_alias: "CloudChaser_42", rating: 8, method: "Dry vape 185°C", text: "Smooth creative energy. No anxiety creep. Perfect afternoon strain — productive with a warm comedown.", created_at: "2026-05-28T14:00:00Z" },
  { id: "cr2", strain: "Gorilla Glue #4", user_alias: "nightowl_melb", rating: 9, method: "Joint", text: "Absolute couch magnet. Best sleep aid I've found. Wake up without grogginess too.", created_at: "2026-05-28T22:30:00Z" },
  { id: "cr3", strain: "Sour Diesel", user_alias: "green_thumb_aus", rating: 7, method: "Bong", text: "Sharp energy hit. Great for morning, but can get jittery if you overdo it. Two hits is the sweet spot.", created_at: "2026-05-27T08:15:00Z" },
  { id: "cr4", strain: "Granddaddy Purple", user_alias: "Driftwood_Dan", rating: 9, method: "Joint", text: "Pure relaxation. Deep grape flavour, heavy body high. This is a night-time only strain for me.", created_at: "2026-05-27T21:00:00Z" },
  { id: "cr5", strain: "Wedding Cake", user_alias: "coastal_sesh", rating: 8, method: "Vaporiser 190°C", text: "Rich vanilla notes through the vape. Euphoric without being spacey. Good for social settings.", created_at: "2026-05-26T19:45:00Z" },
  { id: "cr6", strain: "Jack Herer", user_alias: "morning_ritual", rating: 8, method: "Joint", text: "Clear-headed creative spark. My go-to for writing and music. Lasts about 2 hours before a gentle fade.", created_at: "2026-05-26T10:00:00Z" },
  { id: "cr7", strain: "Zkittlez", user_alias: "fruit_chaser", rating: 9, method: "Dry vape 175°C", text: "Tastes exactly like the candy. Smooth, happy, perfect wind-down strain. Lowers anxiety without sedation.", created_at: "2026-05-25T20:30:00Z" },
  { id: "cr8", strain: "Northern Lights", user_alias: "insomniac_gone", rating: 8, method: "Joint", text: "Classic for a reason. 20 minutes and I'm out cold. No racing thoughts, just peaceful sleep.", created_at: "2026-05-25T23:00:00Z" },
  { id: "cr9", strain: "Pineapple Express", user_alias: "tropics_only", rating: 7, method: "Vaporiser", text: "Tropical vibes. Long-lasting energy — good for hikes and outdoor stuff. Munchies hit hard though.", created_at: "2026-05-24T15:00:00Z" },
  { id: "cr10", strain: "Girl Scout Cookies", user_alias: "bake_master", rating: 9, method: "Joint", text: "Powerful euphoria. Full body relaxation without couch lock. Perfect for movies and creative sessions.", created_at: "2026-05-24T18:30:00Z" },
  { id: "cr11", strain: "Blue Dream", user_alias: "arvo_delight", rating: 7, method: "Joint", text: "Reliable afternoon strain. Good balance of energy and calm. Tastes great, smooth smoke.", created_at: "2026-05-23T16:00:00Z" },
  { id: "cr12", strain: "Gorilla Glue #4", user_alias: "pain_free_days", rating: 8, method: "Vaporiser 195°C", text: "Best pain relief I've found. Heavy body effect without the mental fog of other indicas. Game changer.", created_at: "2026-05-23T20:00:00Z" },
  { id: "cr13", strain: "Mimosa", user_alias: "sunrise_haze", rating: 8, method: "Joint", text: "Bright citrus. Instant mood lift. Great breakfast strain — pairs well with coffee and morning walks.", created_at: "2026-05-22T07:30:00Z" },
  { id: "cr14", strain: "Gelato", user_alias: "dessert_first", rating: 8, method: "Dry vape 185°C", text: "Sweet and smooth. Balanced hybrid perfection. Euphoric but functional. This is my daily driver.", created_at: "2026-05-22T17:00:00Z" },
  { id: "cr15", strain: "Granddaddy Purple", user_alias: "GDP_fanatic", rating: 10, method: "Joint", text: "Desert island strain. Nothing beats the grape-berry flavour and the deep, warm body high. Sleep guaranteed.", created_at: "2026-05-21T21:30:00Z" },
];

const SAMPLE_LEADERBOARD = [
  { strain: "Blue Dream", type: "Hybrid", avg_rating: 7.8, log_count: 142 },
  { strain: "Gorilla Glue #4", type: "Hybrid", avg_rating: 8.5, log_count: 127 },
  { strain: "Granddaddy Purple", type: "Indica", avg_rating: 9.2, log_count: 98 },
  { strain: "Gelato", type: "Hybrid", avg_rating: 8.3, log_count: 115 },
  { strain: "Sour Diesel", type: "Sativa", avg_rating: 7.6, log_count: 133 },
  { strain: "Zkittlez", type: "Indica", avg_rating: 8.7, log_count: 91 },
  { strain: "Wedding Cake", type: "Hybrid", avg_rating: 8.1, log_count: 104 },
  { strain: "Girl Scout Cookies", type: "Hybrid", avg_rating: 8.9, log_count: 109 },
  { strain: "Jack Herer", type: "Sativa", avg_rating: 7.9, log_count: 88 },
  { strain: "Northern Lights", type: "Indica", avg_rating: 8.2, log_count: 96 },
];

// ── API ──────────────────────────────────────────────────────────────────

export async function fetchCommunityFeed(limit = 20) {
  if (!checkSBConfig()) {
    return SAMPLE_REVIEWS.slice(0, limit);
  }
  try {
    const sb = await getSB();
    const { data, error } = await sb
      .from("community_reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  } catch {
    return SAMPLE_REVIEWS.slice(0, limit);
  }
}

export async function fetchLeaderboard(sort = "log_count", filter = null) {
  if (!checkSBConfig()) {
    let result = [...SAMPLE_LEADERBOARD];
    if (filter === "sativa") result = result.filter(s => s.type === "Sativa");
    if (filter === "indica") result = result.filter(s => s.type === "Indica");
    if (filter === "hybrid") result = result.filter(s => s.type === "Hybrid");
    if (filter === "relaxation") result.sort((a, b) => b.avg_rating - a.avg_rating);
    if (sort === "log_count") result.sort((a, b) => b.log_count - a.log_count);
    if (sort === "avg_rating") result.sort((a, b) => b.avg_rating - a.avg_rating);
    return result;
  }
  try {
    const sb = await getSB();
    let query = sb.from("strain_leaderboard").select("*");
    if (filter) query = query.eq("category", filter);
    query = query.order(sort, { ascending: false }).limit(20);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch {
    return SAMPLE_LEADERBOARD;
  }
}

export async function submitCommunityReview(review) {
  if (!checkSBConfig()) return { success: false, error: "Community not configured" };
  try {
    const sb = await getSB();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return { success: false, error: "Sign in to post reviews" };
    const { error } = await sb.from("community_reviews").insert({
      ...review,
      user_id: user.id,
      created_at: new Date().toISOString()
    });
    if (error) throw error;
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
