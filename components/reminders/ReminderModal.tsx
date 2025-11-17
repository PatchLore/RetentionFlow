"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  MessageCircle,
  Mail,
  Send,
  Sparkles,
  MessageSquare,
} from "lucide-react";

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

interface ReminderModalProps {
  open: boolean;
  onClose: () => void;
  client: Client | null;
  onSend: (message: string) => void;
}

export function ReminderModal({
  open,
  onClose,
  client,
  onSend,
}: ReminderModalProps) {
  const [method, setMethod] = useState<"whatsapp" | "email" | "sms">(
    "whatsapp",
  );
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterCount = message.length;

  // Generate default message based on client data
  useEffect(() => {
    if (client && open) {
      const isOverdue = client.isOverdue;

      // WhatsApp-style message (default)
      if (isOverdue) {
        setMessage(
          `Hi ${client.name}! We've missed you! It's been a while since your ${client.service}. Want to get booked in? 💇‍♀️✨`,
        );
      } else {
        setMessage(
          `Hi ${client.name}! You're due for your ${client.service}. Want to book in this week? 💇‍♀️✨`,
        );
      }
    }
  }, [client, open]);

  // Auto-focus textarea on open
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(
          textareaRef.current.value.length,
          textareaRef.current.value.length,
        );
      }, 100);
    }
  }, [open]);

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

  if (!open || !client) return null;

  const handleSend = async () => {
    if (!client) return;

    setIsSending(true);
    // Simulate sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSend(message);
    setIsSending(false);
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
        aria-labelledby="reminder-modal-title"
      >
        <div
          className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl w-full max-w-2xl pointer-events-auto transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2
                    id="reminder-modal-title"
                    className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    ✨ Personalise Your Reminder
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Sending to:{" "}
                    <span className="font-semibold">{client.name}</span>
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
            <div className="absolute top-4 right-16 flex flex-col items-end gap-1">
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                DEMO MODE
              </span>
              <p className="text-xs text-gray-500 text-right max-w-[200px]">
                In your live account, this will open WhatsApp with this message
                pre-filled.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Delivery Method Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Delivery Method
              </label>
              <div className="flex gap-3">
                <button
                  className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-green-500 bg-green-50 shadow-lg cursor-default"
                  aria-pressed={true}
                  disabled
                >
                  <MessageSquare className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-green-600">WhatsApp</span>
                </button>
                <button
                  className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                  disabled
                  aria-disabled={true}
                >
                  <Mail className="w-6 h-6 text-gray-400" />
                  <span className="font-semibold text-gray-400">
                    Email <span className="text-xs">(coming soon)</span>
                  </span>
                </button>
                <button
                  className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                  disabled
                  aria-disabled={true}
                >
                  <MessageCircle className="w-6 h-6 text-gray-400" />
                  <span className="font-semibold text-gray-400">
                    SMS <span className="text-xs">(coming soon)</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Message Editor */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="reminder-message"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Message
                </label>
                <span className="text-xs font-medium text-gray-500">
                  {characterCount} characters
                </span>
              </div>
              <textarea
                id="reminder-message"
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                placeholder="Type your reminder message..."
                aria-label="Reminder message"
              />
            </div>

            {/* Preview Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Preview
              </label>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {client.name}
                    </div>
                    <div className="text-xs text-gray-500">WhatsApp</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-green-100">
                  <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-purple-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-full border-2 border-purple-200 text-purple-600 font-semibold hover:bg-purple-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Reminder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
