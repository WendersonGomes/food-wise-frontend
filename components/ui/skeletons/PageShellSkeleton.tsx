import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeletons/Skeleton";
import { SkeletonPulse } from "@/components/ui/skeletons/SkeletonPulse";

type PageShellSkeletonProps = {
  children?: ReactNode;
};

export function PageShellSkeleton({ children }: PageShellSkeletonProps) {
  return (
    <SkeletonPulse className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </section>
      {children}
    </SkeletonPulse>
  );
}
