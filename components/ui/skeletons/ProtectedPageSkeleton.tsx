import { DashboardPageSkeleton } from "@/components/ui/skeletons/DashboardPageSkeleton";
import { FoodAIPageSkeleton } from "@/components/ui/skeletons/FoodAIPageSkeleton";
import { HeaderSkeleton } from "@/components/ui/skeletons/HeaderSkeleton";
import { InventoryPageSkeleton } from "@/components/ui/skeletons/InventoryPageSkeleton";
import { SettingsPageSkeleton } from "@/components/ui/skeletons/SettingsPageSkeleton";

type ProtectedPageSkeletonProps = {
  pathname: string;
};

function getPageSkeleton(pathname: string) {
  if (pathname.startsWith("/dashboard/inventory")) {
    return <InventoryPageSkeleton />;
  }

  if (pathname.startsWith("/dashboard/ai-food")) {
    return <FoodAIPageSkeleton />;
  }

  if (pathname.startsWith("/dashboard/settings")) {
    return <SettingsPageSkeleton />;
  }

  return <DashboardPageSkeleton />;
}

export function ProtectedPageSkeleton({
  pathname,
}: ProtectedPageSkeletonProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HeaderSkeleton />
      {getPageSkeleton(pathname)}
    </div>
  );
}
