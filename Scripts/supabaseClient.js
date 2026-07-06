/* ===== SUPABASE CONNECTION CONFIG ===== */
/* This key is the "Publishable" (anon) key - it is safe to expose in
   browser code as long as Row Level Security policies are set up in
   Supabase (which we already did via the SQL Editor). */

const SUPABASE_URL = "https://thjijhbzzjoqesvuwgtw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Lj0MqUpKDOhau7SiwVNszw_SaBRT7Xy";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
