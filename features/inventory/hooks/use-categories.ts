"use client";

import { useCallback } from "react";
import {
  createInventoryCategory,
  deleteInventoryCategory,
  getInventoryCategories,
  type CategoryWriteValues,
  updateInventoryCategory,
} from "@/features/inventory/api/categories-api";
import { useApiConnection } from "@/hooks/useApiConnection";
import { mergeWithSystemCategories } from "@/lib/inventory";
import type { FoodCategory } from "@/types/inventory";
import { invalidateInventoryQueries, subscribeInventoryInvalidation } from "./inventory-events";
import { useGetWithCache } from "./use-get-with-cache";

let categoriesCache: FoodCategory[] | null = null;

const cache = {
  get: () => categoriesCache,
  set: (data: FoodCategory[]) => {
    categoriesCache = data;
  },
};

export function useInventoryCategories() {
  const { isWriteBlocked } = useApiConnection();
  const fetcher = useCallback(() => getInventoryCategories(), []);
  const query = useGetWithCache({
    cache,
    fetcher,
    subscribe: subscribeInventoryInvalidation,
  });

  const createCategory = useCallback(
    async (values: CategoryWriteValues) => {
      if (isWriteBlocked) {
        throw new Error("Nao foi possivel salvar alteracoes no momento.");
      }

      const category = await createInventoryCategory(values);
      invalidateInventoryQueries();
      return category;
    },
    [isWriteBlocked],
  );

  const updateCategory = useCallback(
    async (category: FoodCategory) => {
      if (category.isSystem) {
        return category;
      }

      if (isWriteBlocked) {
        throw new Error("Nao foi possivel salvar alteracoes no momento.");
      }

      const updatedCategory = await updateInventoryCategory(category.id, {
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
      invalidateInventoryQueries();
      return updatedCategory;
    },
    [isWriteBlocked],
  );

  const removeCategory = useCallback(
    async (category: FoodCategory) => {
      if (category.isSystem) {
        return;
      }

      if (isWriteBlocked) {
        throw new Error("Nao foi possivel salvar alteracoes no momento.");
      }

      await deleteInventoryCategory(category.id);
      invalidateInventoryQueries();
    },
    [isWriteBlocked],
  );

  return {
    ...query,
    categories: mergeWithSystemCategories(query.data ?? []),
    createCategory,
    updateCategory,
    removeCategory,
  };
}
