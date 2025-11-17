import { createClient } from "@/lib/supabase/server";

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  email: string;
  role: "owner" | "stylist";
  salon_name: string | null;
  team_id: string | null;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: "owner" | "stylist";
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

/**
 * Get current user's team information
 */
export async function getCurrentUserTeam(): Promise<Team | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user's profile with team_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.team_id) {
    return null;
  }

  // Get team details
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", profile.team_id)
    .single();

  return team || null;
}

/**
 * Get all members of the current user's team
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get user's team_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.team_id) {
    return [];
  }

  // Get all team members
  const { data: members } = await supabase
    .from("profiles")
    .select("id, role, salon_name, team_id")
    .eq("team_id", profile.team_id);

  if (!members) {
    return [];
  }

  // Get emails from auth.users
  const memberIds = members.map((m) => m.id);
  const { data: authUsers } = await supabase.auth.admin.listUsers();

  const membersWithEmail: TeamMember[] = members.map((member) => {
    const authUser = authUsers?.users.find((u) => u.id === member.id);
    return {
      id: member.id,
      email: authUser?.email || "Unknown",
      role: member.role as "owner" | "stylist",
      salon_name: member.salon_name,
      team_id: member.team_id,
    };
  });

  return membersWithEmail;
}

/**
 * Create a new team
 */
export async function createTeam(name: string): Promise<Team | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Create team
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      name,
      owner_id: user.id,
    })
    .select()
    .single();

  if (teamError || !team) {
    console.error("Error creating team:", teamError);
    throw teamError || new Error("Failed to create team");
  }

  // Update user's profile with team_id and role
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      team_id: team.id,
      role: "owner",
      salon_name: name,
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    // Rollback team creation
    await supabase.from("teams").delete().eq("id", team.id);
    throw profileError;
  }

  return team;
}

/**
 * Get pending invitations for the current user's team
 */
export async function getTeamInvitations(): Promise<TeamInvitation[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get user's team_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.team_id) {
    return [];
  }

  // Get invitations (only owners can see all, stylists see their own)
  const query = supabase
    .from("team_invitations")
    .select("*")
    .eq("team_id", profile.team_id)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  const { data: invitations } = await query;

  return invitations || [];
}

/**
 * Create a team invitation
 */
export async function createTeamInvitation(
  email: string,
  role: "owner" | "stylist" = "stylist"
): Promise<TeamInvitation | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Verify user is team owner
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "owner" || !profile.team_id) {
    throw new Error("Only team owners can invite members");
  }

  // Create invitation
  const { data: invitation, error } = await supabase
    .from("team_invitations")
    .insert({
      team_id: profile.team_id,
      email,
      role,
      invited_by: user.id,
    })
    .select()
    .single();

  if (error || !invitation) {
    console.error("Error creating invitation:", error);
    throw error || new Error("Failed to create invitation");
  }

  return invitation;
}

/**
 * Accept a team invitation
 */
export async function acceptTeamInvitation(
  invitationId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get invitation
  const { data: invitation, error: inviteError } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("id", invitationId)
    .single();

  if (inviteError || !invitation) {
    throw new Error("Invitation not found");
  }

  // Verify email matches
  if (invitation.email !== user.email) {
    throw new Error("Invitation email does not match");
  }

  // Verify not expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error("Invitation has expired");
  }

  // Update invitation
  const { error: updateError } = await supabase
    .from("team_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitationId);

  if (updateError) {
    throw updateError;
  }

  // Update user's profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      team_id: invitation.team_id,
      role: invitation.role,
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    throw profileError;
  }

  return true;
}

/**
 * Remove a team member (owner only)
 */
export async function removeTeamMember(memberId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Verify user is team owner
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "owner" || !profile.team_id) {
    throw new Error("Only team owners can remove members");
  }

  // Verify member is in same team
  const { data: member } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", memberId)
    .single();

  if (!member || member.team_id !== profile.team_id) {
    throw new Error("Member not found in team");
  }

  // Remove member from team
  const { error } = await supabase
    .from("profiles")
    .update({
      team_id: null,
      role: "owner", // Reset to owner for their own account
    })
    .eq("id", memberId);

  if (error) {
    throw error;
  }

  return true;
}

