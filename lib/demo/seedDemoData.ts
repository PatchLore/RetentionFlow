import { createAdminClient } from "@/lib/supabase/admin";
import { addDays, subDays, format } from "date-fns";

const STYLISTS = ["Chloe", "Amelia", "Sofia"];

const SERVICES = [
  { service_type: "Full Colour", interval_days: 60 },
  { service_type: "Cut & Finish", interval_days: 30 },
  { service_type: "Balayage", interval_days: 90 },
  { service_type: "Blow Dry", interval_days: 14 },
  { service_type: "Highlights", interval_days: 75 },
];

const UK_NAMES = [
  "Emma Thompson",
  "James Wilson",
  "Olivia Brown",
  "William Taylor",
  "Sophie Davies",
  "Thomas Anderson",
  "Charlotte Moore",
  "Daniel Clark",
  "Isabella White",
  "Matthew Harris",
  "Grace Martin",
  "Benjamin Lee",
  "Mia Johnson",
  "Samuel Walker",
  "Lily Hall",
  "Joseph Green",
  "Amelia Young",
  "Henry King",
  "Ella Wright",
  "Alexander Scott",
  "Ruby Turner",
  "David Hill",
  "Chloe Adams",
  "Michael Baker",
  "Zoe Mitchell",
  "Christopher Carter",
  "Lucy Phillips",
  "Joshua Roberts",
  "Hannah Campbell",
  "Andrew Parker",
  "Emily Evans",
  "Ryan Collins",
  "Freya Stewart",
  "Luke Morris",
  "Ava Rogers",
  "Nathan Reed",
  "Maya Cook",
  "Jack Morgan",
  "Lola Bell",
  "Oliver Murphy",
];

/**
 * Seeds demo data for a demo team
 * Wipes existing data and creates fresh demo data
 */
export async function seedDemoDataForTeam(teamId: string): Promise<void> {
  const supabase = createAdminClient();

  // Verify this is a demo team
  const { data: team } = await supabase
    .from("teams")
    .select("is_demo")
    .eq("id", teamId)
    .single();

  if (!team || !team.is_demo) {
    throw new Error("Can only seed data for demo teams");
  }

  // 1) Wipe existing demo data
  // Get all clients for this team
  const { data: existingClients } = await supabase
    .from("clients")
    .select("id")
    .eq("team_id", teamId);

  if (existingClients && existingClients.length > 0) {
    const clientIds = existingClients.map((c) => c.id);

    // Delete followups
    await supabase.from("followups").delete().in("client_id", clientIds);

    // Delete clients
    await supabase.from("clients").delete().eq("team_id", teamId);
  }

  // 2) Insert service rules (if they don't exist)
  for (const service of SERVICES) {
    await supabase
      .from("service_rules")
      .upsert(
        {
          service_type: service.service_type,
          interval_days: service.interval_days,
        },
        { onConflict: "service_type" }
      );
  }

  // 3) Get team members to assign clients
  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id")
    .eq("team_id", teamId);

  const memberIds = teamMembers?.map((m) => m.id) || [];
  const stylists = STYLISTS.slice(0, Math.min(3, memberIds.length || 3));

  // 4) Create clients with realistic data
  const today = new Date();
  const clients = [];
  const followups = [];

  for (let i = 0; i < 35; i++) {
    const name = UK_NAMES[i % UK_NAMES.length];
    const service = SERVICES[i % SERVICES.length];
    const stylist = stylists[i % stylists.length];
    
    // Generate UK phone number format: +44 7XXX XXXXXX
    const phoneSuffix = String(100000000 + i).slice(-9);
    const phone = `+44 7${phoneSuffix.slice(0, 2)} ${phoneSuffix.slice(2, 5)} ${phoneSuffix.slice(5)}`;

    // Vary last_visit dates
    const daysAgo = Math.floor(Math.random() * 120) + 1; // 1-120 days ago
    const lastVisit = subDays(today, daysAgo);
    const nextDue = addDays(lastVisit, service.interval_days);

    // Determine followup status
    let followupStatus: "pending" | "overdue" | "sent" = "pending";
    const daysUntilDue = Math.floor(
      (nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) {
      // Overdue
      followupStatus = Math.random() > 0.3 ? "overdue" : "sent";
    } else if (daysUntilDue === 0) {
      // Due today
      followupStatus = Math.random() > 0.5 ? "pending" : "sent";
    } else if (daysUntilDue <= 7) {
      // Due this week
      followupStatus = Math.random() > 0.7 ? "sent" : "pending";
    }

    clients.push({
      profile_id: memberIds[0] || teamMembers?.[0]?.id, // Assign to first team member
      team_id: teamId,
      name,
      phone,
      service_type: service.service_type,
      last_visit: format(lastVisit, "yyyy-MM-dd"),
      next_due: format(nextDue, "yyyy-MM-dd"),
      stylist,
      notes:
        i % 5 === 0
          ? `Regular client, prefers ${stylist}`
          : i % 7 === 0
          ? "VIP client"
          : null,
    });
  }

  // Insert clients
  const { data: insertedClients, error: clientsError } = await supabase
    .from("clients")
    .insert(clients)
    .select("id, next_due");

  if (clientsError || !insertedClients) {
    throw new Error(`Failed to insert clients: ${clientsError?.message}`);
  }

  // 5) Create followups
  const followupsToInsert = insertedClients.map((client, index) => {
    const originalClient = clients[index];
    const daysUntilDue = Math.floor(
      (new Date(client.next_due).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let status: "pending" | "overdue" | "sent" = "pending";
    if (daysUntilDue < 0) {
      status = Math.random() > 0.3 ? "overdue" : "sent";
    } else if (daysUntilDue === 0) {
      status = Math.random() > 0.5 ? "pending" : "sent";
    } else if (daysUntilDue <= 7) {
      status = Math.random() > 0.7 ? "sent" : "pending";
    }

    return {
      client_id: client.id,
      type: "reminder" as const,
      status,
      date_sent:
        status === "sent"
          ? subDays(today, Math.floor(Math.random() * 7)).toISOString()
          : new Date().toISOString(),
    };
  });

  const { error: followupsError } = await supabase
    .from("followups")
    .insert(followupsToInsert);

  if (followupsError) {
    console.error("Error inserting followups:", followupsError);
    // Don't throw - followups are optional
  }

  console.log(
    `✅ Seeded ${insertedClients.length} clients and ${followupsToInsert.length} followups for demo team ${teamId}`
  );
}

