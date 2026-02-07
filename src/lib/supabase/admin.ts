import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client using service role key.
 * Bypasses RLS — use ONLY for system-level operations (auto-provisioning, migrations).
 * NEVER expose to client-side code.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
