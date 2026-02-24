import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="py-0">
            <CardContent className="flex flex-col gap-3 p-5">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <Card className="py-0">
        <CardContent className="flex items-center gap-3 p-5">
          <Skeleton className="h-4 w-24" />
          <div className="ml-auto flex gap-3">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-44 rounded-md" />
            <Skeleton className="h-9 w-40 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="py-0">
        <CardHeader className="p-5 pb-0">
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex gap-3 mb-4">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="h-9 w-64 rounded-md ml-auto" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
