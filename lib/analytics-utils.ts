import { createClient } from "@/lib/supabase/server";
import { differenceInDays } from "date-fns";

export interface RetentionRateData {
  returningClients: number;
  totalClients: number;
  retentionRate: number;
}

export interface ServiceBreakdownData {
  service_type: string;
  count: number;
  averageCycleDays: number;
}

export interface StylistPerformanceData {
  stylist: string;
  clientCount: number;
  averageCycleDays: number;
}

export interface MissedFollowup {
  client_id: string;
  client_name: string;
  service_type: string;
  next_due: string;
  daysOverdue: number;
  stylist: string | null;
}

/**
 * Calculate retention rate: clients who returned within expected cycle
 */
export async function getRetentionRate(): Promise<RetentionRateData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { returningClients: 0, totalClients: 0, retentionRate: 0 };
  }

  // Get all clients
  const { data: allClients, error: clientsError } = await supabase
    .from("clients")
    .select("id, last_visit, next_due, service_type")
    .eq("profile_id", user.id)
    .not("last_visit", "is", null);

  if (clientsError) {
    console.error("Error fetching clients:", clientsError);
    return { returningClients: 0, totalClients: 0, retentionRate: 0 };
  }

  if (!allClients || allClients.length === 0) {
    return { returningClients: 0, totalClients: 0, retentionRate: 0 };
  }

  // Get service rules to determine expected cycles
  const { data: serviceRules } = await supabase
    .from("service_rules")
    .select("service_type, interval_days");

  if (!serviceRules) {
    return { returningClients: 0, totalClients: allClients.length, retentionRate: 0 };
  }

  const serviceRuleMap = new Map(
    serviceRules.map((rule) => [rule.service_type, rule.interval_days])
  );

  // Count returning clients (those who have a last_visit and returned within expected cycle)
  let returningClients = 0;

  for (const client of allClients) {
    if (!client.last_visit || !client.next_due) continue;

    const expectedInterval = serviceRuleMap.get(client.service_type) || 30;
    const lastVisitDate = new Date(client.last_visit);
    const nextDueDate = new Date(client.next_due);
    const actualCycleDays = differenceInDays(nextDueDate, lastVisitDate);

    // Consider a client as "returning" if they came back within 1.5x the expected interval
    // This accounts for some flexibility in scheduling
    if (actualCycleDays <= expectedInterval * 1.5 && actualCycleDays > 0) {
      returningClients++;
    }
  }

  const retentionRate =
    allClients.length > 0
      ? (returningClients / allClients.length) * 100
      : 0;

  return {
    returningClients,
    totalClients: allClients.length,
    retentionRate: Math.round(retentionRate * 10) / 10,
  };
}

/**
 * Get service breakdown with average cycle length per service
 */
export async function getServiceBreakdown(): Promise<ServiceBreakdownData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get all clients with their service types and visit dates
  const { data: clients, error } = await supabase
    .from("clients")
    .select("service_type, last_visit, next_due")
    .eq("profile_id", user.id)
    .not("last_visit", "is", null)
    .not("next_due", "is", null);

  if (error || !clients) {
    console.error("Error fetching clients for service breakdown:", error);
    return [];
  }

  // Group by service type and calculate averages
  const serviceMap = new Map<string, { count: number; totalDays: number }>();

  for (const client of clients) {
    if (!client.last_visit || !client.next_due) continue;

    const lastVisitDate = new Date(client.last_visit);
    const nextDueDate = new Date(client.next_due);
    const cycleDays = differenceInDays(nextDueDate, lastVisitDate);

    if (cycleDays <= 0) continue;

    const existing = serviceMap.get(client.service_type) || {
      count: 0,
      totalDays: 0,
    };
    serviceMap.set(client.service_type, {
      count: existing.count + 1,
      totalDays: existing.totalDays + cycleDays,
    });
  }

  // Convert to array and calculate averages
  const result: ServiceBreakdownData[] = Array.from(serviceMap.entries()).map(
    ([service_type, data]) => ({
      service_type,
      count: data.count,
      averageCycleDays:
        data.count > 0
          ? Math.round((data.totalDays / data.count) * 10) / 10
          : 0,
    })
  );

  return result.sort((a, b) => b.count - a.count);
}

/**
 * Get stylist performance metrics
 */
export async function getStylistPerformance(): Promise<
  StylistPerformanceData[]
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get all clients with stylist info
  const { data: clients, error } = await supabase
    .from("clients")
    .select("stylist, last_visit, next_due")
    .eq("profile_id", user.id)
    .not("stylist", "is", null)
    .not("last_visit", "is", null)
    .not("next_due", "is", null);

  if (error || !clients) {
    console.error("Error fetching clients for stylist performance:", error);
    return [];
  }

  // Group by stylist
  const stylistMap = new Map<
    string,
    { count: number; totalDays: number }
  >();

  for (const client of clients) {
    if (!client.stylist || !client.last_visit || !client.next_due) continue;

    const lastVisitDate = new Date(client.last_visit);
    const nextDueDate = new Date(client.next_due);
    const cycleDays = differenceInDays(nextDueDate, lastVisitDate);

    if (cycleDays <= 0) continue;

    const existing = stylistMap.get(client.stylist) || {
      count: 0,
      totalDays: 0,
    };
    stylistMap.set(client.stylist, {
      count: existing.count + 1,
      totalDays: existing.totalDays + cycleDays,
    });
  }

  // Convert to array
  const result: StylistPerformanceData[] = Array.from(
    stylistMap.entries()
  ).map(([stylist, data]) => ({
    stylist,
    clientCount: data.count,
    averageCycleDays:
      data.count > 0
        ? Math.round((data.totalDays / data.count) * 10) / 10
        : 0,
  }));

  return result.sort((a, b) => b.clientCount - a.clientCount);
}

/**
 * Get clients with missed follow-ups (past due date with no completed followup)
 */
export async function getMissedFollowups(): Promise<MissedFollowup[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const today = new Date().toISOString().split("T")[0];

  // Get all overdue clients
  const { data: overdueClients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name, service_type, next_due, stylist")
    .eq("profile_id", user.id)
    .lt("next_due", today)
    .not("next_due", "is", null);

  if (clientsError || !overdueClients) {
    console.error("Error fetching overdue clients:", clientsError);
    return [];
  }

  // Get all sent followups for these clients
  const clientIds = overdueClients.map((c) => c.id);
  const { data: sentFollowups } = await supabase
    .from("followups")
    .select("client_id")
    .in("client_id", clientIds)
    .eq("status", "sent");

  const sentFollowupClientIds = new Set(
    sentFollowups?.map((f) => f.client_id) || []
  );

  // Filter to only clients without sent followups
  const missedFollowups: MissedFollowup[] = overdueClients
    .filter((client) => !sentFollowupClientIds.has(client.id))
    .map((client) => {
      const nextDueDate = new Date(client.next_due!);
      const todayDate = new Date();
      const daysOverdue = differenceInDays(todayDate, nextDueDate);

      return {
        client_id: client.id,
        client_name: client.name,
        service_type: client.service_type,
        next_due: client.next_due!,
        daysOverdue,
        stylist: client.stylist,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  return missedFollowups;
}

