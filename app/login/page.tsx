"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { handleDemoLogin } from "@/app/actions/demoLogin";
import { Sparkles, Calendar } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleDemoClick = async () => {
    setDemoLoading(true);
    setError(null);

    try {
      await handleDemoLogin();
      // Redirect happens server-side
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load demo");
      setDemoLoading(false);
    }
  };

  // Check if Supabase is configured
  const isConfigured = typeof window !== "undefined" && 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to RebookFlow
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConfigured && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 font-medium mb-1">
                ⚠️ Supabase Not Configured
              </p>
              <p className="text-xs text-yellow-700">
                Please add your Supabase credentials to <code className="bg-yellow-100 px-1 rounded">.env.local</code>
              </p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full font-bold text-base py-3" disabled={loading || demoLoading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-purple-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500 font-medium">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full font-bold text-base py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
              onClick={handleDemoClick}
              disabled={loading || demoLoading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {demoLoading ? "Loading demo..." : "Try Demo"}
            </Button>

            <div className="text-center text-sm mt-4">
              <span className="text-gray-600">Don't have an account? </span>
              <Link href="/signup" className="text-purple-600 font-semibold hover:underline hover:text-pink-600 transition-colors">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

