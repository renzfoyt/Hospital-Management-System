/* ===== SUPABASE CONNECTION CONFIG ===== */
/* This key is the "Publishable" (anon) key - it is safe to expose in
   browser code as long as Row Level Security policies are set up in
   Supabase (which we already did via the SQL Editor). */

const SUPABASE_URL = "https://kkpjqxyzvjjhrieyplhf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yQvLlBy5nn2l9wfJtEguNA_ZzB141en";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
