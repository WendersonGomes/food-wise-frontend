"use client";

import { useCallback } from "react";
import { getInventoryDashboardSummary } from "@/features/inventory/api/dashboard-api";
import { useAuth } from "@/hooks/useAuth";
import type { InventoryDashboardSummary } from "@/types/inventory";
import {
  subscribeInventoryClear,
  subscribeInventoryDashboardInvalidation,
} from "./inventory-events";
import { useGetWithCache } from "./use-get-with-cache";

let dashboardCache: InventoryDashboardSummary | null = null;
export const dashboardCacheKey = "inventory:dashboard:summary";

const cache = {
  get: () => dashboardCache,
  set: (data: InventoryDashboardSummary) => {
    dashboardCache = data;
  },
  clear: () => {
    dashboardCache = null;
  },
};

export function clearInventoryDashboardCache() {
  dashboardCache = null;
}

export function useInventoryDashboard() {
  const { status } = useAuth();
  const fetcher = useCallback(() => getInventoryDashboardSummary(), []);

  return useGetWithCache({
    cache,
    cacheKey: dashboardCacheKey,
    enabled: status === "authenticated",
    fetcher,
    staleTimeMs: 20_000,
    subscribeClear: subscribeInventoryClear,
    subscribe: subscribeInventoryDashboardInvalidation,
  });
}
