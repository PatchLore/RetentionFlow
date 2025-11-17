"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Bell,
  TrendingUp,
  LogOut,
  Send,
  Clock,
  CheckCircle,
  Eye,
  MessageCircle,
  MessageSquare,
  Mail,
  Search,
  Filter,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { ReminderModal } from "@/components/reminders/ReminderModal";
import { SendAllRemindersModal } from "@/components/reminders/SendAllRemindersModal";
import { Toast } from "@/components/reminders/Toast";

interface ReminderStatus {
  sent: string | null;
  opened: boolean;
  responded: boolean;
  method: "sms" | "email" | null;
}

interface Client {
  id: number;
  name: string;
  service: string;
  lastVisit: string;
  nextDue: string;
  avgSpend: number;
  reminderStatus: ReminderStatus;
  message?: string;
  isOverdue?: boolean;
}

export default function RetentionFlowDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [sentReminders, setSentReminders] = useState<Set<number>>(new Set());

  // Mock data with reminder status - stored in state for demo updates
  const DEMO_OVERDUE_CLIENTS: Client[] = [
    {
      id: 1,
      name: "Charlotte Moore",
      service: "Full Colour",
      lastVisit: "Sep 20, 2025",
      nextDue: "Nov 10, 2025",
      avgSpend: 140,
      reminderStatus: {
        sent: "Nov 8, 2025",
        opened: true,
        responded: false,
        method: "sms",
      },
      message:
        "Hi Charlotte! We noticed you're overdue for your colour treatment. Let's get you booked in!",
      isOverdue: true,
    },
    {
      id: 2,
      name: "Isabella White",
      service: "Cut & Finish",
      lastVisit: "Sep 25, 2025",
      nextDue: "Nov 12, 2025",
      avgSpend: 85,
      reminderStatus: {
        sent: "Nov 10, 2025",
        opened: false,
        responded: false,
        method: "email",
      },
      message:
        "Hi Isabella! You're overdue for your cut and finish. Ready to schedule your next appointment?",
      isOverdue: true,
    },
    {
      id: 3,
      name: "Ava Johnson",
      service: "Highlights",
      lastVisit: "Oct 1, 2025",
      nextDue: "Nov 14, 2025",
      avgSpend: 195,
      reminderStatus: {
        sent: null,
        opened: false,
        responded: false,
        method: null,
      },
      message:
        "Hi Ava! Your highlights are overdue for a refresh. Let's schedule your next visit!",
      isOverdue: true,
    },
  ];

  const DEMO_DUE_SOON_CLIENTS: Client[] = [
    {
      id: 4,
      name: "Sarah Mitchell",
      service: "Full Colour",
      lastVisit: "Oct 5, 2025",
      nextDue: "Nov 18, 2025",
      avgSpend: 150,
      reminderStatus: {
        sent: null,
        opened: false,
        responded: false,
        method: null,
      },
      message:
        "Hi Sarah! You're due for your next colour treatment. Would you like to book in this week?",
    },
    {
      id: 5,
      name: "Emma Thompson",
      service: "Cut & Finish",
      lastVisit: "Oct 10, 2025",
      nextDue: "Nov 20, 2025",
      avgSpend: 75,
      reminderStatus: {
        sent: "Nov 15, 2025",
        opened: true,
        responded: true,
        method: "sms",
      },
      message:
        "Hi Emma! It's time for your next cut and finish. Ready to book your appointment?",
    },
    {
      id: 6,
      name: "Olivia Brown",
      service: "Highlights",
      lastVisit: "Oct 15, 2025",
      nextDue: "Nov 22, 2025",
      avgSpend: 180,
      reminderStatus: {
        sent: null,
        opened: false,
        responded: false,
        method: null,
      },
      message:
        "Hi Olivia! Your highlights are due for a refresh. Let's schedule your next visit!",
    },
    {
      id: 7,
      name: "Sophie Davies",
      service: "Blow Dry",
      lastVisit: "Oct 8, 2025",
      nextDue: "Nov 19, 2025",
      avgSpend: 45,
      reminderStatus: {
        sent: "Nov 15, 2025",
        opened: true,
        responded: false,
        method: "email",
      },
      message:
        "Hi Sophie! Time for your regular blow dry appointment. Book now to secure your spot!",
    },
    {
      id: 8,
      name: "Grace Martin",
      service: "Full Colour",
      lastVisit: "Oct 20, 2025",
      nextDue: "Nov 24, 2025",
      avgSpend: 135,
      reminderStatus: {
        sent: null,
        opened: false,
        responded: false,
        method: null,
      },
      message:
        "Hi Grace! You're due for your next colour appointment. Let's get you booked in!",
    },
  ];

  const [overdueClients, setOverdueClients] =
    useState<Client[]>(DEMO_OVERDUE_CLIENTS);
  const [dueSoonClients, setDueSoonClients] = useState<Client[]>(
    DEMO_DUE_SOON_CLIENTS,
  );

  // Filter clients based on search and service filter
  const filteredOverdueClients = useMemo(() => {
    return overdueClients.filter((client) => {
      const matchesSearch = client.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesService =
        filterService === "all" ||
        client.service
          .toLowerCase()
          .includes(
            filterService
              .toLowerCase()
              .replace("colour", "color")
              .replace("color", "colour"),
          );
      return matchesSearch && matchesService;
    });
  }, [overdueClients, searchTerm, filterService]);

  const filteredDueSoonClients = useMemo(() => {
    return dueSoonClients.filter((client) => {
      const matchesSearch = client.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesService =
        filterService === "all" ||
        client.service
          .toLowerCase()
          .includes(
            filterService
              .toLowerCase()
              .replace("colour", "color")
              .replace("color", "colour"),
          );
      return matchesSearch && matchesService;
    });
  }, [dueSoonClients, searchTerm, filterService]);

  const calculateRevenue = (clients: Client[]) => {
    return clients.reduce((sum, client) => sum + client.avgSpend, 0);
  };

  const overdueRevenue = calculateRevenue(filteredOverdueClients);
  const dueSoonRevenue = calculateRevenue(filteredDueSoonClients);

  const handleSendReminder = (client: Client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleReminderSent = (updatedMessage: string) => {
    if (!selectedClient) return;

    console.log("Demo reminder sent:", {
      message: updatedMessage,
      client: selectedClient,
    });

    // Update the client's reminder status in state
    const now = new Date();
    const formattedDate = format(now, "MMM d, yyyy");

    // Determine which list the client belongs to and update the correct one
    const isOverdue = overdueClients.some((c) => c.id === selectedClient.id);
    const isDueSoon = dueSoonClients.some((c) => c.id === selectedClient.id);

    if (isOverdue) {
      setOverdueClients((prevClients) =>
        prevClients.map((c) =>
          c.id === selectedClient.id
            ? {
                ...c,
                reminderStatus: {
                  sent: formattedDate,
                  opened: false,
                  responded: false,
                  method: "sms", // WhatsApp maps to sms
                },
              }
            : c,
        ),
      );
    }

    if (isDueSoon) {
      setDueSoonClients((prevClients) =>
        prevClients.map((c) =>
          c.id === selectedClient.id
            ? {
                ...c,
                reminderStatus: {
                  sent: formattedDate,
                  opened: false,
                  responded: false,
                  method: "sms", // WhatsApp maps to sms
                },
              }
            : c,
        ),
      );
    }

    setSentReminders((prev) => new Set(prev).add(selectedClient.id));
    setToastMessage("Reminder sent (demo only)");
    setToastVisible(true);

    // Reset button state after 3 seconds
    setTimeout(() => {
      setSentReminders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedClient.id);
        return newSet;
      });
    }, 3000);
  };

  const handleSendAllReminders = (clients: Client[]) => {
    // Update all clients' reminder status in state
    const now = new Date();
    const formattedDate = format(now, "MMM d, yyyy");

    setOverdueClients((prevClients) =>
      prevClients.map((c) => {
        const isInList = clients.some((client) => client.id === c.id);
        if (isInList && !c.reminderStatus.sent) {
          return {
            ...c,
            reminderStatus: {
              sent: formattedDate,
              opened: false,
              responded: false,
              method: "sms", // WhatsApp maps to sms
            },
          };
        }
        return c;
      }),
    );

    // Mark all clients as having sent reminders (demo only)
    clients.forEach((client) => {
      setSentReminders((prev) => new Set(prev).add(client.id));
    });

    setToastMessage(
      `✓ ${clients.length} reminder${clients.length === 1 ? "" : "s"} sent (demo only)!`,
    );
    setToastVisible(true);

    // Reset button states after 3 seconds
    setTimeout(() => {
      setSentReminders((prev) => {
        const newSet = new Set(prev);
        clients.forEach((client) => {
          newSet.delete(client.id);
        });
        return newSet;
      });
    }, 3000);
  };

  const ReminderStatusBadge = ({ status }: { status: ReminderStatus }) => {
    if (!status.sent) {
      return (
        <div className="text-xs text-gray-500 mt-2">
          <Clock className="w-3 h-3 inline mr-1" />
          No reminder sent yet
        </div>
      );
    }

    // Check if this is a demo reminder (sent via the modal)
    const isDemoReminder = status.sent && !status.opened && !status.responded;

    if (isDemoReminder) {
      return (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-green-600 font-medium">
              Reminder sent (Demo)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 ml-5">
            <span>Sent: {status.sent}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 ml-5">
            <MessageSquare className="w-3 h-3 text-green-600" />
            <span>Via WhatsApp</span>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-2 text-xs">
          {status.method === "sms" ? (
            <MessageCircle className="w-3 h-3 text-purple-600" />
          ) : (
            <Mail className="w-3 h-3 text-purple-600" />
          )}
          <span className="text-gray-600">Sent: {status.sent}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {status.opened ? (
            <span className="flex items-center gap-1 text-green-600">
              <Eye className="w-3 h-3" />
              Opened
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-400">
              <Eye className="w-3 h-3" />
              Not opened
            </span>
          )}
          {status.responded ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              Responded
            </span>
          ) : (
            <span className="flex items-center gap-1 text-orange-500">
              <AlertCircle className="w-3 h-3" />
              No response
            </span>
          )}
        </div>
      </div>
    );
  };

  const ClientCard = ({
    client,
    isOverdue,
  }: {
    client: Client;
    isOverdue: boolean;
  }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{client.name}</h3>
          <p className="text-purple-600 font-semibold">{client.service}</p>
        </div>
        {isOverdue && (
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
            OVERDUE
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-3">
        <div className="flex justify-between">
          <span>Last Visit:</span>
          <span className="font-medium">{client.lastVisit}</span>
        </div>
        <div className="flex justify-between">
          <span>Next Due:</span>
          <span className="font-medium">{client.nextDue}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Avg. Spend:</span>
          <span className="font-bold text-green-600">£{client.avgSpend}</span>
        </div>
      </div>
      <ReminderStatusBadge status={client.reminderStatus} />
      <button
        onClick={() => handleSendReminder(client)}
        className={`w-full mt-4 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 ${
          sentReminders.has(client.id)
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        }`}
      >
        {sentReminders.has(client.id) ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Reminder Sent
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Reminder
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back! Here's your client overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">42</span>
            </div>
            <h3 className="font-semibold text-gray-700">Total Clients</h3>
            <p className="text-sm text-gray-500">Active client database</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-gray-900">
                {dueSoonClients.length}
              </span>
            </div>
            <h3 className="font-semibold text-gray-700">Due Soon</h3>
            <p className="text-sm text-gray-500">Next 7 days</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-100">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <span className="text-3xl font-bold text-gray-900">
                {overdueClients.length}
              </span>
            </div>
            <h3 className="font-semibold text-gray-700">Overdue</h3>
            <p className="text-sm text-gray-500">Need attention</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">5</span>
            </div>
            <h3 className="font-semibold text-gray-700">Reminders Today</h3>
            <p className="text-sm text-gray-500">Scheduled</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-purple-200 focus:border-purple-600 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="px-6 py-3 rounded-full border-2 border-purple-200 focus:border-purple-600 focus:outline-none transition-colors bg-white"
          >
            <option value="all">All Services</option>
            <option value="colour">Full Colour</option>
            <option value="cut">Cut & Finish</option>
            <option value="highlights">Highlights</option>
            <option value="blowdry">Blow Dry</option>
          </select>
        </div>

        {/* Revenue Impact Section - Overdue */}
        {filteredOverdueClients.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    £{overdueRevenue} at Risk
                  </h3>
                  <p className="text-gray-700">
                    <span className="font-bold text-red-600">
                      {filteredOverdueClients.length} overdue clients
                    </span>{" "}
                    haven't rebooked yet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Send All Reminders
              </button>
            </div>
          </div>
        )}

        {/* Overdue Clients */}
        {filteredOverdueClients.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Overdue Clients
              </h2>
              <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-bold">
                {filteredOverdueClients.length} Clients
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOverdueClients.map((client) => (
                <ClientCard key={client.id} client={client} isOverdue={true} />
              ))}
            </div>
          </div>
        )}

        {/* Revenue Impact Section - Due Soon */}
        {filteredDueSoonClients.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  £{dueSoonRevenue} Expected Revenue
                </h3>
                <p className="text-gray-700">
                  From{" "}
                  <span className="font-bold text-purple-600">
                    {filteredDueSoonClients.length} clients
                  </span>{" "}
                  due in the next 7 days
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Clients Due Soon */}
        {filteredDueSoonClients.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Clients Due Soon
              </h2>
              <span className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-bold">
                {filteredDueSoonClients.length} Clients
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDueSoonClients.map((client) => (
                <ClientCard key={client.id} client={client} isOverdue={false} />
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">
            Ready to import your clients?
          </h3>
          <p className="text-purple-100 mb-6">
            Start managing your client retention with RetentionFlow today.
          </p>
          <Link href="/dashboard/clients">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition-all">
              Import Clients
            </button>
          </Link>
        </div>
      </main>

      {/* Reminder Modal */}
      <ReminderModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSend={handleReminderSent}
      />

      {/* Send All Reminders Modal */}
      <SendAllRemindersModal
        open={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        clients={filteredOverdueClients}
        onSendAll={handleSendAllReminders}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
