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
import type { FoodFormSubmitValues, FoodItem } from "@/types/inventory";
import { invalidateInventoryQueries, subscribeInventoryInvalidation } from "./inventory-events";
import { useGetWithCache } from "./use-get-with-cache";

let itemsCache: FoodItem[] | null = null;

const cache = {
  get: () => itemsCache,
  set: (data: FoodItem[]) => {
    itemsCache = data;
  },
};

export function useInventoryItems() {
  const { isWriteBlocked } = useApiConnection();
  const fetcher = useCallback(() => getInventoryItems(), []);
  const query = useGetWithCache({
    cache,
    fetcher,
    subscribe: subscribeInventoryInvalidation,
  });

  const createItem = useCallback(
    async (values: FoodFormSubmitValues) => {
      if (isWriteBlocked) {
        throw new Error("Nao foi possivel salvar alteracoes no momento.");
      }

      const createdItem = await createInventoryItem(values);

      if (values.photoFile) {
        await uploadInventoryItemPhoto(createdItem.id, values.photoFile);
      }

      invalidateInventoryQueries();
      return createdItem;
    },
    [isWriteBlocked],
  );

  const updateItem = useCallback(
    async (item: FoodItem, values: FoodFormSubmitValues) => {
      if (isWriteBlocked) {
        throw new Error("Nao foi possivel salvar alteracoes no momento.");
      }

      const updatedItem = await updateInventoryItem(
        item.id,
        values,
        item.version ?? 0,
      );

      for (const photoId of values.removedPhotoIds ?? []) {
        await deleteInventoryItemPhoto(item.id, photoId);
      }

      if (values.photoFile) {
        await uploadInventoryItemPhoto(item.id, values.photoFile);
      }

      invalidateInventoryQueries();
      return updatedItem;
    },
    [isWriteBlocked],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (isWriteBlocked) {
        throw new Error("Nao foi possivel salvar alteracoes no momento.");
      }

      await deleteInventoryItem(itemId);
      invalidateInventoryQueries();
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
