import { apiFetch } from "@/lib/api/gateway-client";
import { type FoodFormSubmitValues, type FoodItem } from "@/types/inventory";
import { getItemsFromResponse, normalizeFoodItem } from "./inventory-mappers";

type ItemPayload = {
  name: string;
  brand?: string;
  categoryId?: string;
  quantity: number;
  unit: FoodFormSubmitValues["quantityUnit"];
  storageLocation: FoodFormSubmitValues["storageLocation"];
  manufacturedAt?: string;
  expiresAt?: string;
  openedAt?: string;
  notes?: string;
};

type OptionalItemPayload = Omit<
  ItemPayload,
  "name" | "quantity" | "unit" | "storageLocation"
>;

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function addOptionalString<K extends keyof OptionalItemPayload>(
  payload: ItemPayload,
  key: K,
  value: string | undefined,
) {
  const normalizedValue = value?.trim();

  if (normalizedValue) {
    payload[key] = normalizedValue;
  }
}

function addOptionalUuid(
  payload: ItemPayload,
  key: keyof Pick<ItemPayload, "categoryId">,
  value: string | undefined,
) {
  const normalizedValue = value?.trim();

  if (normalizedValue && uuidRegex.test(normalizedValue)) {
    payload[key] = normalizedValue;
  }
}

function toPayloadNumber(value: number) {
  return Number(Number(value).toFixed(3));
}

function toItemPayload(values: FoodFormSubmitValues): ItemPayload {
  const payload: ItemPayload = {
    name: values.name.trim(),
    quantity: toPayloadNumber(values.quantity),
    unit: values.quantityUnit,
    storageLocation: values.storageLocation,
  };

  addOptionalString(payload, "brand", values.brand);
  addOptionalUuid(payload, "categoryId", values.categoryId);
  addOptionalString(payload, "manufacturedAt", values.manufacturedAt);
  addOptionalString(payload, "expiresAt", values.expiresAt);
  addOptionalString(payload, "openedAt", values.openedAt);
  addOptionalString(payload, "notes", values.notes);

  return payload;
}

export async function getInventoryItems(): Promise<FoodItem[]> {
  const response = await apiFetch<unknown>("/api/inventory/items");

  return getItemsFromResponse(response);
}

export async function getInventoryItem(itemId: string): Promise<FoodItem> {
  const response = await apiFetch<unknown>(`/api/inventory/items/${itemId}`);

  return normalizeFoodItem(response);
}

export async function createInventoryItem(
  values: FoodFormSubmitValues,
): Promise<FoodItem> {
  const response = await apiFetch<unknown>("/api/inventory/items", {
    method: "POST",
    body: JSON.stringify(toItemPayload(values)),
  });

  return normalizeFoodItem(response);
}

export async function updateInventoryItem(
  itemId: string,
  values: FoodFormSubmitValues,
  expectedVersion: number,
): Promise<FoodItem> {
  const response = await apiFetch<unknown>(`/api/inventory/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({
      expectedVersion: Number(expectedVersion),
      ...toItemPayload(values),
    }),
  });

  return normalizeFoodItem(response);
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
  await apiFetch<void>(`/api/inventory/items/${itemId}`, {
    method: "DELETE",
  });
}
