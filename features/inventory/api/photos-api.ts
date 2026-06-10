import { buildGatewayUrl, gatewayFetch } from "@/lib/api/gateway-client";
import type { FoodPhoto } from "@/types/inventory";
import { getPhotosFromResponse, normalizePhoto } from "./inventory-mappers";

export const maxPhotoSizeBytes = 2 * 1024 * 1024;

export function getInventoryPhotoContentUrl(
  photoId: string,
  variant: "image" | "thumbnail" = "thumbnail",
) {
  return buildGatewayUrl(
    `/api/inventory/photos/${photoId}/content?variant=${variant}`,
  );
}

export function validateInventoryPhotoFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Selecione uma imagem válida.";
  }

  if (file.size > maxPhotoSizeBytes) {
    return "A imagem deve ter no máximo 2 MB.";
  }

  return null;
}

export async function getInventoryItemPhotos(
  itemId: string,
): Promise<FoodPhoto[]> {
  const response = await gatewayFetch<unknown>(
    `/api/inventory/items/${itemId}/photos`,
  );

  return getPhotosFromResponse(response);
}

export async function uploadInventoryItemPhoto(
  itemId: string,
  file: File,
): Promise<FoodPhoto> {
  const form = new FormData();
  form.append("file", file);

  const response = await gatewayFetch<unknown>(
    `/api/inventory/items/${itemId}/photos`,
    {
      method: "POST",
      body: form,
    },
  );

  return normalizePhoto(response);
}

export async function deleteInventoryItemPhoto(
  itemId: string,
  photoId: string,
): Promise<void> {
  await gatewayFetch<void>(
    `/api/inventory/items/${itemId}/photos/${photoId}`,
    {
      method: "DELETE",
    },
  );
}
