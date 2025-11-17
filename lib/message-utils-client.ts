"use client";

import { Client } from "./types";
import { differenceInDays } from "date-fns";
import templatesData from "./message-templates.json";

export function getTemplate(type: "reminder" | "review" | "birthday"): string {
  if (typeof window === "undefined") {
    // Server-side fallback
    return templatesData[`${type}_template` as keyof typeof templatesData] as string;
  }

  // Try to load from localStorage
  const saved = localStorage.getItem("message_templates");
  if (saved) {
    try {
      const templates = JSON.parse(saved);
      return templates[`${type}_template`] || templatesData[`${type}_template` as keyof typeof templatesData] as string;
    } catch (e) {
      console.error("Error loading templates:", e);
    }
  }

  // Fallback to default
  return templatesData[`${type}_template` as keyof typeof templatesData] as string;
}

export function generateWhatsAppLink(
  phone: string,
  message: string
): string {
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function replaceTemplateVariables(
  template: string,
  client: Client,
  days?: number
): string {
  let message = template;
  
  message = message.replace(/\{\{name\}\}/g, client.name || "");
  message = message.replace(/\{\{service_type\}\}/g, client.service_type || "");
  message = message.replace(/\{\{stylist\}\}/g, client.stylist || "");
  
  if (days !== undefined) {
    message = message.replace(/\{\{days\}\}/g, days.toString());
  } else if (client.next_due) {
    const daysUntilDue = differenceInDays(new Date(client.next_due), new Date());
    message = message.replace(/\{\{days\}\}/g, Math.abs(daysUntilDue).toString());
  }
  
  return message;
}

