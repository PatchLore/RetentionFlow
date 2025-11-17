"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ServiceRule } from "@/lib/types";
import { addDays, format } from "date-fns";

export default function NewClientPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
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
    async function fetchServiceRules() {
      const { data } = await supabase.from("service_rules").select("*");
      if (data) {
        setServiceRules(data);
      }
    }
    fetchServiceRules();
  }, [supabase]);

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

    // Get user's team_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("team_id")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("clients").insert({
      profile_id: user.id,
      team_id: profile?.team_id || null,
      name: formData.name,
      phone: formData.phone,
      service_type: formData.service_type,
      last_visit: formData.last_visit || null,
      next_due,
      stylist: formData.stylist || null,
      notes: formData.notes || null,
    });

    if (error) {
      console.error("Error creating client:", error);
      alert("Error creating client: " + error.message);
      setLoading(false);
    } else {
      router.push("/clients");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-2xl mx-auto shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Add New Client</CardTitle>
            <CardDescription className="text-gray-600">Enter client information below</CardDescription>
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

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="font-semibold">
                  {loading ? "Creating..." : "Create Client"}
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

