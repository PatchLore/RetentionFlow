import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, return a mock client to avoid build errors
    // The actual error will be caught at runtime
    if (typeof window === "undefined") {
      // Server-side build: return a mock client
      return createBrowserClient(
        "https://placeholder.supabase.co",
        "placeholder-anon-key"
      );
    }
    throw new Error("Missing Supabase environment variables. Please check your .env.local file.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

