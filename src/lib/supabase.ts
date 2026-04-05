import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project credentials
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://fzngguifdmknaffiglio.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_Co55U87oSt8Vr8jqy0yk-A_wGTzjcZ6";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
