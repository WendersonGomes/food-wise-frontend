import { buildGatewayUrl } from "@/lib/api/gateway-client";
import { normalizeName, systemCategories } from "@/lib/inventory";
import {
  QuantityUnit,
  StorageLocation,
  type CategoryIconName,
  type FoodCategory,
  type FoodItem,
  type FoodPhoto,
  type InventoryDashboardSummary,
  type InventorySummaryItem,
  type SystemCategoryCode,
} from "@/types/inventory";

const validIcons = new Set<CategoryIconName>([
  "apple",
  "carrot",
  "beef",
  "milk",
  "cup-soda",
  "croissant",
  "package",
]);

const systemCategoryByCode = new Map(
  systemCategories
    .filter((category) => category.systemCode)
    .map((category) => [category.systemCode, category]),
);

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === "string" && value.trim() ? value : undefined;
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getArray(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  const record = asRecord(value);

  if (Array.isArray(record.items)) {
    return record.items;
  }

  if (Array.isArray(record.data)) {
    return record.data;
  }

  if (Array.isArray(record.categories)) {
    return record.categories;
  }

  if (Array.isArray(record.photos)) {
    return record.photos;
  }

  return [];
}

function normalizeQuantityUnit(value: unknown): QuantityUnit {
  return Object.values(QuantityUnit).includes(value as QuantityUnit)
    ? (value as QuantityUnit)
    : QuantityUnit.UNIT;
}

function normalizeStorageLocation(value: unknown): StorageLocation {
  return Object.values(StorageLocation).includes(value as StorageLocation)
    ? (value as StorageLocation)
    : StorageLocation.PANTRY;
}

function normalizeIcon(value: unknown): CategoryIconName {
  return typeof value === "string" && validIcons.has(value as CategoryIconName)
    ? (value as CategoryIconName)
    : "package";
}

export function getPhotoContentUrl(
  photoId: string,
  variant: "image" | "thumbnail" = "thumbnail",
) {
  return buildGatewayUrl(
    `/api/inventory/photos/${photoId}/content?variant=${variant}`,
  );
}

export function normalizePhoto(payload: unknown): FoodPhoto {
  const photo = asRecord(payload);
  const id = getString(photo, "id") ?? getString(photo, "photoId") ?? "";

  return {
    id,
    itemId: getString(photo, "itemId"),
    url:
      getString(photo, "url") ??
      getString(photo, "contentUrl") ??
      (id ? getPhotoContentUrl(id, "thumbnail") : ""),
    alt: getString(photo, "alt") ?? getString(photo, "fileName"),
  };
}

export function normalizeFoodItem(payload: unknown): FoodItem {
  const item = asRecord(payload);
  const id = getString(item, "id") ?? "";
  const primaryPhotoId = getString(item, "primaryPhotoId");
  const photos = getArray(item.photos).map(normalizePhoto).filter((photo) => photo.id);

  if (primaryPhotoId && !photos.some((photo) => photo.id === primaryPhotoId)) {
    photos.unshift({
      id: primaryPhotoId,
      url: getPhotoContentUrl(primaryPhotoId, "thumbnail"),
    });
  }

  return {
    id,
    name: getString(item, "name") ?? "Alimento sem nome",
    brand: getString(item, "brand"),
    storageLocation: normalizeStorageLocation(item.storageLocation),
    categoryId: getString(item, "categoryId"),
    quantity: getNumber(item, "quantity") ?? 1,
    quantityUnit: normalizeQuantityUnit(item.unit ?? item.quantityUnit),
    manufacturedAt: getString(item, "manufacturedAt"),
    expiresAt: getString(item, "expiresAt"),
    openedAt: getString(item, "openedAt"),
    notes: getString(item, "notes"),
    photos,
    primaryPhotoId,
    createdAt: getString(item, "createdAt") ?? new Date().toISOString(),
    updatedAt: getString(item, "updatedAt"),
    version: getNumber(item, "version"),
  };
}

export function normalizeCategory(payload: unknown): FoodCategory {
  const category = asRecord(payload);
  const name = getString(category, "name") ?? "Categoria";
  const systemCode = getString(category, "systemCode") as
    | SystemCategoryCode
    | undefined;
  const scope = getString(category, "scope");
  const isSystem =
    typeof category.isSystem === "boolean"
      ? category.isSystem
      : scope === "SYSTEM" || Boolean(systemCode);
  const systemCategory = systemCode ? systemCategoryByCode.get(systemCode) : undefined;

  return {
    id: getString(category, "id") ?? systemCategory?.id ?? "",
    name,
    normalizedName: getString(category, "normalizedName") ?? normalizeName(name),
    icon: normalizeIcon(category.icon ?? systemCategory?.icon),
    color: getString(category, "color") ?? systemCategory?.color,
    sortOrder:
      getNumber(category, "sortOrder") ??
      systemCategory?.sortOrder ??
      (isSystem ? 0 : 999),
    isSystem,
    systemCode,
  };
}

export function getItemsFromResponse(payload: unknown) {
  return getArray(payload).map(normalizeFoodItem).filter((item) => item.id);
}

export function getCategoriesFromResponse(payload: unknown) {
  return getArray(payload)
    .map(normalizeCategory)
    .filter((category) => category.id);
}

export function getPhotosFromResponse(payload: unknown) {
  return getArray(payload).map(normalizePhoto).filter((photo) => photo.id);
}

function normalizeSummaryItems(value: unknown): InventorySummaryItem[] {
  return getArray(value).map(normalizeFoodItem);
}

export function normalizeDashboardSummary(
  payload: unknown,
): InventoryDashboardSummary {
  const summary = asRecord(payload);
  const totals = asRecord(summary.totals);
  const storageLocations = asRecord(summary.storageLocations);
  const fridge = asRecord(storageLocations.fridge);
  const freezer = asRecord(storageLocations.freezer);
  const pantry = asRecord(storageLocations.pantry);

  return {
    totalItems: getNumber(totals, "items") ?? 0,
    expiredItems: getNumber(totals, "expired") ?? 0,
    expiringSoonItems: getNumber(totals, "expiringSoon") ?? 0,
    fridgeItems: getNumber(fridge, "items") ?? 0,
    freezerItems: getNumber(freezer, "items") ?? 0,
    pantryItems: getNumber(pantry, "items") ?? 0,
    recentItems: normalizeSummaryItems(summary.recentItems),
    expiringSoon: normalizeSummaryItems(summary.nextToExpire),
  };
}
