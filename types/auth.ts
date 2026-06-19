export type AuthUser = {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  reloadMe: () => Promise<void>;
  refreshUser: () => Promise<void>;
};
