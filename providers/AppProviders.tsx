"use client";

import type { ReactNode } from "react";
import { ApiConnectionBanner } from "@/components/api/ApiConnectionBanner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApiAvailabilityProvider } from "@/providers/api-availability-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ApiAvailabilityProvider>
      <AuthProvider>
        {children}
        <ApiConnectionBanner />
      </AuthProvider>
    </ApiAvailabilityProvider>
  );
}
