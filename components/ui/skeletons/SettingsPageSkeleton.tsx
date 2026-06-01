import { PageShellSkeleton } from "@/components/ui/skeletons/PageShellSkeleton";
import { Skeleton } from "@/components/ui/skeletons/Skeleton";

function SettingsCardSkeleton() {
  return <Skeleton className="h-36 w-full" />;
}

export function SettingsPageSkeleton() {
  return (
    <PageShellSkeleton>
      <section className="grid gap-4 md:grid-cols-2">
        <SettingsCardSkeleton />
        <SettingsCardSkeleton />
      </section>
    </PageShellSkeleton>
  );
}
