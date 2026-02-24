"use client"

import { useEffect, useState } from "react"
import { MarketHeader } from "@/components/market/market-header"
import { MarketStatsBar } from "@/components/market/market-stats-bar"
import { BettingInterface } from "@/components/market/betting-interface"
import { UserStakes } from "@/components/market/user-stakes"
import { ClaimRewards } from "@/components/market/claim-rewards"
import { DiscussionSection } from "@/components/market/discussion-section"
import { MarketSkeleton } from "@/components/market/market-skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

import type { Market, UserStake, ClaimReward, Comment } from "@/lib/types/market"
import {
  mockMarket,
  mockUserStake,
  mockClaimReward,
  mockComments,
} from "@/lib/data/mock-market"

// Simulate loading state
function useMarketData() {
  const [loading, setLoading] = useState(true)
  const [market, setMarket] = useState<Market | null>(null)
  const [userStake, setUserStake] = useState<UserStake | null>(null)
  const [claimReward, setClaimReward] = useState<ClaimReward | null>(null)
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMarket(mockMarket)
      setUserStake(mockUserStake)
      setClaimReward(mockClaimReward)
      setComments(mockComments)
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return { loading, market, userStake, claimReward, comments }
}

export function MarketDetailPage() {
  const { loading, market, userStake, claimReward, comments } = useMarketData()

  if (loading || !market) {
    return <MarketSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky mini header */}
      <StickyHeader market={market} />

      <div className="mx-auto max-w-4xl px-4 py-6 pb-20 md:px-6 md:py-8">
        <div className="flex flex-col gap-8">
          {/* Back link */}
          <Button variant="ghost" className="w-fit gap-2 text-muted-foreground hover:text-foreground -ml-2" asChild>
            <a href="/">
              <ArrowLeft className="size-4" />
              Back to Markets
            </a>
          </Button>

          {/* 1. Header Section */}
          <MarketHeader market={market} />

          {/* 2. Stats Bar */}
          <MarketStatsBar market={market} />

          {/* Main content grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left column: Betting + Rewards */}
            <div className="flex flex-col gap-8 lg:col-span-2">
              {/* 3. Betting Interface */}
              <BettingInterface market={market} />

              {/* 5. Claim Rewards (shown only if applicable) */}
              {claimReward && !claimReward.claimed && (
                <ClaimRewards reward={claimReward} />
              )}
            </div>

            {/* Right column: User Stakes + Discussion */}
            <div className="flex flex-col gap-8">
              {/* 4. Your Stakes (shown only if user has staked) */}
              {userStake && userStake.totalStaked > 0 && (
                <UserStakes stake={userStake} />
              )}
            </div>
          </div>

          {/* 6. Discussion (full width below) */}
          <DiscussionSection comments={comments} />
        </div>
      </div>
    </div>
  )
}

// Sticky header that appears on scroll
function StickyHeader({ market }: { market: Market }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 200)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2.5 md:px-6">
        <p className="truncate text-sm font-semibold text-foreground">{market.title}</p>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-success">YES {market.yesPercentage}%</span>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-xs font-medium text-destructive">NO {market.noPercentage}%</span>
        </div>
      </div>
    </div>
  )
}
