"use client";

import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Notification } from "@/components/ui/Notification";
import { useAuth } from "@/hooks/useAuth";
import {
  getApiErrorSupportCode,
  getUserFriendlyErrorMessage,
} from "@/lib/api/api-error-messages";

type LogoutButtonProps = {
  className?: string;
  onLoggedOut?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function LogoutButton({
  className,
  onLoggedOut,
  variant = "ghost",
}: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportCode, setSupportCode] = useState<string | null>(null);

  async function handleLogout() {
    if (isLoading) {
      return;
    }

    setLoading(true);
    setError(null);
    setSupportCode(null);

    try {
      await logout();
      onLoggedOut?.();
      router.replace("/login");
    } catch (requestError) {
      setError(getUserFriendlyErrorMessage(requestError));
      setSupportCode(getApiErrorSupportCode(requestError));
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        aria-busy={isLoading}
        className={className}
        disabled={isLoading}
        icon={
          isLoading ? (
            <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.9} />
          ) : (
            <LogOut className="h-5 w-5" strokeWidth={1.9} />
          )
        }
        variant={variant}
        onClick={() => void handleLogout()}
      >
        {isLoading ? "Saindo..." : "Sair"}
      </Button>

      {error ? (
        <Notification
          className="mt-2"
          context="modal"
          description={
            supportCode ? `Codigo de suporte: ${supportCode}` : undefined
          }
          title={error}
        />
      ) : null}
    </>
  );
}
