"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isApiUnavailableError,
  isRetryableApiError,
} from "@/lib/api/api-errors";
import { useApiConnection } from "@/hooks/useApiConnection";

type UseGetWithCacheOptions<TData> = {
  cache: {
    get: () => TData | null;
    set: (data: TData) => void;
  };
  fetcher: () => Promise<TData>;
  subscribe?: (listener: () => void) => () => void;
};

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getRetryDelay() {
  return 450 + Math.floor(Math.random() * 250);
}

export function useGetWithCache<TData>({
  cache,
  fetcher,
  subscribe,
}: UseGetWithCacheOptions<TData>) {
  const [data, setData] = useState<TData | null>(() => cache.get());
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isLoading, setLoading] = useState(!cache.get());
  const [error, setError] = useState<Error | null>(null);
  const inFlightRef = useRef(false);
  const { markOnline, markRecovering, markUnavailable, retrySignal } =
    useApiConnection();

  const refetch = useCallback(async () => {
    if (inFlightRef.current) {
      return cache.get();
    }

    const staleData = cache.get();

    inFlightRef.current = true;
    setLoading(!staleData);
    setError(null);
    markRecovering();

    try {
      let freshData: TData | null = null;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          freshData = await fetcher();
          break;
        } catch (requestError) {
          if (!isRetryableApiError(requestError) || attempt === 1) {
            throw requestError;
          }

          await wait(getRetryDelay());
        }
      }

      if (!freshData) {
        throw new Error("Erro ao carregar dados.");
      }

      cache.set(freshData);
      setData(freshData);
      setLastSyncedAt(new Date());
      markOnline();
      return freshData;
    } catch (requestError) {
      const nextError =
        requestError instanceof Error
          ? requestError
          : new Error("Erro ao carregar dados.");

      if (isApiUnavailableError(requestError)) {
        markUnavailable(Boolean(staleData));
        setData(staleData);
      }

      setError(nextError);
      throw requestError;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [cache, fetcher, markOnline, markRecovering, markUnavailable]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refetch().catch(() => undefined);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refetch, retrySignal]);

  useEffect(() => {
    function handleOnline() {
      void refetch().catch(() => undefined);
    }

    function handleFocus() {
      void refetch().catch(() => undefined);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetch]);

  useEffect(() => {
    if (!subscribe) {
      return undefined;
    }

    return subscribe(() => {
      void refetch().catch(() => undefined);
    });
  }, [refetch, subscribe]);

  return {
    data,
    isLoading,
    error,
    lastSyncedAt,
    refetch,
  };
}
