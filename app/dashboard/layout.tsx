import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <Header />
      <div className="flex min-h-screen flex-col bg-background">
        {children}
      </div>
    </AuthGuard>
  );
}
