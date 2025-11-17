export interface Client {
  id: string;
  profile_id: string;
  team_id: string | null;
  name: string;
  phone: string;
  service_type: string;
  last_visit: string | null;
  next_due: string | null;
  stylist: string | null;
  notes: string | null;
  created_at: string;
}

export interface ServiceRule {
  service_type: string;
  interval_days: number;
}

export interface Followup {
  id: string;
  client_id: string;
  date_sent: string;
  type: "reminder" | "birthday" | "review";
  status: "pending" | "overdue" | "sent";
}

export interface MessageTemplate {
  reminder_template: string;
  review_template: string;
  birthday_template: string;
}

