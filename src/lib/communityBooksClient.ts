import { createClient } from "@supabase/supabase-js";

// Read-only Supabase client targeting the "Kawan Baca V 1.0" project.
// Uses the public anon key — RLS on community_books restricts mutations.
const SUPABASE_URL = "https://lsuxhhiptpqcemxuddcu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdXhoaGlwdHBxY2VteHVkZGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTY0NjcsImV4cCI6MjA5MDE5MjQ2N30.wfVKiy34W_NREjcxVCYCHWRw43KAjz6L6rwy75dMqCA";

export const kawanBacaSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
