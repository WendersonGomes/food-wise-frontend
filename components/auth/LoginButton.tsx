"use client";

import { useState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";

export function LoginButton() {
  const { loginWithGoogle } = useAuth();
  const [isRedirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLogin() {
    if (isRedirecting) {
      return;
    }

    setRedirecting(true);
    setError(null);

    try {
      loginWithGoogle();
    } catch {
      setRedirecting(false);
      setError("Não foi possível iniciar o login. Tente novamente.");
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
        <p className="mt-3 text-sm leading-6 text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
