"use client";

import { useCallback, useMemo } from "react";
import {
  deleteInventoryItemPhoto,
  getInventoryItemPhotos,
  uploadInventoryItemPhoto,
} from "@/features/inventory/api/photos-api";
import { useApiConnection } from "@/hooks/useApiConnection";
import { useAuth } from "@/hooks/useAuth";
import { ApiClientError } from "@/lib/api/api-errors";
import type { FoodPhoto } from "@/types/inventory";
import {
  invalidateInventoryQueries,
  subscribeInventoryClear,
} from "./inventory-events";
import { useGetWithCache } from "./use-get-with-cache";

const photosCache = new Map<string, FoodPhoto[]>();

function createWriteBlockedError() {
  return new ApiClientError({
    message: "Nao foi possivel salvar alteracoes no momento.",
    code: "WRITE_BLOCKED",
  });
}

export function useInventoryPhotos(itemId: string) {
  const { status } = useAuth();
  const { isWriteBlocked } = useApiConnection();
  const fetcher = useCallback(() => getInventoryItemPhotos(itemId), [itemId]);
  const cache = useMemo(
    () => ({
      get: () => photosCache.get(itemId) ?? null,
      set: (data: FoodPhoto[]) => {
        photosCache.set(itemId, data);
      },
      clear: () => {
        photosCache.delete(itemId);
      },
    }),
    [itemId],
  );
  const query = useGetWithCache({
    cache,
    cacheKey: `inventory:items:${itemId}:photos`,
    enabled: status === "authenticated",
    fetcher,
    staleTimeMs: 30_000,
    subscribeClear: subscribeInventoryClear,
  });

  const uploadPhoto = useCallback(
    async (file: File) => {
      if (isWriteBlocked) {
        throw createWriteBlockedError();
      }

      const photo = await uploadInventoryItemPhoto(itemId, file);
      photosCache.delete(itemId);
      invalidateInventoryQueries();
      return photo;
    },
    [isWriteBlocked, itemId],
  );

  const removePhoto = useCallback(
    async (photoId: string) => {
      if (isWriteBlocked) {
        throw createWriteBlockedError();
      }

      await deleteInventoryItemPhoto(itemId, photoId);
      photosCache.delete(itemId);
      invalidateInventoryQueries();
    },
    [isWriteBlocked, itemId],
  );

  return {
    ...query,
    photos: query.data ?? [],
    uploadPhoto,
    removePhoto,
  };
}

export function clearInventoryPhotosCache() {
  photosCache.clear();
}
