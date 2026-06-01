import { apiFetch } from "@/services/api";
import type { AuthUser } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL não foi configurada");
}

export function loginWithGoogle(): void {
  window.location.href = `${API_URL}/api/auth/google`;
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
    throw new Error("Perfil autenticado inválido");
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
  const profile = await apiFetch<unknown>("/api/auth/me");

  return normalizeAuthUser(profile);
}

export async function logout(): Promise<void> {
  await apiFetch<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}
