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
import { useAuth } from "@/hooks/useAuth";
import { ApiClientError } from "@/lib/api/api-errors";
import { mergeWithSystemCategories } from "@/lib/inventory";
import type { FoodCategory } from "@/types/inventory";
import {
  invalidateInventoryCategories,
  subscribeInventoryClear,
  subscribeInventoryCategoriesInvalidation,
} from "./inventory-events";
import { useGetWithCache } from "./use-get-with-cache";

let categoriesCache: FoodCategory[] | null = null;
export const categoriesCacheKey = "inventory:categories";

function createWriteBlockedError() {
  return new ApiClientError({
    message: "Nao foi possivel salvar alteracoes no momento.",
    code: "WRITE_BLOCKED",
  });
}

const cache = {
  get: () => categoriesCache,
  set: (data: FoodCategory[]) => {
    categoriesCache = data;
  },
  clear: () => {
    categoriesCache = null;
  },
};

function upsertCachedCategory(category: FoodCategory) {
  const currentCategories = categoriesCache ?? [];
  const categoryIndex = currentCategories.findIndex(
    (currentCategory) => currentCategory.id === category.id,
  );

  categoriesCache =
    categoryIndex >= 0
      ? currentCategories.map((currentCategory) =>
          currentCategory.id === category.id ? category : currentCategory,
        )
      : [...currentCategories, category];
}

function removeCachedCategory(categoryId: string) {
  categoriesCache = (categoriesCache ?? []).filter(
    (category) => category.id !== categoryId,
  );
}

export function clearInventoryCategoriesCache() {
  categoriesCache = null;
}

export function useInventoryCategories() {
  const { status } = useAuth();
  const { isWriteBlocked } = useApiConnection();
  const fetcher = useCallback(() => getInventoryCategories(), []);
  const query = useGetWithCache({
    cache,
    cacheKey: categoriesCacheKey,
    enabled: status === "authenticated",
    fetcher,
    staleTimeMs: 60_000,
    subscribeClear: subscribeInventoryClear,
    subscribe: subscribeInventoryCategoriesInvalidation,
  });

  const createCategory = useCallback(
    async (values: CategoryWriteValues) => {
      if (isWriteBlocked) {
        throw createWriteBlockedError();
      }

      const category = await createInventoryCategory(values);
      upsertCachedCategory(category);
      invalidateInventoryCategories();
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
        throw createWriteBlockedError();
      }

      const updatedCategory = await updateInventoryCategory(category.id, {
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
      upsertCachedCategory(updatedCategory);
      invalidateInventoryCategories();
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
        throw createWriteBlockedError();
      }

      await deleteInventoryCategory(category.id);
      removeCachedCategory(category.id);
      invalidateInventoryCategories();
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
