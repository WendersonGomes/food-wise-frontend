import { PageShellSkeleton } from "@/components/ui/skeletons/PageShellSkeleton";
import { Skeleton } from "@/components/ui/skeletons/Skeleton";

function StatCardSkeleton() {
  return <Skeleton className="h-32 w-full" />;
}

function StorageCardSkeleton() {
  return <Skeleton className="h-36 w-full" />;
}

export function DashboardPageSkeleton() {
  return (
    <PageShellSkeleton>
      <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <StorageCardSkeleton key={index} />
        ))}
      </section>
    </PageShellSkeleton>
  );
}
