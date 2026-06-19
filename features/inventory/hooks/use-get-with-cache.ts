"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiClientError,
  isApiUnavailableError,
  isRetryableApiError,
} from "@/lib/api/api-errors";
import { useApiConnection } from "@/hooks/useApiConnection";

type CacheAdapter<TData> = {
  get: () => TData | null;
  set: (data: TData) => void;
  clear?: () => void;
};

type UseGetWithCacheOptions<TData> = {
  cache: CacheAdapter<TData>;
  cacheKey: string;
  dedupe?: boolean;
  enabled?: boolean;
  fetcher: () => Promise<TData>;
  refetchOnMount?: boolean;
  staleTimeMs?: number;
  subscribe?: (listener: () => void) => () => void;
  subscribeClear?: (listener: () => void) => () => void;
};

type RefetchOptions = {
  force?: boolean;
};

const inFlightRequests = new Map<string, Promise<unknown>>();
const cacheInvalidators = new Map<string, Set<() => void>>();

export function invalidateCache(key: string) {
  cacheInvalidators.get(key)?.forEach((invalidate) => invalidate());
}

export function clearCacheByPrefix(prefix: string) {
  for (const key of cacheInvalidators.keys()) {
    if (key.startsWith(prefix)) {
      invalidateCache(key);
    }
  }
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getRetryDelay() {
  return 600 + Math.floor(Math.random() * 300);
}

export function useGetWithCache<TData>({
  cache,
  cacheKey,
  dedupe = true,
  enabled = true,
  fetcher,
  refetchOnMount = true,
  staleTimeMs = 0,
  subscribe,
  subscribeClear,
}: UseGetWithCacheOptions<TData>) {
  const [data, setData] = useState<TData | null>(() => cache.get());
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isLoading, setLoading] = useState(enabled && !cache.get());
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(false);
  const requestSeqRef = useRef(0);
  const { markOnline, markRecovering, markUnavailable, retrySignal } =
    useApiConnection();

  const updateState = useCallback(
    (updater: () => void, requestSeq?: number) => {
      if (!isMountedRef.current) {
        return;
      }

      if (
        typeof requestSeq === "number" &&
        requestSeq !== requestSeqRef.current
      ) {
        return;
      }

      updater();
    },
    [],
  );

  const clearLocalCache = useCallback(() => {
    cache.clear?.();

    updateState(() => {
      setData(cache.get());
      setLastSyncedAt(null);
      setError(null);
    });
  }, [cache, updateState]);

  const refetch = useCallback(
    async ({ force = false }: RefetchOptions = {}) => {
      if (!enabled) {
        return cache.get();
      }

      const cachedData = cache.get();
      const isFresh =
        !force &&
        staleTimeMs > 0 &&
        cachedData &&
        lastSyncedAt &&
        Date.now() - lastSyncedAt.getTime() < staleTimeMs;

      if (isFresh) {
        return cachedData;
      }

      const requestSeq = requestSeqRef.current + 1;
      requestSeqRef.current = requestSeq;

      updateState(() => {
        setLoading(!cachedData);
        setError(null);
      });
      markRecovering();

      try {
        let request = dedupe
          ? (inFlightRequests.get(cacheKey) as Promise<TData> | undefined)
          : undefined;

        if (!request) {
          request = (async () => {
            for (let attempt = 0; attempt < 2; attempt += 1) {
              try {
                return await fetcher();
              } catch (requestError) {
                if (!isRetryableApiError(requestError) || attempt === 1) {
                  throw requestError;
                }

                await wait(getRetryDelay());
              }
            }

            throw new ApiClientError({
              message: "Erro ao carregar dados.",
              code: "EMPTY_API_RESPONSE",
            });
          })();

          if (dedupe) {
            inFlightRequests.set(cacheKey, request);
            void request
              .finally(() => {
                if (inFlightRequests.get(cacheKey) === request) {
                  inFlightRequests.delete(cacheKey);
                }
              })
              .catch(() => undefined);
          }
        }

        const freshData = await request;

        if (typeof freshData === "undefined" || freshData === null) {
          throw new ApiClientError({
            message: "Erro ao carregar dados.",
            code: "EMPTY_API_RESPONSE",
          });
        }

        cache.set(freshData);
        updateState(() => {
          setData(freshData);
          setLastSyncedAt(new Date());
          setError(null);
        }, requestSeq);
        markOnline();
        return freshData;
      } catch (requestError) {
        const nextError =
          requestError instanceof Error
            ? requestError
            : new ApiClientError({
                message: "Erro ao carregar dados.",
                code: "EMPTY_API_RESPONSE",
                details: requestError,
              });

        if (isApiUnavailableError(requestError)) {
          markUnavailable(Boolean(cachedData));
          updateState(() => setData(cachedData), requestSeq);
        }

        updateState(() => setError(nextError), requestSeq);
        throw requestError;
      } finally {
        updateState(() => setLoading(false), requestSeq);
      }
    },
    [
      cache,
      cacheKey,
      dedupe,
      enabled,
      fetcher,
      lastSyncedAt,
      markOnline,
      markRecovering,
      markUnavailable,
      staleTimeMs,
      updateState,
    ],
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let invalidators = cacheInvalidators.get(cacheKey);

    if (!invalidators) {
      invalidators = new Set();
      cacheInvalidators.set(cacheKey, invalidators);
    }

    invalidators.add(clearLocalCache);

    return () => {
      invalidators?.delete(clearLocalCache);

      if (invalidators?.size === 0) {
        cacheInvalidators.delete(cacheKey);
      }
    };
  }, [cacheKey, clearLocalCache]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!refetchOnMount) {
      return;
    }

    void refetch().catch(() => undefined);
  }, [enabled, refetch, refetchOnMount, retrySignal]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    function handleOnline() {
      void refetch({ force: true }).catch(() => undefined);
    }

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [enabled, refetch]);

  useEffect(() => {
    if (!subscribe || !enabled) {
      return undefined;
    }

    return subscribe(() => {
      void refetch({ force: true }).catch(() => undefined);
    });
  }, [enabled, refetch, subscribe]);

  useEffect(() => {
    if (!subscribeClear) {
      return undefined;
    }

    return subscribeClear(clearLocalCache);
  }, [clearLocalCache, subscribeClear]);

  return {
    data,
    isLoading: enabled ? isLoading : false,
    error,
    lastSyncedAt,
    refetch,
  };
}
