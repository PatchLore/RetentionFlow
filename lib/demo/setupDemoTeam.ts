import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD;

if (!DEMO_EMAIL || !DEMO_PASSWORD) {
  throw new Error(
    "Demo environment variables not set: NEXT_PUBLIC_DEMO_EMAIL and DEMO_USER_PASSWORD required"
  );
}

/**
 * Ensures demo team and user exist
 * Should be called server-side only
 */
export async function ensureDemoTeamAndUser(): Promise<{
  teamId: string;
  userId: string;
}> {
  const supabase = createAdminClient();

  // 1) Find or create demo team
  let { data: demoTeam } = await supabase
    .from("teams")
    .select("id, owner_id")
    .eq("is_demo", true)
    .single();

  if (!demoTeam) {
    // Create a temporary profile first to satisfy foreign key
    // We'll update it after creating the user
    const { data: tempProfile } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .single();

    if (!tempProfile) {
      throw new Error("No profiles exist - cannot create demo team");
    }

    const { data: newTeam, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: "Demo Salon",
        owner_id: tempProfile.id, // Temporary, will update
        is_demo: true,
      })
      .select()
      .single();

    if (teamError || !newTeam) {
      throw new Error(`Failed to create demo team: ${teamError?.message}`);
    }

    demoTeam = newTeam;
  }

  // 2) Find or create demo user
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  let demoUser = authUsers?.users.find((u) => u.email === DEMO_EMAIL);

  if (!demoUser) {
    // Create user via Supabase Auth Admin API
    const { data: newUser, error: userError } =
      await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
      });

    if (userError || !newUser.user) {
      throw new Error(`Failed to create demo user: ${userError?.message}`);
    }

    demoUser = newUser.user;
  }

  // 3) Ensure profile exists and points to demo team
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, team_id, role")
    .eq("id", demoUser.id)
    .single();

  if (!profile) {
    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: demoUser.id,
      team_id: demoTeam.id,
      role: "owner",
      salon_name: "Demo Salon",
    });

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }
  } else {
    // Update existing profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        team_id: demoTeam.id,
        role: "owner",
        salon_name: "Demo Salon",
      })
      .eq("id", demoUser.id);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }
  }

  // 4) Update team owner_id if needed
  if (demoTeam.owner_id !== demoUser.id) {
    const { error: teamUpdateError } = await supabase
      .from("teams")
      .update({ owner_id: demoUser.id })
      .eq("id", demoTeam.id);

    if (teamUpdateError) {
      console.warn(
        `Failed to update team owner: ${teamUpdateError.message}`
      );
    }
  }

  return {
    teamId: demoTeam.id,
    userId: demoUser.id,
  };
}

