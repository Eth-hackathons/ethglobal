import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-6">
      {/* Hero strip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Top Communities */}
        <Card className="lg:col-span-3 py-0 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56 mt-2" />
          </div>
          <div className="flex flex-col gap-2 px-2 pb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56 mt-1.5" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>

        {/* Your Bets */}
        <Card className="lg:col-span-2 py-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-0">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-stretch px-5 pt-4 pb-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <Skeleton className="size-9 rounded-lg" />
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
          <Separator />
          <div className="px-5 pt-3 pb-3">
            <div className="flex items-center gap-1 mb-2">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <Skeleton className="size-8 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28 mt-1" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Trending */}
      <div className="mb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-64 mt-2" />
      </div>
      <div className="flex gap-4 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="min-w-[280px] max-w-[320px] py-0 shrink-0">
            <div className="px-4 pt-4 flex gap-1.5">
              <Skeleton className="h-5 w-10 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <div className="px-4 pt-3 pb-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-1.5" />
            </div>
            <div className="px-4 pt-2 pb-4">
              <Skeleton className="h-2 w-full rounded-full mt-4" />
              <div className="flex items-center gap-3 mt-4">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
