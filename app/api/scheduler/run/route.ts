import { NextResponse } from "next/server";
import {
  getClientsDueToday,
  getOverdueClients,
  createPendingFollowups,
  updateFollowupsToOverdue,
} from "@/lib/followups";

export const dynamic = "force-dynamic";

/**
 * Scheduler API route that:
 * 1. Fetches clients where next_due = today
 * 2. Creates followup records with type="reminder" and status="pending"
 * 3. Fetches overdue clients (next_due < today)
 * 4. Updates their followups to status="overdue"
 */
export async function GET() {
  const startTime = Date.now();
  console.log("[scheduler] Starting scheduler run at", new Date().toISOString());

  try {
    // Step 1: Fetch clients due today
    console.log("[scheduler] Fetching clients due today...");
    const clientsDueToday = await getClientsDueToday();
    console.log(
      `[scheduler] Found ${clientsDueToday.length} clients due today`
    );

    // Step 2: Create pending followups for clients due today
    let createdFollowups = 0;
    if (clientsDueToday.length > 0) {
      const clientIds = clientsDueToday.map((client) => client.id);
      console.log(
        `[scheduler] Creating pending followups for ${clientIds.length} clients...`
      );
      const followups = await createPendingFollowups(clientIds, "reminder");
      createdFollowups = followups.length;
      console.log(
        `[scheduler] Created ${createdFollowups} pending followup records`
      );
    }

    // Step 3: Fetch overdue clients
    console.log("[scheduler] Fetching overdue clients...");
    const overdueClients = await getOverdueClients();
    console.log(`[scheduler] Found ${overdueClients.length} overdue clients`);

    // Step 4: Update followups to overdue status
    let updatedToOverdue = 0;
    if (overdueClients.length > 0) {
      const overdueClientIds = overdueClients.map((client) => client.id);
      console.log(
        `[scheduler] Updating followups to overdue for ${overdueClientIds.length} clients...`
      );
      updatedToOverdue = await updateFollowupsToOverdue(overdueClientIds);
      console.log(
        `[scheduler] Updated ${updatedToOverdue} followups to overdue status`
      );
    }

    const duration = Date.now() - startTime;
    console.log(
      `[scheduler] Scheduler run completed in ${duration}ms`,
      new Date().toISOString()
    );

    // Return JSON summary
    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        summary: {
          clients_due_today: clientsDueToday.length,
          followups_created: createdFollowups,
          overdue_clients: overdueClients.length,
          followups_updated_to_overdue: updatedToOverdue,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[scheduler] Error during scheduler run:", error);
    console.log(
      `[scheduler] Scheduler run failed after ${duration}ms`,
      new Date().toISOString()
    );

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

