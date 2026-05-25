const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export const AUTH_SESSION_KEY = "foodwise-session";

export type AuthSession = {
  accessToken: string;
  user?: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
};

export function getStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as Partial<AuthSession>;
    return session.accessToken ? session : null;
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.dispatchEvent(new Event("foodwise-auth-change"));
}

export function getGoogleAuthUrl() {
  if (!API_GATEWAY_URL) {
    return null;
  }

  const callbackUrl = `${window.location.origin}/dashboard`;
  const url = new URL("/auth/google", API_GATEWAY_URL);
  url.searchParams.set("redirect_uri", callbackUrl);

  return url.toString();
}
