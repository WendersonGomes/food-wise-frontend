import { PageShellSkeleton } from "@/components/ui/skeletons/PageShellSkeleton";
import { Skeleton } from "@/components/ui/skeletons/Skeleton";

function InventoryItemSkeleton() {
  return (
    <div className="grid grid-cols-1 items-center gap-3 rounded-3xl bg-(--surface) p-4 sm:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-20" />
    </div>
  );
}

export function InventoryPageSkeleton() {
  return (
    <PageShellSkeleton>
      <div className="flex justify-end">
        <Skeleton className="h-11 w-28" />
      </div>
      <section className="grid gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <InventoryItemSkeleton key={index} />
        ))}
      </section>
    </PageShellSkeleton>
  );
}
