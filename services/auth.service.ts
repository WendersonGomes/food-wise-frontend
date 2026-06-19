import { ApiClientError } from "@/lib/api/api-errors";
import { apiFetch } from "@/lib/api/gateway-client";
import type { AuthUser } from "@/types/auth";

type GoogleAuthUrlResponse = {
  url?: string;
};

export async function loginWithGoogle(): Promise<void> {
  const response = await apiFetch<GoogleAuthUrlResponse>(
    "/api/auth/google/url",
  );

  if (!response.url) {
    throw new ApiClientError({
      message: "URL de login nao retornada.",
      code: "AUTH_GOOGLE_OAUTH_URL_MISSING",
      details: {
        endpoint: "/api/auth/google/url",
        method: "GET",
        bodyJson: response,
      },
    });
  }

  window.location.href = response.url;
}

function getRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function getString(
  record: Record<string, unknown> | null,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = record?.[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function normalizeAuthUser(payload: unknown): AuthUser {
  const response = getRecord(payload);
  const profile = getRecord(response?.user) ?? response;
  const metadata =
    getRecord(profile?.user_metadata) ?? getRecord(profile?.userMetadata);
  const id = getString(profile, "id", "userId", "sub");

  if (!id) {
    throw new ApiClientError({
      message: "Perfil autenticado invalido.",
      code: "INVALID_AUTH_PROFILE",
      details: payload,
    });
  }

  return {
    id,
    email: getString(profile, "email"),
    displayName:
      getString(profile, "displayName", "display_name", "name") ??
      getString(metadata, "displayName", "display_name", "full_name", "name"),
    avatarUrl:
      getString(profile, "avatarUrl", "avatar_url", "picture", "avatar") ??
      getString(metadata, "avatarUrl", "avatar_url", "picture", "avatar"),
    createdAt: getString(profile, "createdAt", "created_at"),
    updatedAt: getString(profile, "updatedAt", "updated_at"),
  };
}

export async function getCurrentUser(): Promise<AuthUser> {
  const profile = await apiFetch<unknown>("/api/auth/me", {
    skipAuthRetry: true,
  });

  return normalizeAuthUser(profile);
}

export async function refreshAuthSession(): Promise<void> {
  await apiFetch<void>("/api/auth/refresh", {
    method: "POST",
    skipAuthRetry: true,
  });
}

export async function logout(): Promise<void> {
  await apiFetch<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
    skipAuthRetry: true,
  });
}
