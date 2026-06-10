"use client";

import { useCallback } from "react";
import { getInventoryDashboardSummary } from "@/features/inventory/api/dashboard-api";
import type { InventoryDashboardSummary } from "@/types/inventory";
import { subscribeInventoryInvalidation } from "./inventory-events";
import { useGetWithCache } from "./use-get-with-cache";

let dashboardCache: InventoryDashboardSummary | null = null;

const cache = {
  get: () => dashboardCache,
  set: (data: InventoryDashboardSummary) => {
    dashboardCache = data;
  },
};

export function useInventoryDashboard() {
  const fetcher = useCallback(() => getInventoryDashboardSummary(), []);

  return useGetWithCache({
    cache,
    fetcher,
    subscribe: subscribeInventoryInvalidation,
  });
}
