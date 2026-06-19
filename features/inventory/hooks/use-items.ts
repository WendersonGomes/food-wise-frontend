"use client";

import { useCallback } from "react";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  updateInventoryItem,
} from "@/features/inventory/api/items-api";
import {
  deleteInventoryItemPhoto,
  uploadInventoryItemPhoto,
} from "@/features/inventory/api/photos-api";
import { useApiConnection } from "@/hooks/useApiConnection";
import { useAuth } from "@/hooks/useAuth";
import { ApiClientError } from "@/lib/api/api-errors";
import type { FoodFormSubmitValues, FoodItem } from "@/types/inventory";
import {
  invalidateInventoryDashboard,
  invalidateInventoryItems,
  subscribeInventoryClear,
  subscribeInventoryItemsInvalidation,
} from "./inventory-events";
import { useGetWithCache } from "./use-get-with-cache";

let itemsCache: FoodItem[] | null = null;
export const itemsCacheKey = "inventory:items";

function createWriteBlockedError() {
  return new ApiClientError({
    message: "Nao foi possivel salvar alteracoes no momento.",
    code: "WRITE_BLOCKED",
  });
}

const cache = {
  get: () => itemsCache,
  set: (data: FoodItem[]) => {
    itemsCache = data;
  },
  clear: () => {
    itemsCache = null;
  },
};

function upsertCachedItem(item: FoodItem) {
  const currentItems = itemsCache ?? [];
  const itemIndex = currentItems.findIndex((currentItem) => currentItem.id === item.id);

  itemsCache =
    itemIndex >= 0
      ? currentItems.map((currentItem) =>
          currentItem.id === item.id ? item : currentItem,
        )
      : [item, ...currentItems];
}

function removeCachedItem(itemId: string) {
  itemsCache = (itemsCache ?? []).filter((item) => item.id !== itemId);
}

function normalizeText(value: string | undefined) {
  return value?.trim().toLocaleLowerCase("pt-BR") ?? "";
}

function normalizeOptionalDate(value: string | undefined) {
  return value?.trim() ?? "";
}

function isSameQuantity(first: number, second: number) {
  return Math.abs(Number(first) - Number(second)) < 0.001;
}

function isCompatibleCreatedItem(
  item: FoodItem,
  values: FoodFormSubmitValues,
) {
  return (
    normalizeText(item.name) === normalizeText(values.name) &&
    normalizeText(item.brand) === normalizeText(values.brand) &&
    item.storageLocation === values.storageLocation &&
    item.quantityUnit === values.quantityUnit &&
    isSameQuantity(item.quantity, values.quantity) &&
    (item.categoryId ?? "") === (values.categoryId?.trim() ?? "") &&
    normalizeOptionalDate(item.manufacturedAt) ===
      normalizeOptionalDate(values.manufacturedAt) &&
    normalizeOptionalDate(item.expiresAt) ===
      normalizeOptionalDate(values.expiresAt) &&
    normalizeOptionalDate(item.openedAt) === normalizeOptionalDate(values.openedAt)
  );
}

function createAmbiguousCreateTimeoutError(error: ApiClientError) {
  return new ApiClientError({
    message:
      "O servidor demorou para responder. Verifique se o item foi criado antes de tentar novamente.",
    statusCode: error.statusCode,
    code: "ITEM_CREATE_TIMEOUT_AMBIGUOUS",
    endpoint: error.endpoint,
    method: error.method,
    url: error.url,
    requestId: error.requestId,
    details: error.details,
  });
}

export function clearInventoryItemsCache() {
  itemsCache = null;
}

export function useInventoryItems() {
  const { status } = useAuth();
  const { isWriteBlocked } = useApiConnection();
  const fetcher = useCallback(() => getInventoryItems(), []);
  const query = useGetWithCache({
    cache,
    cacheKey: itemsCacheKey,
    enabled: status === "authenticated",
    fetcher,
    staleTimeMs: 20_000,
    subscribeClear: subscribeInventoryClear,
    subscribe: subscribeInventoryItemsInvalidation,
  });

  const createItem = useCallback(
    async (values: FoodFormSubmitValues) => {
      if (isWriteBlocked) {
        throw createWriteBlockedError();
      }

      let createdItem: FoodItem;

      try {
        createdItem = await createInventoryItem(values);
      } catch (error) {
        if (error instanceof ApiClientError && error.statusCode === 504) {
          const freshItems = await query.refetch({ force: true });
          const compatibleItem = freshItems?.find((item) =>
            isCompatibleCreatedItem(item, values),
          );

          if (compatibleItem) {
            upsertCachedItem(compatibleItem);
            invalidateInventoryDashboard();
            return compatibleItem;
          }

          throw createAmbiguousCreateTimeoutError(error);
        }

        throw error;
      }

      if (values.photoFile) {
        await uploadInventoryItemPhoto(createdItem.id, values.photoFile);
      }

      upsertCachedItem(createdItem);
      invalidateInventoryItems();
      invalidateInventoryDashboard();
      return createdItem;
    },
    [isWriteBlocked, query],
  );

  const updateItem = useCallback(
    async (item: FoodItem, values: FoodFormSubmitValues) => {
      if (isWriteBlocked) {
        throw createWriteBlockedError();
      }

      let updatedItem: FoodItem;

      try {
        updatedItem = await updateInventoryItem(
          item.id,
          values,
          item.version ?? 0,
        );
      } catch (error) {
        if (error instanceof ApiClientError && error.code === "ITEM_VERSION_CONFLICT") {
          invalidateInventoryItems();
          await query.refetch({ force: true }).catch(() => undefined);
        }

        throw error;
      }

      for (const photoId of values.removedPhotoIds ?? []) {
        await deleteInventoryItemPhoto(item.id, photoId);
      }

      if (values.photoFile) {
        await uploadInventoryItemPhoto(item.id, values.photoFile);
      }

      upsertCachedItem(updatedItem);
      invalidateInventoryItems();
      invalidateInventoryDashboard();
      return updatedItem;
    },
    [isWriteBlocked, query],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (isWriteBlocked) {
        throw createWriteBlockedError();
      }

      await deleteInventoryItem(itemId);
      removeCachedItem(itemId);
      invalidateInventoryItems();
      invalidateInventoryDashboard();
    },
    [isWriteBlocked],
  );

  return {
    ...query,
    items: query.data ?? [],
    createItem,
    updateItem,
    removeItem,
  };
}
