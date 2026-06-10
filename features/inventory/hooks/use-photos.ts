"use client";

import { useCallback, useMemo } from "react";
import {
  deleteInventoryItemPhoto,
  getInventoryItemPhotos,
  uploadInventoryItemPhoto,
} from "@/features/inventory/api/photos-api";
import { useApiConnection } from "@/hooks/useApiConnection";
import type { FoodPhoto } from "@/types/inventory";
import { invalidateInventoryQueries } from "./inventory-events";
import { useGetWithCache } from "./use-get-with-cache";

const photosCache = new Map<string, FoodPhoto[]>();

export function useInventoryPhotos(itemId: string) {
  const { isWriteBlocked } = useApiConnection();
  const fetcher = useCallback(() => getInventoryItemPhotos(itemId), [itemId]);
  const cache = useMemo(
    () => ({
      get: () => photosCache.get(itemId) ?? null,
      set: (data: FoodPhoto[]) => {
        photosCache.set(itemId, data);
      },
    }),
    [itemId],
  );
  const query = useGetWithCache({
    cache,
    fetcher,
  });

  const uploadPhoto = useCallback(
    async (file: File) => {
      if (isWriteBlocked) {
        throw new Error("Nao foi possivel salvar alteracoes no momento.");
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
        throw new Error("Nao foi possivel salvar alteracoes no momento.");
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
