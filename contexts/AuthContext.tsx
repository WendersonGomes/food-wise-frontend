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
import { isUnauthorizedApiError } from "@/lib/api/api-errors";
import { getUserFriendlyErrorMessage } from "@/lib/api/api-error-messages";
import { clearInventoryClientCaches } from "@/features/inventory/hooks/inventory-events";
import {
  getCurrentUser,
  loginWithGoogle as redirectToGoogle,
  logout as logoutFromGateway,
  refreshAuthSession,
} from "@/services/auth.service";
import type { AuthContextValue, AuthStatus, AuthUser } from "@/types/auth";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

function logDevelopmentError(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}

function clearProtectedClientState() {
  clearInventoryClientCaches();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const hasBootstrapped = useRef(false);

  const setUnauthenticated = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
    clearProtectedClientState();
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setStatus("authenticated");
    setError(null);
    return currentUser;
  }, []);

  const bootstrapSession = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      await loadCurrentUser();
    } catch (requestError) {
      if (!isUnauthorizedApiError(requestError)) {
        logDevelopmentError(requestError);
        setError(getUserFriendlyErrorMessage(requestError));
        setUnauthenticated();
        return;
      }

      try {
        await refreshAuthSession();
        await loadCurrentUser();
      } catch (refreshError) {
        if (!isUnauthorizedApiError(refreshError)) {
          logDevelopmentError(refreshError);
          setError(getUserFriendlyErrorMessage(refreshError));
        }

        setUnauthenticated();
      }
    }
  }, [loadCurrentUser, setUnauthenticated]);

  useEffect(() => {
    if (hasBootstrapped.current) {
      return;
    }

    hasBootstrapped.current = true;
    void bootstrapSession();
  }, [bootstrapSession]);

  const loginWithGoogle = useCallback(async () => {
    setError(null);

    try {
      await redirectToGoogle();
    } catch (requestError) {
      logDevelopmentError(requestError);
      setError(getUserFriendlyErrorMessage(requestError));
      throw requestError;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      await refreshAuthSession();
      await loadCurrentUser();
    } catch (requestError) {
      if (!isUnauthorizedApiError(requestError)) {
        logDevelopmentError(requestError);
        setError(getUserFriendlyErrorMessage(requestError));
      }

      setUnauthenticated();
      throw requestError;
    }
  }, [loadCurrentUser, setUnauthenticated]);

  const logout = useCallback(async () => {
    setError(null);

    try {
      await logoutFromGateway();
    } catch (requestError) {
      logDevelopmentError(requestError);
      setError(getUserFriendlyErrorMessage(requestError));
      throw requestError;
    } finally {
      setUnauthenticated();
    }
  }, [setUnauthenticated]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isLoading: status === "loading",
      isAuthenticated: status === "authenticated",
      error,
      loginWithGoogle,
      logout,
      refresh,
      reloadMe: bootstrapSession,
      refreshUser: bootstrapSession,
    }),
    [bootstrapSession, error, loginWithGoogle, logout, refresh, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
