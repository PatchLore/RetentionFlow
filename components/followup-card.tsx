"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Client } from "@/lib/types";
import { generateWhatsAppLink, replaceTemplateVariables, getTemplate } from "@/lib/message-utils-client";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { differenceInDays, isPast, isToday } from "date-fns";

function getDaysUntilDue(nextDue: string | null): number | null {
  if (!nextDue) return null;
  const dueDate = new Date(nextDue);
  return differenceInDays(dueDate, new Date());
}

function isOverdue(nextDue: string | null): boolean {
  if (!nextDue) return false;
  const dueDate = new Date(nextDue);
  return isPast(dueDate) && !isToday(dueDate);
}

export function FollowUpCard({ client }: { client: Client }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const daysUntilDue = getDaysUntilDue(client.next_due);
  const overdue = isOverdue(client.next_due);
  
  const template = getTemplate("reminder");
  const message = replaceTemplateVariables(template, client, daysUntilDue || 0);
  const whatsappLink = generateWhatsAppLink(client.phone, message);

  const handleSendWhatsApp = async () => {
    setLoading(true);
    
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
    setLoading(false);
  };

  return (
    <Card className="hover:shadow-2xl transition-all transform hover:scale-[1.02]">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">{client.name}</CardTitle>
        <CardDescription className="text-gray-600 font-medium">{client.service_type}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Stylist:</span> {client.stylist || "N/A"}
          </p>
          <p className="text-sm">
            {overdue ? (
              <span className="text-red-600 font-semibold px-3 py-1 rounded-full bg-red-50 inline-block">
                Overdue by {daysUntilDue ? Math.abs(daysUntilDue) : 0} days
              </span>
            ) : daysUntilDue === 0 ? (
              <span className="text-purple-600 font-semibold px-3 py-1 rounded-full bg-purple-50 inline-block">Due today!</span>
            ) : (
              <span className="text-gray-600 px-3 py-1 rounded-full bg-gray-100 inline-block">
                Due in {daysUntilDue} days
              </span>
            )}
          </p>
          <div className="flex gap-2 pt-2">
            <Button 
              className="w-full font-semibold" 
              size="sm" 
              onClick={handleSendWhatsApp}
              disabled={loading}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {loading ? "Opening..." : "Send WhatsApp"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

