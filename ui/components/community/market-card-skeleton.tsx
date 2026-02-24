import { Skeleton } from "@/components/ui/skeleton"

export function MarketCardSkeleton() {
  return (
    <div className="flex flex-col bg-card border rounded-xl shadow-sm overflow-hidden p-5 gap-4">
      {/* Status badge placeholder */}
      <div className="flex justify-end">
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>

      {/* Countdown */}
      <Skeleton className="h-3.5 w-28 rounded" />

      {/* Odds bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <Skeleton className="h-3 w-14 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-5 w-8 rounded ml-auto" />
      </div>
    </div>
  )
}

export function MarketGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <MarketCardSkeleton key={i} />
      ))}
    </div>
  )
}
