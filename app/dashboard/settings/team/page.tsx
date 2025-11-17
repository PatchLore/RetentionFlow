"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Plus, Trash2, Mail } from "lucide-react";

interface TeamMember {
  id: string;
  email: string;
  role: "owner" | "stylist";
}

interface TeamInvitation {
  id: string;
  email: string;
  role: "owner" | "stylist";
  created_at: string;
}

export default function TeamPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "stylist">("stylist");

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("team_id, role, salon_name")
      .eq("id", user.id)
      .single();

    if (profile) {
      setIsOwner(profile.role === "owner");
      setTeamName(profile.salon_name || "");

      if (profile.team_id) {
        setTeamId(profile.team_id);
        loadTeamMembers(profile.team_id);
        loadInvitations(profile.team_id);
      }
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    const { data: members } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("team_id", teamId);

    if (!members) return;

    // For now, we'll show member IDs. In production, you'd want to store emails
    // in the profiles table or use a server-side API route with admin access
    const membersWithEmail: TeamMember[] = members.map((member) => {
      return {
        id: member.id,
        email: `User ${member.id.substring(0, 8)}...`, // Placeholder
        role: member.role as "owner" | "stylist",
      };
    });

    setMembers(membersWithEmail);
  };

  const loadInvitations = async (teamId: string) => {
    const { data: invs } = await supabase
      .from("team_invitations")
      .select("*")
      .eq("team_id", teamId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (invs) {
      setInvitations(
        invs.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role as "owner" | "stylist",
          created_at: inv.created_at,
        }))
      );
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create team
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: teamName,
          owner_id: user.id,
        })
        .select()
        .single();

      if (teamError || !team) throw teamError || new Error("Failed to create team");

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          team_id: team.id,
          role: "owner",
          salon_name: teamName,
        })
        .eq("id", user.id);

      if (profileError) {
        await supabase.from("teams").delete().eq("id", team.id);
        throw profileError;
      }

      setTeamId(team.id);
      setIsOwner(true);
      await loadTeamMembers(team.id);
    } catch (error) {
      console.error("Error creating team:", error);
      alert(error instanceof Error ? error.message : "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !teamId) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: invitation, error } = await supabase
        .from("team_invitations")
        .insert({
          team_id: teamId,
          email: inviteEmail.trim(),
          role: inviteRole,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error || !invitation) {
        throw error || new Error("Failed to create invitation");
      }

      setInviteEmail("");
      setInviteDialogOpen(false);
      await loadInvitations(teamId);
    } catch (error) {
      console.error("Error creating invitation:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          team_id: null,
          role: "owner",
        })
        .eq("id", memberId);

      if (error) throw error;

      if (teamId) {
        await loadTeamMembers(teamId);
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("team_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      if (teamId) {
        await loadInvitations(teamId);
      }
    } catch (error) {
      console.error("Error deleting invitation:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Team Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your salon team and invite stylists
          </p>
        </div>

        {!teamId ? (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Create Your Team</CardTitle>
              <CardDescription className="text-gray-600">
                Set up a team to share clients with your stylists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="teamName">Salon/Team Name</Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g., Beautiful Hair Salon"
                  />
                </div>
                <Button onClick={handleCreateTeam} disabled={loading} className="font-semibold">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Team Info */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{teamName}</CardTitle>
                <CardDescription className="text-gray-600">Team ID: {teamId}</CardDescription>
              </CardHeader>
            </Card>

            {/* Team Members */}
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">Team Members</CardTitle>
                    <CardDescription className="text-gray-600">
                      {members.length} member{members.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  {isOwner && (
                    <Button
                      onClick={() => setInviteDialogOpen(true)}
                      size="sm"
                      className="font-semibold"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Invite Member
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No team members yet
                  </p>
                ) : (
                  <div className="rounded-xl border-2 border-purple-100 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          {isOwner && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              {member.email}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  member.role === "owner"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {member.role}
                              </span>
                            </TableCell>
                            {isOwner && member.role !== "owner" && (
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Invitations */}
            {isOwner && invitations.length > 0 && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Pending Invitations</CardTitle>
                  <CardDescription className="text-gray-600">
                    {invitations.length} pending invitation
                    {invitations.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border-2 border-purple-100 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Invited</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitations.map((invitation) => (
                          <TableRow key={invitation.id}>
                            <TableCell className="font-medium">
                              {invitation.email}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  invitation.role === "owner"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {invitation.role}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(invitation.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteInvitation(invitation.id)
                                }
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="inviteEmail">Email</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="stylist@example.com"
                />
              </div>
              <div>
                <Label htmlFor="inviteRole">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(value) =>
                    setInviteRole(value as "owner" | "stylist")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stylist">Stylist</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                  className="font-semibold"
                >
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={loading} className="font-semibold">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

