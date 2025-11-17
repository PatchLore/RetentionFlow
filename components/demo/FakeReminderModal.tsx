"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface FakeReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  message: string;
}

export function FakeReminderModal({
  open,
  onOpenChange,
  clientName,
  message,
}: FakeReminderModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <p className="text-sm font-semibold text-gray-700">
                Message for {clientName}
              </p>
            </div>
            <p className="text-gray-800 leading-relaxed">{message}</p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

