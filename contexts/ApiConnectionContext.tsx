"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ApiConnectionStatus =
  | "ONLINE"
  | "DEGRADED"
  | "OFFLINE"
  | "RECOVERING";

type ApiConnectionContextValue = {
  status: ApiConnectionStatus;
  isWriteBlocked: boolean;
  retrySignal: number;
  markOnline: () => void;
  markDegraded: () => void;
  markOffline: () => void;
  markRecovering: () => void;
  markUnavailable: (hasStaleData: boolean) => void;
  requestRetry: () => void;
};

export const ApiConnectionContext = createContext<
  ApiConnectionContextValue | undefined
>(undefined);

export function ApiConnectionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ApiConnectionStatus>("ONLINE");
  const failureCountRef = useRef(0);
  const [retrySignal, setRetrySignal] = useState(0);

  const markOnline = useCallback(() => {
    failureCountRef.current = 0;
    setStatus("ONLINE");
  }, []);

  const markDegraded = useCallback(() => {
    setStatus("DEGRADED");
  }, []);

  const markOffline = useCallback(() => {
    setStatus("OFFLINE");
  }, []);

  const markRecovering = useCallback(() => {
    setStatus((currentStatus) =>
      currentStatus === "ONLINE" ? "ONLINE" : "RECOVERING",
    );
  }, []);

  const markUnavailable = useCallback(
    (hasStaleData: boolean) => {
      failureCountRef.current += 1;

      if (!hasStaleData || failureCountRef.current >= 2) {
        markOffline();
      } else {
        markDegraded();
      }
    },
    [markDegraded, markOffline],
  );

  const requestRetry = useCallback(() => {
    markRecovering();
    setRetrySignal((currentSignal) => currentSignal + 1);
  }, [markRecovering]);

  const value = useMemo<ApiConnectionContextValue>(
    () => ({
      status,
      isWriteBlocked: status !== "ONLINE",
      retrySignal,
      markOnline,
      markDegraded,
      markOffline,
      markRecovering,
      markUnavailable,
      requestRetry,
    }),
    [
      markDegraded,
      markOffline,
      markOnline,
      markRecovering,
      markUnavailable,
      requestRetry,
      retrySignal,
      status,
    ],
  );

  return (
    <ApiConnectionContext.Provider value={value}>
      {children}
    </ApiConnectionContext.Provider>
  );
}
