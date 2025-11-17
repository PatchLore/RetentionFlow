import { createClient } from "@/lib/supabase/server";
import { Client } from "./types";
import { differenceInDays, isPast, isToday, addDays } from "date-fns";

export async function getDueClients(daysAhead: number = 7): Promise<Client[]> {
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

  const today = new Date();
  const futureDate = addDays(today, daysAhead);

  // Build query - include own clients and team clients
  let query = supabase
    .from("clients")
    .select("*")
    .lte("next_due", futureDate.toISOString().split("T")[0])
    .order("next_due", { ascending: true });

  if (profile?.team_id) {
    // Include own clients OR team clients
    query = query.or(`profile_id.eq.${user.id},team_id.eq.${profile.team_id}`);
  } else {
    // Only own clients
    query = query.eq("profile_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching due clients:", error);
    return [];
  }

  return data || [];
}

export async function getTodaysFollowUps(): Promise<Client[]> {
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

  const today = new Date().toISOString().split("T")[0];

  // Build query - include own clients and team clients
  let query = supabase
    .from("clients")
    .select("*")
    .eq("next_due", today)
    .order("name", { ascending: true });

  if (profile?.team_id) {
    // Include own clients OR team clients
    query = query.or(`profile_id.eq.${user.id},team_id.eq.${profile.team_id}`);
  } else {
    // Only own clients
    query = query.eq("profile_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching today's follow-ups:", error);
    return [];
  }

  return data || [];
}

export function getDaysUntilDue(nextDue: string | null): number | null {
  if (!nextDue) return null;
  const dueDate = new Date(nextDue);
  return differenceInDays(dueDate, new Date());
}

export function isOverdue(nextDue: string | null): boolean {
  if (!nextDue) return false;
  const dueDate = new Date(nextDue);
  return isPast(dueDate) && !isToday(dueDate);
}

