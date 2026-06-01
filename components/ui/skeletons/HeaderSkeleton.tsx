import { Skeleton } from "@/components/ui/skeletons/Skeleton";
import { SkeletonPulse } from "@/components/ui/skeletons/SkeletonPulse";
import { cn } from "@/lib/utils";

type HeaderSkeletonProps = {
  isPublic?: boolean;
};

export function HeaderSkeleton({ isPublic = false }: HeaderSkeletonProps) {
  return (
    <SkeletonPulse
      className={cn(
        "z-30 w-full bg-(--background)/82 backdrop-blur-xl",
        isPublic ? "fixed left-0 top-0" : "sticky top-0",
      )}
    >
      <header>
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-20 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11" />
            <Skeleton className="h-5 w-24" />
          </div>

          {!isPublic ? (
            <div className="hidden items-center gap-2 lg:flex">
              <Skeleton className="h-11 w-28" />
              <Skeleton className="h-11 w-28" />
              <Skeleton className="h-11 w-24" />
              <Skeleton className="h-11 w-24" />
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-11" />
            {!isPublic ? <Skeleton className="h-11 w-11 md:w-36" /> : null}
            {!isPublic ? <Skeleton className="h-11 w-11 lg:hidden" /> : null}
          </div>
        </div>
      </header>
    </SkeletonPulse>
  );
}
