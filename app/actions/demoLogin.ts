"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureDemoTeamAndUser } from "@/lib/demo/setupDemoTeam";
import { seedDemoDataForTeam } from "@/lib/demo/seedDemoData";
import { redirect } from "next/navigation";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD;

export async function handleDemoLogin() {
  if (!DEMO_EMAIL || !DEMO_PASSWORD) {
    throw new Error("Demo credentials not configured");
  }

  try {
    // Ensure demo team and user exist
    const { teamId } = await ensureDemoTeamAndUser();

    // Check if demo data needs seeding (only seed if no clients exist)
    const supabase = await createClient();
    const { count } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("team_id", teamId);

    if (count === 0) {
      // Seed demo data
      await seedDemoDataForTeam(teamId);
    }

    // Sign in as demo user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    if (signInError) {
      throw new Error(`Failed to sign in: ${signInError.message}`);
    }

    // Redirect to dashboard
    redirect("/dashboard");
  } catch (error) {
    console.error("Demo login error:", error);
    throw error;
  }
}

