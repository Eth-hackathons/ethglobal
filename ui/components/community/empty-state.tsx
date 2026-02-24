import { PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onClearFilters?: () => void
  hasActiveFilters: boolean
}

export function EmptyState({ onClearFilters, hasActiveFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="flex items-center justify-center size-16 rounded-2xl bg-muted mb-5">
        <PackageOpen className="size-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1.5">
        No markets found
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {hasActiveFilters
          ? "No markets match your current filters. Try adjusting your selection."
          : "Be the first to create a prediction market in this community."}
      </p>

      {hasActiveFilters ? (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="border-primary text-primary hover:bg-primary/5"
        >
          Clear Filters
        </Button>
      ) : (
        <Button className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md hover:shadow-lg transition-shadow font-semibold">
          Create First Market
        </Button>
      )}
    </div>
  )
}
