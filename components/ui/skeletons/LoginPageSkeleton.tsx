import { HeaderSkeleton } from "@/components/ui/skeletons/HeaderSkeleton";
import { Skeleton } from "@/components/ui/skeletons/Skeleton";
import { SkeletonPulse } from "@/components/ui/skeletons/SkeletonPulse";

function LoginCardSkeleton() {
  return (
    <section className="flex w-full max-w-md flex-col items-center">
      <Skeleton className="mb-5 h-44 w-44" />
      <div className="flex w-full flex-col items-center rounded-3xl bg-(--surface) p-6 shadow-[0_28px_80px_rgba(15,23,42,0.10)] sm:p-8">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-5 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
        <Skeleton className="mt-6 h-11 w-full" />
      </div>
    </section>
  );
}

export function LoginPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderSkeleton isPublic />
      <SkeletonPulse className="flex min-h-screen items-center justify-center px-5 pb-10 pt-28">
        <LoginCardSkeleton />
      </SkeletonPulse>
    </div>
  );
}
