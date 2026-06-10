import { gatewayFetch } from "@/lib/api/gateway-client";
import type { InventoryDashboardSummary } from "@/types/inventory";
import { normalizeDashboardSummary } from "./inventory-mappers";

export async function getInventoryDashboardSummary(): Promise<InventoryDashboardSummary> {
  const response = await gatewayFetch<unknown>(
    "/api/inventory/dashboard/summary",
  );

  return normalizeDashboardSummary(response);
}
