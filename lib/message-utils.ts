import { Client } from "./types";
import { differenceInDays } from "date-fns";

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

