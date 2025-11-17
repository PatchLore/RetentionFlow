"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Client } from "@/lib/types";
import { generateWhatsAppLink, replaceTemplateVariables, getTemplate } from "@/lib/message-utils-client";
import { MessageSquare, Sparkles } from "lucide-react";
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
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [personalizedMessage, setPersonalizedMessage] = useState("");
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

    // Use personalized message if available, otherwise use default
    const messageToSend = personalizedMessage || message;
    const link = personalizedMessage
      ? generateWhatsAppLink(client.phone, personalizedMessage)
      : whatsappLink;

    window.open(link, "_blank");
    setLoading(false);
  };

  const handlePersonaliseWithAI = async () => {
    setAiDialogOpen(true);
    // Initialize with current message
    setPersonalizedMessage(message);
  };

  const handleImproveWithAI = async () => {
    setAiLoading(true);
    try {
      const template = getTemplate("reminder");
      const variables = {
        name: client.name,
        service_type: client.service_type,
        stylist: client.stylist || "",
        days: daysUntilDue || 0,
      };

      const response = await fetch("/api/ai/personalise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template,
          variables,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to improve message");
      }

      const data = await response.json();
      
      if (data.improvedMessage) {
        // Replace variables in the improved message
        // The improved message should have {{variables}} that need to be replaced
        const improvedWithVariables = replaceTemplateVariables(
          data.improvedMessage,
          client,
          daysUntilDue || 0
        );
        setPersonalizedMessage(improvedWithVariables);
        
        if (data.missingVariables && data.missingVariables.length > 0) {
          alert(
            `Warning: Some variables were not preserved in the AI response. Using original template.`
          );
        }
      } else {
        throw new Error(data.error || "No improved message returned");
      }
    } catch (error) {
      console.error("Error improving message with AI:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to improve message. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
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
              className="flex-1 font-semibold" 
              size="sm" 
              onClick={handleSendWhatsApp}
              disabled={loading}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {loading ? "Opening..." : "Send WhatsApp"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePersonaliseWithAI}
              disabled={loading}
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Personalise Message with AI</DialogTitle>
            <DialogDescription>
              Improve your message using AI while keeping all client information intact
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Message Preview
              </label>
              <Textarea
                value={personalizedMessage}
                onChange={(e) => setPersonalizedMessage(e.target.value)}
                className="min-h-[200px]"
                placeholder="Your message will appear here..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setAiDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImproveWithAI}
                disabled={aiLoading}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {aiLoading ? "Improving..." : "Improve with AI"}
              </Button>
              <Button
                onClick={() => {
                  setAiDialogOpen(false);
                  handleSendWhatsApp();
                }}
                disabled={loading || aiLoading}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

