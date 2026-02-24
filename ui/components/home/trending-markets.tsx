"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Clock,
  Users,
  TrendingUp,
  ChevronRight,
  Flame,
  ChevronLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TrendingMarket } from "@/lib/data/mock-home"

function formatVolume(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

function getTimeRemaining(closesAt: string): string {
  const diff = new Date(closesAt).getTime() - Date.now()
  if (diff <= 0) return "Closed"
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h`
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function TrendingCard({ market }: { market: TrendingMarket }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(market.closesAt))
  const isClosingSoon = market.status === "closing_soon"

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(market.closesAt))
    }, 60000)
    return () => clearInterval(interval)
  }, [market.closesAt])

  return (
    <Link
      href={`/market/${market.id}`}
      className={cn(
        "group relative flex flex-col bg-card border rounded-xl shadow-sm transition-all duration-300 overflow-hidden min-w-[280px] max-w-[320px] snap-start shrink-0",
        "hover:shadow-lg hover:-translate-y-0.5",
        isClosingSoon && "border-warning/30"
      )}
    >
      {/* Top badges */}
      <div className="flex items-center gap-1.5 px-4 pt-4 pb-0">
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 h-5 font-semibold text-muted-foreground"
        >
          {market.communityBadge}
        </Badge>
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 h-5 font-medium text-muted-foreground"
        >
          {market.sport}
        </Badge>
        {market.hot && (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 h-5">
            <Flame className="size-2.5" />
            Hot
          </Badge>
        )}
        {isClosingSoon && (
          <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px] px-1.5 py-0 h-5 ml-auto">
            <Clock className="size-2.5" />
            {timeLeft}
          </Badge>
        )}
      </div>

      {/* Title */}
      <div className="px-4 pt-3 pb-1">
        <h3 className="text-sm font-semibold text-card-foreground leading-snug line-clamp-2 min-h-[2.5rem]">
          {market.title}
        </h3>
      </div>

      {/* Odds bar */}
      <div className="flex flex-col gap-1.5 px-4 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-success">
            YES {market.yesPercentage}%
          </span>
          <span className="font-semibold text-destructive">
            NO {market.noPercentage}%
          </span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-muted">
          <div
            className="bg-success rounded-l-full transition-all duration-500"
            style={{ width: `${market.yesPercentage}%` }}
          />
          <div
            className="bg-destructive rounded-r-full transition-all duration-500"
            style={{ width: `${market.noPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-4 mt-auto">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="size-3" />
          <span className="text-xs">{market.totalBets.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <TrendingUp className="size-3" />
          <span className="text-xs">{formatVolume(market.totalVolume)} CHZ</span>
        </div>
        {!isClosingSoon && (
          <div className="flex items-center gap-1 text-muted-foreground ml-auto">
            <Clock className="size-3" />
            <span className="text-xs">{timeLeft}</span>
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-foreground/5 backdrop-blur-[2px] transition-opacity duration-200 opacity-0 pointer-events-none group-hover:opacity-100">
        <span className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold shadow-lg">
          View Market
        </span>
      </div>
    </Link>
  )
}

export function TrendingMarkets({
  markets,
}: {
  markets: TrendingMarket[]
}) {
  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Flame className="size-5 text-primary" />
            Trending Markets
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hottest bets right now across all communities
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            aria-label="Scroll left"
            onClick={() => {
              document
                .getElementById("trending-scroll")
                ?.scrollBy({ left: -320, behavior: "smooth" })
            }}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            aria-label="Scroll right"
            onClick={() => {
              document
                .getElementById("trending-scroll")
                ?.scrollBy({ left: 320, behavior: "smooth" })
            }}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable cards */}
      <div
        id="trending-scroll"
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4 lg:-mx-0 lg:px-0"
        style={{ scrollbarWidth: "none" }}
      >
        {markets.map((market) => (
          <TrendingCard key={market.id} market={market} />
        ))}
      </div>
    </section>
  )
}
