"use client";

import { useState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/Button";
import { Notification } from "@/components/ui/Notification";
import { useAuth } from "@/hooks/useAuth";

export function LoginButton() {
  const { loginWithGoogle } = useAuth();
  const [isRedirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (isRedirecting) {
      return;
    }

    setRedirecting(true);
    setError(null);

    try {
      await loginWithGoogle();
    } catch {
      setRedirecting(false);
      setError(
        "Nao foi possivel concluir o login agora. Tente novamente em instantes.",
      );
    }
  }

  return (
    <>
      <Button
        aria-busy={isRedirecting}
        className="mt-6 w-full"
        disabled={isRedirecting}
        icon={
          isRedirecting ? (
            <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.9} />
          ) : (
            <LogIn className="h-5 w-5" strokeWidth={1.9} />
          )
        }
        onClick={handleLogin}
      >
        {isRedirecting ? "Redirecionando..." : "Entrar com Google"}
      </Button>

      {error ? (
        <Notification className="mt-3" context="auth" title={error} />
      ) : null}
    </>
  );
}
