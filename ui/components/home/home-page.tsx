"use client"

import { useState, useEffect } from "react"
import { HomeHero } from "@/components/home/home-hero"
import { TopCommunities } from "@/components/home/top-communities"
import { YourBetsDashboard } from "@/components/home/your-bets-dashboard"
import { TrendingMarkets } from "@/components/home/trending-markets"
import { HomeSkeleton } from "@/components/home/home-skeleton"
import {
  mockTopCommunities,
  mockUserBetsSummary,
  mockUserBets,
  mockTrendingMarkets,
} from "@/lib/data/mock-home"

export function HomePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <HomeSkeleton />

  return (
    <main className="mx-auto max-w-7xl px-4 lg:px-8 py-6">
      {/* Hero greeting strip */}
      <div className="mb-8">
        <HomeHero
          platformStats={{
            totalVolume: "$1.2M",
            activeBettors: 4821,
            liveCommunities: 38,
          }}
        />
      </div>

      {/* Two-column layout: Communities (primary) + Your Bets (sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
        <div className="lg:col-span-3">
          <TopCommunities communities={mockTopCommunities} />
        </div>
        <div className="lg:col-span-2">
          <YourBetsDashboard summary={mockUserBetsSummary} bets={mockUserBets} />
        </div>
      </div>

      {/* Trending markets horizontal scroll */}
      <TrendingMarkets markets={mockTrendingMarkets} />
    </main>
  )
}
