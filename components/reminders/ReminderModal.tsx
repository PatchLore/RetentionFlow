"use client";

import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Mail, Send, Sparkles } from "lucide-react";

interface Client {
  id: number;
  name: string;
  service: string;
  lastVisit: string;
  nextDue: string;
  avgSpend: number;
  isOverdue?: boolean;
}

interface ReminderModalProps {
  open: boolean;
  onClose: () => void;
  client: Client | null;
  onSend: (message: string, method: "sms" | "email", client: Client) => void;
}

export function ReminderModal({
  open,
  onClose,
  client,
  onSend,
}: ReminderModalProps) {
  const [method, setMethod] = useState<"sms" | "email">("sms");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const SMS_LIMIT = 160;
  const characterCount = message.length;
  const isOverLimit = method === "sms" && characterCount > SMS_LIMIT;

  // Generate default message based on client data
  useEffect(() => {
    if (client && open) {
      const isOverdue = client.isOverdue;
      const salonName = "RetentionFlow Salon";

      if (method === "sms") {
        if (isOverdue) {
          setMessage(
            `Hi ${client.name}! We've missed you! It's been a while since your ${client.service}. Want to get booked in? 💇‍♀️`,
          );
        } else {
          setMessage(
            `Hi ${client.name}! You're due for your ${client.service}. Ready to rebook? Reply YES! ✨`,
          );
        }
      } else {
        // Email
        if (isOverdue) {
          setMessage(
            `Hi ${client.name},

Hope you're well! We've missed you at the salon. It's been a while since your ${client.service} appointment.

Would you like to book in this week? We have spots available on Thursday at 2pm or Friday at 10am.

Looking forward to seeing you!

${salonName}`,
          );
        } else {
          setMessage(
            `Hi ${client.name},

Hope you're well! You're due for your ${client.service} appointment.

Would you like to book in this week? We have spots available on Thursday at 2pm or Friday at 10am.

Looking forward to seeing you!

${salonName}`,
          );
        }
      }
    }
  }, [client, method, open]);

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
    if (isOverLimit) return;

    setIsSending(true);
    // Simulate sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSend(message, method, client);
    setIsSending(false);
    onClose();
  };

  const handleMethodChange = (newMethod: "sms" | "email") => {
    setMethod(newMethod);
    // Regenerate message when switching methods
    const salonName = "RetentionFlow Salon";
    const isOverdue = client.isOverdue;

    if (newMethod === "sms") {
      if (isOverdue) {
        setMessage(
          `Hi ${client.name}! We've missed you! It's been a while since your ${client.service}. Want to get booked in? 💇‍♀️`,
        );
      } else {
        setMessage(
          `Hi ${client.name}! You're due for your ${client.service}. Ready to rebook? Reply YES! ✨`,
        );
      }
    } else {
      if (isOverdue) {
        setMessage(
          `Hi ${client.name},

Hope you're well! We've missed you at the salon. It's been a while since your ${client.service} appointment.

Would you like to book in this week? We have spots available on Thursday at 2pm or Friday at 10am.

Looking forward to seeing you!

${salonName}`,
        );
      } else {
        setMessage(
          `Hi ${client.name},

Hope you're well! You're due for your ${client.service} appointment.

Would you like to book in this week? We have spots available on Thursday at 2pm or Friday at 10am.

Looking forward to seeing you!

${salonName}`,
        );
      }
    }
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
            <div className="absolute top-4 right-16">
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                DEMO MODE
              </span>
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
                  onClick={() => handleMethodChange("sms")}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    method === "sms"
                      ? "border-purple-600 bg-purple-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-purple-300"
                  }`}
                  aria-pressed={method === "sms"}
                >
                  <MessageCircle
                    className={`w-6 h-6 ${
                      method === "sms" ? "text-purple-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      method === "sms" ? "text-purple-600" : "text-gray-600"
                    }`}
                  >
                    SMS
                  </span>
                </button>
                <button
                  onClick={() => handleMethodChange("email")}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    method === "email"
                      ? "border-purple-600 bg-purple-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-purple-300"
                  }`}
                  aria-pressed={method === "email"}
                >
                  <Mail
                    className={`w-6 h-6 ${
                      method === "email" ? "text-purple-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      method === "email" ? "text-purple-600" : "text-gray-600"
                    }`}
                  >
                    Email
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
                <span
                  className={`text-xs font-medium ${
                    isOverLimit
                      ? "text-red-600 animate-pulse"
                      : method === "sms" && characterCount > SMS_LIMIT * 0.8
                        ? "text-orange-600"
                        : "text-gray-500"
                  }`}
                >
                  {characterCount}
                  {method === "sms" && ` / ${SMS_LIMIT}`}
                </span>
              </div>
              <textarea
                id="reminder-message"
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={method === "sms" ? 4 : 8}
                className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none ${
                  isOverLimit
                    ? "border-red-300 bg-red-50 animate-shake"
                    : "border-purple-200 focus:border-purple-600"
                }`}
                placeholder="Type your reminder message..."
                aria-label="Reminder message"
              />
              {isOverLimit && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> Message exceeds SMS character limit. Please
                  shorten it.
                </p>
              )}
            </div>

            {/* Preview Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Preview
              </label>
              {method === "sms" ? (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {client.name}
                      </div>
                      <div className="text-xs text-gray-500">Mobile</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-purple-100">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                  <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-white" />
                        <div>
                          <div className="font-semibold text-white">
                            RetentionFlow Salon
                          </div>
                          <div className="text-xs text-purple-100">
                            to {client.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
              disabled={isSending || isOverLimit}
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
