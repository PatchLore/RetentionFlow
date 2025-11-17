import { createAdminClient } from "@/lib/supabase/admin";
import { Client, Followup } from "@/lib/types";

/**
 * Fetches all clients where next_due equals today's date
 */
export async function getClientsDueToday(): Promise<Client[]> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("next_due", today);

  if (error) {
    console.error("[followups] Error fetching clients due today:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches all clients where next_due is before today (overdue)
 */
export async function getOverdueClients(): Promise<Client[]> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .lt("next_due", today);

  if (error) {
    console.error("[followups] Error fetching overdue clients:", error);
    throw error;
  }

  return data || [];
}

/**
 * Creates a followup record with status="pending" for a client
 */
export async function createPendingFollowup(
  clientId: string,
  type: "reminder" | "birthday" | "review" = "reminder"
): Promise<Followup | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("followups")
    .insert({
      client_id: clientId,
      type,
      status: "pending",
      date_sent: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error(
      `[followups] Error creating pending followup for client ${clientId}:`,
      error
    );
    throw error;
  }

  return data;
}

/**
 * Creates multiple pending followup records
 */
export async function createPendingFollowups(
  clientIds: string[],
  type: "reminder" | "birthday" | "review" = "reminder"
): Promise<Followup[]> {
  const supabase = createAdminClient();

  const followupsToInsert = clientIds.map((clientId) => ({
    client_id: clientId,
    type,
    status: "pending" as const,
    date_sent: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("followups")
    .insert(followupsToInsert)
    .select();

  if (error) {
    console.error("[followups] Error creating pending followups:", error);
    throw error;
  }

  return data || [];
}

/**
 * Updates followup records to status="overdue" for a list of client IDs
 */
export async function updateFollowupsToOverdue(
  clientIds: string[]
): Promise<number> {
  if (clientIds.length === 0) {
    return 0;
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("followups")
    .update({ status: "overdue" })
    .in("client_id", clientIds)
    .eq("status", "pending")
    .select();

  if (error) {
    console.error("[followups] Error updating followups to overdue:", error);
    throw error;
  }

  return data?.length || 0;
}

/**
 * Gets all pending followups for a list of client IDs
 */
export async function getPendingFollowupsForClients(
  clientIds: string[]
): Promise<Followup[]> {
  if (clientIds.length === 0) {
    return [];
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("followups")
    .select("*")
    .in("client_id", clientIds)
    .eq("status", "pending");

  if (error) {
    console.error(
      "[followups] Error fetching pending followups for clients:",
      error
    );
    throw error;
  }

  return data || [];
}

