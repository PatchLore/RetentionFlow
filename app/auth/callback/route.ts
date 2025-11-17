import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // No code → redirect to login
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  // Prepare response with cookies enabled
  const response = NextResponse.redirect(new URL("/dashboard", request.url));

  // Create SSR supabase client that can set cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  // Exchange the code for a session (sets the cookie)
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth exchange error:", error);
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  return response;
}

