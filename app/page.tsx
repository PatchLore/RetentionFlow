"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  Bell,
  TrendingUp,
  Check,
  BarChart3,
  Clock,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DemoVideoSection from "./components/DemoVideoSection";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  // Check if Supabase is configured
  const isSupabaseConfigured =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Redirect logged-in users to dashboard (only if Supabase is configured)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          router.push("/dashboard");
        }
      } catch (error) {
        // Supabase not configured, ignore
        console.log("Supabase not configured, skipping user check");
      }
    };
    checkUser();
  }, [router, isSupabaseConfigured]);

  const handleDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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
              RebookFlow
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
              href="/demo"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-block mb-4 px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-semibold text-sm">
          💇‍♀️ Smart Client Return System for Salons
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          Turn Casual Clients Into
          <br />
          Loyal Regulars — Automatically
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Every salon loses money from clients who forget to rebook, miss
          appointments, or disappear after one visit. RebookFlow tracks when
          each client is due back and sends smart reminders that bring them back
          in.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Get Started Free →
          </Link>
          <Link
            href="/demo"
            className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-50 transform hover:scale-105 transition-all"
          >
            <Sparkles className="inline mr-2 h-5 w-5" />
            Try Demo
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          🎉 Early adopters get{" "}
          <span className="font-bold text-purple-600">50% OFF for life</span>
        </p>
      </section>

      {/* Demo Video Section */}
      <DemoVideoSection />

      {/* Stats Bar */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">20-40%</div>
              <div className="text-purple-100">Increase in Repeat Bookings</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2-3 min</div>
              <div className="text-purple-100">Quick Demo Setup</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Zero</div>
              <div className="text-purple-100">Extra Admin Work</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">The Problem</h2>
          <p className="text-xl text-gray-600">
            Most salons struggle with client retention
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Clients not returning after their first appointment",
            "Empty spaces in the calendar",
            "No-shows costing money",
            "No time to manually chase clients",
            "No system to track who's due back & when",
            "Inconsistent income and lost repeat business",
          ].map((problem, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-100 hover:border-red-300 hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="text-red-500 text-4xl mb-3">⚠️</div>
              <p className="text-gray-700 font-medium">{problem}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-gradient-to-br from-purple-100 to-pink-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              The Solution
            </h2>
            <p className="text-2xl text-purple-600 font-semibold">
              A Simple Automated System That Increases Repeat Bookings by 20–40%
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Calendar className="w-8 h-8" />,
                text: "Tracks every client's typical return cycle",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                text: "Predicts when they are due back",
              },
              {
                icon: <MessageCircle className="w-8 h-8" />,
                text: "Sends personalised return reminders",
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                text: "Helps you fill empty slots",
              },
              {
                icon: <Bell className="w-8 h-8" />,
                text: "Reduces no-shows",
              },
              {
                icon: <Users className="w-8 h-8" />,
                text: "Improves client loyalty",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <div className="text-purple-600 mb-3">{item.icon}</div>
                <p className="text-gray-700 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-12 text-2xl font-bold text-gray-900">
            You stay fully booked — without doing extra admin.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Key Features
          </h2>
        </div>
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 bg-gradient-to-br from-purple-600 to-pink-600 p-12 rounded-3xl text-white shadow-2xl">
              <Calendar className="w-16 h-16 mb-4" />
              <h3 className="text-3xl font-bold mb-4">Smart Return Tracking</h3>
              <p className="text-lg text-purple-100">
                Automatically calculates when each client is due their next
                appointment based on their last visit + service type.
              </p>
            </div>
            <div className="flex-1">
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="font-medium">
                      Sarah - Due in 3 days (Color)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">
                      Emma - Overdue 5 days (Cut)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="font-medium">
                      Lisa - Due in 1 week (Treatment)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1 bg-gradient-to-br from-pink-600 to-purple-600 p-12 rounded-3xl text-white shadow-2xl">
              <MessageCircle className="w-16 h-16 mb-4" />
              <h3 className="text-3xl font-bold mb-4">Automated Reminders</h3>
              <p className="text-lg text-pink-100">
                Gentle, friendly reminders sent at optimal times to bring
                clients back.
              </p>
            </div>
            <div className="flex-1">
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                  <p className="text-sm text-gray-600 mb-2">WhatsApp Preview</p>
                  <p className="text-gray-800 font-medium">
                    "Hi Sarah! 👋 It's been 6 weeks since your last color. Ready
                    for a refresh? Reply YES to book your next appointment! ✨"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 bg-gradient-to-br from-purple-600 to-pink-600 p-12 rounded-3xl text-white shadow-2xl">
              <BarChart3 className="w-16 h-16 mb-4" />
              <h3 className="text-3xl font-bold mb-4">Client Dashboard</h3>
              <p className="text-lg text-purple-100">
                See who is overdue, who is due soon, and who recently rebooked.
              </p>
            </div>
            <div className="flex-1">
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-red-600">12</div>
                    <div className="text-sm text-gray-600">Overdue</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-orange-600">28</div>
                    <div className="text-sm text-gray-600">Due Soon</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-green-600">45</div>
                    <div className="text-sm text-gray-600">Rebooked</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-purple-900 to-pink-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-purple-200">
              Simple setup, powerful results
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                num: "1",
                title: "Add Your Clients",
                desc: "Upload a simple list or import from your booking system",
              },
              {
                num: "2",
                title: "System Tracks",
                desc: "We calculate typical rebooking intervals",
              },
              {
                num: "3",
                title: "Auto Notifications",
                desc: "Friendly reminders go out automatically",
              },
              {
                num: "4",
                title: "Stay Fully Booked",
                desc: "More repeat bookings → more revenue",
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-white text-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-purple-200">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Simple & Affordable Pricing
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Starter",
              price: "£29",
              desc: "Perfect for smaller salons",
              features: [
                "Up to 100 clients",
                "Basic reminders",
                "Email support",
                "Client dashboard",
              ],
            },
            {
              name: "Pro",
              price: "£49",
              desc: "Most popular for growing salons",
              features: [
                "Unlimited clients",
                "Custom reminders",
                "Full analytics",
                "Priority support",
                "SMS + Email",
              ],
              popular: true,
            },
            {
              name: "Business",
              price: "£99",
              desc: "For multi-branch salons",
              features: [
                "Everything in Pro",
                "White-label option",
                "Team accounts",
                "Advanced CRM",
                "Multi-branch support",
              ],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`bg-white p-8 rounded-3xl shadow-xl ${
                plan.popular ? "ring-4 ring-purple-600 transform scale-105" : ""
              } hover:shadow-2xl transition-all`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 -mt-8 mx-4 rounded-full font-bold mb-4">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                {plan.name}
              </h3>
              <p className="text-gray-600 mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block w-full py-3 rounded-full font-bold text-center transition-all transform hover:scale-105 ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg"
                    : "border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-xl text-purple-600 font-bold">
          🎉 Early adopters get 50% OFF for life
        </p>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Try RebookFlow Free Today
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            See exactly how the system works — no pressure, no commitment.
          </p>
          <form
            onSubmit={handleDemo}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50 font-medium"
              required
            />
            <button
              type="submit"
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Get Started →
            </button>
          </form>
          {showSuccess && (
            <div className="mt-4 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full inline-block">
              ✅ Thanks! We'll be in touch shortly.
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
            <Link
              href="/demo"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transform hover:scale-105 transition-all"
            >
              <Sparkles className="inline mr-2 h-5 w-5" />
              Try Demo
            </Link>
          </div>
          <p className="mt-6 text-purple-100">
            Or simply click "Try Demo" to preview the full system
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 mb-4 md:mb-0 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">RebookFlow</span>
            </Link>
            <p className="text-gray-400 text-center mb-4 md:mb-0">
              Built for salon owners who want to stay fully booked
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/login"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            © 2025 RebookFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
