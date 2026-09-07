import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/api";

// Supabase browser keys are intentionally public and must be protected by RLS.
// Environment configuration is preferred; the current published anon key is a
// compatibility fallback until the backend/config migration is complete.
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rb2NudWZ3bXNmY2hpdmZiaHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMjcyNjUsImV4cCI6MjA5OTgwMzI2NX0.6SQI1J1ojAiKkfPzZZVh-3UyPlaaqv-Gxw4qYP9FPxs";

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? FALLBACK_ANON_KEY;

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
