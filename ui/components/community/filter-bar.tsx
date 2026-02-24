"use client"

import { useRef } from "react"
import { ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MarketStatus } from "@/lib/types/market"
import type { SportCategory, SortOption } from "@/lib/types/community"

const STATUS_FILTERS: { value: MarketStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "closing_soon", label: "Closing Soon" },
  { value: "closed", label: "Closed" },
]

const SPORT_FILTERS: { value: SportCategory; label: string }[] = [
  { value: "all", label: "All Sports" },
  { value: "football", label: "Football" },
  { value: "basketball", label: "Basketball" },
  { value: "tennis", label: "Tennis" },
  { value: "motorsport", label: "Motorsport" },
  { value: "cycling", label: "Cycling" },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "most_bets", label: "Most Bets" },
  { value: "highest_volume", label: "Highest Volume" },
  { value: "closing_soon", label: "Closing Soon" },
]

interface FilterBarProps {
  activeStatus: MarketStatus | "all"
  activeSport: SportCategory
  activeSort: SortOption
  onStatusChange: (status: MarketStatus | "all") => void
  onSportChange: (sport: SportCategory) => void
  onSortChange: (sort: SortOption) => void
  resultCount: number
}

export function FilterBar({
  activeStatus,
  activeSport,
  activeSort,
  onStatusChange,
  onSportChange,
  onSortChange,
  resultCount,
}: FilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          {/* Status + Sport Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status chips - scrollable on mobile */}
            <div
              ref={scrollRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
              role="tablist"
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  role="tab"
                  aria-selected={activeStatus === filter.value}
                  onClick={() => onStatusChange(filter.value)}
                  className={cn(
                    "shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
                    activeStatus === filter.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}

              {/* Divider */}
              <div className="h-5 w-px bg-border shrink-0 mx-1 hidden sm:block" aria-hidden="true" />

              {/* Sport pills */}
              {SPORT_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => onSportChange(filter.value)}
                  className={cn(
                    "shrink-0 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all",
                    activeSport === filter.value
                      ? "border-primary text-primary bg-primary/5"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Sort + Result Count */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                {resultCount} {resultCount === 1 ? "market" : "markets"}
              </span>
              <Select value={activeSort} onValueChange={(v) => onSortChange(v as SortOption)}>
                <SelectTrigger className="w-auto gap-1.5 text-sm h-8" size="sm">
                  <ArrowUpDown className="size-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
