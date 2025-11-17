"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageTemplate } from "@/lib/types";
import templatesData from "@/lib/message-templates.json";

export default function TemplatesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate>({
    reminder_template: templatesData.reminder_template,
    review_template: templatesData.review_template,
    birthday_template: templatesData.birthday_template,
  });

  useEffect(() => {
    // Load templates from localStorage if available
    const saved = localStorage.getItem("message_templates");
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading templates:", e);
      }
    }
  }, []);

  const handleSave = () => {
    setLoading(true);
    localStorage.setItem("message_templates", JSON.stringify(templates));
    setTimeout(() => {
      setLoading(false);
      alert("Templates saved successfully!");
    }, 500);
  };

  const handleReset = () => {
    if (confirm("Reset all templates to defaults?")) {
      setTemplates({
        reminder_template: templatesData.reminder_template,
        review_template: templatesData.review_template,
        birthday_template: templatesData.birthday_template,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Message Templates</h1>
          <p className="text-gray-600 mt-2">
            Customize your WhatsApp message templates
          </p>
        </div>

        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Reminder Template</CardTitle>
              <CardDescription>
                Used for appointment reminders. Available variables: {"{"}
                {"{"}name{"}"}
                {"}"}, {"{"}
                {"{"}service_type{"}"}
                {"}"}, {"{"}
                {"{"}stylist{"}"}
                {"}"}, {"{"}
                {"{"}days{"}"}
                {"}"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={templates.reminder_template}
                onChange={(e) =>
                  setTemplates({
                    ...templates,
                    reminder_template: e.target.value,
                  })
                }
                rows={8}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Template</CardTitle>
              <CardDescription>
                Used for requesting reviews. Available variables: {"{"}
                {"{"}name{"}"}
                {"}"}, {"{"}
                {"{"}service_type{"}"}
                {"}"}, {"{"}
                {"{"}stylist{"}"}
                {"}"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={templates.review_template}
                onChange={(e) =>
                  setTemplates({
                    ...templates,
                    review_template: e.target.value,
                  })
                }
                rows={8}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Birthday Template</CardTitle>
              <CardDescription>
                Used for birthday messages. Available variables: {"{"}
                {"{"}name{"}"}
                {"}"}, {"{"}
                {"{"}service_type{"}"}
                {"}"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={templates.birthday_template}
                onChange={(e) =>
                  setTemplates({
                    ...templates,
                    birthday_template: e.target.value,
                  })
                }
                rows={8}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={loading} className="font-semibold">
              {loading ? "Saving..." : "Save Templates"}
            </Button>
            <Button onClick={handleReset} variant="outline" className="font-semibold">
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

