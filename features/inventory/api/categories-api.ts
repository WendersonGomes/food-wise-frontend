import { gatewayFetch } from "@/lib/api/gateway-client";
import type { CategoryIconName, FoodCategory } from "@/types/inventory";
import { getCategoriesFromResponse, normalizeCategory } from "./inventory-mappers";

export type CategoryWriteValues = {
  name: string;
  icon?: CategoryIconName;
  color?: string;
};

function toCategoryPayload(values: CategoryWriteValues) {
  return Object.fromEntries(
    Object.entries({
      name: values.name,
      icon: values.icon,
      color: values.color,
    }).filter(([, value]) => value !== undefined && value !== ""),
  );
}

export async function getInventoryCategories(): Promise<FoodCategory[]> {
  const response = await gatewayFetch<unknown>("/api/inventory/categories");

  return getCategoriesFromResponse(response);
}

export async function createInventoryCategory(
  values: CategoryWriteValues,
): Promise<FoodCategory> {
  const response = await gatewayFetch<unknown>("/api/inventory/categories", {
    method: "POST",
    body: JSON.stringify(toCategoryPayload(values)),
  });

  return normalizeCategory(response);
}

export async function updateInventoryCategory(
  categoryId: string,
  values: CategoryWriteValues,
): Promise<FoodCategory> {
  const response = await gatewayFetch<unknown>(
    `/api/inventory/categories/${categoryId}`,
    {
      method: "PATCH",
      body: JSON.stringify(toCategoryPayload(values)),
    },
  );

  return normalizeCategory(response);
}

export async function deleteInventoryCategory(categoryId: string): Promise<void> {
  await gatewayFetch<void>(`/api/inventory/categories/${categoryId}`, {
    method: "DELETE",
  });
}
