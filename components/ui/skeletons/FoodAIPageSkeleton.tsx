import { PageShellSkeleton } from "@/components/ui/skeletons/PageShellSkeleton";
import { Skeleton } from "@/components/ui/skeletons/Skeleton";

function ChatMessageSkeleton({ isShort = false }: { isShort?: boolean }) {
  return (
    <div className="grid max-w-[92%] gap-2 rounded-3xl bg-background p-4 sm:max-w-[78%]">
      <Skeleton className="h-4 w-20" />
      <Skeleton className={isShort ? "h-4 w-48" : "h-4 w-full"} />
      {!isShort ? <Skeleton className="h-4 w-4/5" /> : null}
    </div>
  );
}

export function FoodAIPageSkeleton() {
  return (
    <PageShellSkeleton>
      <div className="mx-auto flex min-h-136 w-full max-w-4xl flex-col rounded-3xl bg-(--surface) p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-10 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
        <div className="mt-5 flex flex-1 flex-col gap-3">
          <ChatMessageSkeleton />
          <ChatMessageSkeleton isShort />
        </div>
        <Skeleton className="mt-4 h-12 w-full" />
      </div>
    </PageShellSkeleton>
  );
}
