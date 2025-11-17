export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { format } from "date-fns";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .eq("profile_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Clients</h1>
            <p className="text-gray-600 mt-2">Manage your client database</p>
          </div>
          <Link href="/clients/new">
            <Button className="font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </Link>
        </div>

        {!clients || clients.length === 0 ? (
          <Card className="shadow-xl">
            <CardContent className="py-16 text-center">
              <Users className="mx-auto h-16 w-16 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first client
              </p>
              <Link href="/clients/new">
                <Button className="font-semibold">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Client
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="hover:shadow-2xl transition-all transform hover:scale-[1.02] cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-3">{client.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="font-semibold text-purple-600">{client.service_type}</p>
                      {client.stylist && <p><span className="font-medium">Stylist:</span> {client.stylist}</p>}
                      {client.next_due && (
                        <p>
                          <span className="font-medium">Next due:</span> {format(new Date(client.next_due), "MMM d, yyyy")}
                        </p>
                      )}
                      {client.phone && <p><span className="font-medium">Phone:</span> {client.phone}</p>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

