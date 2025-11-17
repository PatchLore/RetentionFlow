"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Client, ServiceRule } from "@/lib/types";
import { addDays, format } from "date-fns";
import { generateWhatsAppLink, replaceTemplateVariables, getTemplate } from "@/lib/message-utils-client";
import { MessageSquare, Trash2 } from "lucide-react";

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [serviceRules, setServiceRules] = useState<ServiceRule[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service_type: "",
    last_visit: "",
    stylist: "",
    notes: "",
  });

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch client
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", params.id)
        .eq("profile_id", user.id)
        .single();

      if (clientError || !clientData) {
        router.push("/clients");
        return;
      }

      setClient(clientData);
      setFormData({
        name: clientData.name,
        phone: clientData.phone,
        service_type: clientData.service_type,
        last_visit: clientData.last_visit || "",
        stylist: clientData.stylist || "",
        notes: clientData.notes || "",
      });

      // Fetch service rules
      const { data: rulesData } = await supabase.from("service_rules").select("*");
      if (rulesData) {
        setServiceRules(rulesData);
      }
    }
    fetchData();
  }, [params.id, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Calculate next_due
    let next_due = null;
    if (formData.last_visit && formData.service_type) {
      const selectedRule = serviceRules.find(
        (r) => r.service_type === formData.service_type
      );
      if (selectedRule) {
        const lastVisitDate = new Date(formData.last_visit);
        next_due = format(addDays(lastVisitDate, selectedRule.interval_days), "yyyy-MM-dd");
      }
    }

    const { error } = await supabase
      .from("clients")
      .update({
        name: formData.name,
        phone: formData.phone,
        service_type: formData.service_type,
        last_visit: formData.last_visit || null,
        next_due,
        stylist: formData.stylist || null,
        notes: formData.notes || null,
      })
      .eq("id", params.id)
      .eq("profile_id", user.id);

    if (error) {
      console.error("Error updating client:", error);
      alert("Error updating client: " + error.message);
      setLoading(false);
    } else {
      router.refresh();
      setLoading(false);
      alert("Client updated successfully!");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this client?")) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", params.id)
      .eq("profile_id", user.id);

    if (error) {
      console.error("Error deleting client:", error);
      alert("Error deleting client: " + error.message);
    } else {
      router.push("/clients");
    }
  };

  const handleSendWhatsApp = async () => {
    if (!client) return;

    const template = getTemplate("reminder");
    const daysUntilDue = client.next_due
      ? Math.ceil((new Date(client.next_due).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const message = replaceTemplateVariables(template, client, daysUntilDue);
    const whatsappLink = generateWhatsAppLink(client.phone, message);

    // Log follow-up
    const { error } = await supabase.from("followups").insert({
      client_id: client.id,
      date_sent: new Date().toISOString(),
      type: "reminder",
    });

    if (error) {
      console.error("Error logging follow-up:", error);
    }

    window.open(whatsappLink, "_blank");
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-2xl mx-auto shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Edit Client</CardTitle>
                <CardDescription className="text-gray-600 text-lg mt-2">{client.name}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSendWhatsApp} variant="outline" className="font-semibold border-purple-200 text-purple-600 hover:bg-purple-50">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send WhatsApp
                </Button>
                <Button onClick={handleDelete} variant="destructive" className="font-semibold">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type *</Label>
                <Select
                  id="service_type"
                  value={formData.service_type}
                  onChange={(e) =>
                    setFormData({ ...formData, service_type: e.target.value })
                  }
                  required
                >
                  <option value="">Select a service type</option>
                  {serviceRules.map((rule) => (
                    <option key={rule.service_type} value={rule.service_type}>
                      {rule.service_type} ({rule.interval_days} days)
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_visit">Last Visit</Label>
                <Input
                  id="last_visit"
                  type="date"
                  value={formData.last_visit}
                  onChange={(e) =>
                    setFormData({ ...formData, last_visit: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stylist">Stylist</Label>
                <Input
                  id="stylist"
                  value={formData.stylist}
                  onChange={(e) =>
                    setFormData({ ...formData, stylist: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                />
              </div>

              {client.next_due && (
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
                  <p className="text-sm font-semibold text-gray-900">Next Due Date</p>
                  <p className="text-base text-purple-600 font-bold mt-1">
                    {format(new Date(client.next_due), "MMMM d, yyyy")}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="font-semibold">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

