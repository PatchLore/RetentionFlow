import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client using the service role key.
 * This bypasses Row Level Security and should only be used server-side.
 * NEVER expose the service role key to the client.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

