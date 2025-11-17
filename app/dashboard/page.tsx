export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTodaysFollowUps, getDueClients } from "@/lib/followup-utils";
import { getRetentionRate } from "@/lib/analytics-utils";
import { FollowUpCard } from "@/components/followup-card";
import Link from "next/link";
import { Users, Calendar, TrendingUp, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's team_id for proper querying
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  const todaysFollowUps = await getTodaysFollowUps();
  const weeksDue = await getDueClients(7);
  const retentionData = await getRetentionRate();

  // Build queries that include team clients
  let totalClientsQuery = supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  let dueThisWeekQuery = supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .lte("next_due", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

  let overdueQuery = supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .lt("next_due", new Date().toISOString().split("T")[0]);

  if (profile?.team_id) {
    totalClientsQuery = totalClientsQuery.or(`profile_id.eq.${user.id},team_id.eq.${profile.team_id}`);
    dueThisWeekQuery = dueThisWeekQuery.or(`profile_id.eq.${user.id},team_id.eq.${profile.team_id}`);
    overdueQuery = overdueQuery.or(`profile_id.eq.${user.id},team_id.eq.${profile.team_id}`);
  } else {
    totalClientsQuery = totalClientsQuery.eq("profile_id", user.id);
    dueThisWeekQuery = dueThisWeekQuery.eq("profile_id", user.id);
    overdueQuery = overdueQuery.eq("profile_id", user.id);
  }

  const { count: totalClients } = await totalClientsQuery;
  const { count: dueThisWeek } = await dueThisWeekQuery;
  const { count: overdueCount } = await overdueQuery;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back!</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card className="hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Clients</CardTitle>
              <Users className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalClients || 0}</div>
              <p className="text-xs text-gray-500 mt-2">
                Active client database
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Due This Week</CardTitle>
              <Calendar className="h-5 w-5 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{dueThisWeek || 0}</div>
              <p className="text-xs text-gray-500 mt-2">
                Follow-ups needed
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-2xl transition-shadow border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Overdue</CardTitle>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{overdueCount || 0}</div>
              <p className="text-xs text-gray-500 mt-2">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Retention Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {retentionData.retentionRate > 0
                  ? `${retentionData.retentionRate}%`
                  : "--"}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {retentionData.retentionRate > 0
                  ? `${retentionData.returningClients} of ${retentionData.totalClients} clients`
                  : "Insufficient data"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Follow-Ups */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Today's Follow-Ups</h2>
            <Link href="/clients">
              <Button variant="outline" className="font-semibold">View All Clients</Button>
            </Link>
          </div>
          {todaysFollowUps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No follow-ups due today
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {todaysFollowUps.map((client) => (
                <FollowUpCard key={client.id} client={client} />
              ))}
            </div>
          )}
        </div>

        {/* This Week's Due */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">This Week's Due</h2>
          </div>
          {weeksDue.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No clients due this week
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {weeksDue.map((client) => (
                <FollowUpCard key={client.id} client={client} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

