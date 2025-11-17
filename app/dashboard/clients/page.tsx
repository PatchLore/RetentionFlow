export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users } from "lucide-react";

export default async function DashboardClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4 font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Import Clients
        </h1>
        <p className="text-gray-600">Manage your client database</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Coming Soon</CardTitle>
          <CardDescription>
            Client import functionality will be available here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Users className="mx-auto h-16 w-16 text-purple-400 mb-4" />
            <p className="text-gray-600">
              Import your clients to start tracking their appointments and sending reminders.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

