"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MessageSquare, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface DemoClient {
  name: string;
  service: string;
  lastVisit: string;
  nextDue: string;
  isOverdue?: boolean;
  message: string;
}

const DUE_SOON_CLIENTS: DemoClient[] = [
  {
    name: "Sarah Mitchell",
    service: "Full Colour",
    lastVisit: "2025-01-15",
    nextDue: "2025-02-15",
    message: "Hi Sarah! You're due for your next colour treatment. Would you like to book in this week?",
  },
  {
    name: "Emma Thompson",
    service: "Cut & Finish",
    lastVisit: "2025-01-20",
    nextDue: "2025-02-20",
    message: "Hi Emma! It's time for your next cut and finish. Ready to book your appointment?",
  },
  {
    name: "Olivia Brown",
    service: "Highlights",
    lastVisit: "2025-01-10",
    nextDue: "2025-02-25",
    message: "Hi Olivia! Your highlights are due for a refresh. Let's schedule your next visit!",
  },
  {
    name: "Sophie Davies",
    service: "Blow Dry",
    lastVisit: "2025-01-28",
    nextDue: "2025-02-11",
    message: "Hi Sophie! Time for your regular blow dry appointment. Book now to secure your spot!",
  },
];

const OVERDUE_CLIENTS: DemoClient[] = [
  {
    name: "Charlotte Moore",
    service: "Full Colour",
    lastVisit: "2024-12-20",
    nextDue: "2025-01-20",
    isOverdue: true,
    message: "Hi Charlotte! We noticed you're overdue for your colour treatment. Let's get you booked in!",
  },
  {
    name: "Isabella White",
    service: "Cut & Finish",
    lastVisit: "2024-12-15",
    nextDue: "2025-01-15",
    isOverdue: true,
    message: "Hi Isabella! You're overdue for your cut and finish. Ready to schedule your next appointment?",
  },
];

export default function DemoPage() {
  const [selectedClient, setSelectedClient] = useState<DemoClient | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePreviewReminder = (client: DemoClient) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              RetentionFlow
            </span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link
              href="/login"
              className="text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-purple-50 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            RetentionFlow Demo Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Preview how RetentionFlow keeps your salon fully booked with timely reminders.
          </p>
        </div>

        {/* Overdue Clients Section */}
        {OVERDUE_CLIENTS.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-3xl font-bold text-gray-900">Overdue Clients</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {OVERDUE_CLIENTS.map((client, index) => (
                <Card
                  key={index}
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
                        onClick={() => handlePreviewReminder(client)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Preview Reminder
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {DUE_SOON_CLIENTS.map((client, index) => (
              <Card
                key={index}
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
                      onClick={() => handlePreviewReminder(client)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Preview Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Want the full system for your salon?</h3>
          <p className="text-xl text-purple-100 mb-8">
            See how RetentionFlow can transform your client retention and keep your books full.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Book a Call →
          </Link>
        </div>
      </main>

      {/* Reminder Preview Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Reminder Preview
            </DialogTitle>
            <DialogDescription>
              This is what your client will receive via WhatsApp
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedClient && (
              <>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <p className="text-sm font-semibold text-gray-700">
                      Message for {selectedClient.name}
                    </p>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{selectedClient.message}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-600 mb-2">
                    <span className="font-semibold">Service:</span> {selectedClient.service}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Due Date:</span>{" "}
                    {format(new Date(selectedClient.nextDue), "MMMM d, yyyy")}
                  </p>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="font-semibold"
              >
                Close
              </Button>
              <Link href="/signup">
                <Button className="font-semibold">
                  Get Started →
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

