"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { CommunityHeader } from "./community-header"
import { FilterBar } from "./filter-bar"
import { MarketGrid } from "./market-grid"
import { MarketGridSkeleton } from "./market-card-skeleton"
import { ErrorState } from "./error-state"
import { ImportPolymarketDialog } from "./import-polymarket-dialog"
import { mockCommunity, mockCommunityMarkets } from "@/lib/data/mock-community"
import type { MarketStatus } from "@/lib/types/market"
import type { SportCategory, SortOption, CommunityMarket } from "@/lib/types/community"

type LoadState = "loading" | "success" | "error"

function sortMarkets(markets: CommunityMarket[], sort: SortOption): CommunityMarket[] {
  const sorted = [...markets]
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => new Date(b.closesAt).getTime() - new Date(a.closesAt).getTime())
    case "most_bets":
      return sorted.sort((a, b) => b.totalBets - a.totalBets)
    case "highest_volume":
      return sorted.sort((a, b) => b.totalVolume - a.totalVolume)
    case "closing_soon":
      return sorted.sort((a, b) => {
        const aDiff = new Date(a.closesAt).getTime() - Date.now()
        const bDiff = new Date(b.closesAt).getTime() - Date.now()
        // Put closed items last, then sort ascending by time remaining
        if (aDiff <= 0 && bDiff <= 0) return 0
        if (aDiff <= 0) return 1
        if (bDiff <= 0) return -1
        return aDiff - bDiff
      })
    default:
      return sorted
  }
}

export function CommunityLanding() {
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [activeStatus, setActiveStatus] = useState<MarketStatus | "all">("all")
  const [activeSport, setActiveSport] = useState<SportCategory>("all")
  const [activeSort, setActiveSort] = useState<SortOption>("newest")

  // Simulate initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadState("success")
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  function handleRetry() {
    setLoadState("loading")
    setTimeout(() => {
      setLoadState("success")
    }, 1200)
  }

  const hasActiveFilters = activeStatus !== "all" || activeSport !== "all"

  const handleClearFilters = useCallback(() => {
    setActiveStatus("all")
    setActiveSport("all")
  }, [])

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    let markets = mockCommunityMarkets

    if (activeStatus !== "all") {
      markets = markets.filter((m) => m.status === activeStatus)
    }

    if (activeSport !== "all") {
      markets = markets.filter((m) => m.sport === activeSport)
    }

    return sortMarkets(markets, activeSort)
  }, [activeStatus, activeSport, activeSort])

  return (
    <div className="min-h-screen bg-background-alt">
      {/* Community Header */}
      <CommunityHeader community={mockCommunity} />

      {/* Action bar */}
      <div className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-end gap-3">
          <ImportPolymarketDialog />
        </div>
      </div>

      {/* Filter Bar - sticky on scroll */}
      <FilterBar
        activeStatus={activeStatus}
        activeSport={activeSport}
        activeSort={activeSort}
        onStatusChange={setActiveStatus}
        onSportChange={setActiveSport}
        onSortChange={setActiveSort}
        resultCount={filteredMarkets.length}
      />

      {/* Market Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {loadState === "loading" && <MarketGridSkeleton count={6} />}
        {loadState === "error" && <ErrorState onRetry={handleRetry} />}
        {loadState === "success" && (
          <MarketGrid
            markets={filteredMarkets}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        )}
      </main>
    </div>
  )
}
