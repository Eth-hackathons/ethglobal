import { Skeleton } from "@/components/ui/skeleton"

export function CommunityCardSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-4 sm:p-5">
      <Skeleton className="size-12 sm:size-14 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-full max-w-md" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-16 mt-1" />
      </div>
    </div>
  )
}

export function CommunitiesListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <CommunityCardSkeleton key={i} />
      ))}
    </div>
  )
}
