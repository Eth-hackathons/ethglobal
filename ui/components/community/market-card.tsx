"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, Users, TrendingUp, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { CommunityMarket } from "@/lib/types/community"

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

const statusConfig: Record<string, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-success/10 text-success border-success/20",
  },
  closing_soon: {
    label: "Closing Soon",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground border-border",
  },
  resolved: {
    label: "Resolved",
    className: "bg-muted text-muted-foreground border-border",
  },
}

interface MarketCardProps {
  market: CommunityMarket
  index: number
}

const NEW_THRESHOLD_MS = 24 * 60 * 60 * 1000 // 24 hours

export function MarketCard({ market, index }: MarketCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(market.closesAt))
  const status = statusConfig[market.status]
  const isClosed = market.status === "closed" || market.status === "resolved"
  const isNew = market.createdAt
    ? Date.now() - new Date(market.createdAt).getTime() < NEW_THRESHOLD_MS
    : false

  useEffect(() => {
    if (isClosed) return
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(market.closesAt))
    }, 60000)
    return () => clearInterval(interval)
  }, [market.closesAt, isClosed])

  return (
    <Link
      href={`/market/${market.id}`}
      className={cn(
        "group relative flex flex-col bg-card border rounded-xl shadow-sm transition-all duration-300 overflow-hidden",
        "hover:shadow-lg hover:-translate-y-1",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        isNew && "ring-2 ring-primary/30 border-primary/40"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${market.title} - ${status.label}`}
    >
      {/* Badges - top right */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        {isNew && (
          <Badge className="bg-primary text-primary-foreground text-[10px] font-bold tracking-wide gap-1 px-1.5 py-0.5 border-0 animate-in fade-in slide-in-from-right-2 duration-300">
            <Sparkles className="size-3" />
            NEW
          </Badge>
        )}
        <Badge className={cn("text-[11px] font-medium", status.className)}>
          {status.label}
        </Badge>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-4 p-5 flex-1">
        {/* Title */}
        <h3 className="text-sm font-semibold text-card-foreground leading-snug line-clamp-2 pr-20">
          {market.title}
        </h3>

        {/* Countdown */}
        {!isClosed && (
          <div className="flex items-center gap-1.5">
            <Clock className={cn(
              "size-3.5",
              market.status === "closing_soon" ? "text-warning" : "text-primary"
            )} />
            <span className={cn(
              "text-xs font-medium",
              market.status === "closing_soon" ? "text-warning" : "text-primary"
            )}>
              Closes in {timeLeft}
            </span>
          </div>
        )}

        {/* Odds bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-success">YES {market.yesPercentage}%</span>
            <span className="font-medium text-destructive">NO {market.noPercentage}%</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-muted" role="progressbar" aria-label="Market odds">
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
        <div className="flex items-center gap-4 mt-auto pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="size-3.5" />
            <span className="text-xs">{market.totalBets.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="size-3.5" />
            <span className="text-xs">{formatVolume(market.totalVolume)} CHZ</span>
          </div>
          <Badge
            variant="outline"
            className="ml-auto text-[10px] px-1.5 py-0 h-5 font-semibold text-muted-foreground"
          >
            {market.communityBadge}
          </Badge>
        </div>
      </div>

      {/* Hover overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-foreground/5 backdrop-blur-[2px] transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <span className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold shadow-lg">
          View Market
        </span>
      </div>
    </Link>
  )
}
