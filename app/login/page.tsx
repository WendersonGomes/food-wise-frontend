"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginCard } from "@/components/auth/LoginCard";
import { LoginPageSkeleton } from "@/components/ui/skeletons/LoginPageSkeleton";
import { PublicHeader } from "@/components/PublicHeader";
import { useAuth } from "@/hooks/useAuth";
import { getLoginErrorMessage } from "@/lib/api/api-error-messages";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error, isAuthenticated, isLoading } = useAuth();
  const loginError = getLoginErrorMessage(searchParams.get("error"));

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return <LoginPageSkeleton />;
  }

  return (
    <>
      <PublicHeader />
      <main className="flex min-h-screen mt-25 justify-center bg-background text-foreground">
        <LoginCard error={loginError ?? error} />
      </main>
    </>
  );
}
