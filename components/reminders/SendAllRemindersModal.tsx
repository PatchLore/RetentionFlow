"use client";

import { useEffect } from "react";
import { X, Send, AlertCircle } from "lucide-react";

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

interface SendAllRemindersModalProps {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  onSendAll: (clients: Client[]) => void;
}

export function SendAllRemindersModal({
  open,
  onClose,
  clients,
  onSendAll,
}: SendAllRemindersModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  // Generate reminder message for each client (same template as single reminder modal)
  const generateMessage = (client: Client): string => {
    if (client.isOverdue) {
      return `Hi ${client.name}! We've missed you! It's been a while since your ${client.service}. Want to get booked in? 💇‍♀️✨`;
    } else {
      return `Hi ${client.name}! You're due for your ${client.service}. Want to book in this week? 💇‍♀️✨`;
    }
  };

  const handleSendAll = () => {
    const messages = clients.map((client) => ({
      client: client.name,
      service: client.service,
      message: generateMessage(client),
    }));

    console.log("Bulk reminders sent:", messages);
    onSendAll(clients);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-modal-title"
      >
        <div
          className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-purple-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2
                    id="bulk-modal-title"
                    className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
                  >
                    Send All Reminders
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {clients.length} overdue {clients.length === 1 ? "client" : "clients"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Demo Mode Badge */}
            <div className="absolute top-4 right-16">
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                DEMO MODE
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Summary */}
            <div className="mb-6">
              <p className="text-gray-700">
                You are about to send reminders to all overdue clients.
              </p>
            </div>

            {/* Clients List */}
            <div className="space-y-4">
              {clients.map((client) => {
                const message = generateMessage(client);
                return (
                  <div
                    key={client.id}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {client.name}
                        </h3>
                        <p className="text-purple-600 font-semibold text-sm">
                          {client.service}
                        </p>
                      </div>
                      {client.isOverdue && (
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    {/* Message Preview */}
                    <div className="bg-white p-4 rounded-xl border border-purple-100 mt-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-purple-100 flex gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-full border-2 border-purple-200 text-purple-600 font-semibold hover:bg-purple-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSendAll}
              className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send All (Demo Mode)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

