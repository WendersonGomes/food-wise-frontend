"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { UnauthorizedError } from "@/lib/api/api-errors";
import {
  getCurrentUser,
  loginWithGoogle as redirectToGoogle,
  logout as logoutFromGateway,
} from "@/services/auth.service";
import type { AuthContextValue, AuthUser } from "@/types/auth";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedSession = useRef(false);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (requestError) {
      setUser(null);

      if (!(requestError instanceof UnauthorizedError)) {
        setError(
          "Não foi possível carregar sua sessão. Tente entrar novamente.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedSession.current) {
      return;
    }

    hasLoadedSession.current = true;
    void refreshUser();
  }, [refreshUser]);

  const loginWithGoogle = useCallback(async () => {
    await redirectToGoogle();
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutFromGateway();
      setUser(null);
      setError(null);
    } catch {
      setError(
        "Não foi possível sair da conta. Tente novamente em alguns instantes.",
      );
      throw new Error("Não foi possível sair da conta.");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      error,
      loginWithGoogle,
      logout,
      refreshUser,
    }),
    [error, isLoading, loginWithGoogle, logout, refreshUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
