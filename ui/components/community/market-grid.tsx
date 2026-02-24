"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketCard } from "./market-card"
import { EmptyState } from "./empty-state"
import type { CommunityMarket } from "@/lib/types/community"

const PAGE_SIZE = 6

interface MarketGridProps {
  markets: CommunityMarket[]
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function MarketGrid({ markets, hasActiveFilters, onClearFilters }: MarketGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)

  const visibleMarkets = markets.slice(0, visibleCount)
  const hasMore = visibleCount < markets.length

  function handleLoadMore() {
    setLoadingMore(true)
    // Simulate network delay
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, markets.length))
      setLoadingMore(false)
    }, 600)
  }

  if (markets.length === 0) {
    return <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleMarkets.map((market, i) => (
          <div
            key={market.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
            style={{ animationDelay: `${(i % PAGE_SIZE) * 80}ms` }}
          >
            <MarketCard market={market} index={i} />
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="min-w-48 border-border text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {loadingMore ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More Markets (${markets.length - visibleCount} remaining)`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
