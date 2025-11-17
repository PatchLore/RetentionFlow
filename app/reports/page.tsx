export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { RetentionRateChart } from "@/components/reports/retention-rate-chart";
import { ServiceBreakdownChart } from "@/components/reports/service-breakdown-chart";
import { StylistPerformanceChart } from "@/components/reports/stylist-performance-chart";
import { MissedFollowupsTable } from "@/components/reports/missed-followups-table";
import {
  getRetentionRate,
  getServiceBreakdown,
  getStylistPerformance,
  getMissedFollowups,
} from "@/lib/analytics-utils";
import { BarChart3 } from "lucide-react";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all analytics data in parallel
  const [
    retentionData,
    serviceBreakdown,
    stylistPerformance,
    missedFollowups,
  ] = await Promise.all([
    getRetentionRate(),
    getServiceBreakdown(),
    getStylistPerformance(),
    getMissedFollowups(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Reports</h1>
          <p className="text-gray-600 mt-2">Analytics and insights</p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Retention Rate Chart */}
          <RetentionRateChart data={retentionData} />

          {/* Service Breakdown Chart */}
          <ServiceBreakdownChart data={serviceBreakdown} />

          {/* Stylist Performance Chart */}
          <StylistPerformanceChart data={stylistPerformance} />

          {/* Missed Follow-ups Table - Full width */}
          <div className="lg:col-span-2">
            <MissedFollowupsTable data={missedFollowups} />
          </div>
        </div>
      </div>
    </div>
  );
}

