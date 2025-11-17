"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, AlertCircle, Bell, MessageSquare, Upload } from "lucide-react";
import { format } from "date-fns";
import { FakeReminderModal } from "@/components/demo/FakeReminderModal";

interface FakeClient {
  id: string;
  name: string;
  service: string;
  lastVisit: string;
  nextDue: string;
  isOverdue?: boolean;
  message: string;
}

// Fake data for dashboard
const STATS = {
  totalClients: 42,
  dueSoon: 8,
  overdue: 3,
  remindersToday: 5,
};

const DUE_SOON_CLIENTS: FakeClient[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    service: "Full Colour",
    lastVisit: "2025-01-15",
    nextDue: "2025-02-15",
    message: "Hi Sarah! You're due for your next colour treatment. Would you like to book in this week?",
  },
  {
    id: "2",
    name: "Emma Thompson",
    service: "Cut & Finish",
    lastVisit: "2025-01-20",
    nextDue: "2025-02-20",
    message: "Hi Emma! It's time for your next cut and finish. Ready to book your appointment?",
  },
  {
    id: "3",
    name: "Olivia Brown",
    service: "Highlights",
    lastVisit: "2025-01-10",
    nextDue: "2025-02-25",
    message: "Hi Olivia! Your highlights are due for a refresh. Let's schedule your next visit!",
  },
  {
    id: "4",
    name: "Sophie Davies",
    service: "Blow Dry",
    lastVisit: "2025-01-28",
    nextDue: "2025-02-11",
    message: "Hi Sophie! Time for your regular blow dry appointment. Book now to secure your spot!",
  },
  {
    id: "5",
    name: "Grace Martin",
    service: "Full Colour",
    lastVisit: "2025-01-12",
    nextDue: "2025-02-12",
    message: "Hi Grace! You're due for your next colour appointment. Let's get you booked in!",
  },
];

const OVERDUE_CLIENTS: FakeClient[] = [
  {
    id: "6",
    name: "Charlotte Moore",
    service: "Full Colour",
    lastVisit: "2024-12-20",
    nextDue: "2025-01-20",
    isOverdue: true,
    message: "Hi Charlotte! We noticed you're overdue for your colour treatment. Let's get you booked in!",
  },
  {
    id: "7",
    name: "Isabella White",
    service: "Cut & Finish",
    lastVisit: "2024-12-15",
    nextDue: "2025-01-15",
    isOverdue: true,
    message: "Hi Isabella! You're overdue for your cut and finish. Ready to schedule your next appointment?",
  },
];

export default function DashboardPage() {
  const [selectedClient, setSelectedClient] = useState<FakeClient | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSendReminder = (client: FakeClient) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">Welcome back! Here's your client overview.</p>
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        <Card className="hover:shadow-2xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Clients</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{STATS.totalClients}</div>
            <p className="text-xs text-gray-500 mt-2">Active client database</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Due Soon</CardTitle>
            <Calendar className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{STATS.dueSoon}</div>
            <p className="text-xs text-gray-500 mt-2">Clients due in next 7 days</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-shadow border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Overdue</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{STATS.overdue}</div>
            <p className="text-xs text-gray-500 mt-2">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-2xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Reminders Today</CardTitle>
            <Bell className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{STATS.remindersToday}</div>
            <p className="text-xs text-gray-500 mt-2">Scheduled for today</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Clients Section */}
      {OVERDUE_CLIENTS.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-3xl font-bold text-gray-900">Overdue Clients</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {OVERDUE_CLIENTS.map((client) => (
              <Card
                key={client.id}
                className="border-2 border-red-200 bg-red-50/50 hover:shadow-2xl transition-all transform hover:scale-[1.02]"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-red-900">{client.name}</CardTitle>
                  <CardDescription className="text-red-700 font-medium">
                    {client.service}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Last Visit:</span>{" "}
                      {format(new Date(client.lastVisit), "MMM d, yyyy")}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Next Due:</span>{" "}
                      <span className="text-red-600 font-bold">
                        {format(new Date(client.nextDue), "MMM d, yyyy")} (Overdue)
                      </span>
                    </p>
                    <Button
                      className="w-full font-semibold mt-4"
                      size="sm"
                      onClick={() => handleSendReminder(client)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Clients Due Soon Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-6 w-6 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">Clients Due Soon</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DUE_SOON_CLIENTS.map((client) => (
            <Card
              key={client.id}
              className="hover:shadow-2xl transition-all transform hover:scale-[1.02]"
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">{client.name}</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  {client.service}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Last Visit:</span>{" "}
                    {format(new Date(client.lastVisit), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Next Due:</span>{" "}
                    <span className="text-purple-600 font-semibold">
                      {format(new Date(client.nextDue), "MMM d, yyyy")}
                    </span>
                  </p>
                  <Button
                    className="w-full font-semibold mt-4"
                    size="sm"
                    onClick={() => handleSendReminder(client)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
        <h3 className="text-3xl font-bold mb-4">Ready to import your clients?</h3>
        <p className="text-xl text-purple-100 mb-8">
          Start managing your client retention with RetentionFlow today.
        </p>
        <Link href="/dashboard/clients">
          <Button className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all">
            <Upload className="mr-2 h-5 w-5" />
            Import Clients
          </Button>
        </Link>
      </div>

      {/* Reminder Modal */}
      {selectedClient && (
        <FakeReminderModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          clientName={selectedClient.name}
          message={selectedClient.message}
        />
      )}
    </div>
  );
}
