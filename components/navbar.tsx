"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, Calendar, FileText, Settings, LogOut, BarChart3 } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              RebookFlow
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-purple-600">
                <Calendar className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/clients">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-purple-600">
                <Users className="mr-2 h-4 w-4" />
                Clients
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-purple-600">
                <FileText className="mr-2 h-4 w-4" />
                Templates
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-purple-600">
                <BarChart3 className="mr-2 h-4 w-4" />
                Reports
              </Button>
            </Link>
            <Link href="/dashboard/settings/service-rules">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-purple-600">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-purple-200 text-purple-600 hover:bg-purple-50">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

