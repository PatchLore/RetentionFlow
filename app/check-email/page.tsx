"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            We've sent you a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium mb-1">
                ✉️ Check your email for the login link.
              </p>
              <p className="text-xs text-green-700">
                {email && (
                  <>We've sent a magic link to <strong>{email}</strong>. </>
                )}
                Click the link in the email to sign in.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <p className="text-xs text-purple-800 mb-2 font-semibold">What's next?</p>
              <ol className="text-xs text-purple-700 space-y-1 list-decimal list-inside">
                <li>Open your email inbox</li>
                <li>Find the email from RetentionFlow</li>
                <li>Click the "Sign in" button in the email</li>
                <li>You'll be automatically logged in</li>
              </ol>
            </div>

            <Link href="/login">
              <Button variant="outline" className="w-full font-semibold">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}

