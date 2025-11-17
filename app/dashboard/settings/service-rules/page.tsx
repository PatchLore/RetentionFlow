"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceRule } from "@/lib/types";
import { Plus, Trash2, Save } from "lucide-react";

interface EditableServiceRule extends ServiceRule {
  isNew?: boolean;
  originalServiceType?: string;
}

export default function ServiceRulesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [serviceRules, setServiceRules] = useState<EditableServiceRule[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchServiceRules() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("service_rules")
        .select("*")
        .order("service_type", { ascending: true });

      if (error) {
        console.error("Error fetching service rules:", error);
        return;
      }

      if (data) {
        setServiceRules(
          data.map((rule) => ({
            ...rule,
            originalServiceType: rule.service_type,
          }))
        );
      }
    }
    fetchServiceRules();
  }, [router, supabase]);

  const handleServiceTypeChange = (
    index: number,
    newServiceType: string
  ) => {
    const updated = [...serviceRules];
    updated[index].service_type = newServiceType;
    setServiceRules(updated);

    // Clear error for this field
    const errorKey = `service_type_${index}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleIntervalDaysChange = (
    index: number,
    newIntervalDays: string
  ) => {
    const updated = [...serviceRules];
    const numValue = parseInt(newIntervalDays, 10);
    
    if (newIntervalDays === "" || isNaN(numValue)) {
      updated[index].interval_days = 0;
    } else {
      updated[index].interval_days = numValue;
    }
    setServiceRules(updated);

    // Validate interval_days >= 1
    const errorKey = `interval_days_${index}`;
    if (numValue < 1) {
      setErrors({
        ...errors,
        [errorKey]: "Interval days must be at least 1",
      });
    } else {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleAddNew = () => {
    setServiceRules([
      ...serviceRules,
      {
        service_type: "",
        interval_days: 30,
        isNew: true,
      },
    ]);
  };

  const handleDelete = async (index: number) => {
    const rule = serviceRules[index];
    
    // If it's a new rule, just remove it from state
    if (rule.isNew) {
      const updated = serviceRules.filter((_, i) => i !== index);
      setServiceRules(updated);
      return;
    }

    // Otherwise, delete from database
    setLoading(true);
    const { error } = await supabase
      .from("service_rules")
      .delete()
      .eq("service_type", rule.service_type);

    if (error) {
      console.error("Error deleting service rule:", error);
      if (error.code === "23503") {
        // Foreign key constraint violation
        alert(
          `Cannot delete service type "${rule.service_type}" because it is in use by existing clients. Please update or remove those clients first.`
        );
      } else {
        alert(`Failed to delete service rule: ${error.message}`);
      }
    } else {
      const updated = serviceRules.filter((_, i) => i !== index);
      setServiceRules(updated);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    // Validate all fields
    const newErrors: Record<string, string> = {};
    serviceRules.forEach((rule, index) => {
      if (!rule.service_type.trim()) {
        newErrors[`service_type_${index}`] = "Service name is required";
      }
      if (rule.interval_days < 1) {
        newErrors[`interval_days_${index}`] = "Interval days must be at least 1";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Process updates and inserts
      for (let i = 0; i < serviceRules.length; i++) {
        const rule = serviceRules[i];

        if (rule.isNew) {
          // Insert new rule
          const { error } = await supabase.from("service_rules").insert({
            service_type: rule.service_type.trim(),
            interval_days: rule.interval_days,
          });

          if (error) {
            console.error("Error inserting service rule:", error);
            if (error.code === "23505") {
              // Unique constraint violation
              alert(
                `Service rule "${rule.service_type}" already exists.`
              );
            } else {
              alert(`Failed to add service rule: ${error.message}`);
            }
            setLoading(false);
            return;
          }
        } else if (
          rule.originalServiceType &&
          (rule.service_type !== rule.originalServiceType ||
            rule.interval_days !==
              serviceRules.find(
                (r) => r.originalServiceType === rule.originalServiceType
              )?.interval_days)
        ) {
          // Update existing rule
          // If service_type changed, we need to delete old and insert new
          // (since service_type is the primary key)
          if (rule.service_type !== rule.originalServiceType) {
            // Check if new service_type already exists
            const exists = serviceRules.some(
              (r, idx) =>
                idx !== i &&
                r.service_type === rule.service_type &&
                !r.isNew
            );

            if (exists) {
              alert(
                `Service rule "${rule.service_type}" already exists.`
              );
              setLoading(false);
              return;
            }

            // Delete old and insert new
            // Note: This will fail if clients reference the old service_type
            const { error: deleteError } = await supabase
              .from("service_rules")
              .delete()
              .eq("service_type", rule.originalServiceType);

            if (deleteError) {
              console.error("Error deleting old service rule:", deleteError);
              if (deleteError.code === "23503") {
                // Foreign key constraint violation
                alert(
                  `Cannot rename service type "${rule.originalServiceType}" because it is in use by existing clients. Please update or remove those clients first.`
                );
              } else {
                alert(
                  `Failed to update service rule: ${deleteError.message}`
                );
              }
              setLoading(false);
              return;
            }

            const { error: insertError } = await supabase
              .from("service_rules")
              .insert({
                service_type: rule.service_type.trim(),
                interval_days: rule.interval_days,
              });

            if (insertError) {
              console.error("Error inserting updated service rule:", insertError);
              alert(
                `Failed to update service rule: ${insertError.message}`
              );
              setLoading(false);
              return;
            }
          } else {
            // Only interval_days changed, update it
            const { error } = await supabase
              .from("service_rules")
              .update({ interval_days: rule.interval_days })
              .eq("service_type", rule.service_type);

            if (error) {
              console.error("Error updating service rule:", error);
              alert(`Failed to update service rule: ${error.message}`);
              setLoading(false);
              return;
            }
          }
        }
      }

      // Refresh the list
      const { data, error } = await supabase
        .from("service_rules")
        .select("*")
        .order("service_type", { ascending: true });

      if (error) {
        console.error("Error refreshing service rules:", error);
      } else if (data) {
        setServiceRules(
          data.map((rule) => ({
            ...rule,
            originalServiceType: rule.service_type,
          }))
        );
        setErrors({});
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Service Rules</h1>
          <p className="text-gray-600 mt-2">
            Manage service types and their follow-up intervals
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Service Rules</CardTitle>
                <CardDescription className="text-gray-600">
                  Define service types and how many days until follow-up is due
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddNew} variant="outline" size="sm" className="font-semibold border-purple-200 text-purple-600 hover:bg-purple-50">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
                <Button onClick={handleSave} disabled={loading} size="sm" className="font-semibold">
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {serviceRules.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No service rules. Click "Add Service" to get started.
              </div>
            ) : (
              <div className="rounded-xl border-2 border-purple-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Service Name</TableHead>
                      <TableHead className="w-[30%]">Interval (Days)</TableHead>
                      <TableHead className="w-[20%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceRules.map((rule, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={rule.service_type}
                            onChange={(e) =>
                              handleServiceTypeChange(index, e.target.value)
                            }
                            placeholder="e.g., Haircut"
                            className={
                              errors[`service_type_${index}`]
                                ? "border-destructive"
                                : ""
                            }
                          />
                          {errors[`service_type_${index}`] && (
                            <p className="text-sm text-destructive mt-1">
                              {errors[`service_type_${index}`]}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={rule.interval_days || ""}
                            onChange={(e) =>
                              handleIntervalDaysChange(index, e.target.value)
                            }
                            min="1"
                            className={
                              errors[`interval_days_${index}`]
                                ? "border-destructive"
                                : ""
                            }
                          />
                          {errors[`interval_days_${index}`] && (
                            <p className="text-sm text-destructive mt-1">
                              {errors[`interval_days_${index}`]}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(index)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

