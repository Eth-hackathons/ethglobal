"use client"

import Link from "next/link"
import {
  Users,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Zap,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { TopCommunity } from "@/lib/data/mock-home"

function formatVolume(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

const rankColors: Record<number, string> = {
  1: "from-primary to-primary-dark text-primary-foreground",
  2: "from-foreground/80 to-foreground/60 text-background",
  3: "from-warning to-warning/80 text-warning-foreground",
}

function CommunityRow({ community }: { community: TopCommunity }) {
  const isTop3 = community.rank <= 3

  return (
    <Link
      href={`/community/${community.slug}`}
      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all hover:bg-muted/60"
    >
      {/* Rank */}
      <div
        className={cn(
          "flex items-center justify-center size-8 rounded-lg text-sm font-bold shrink-0",
          isTop3
            ? `bg-gradient-to-br ${rankColors[community.rank]}`
            : "bg-muted text-muted-foreground"
        )}
      >
        {community.rank}
      </div>

      {/* Avatar */}
      <Avatar className="size-10 shrink-0">
        <AvatarFallback
          className={cn(
            "text-sm font-bold",
            community.rank === 1
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {community.name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-foreground truncate">
            {community.name}
          </p>
          {community.verified && (
            <CheckCircle2 className="size-3.5 text-primary shrink-0" />
          )}
          {community.trending && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1 py-0 h-4">
              <Zap className="size-2.5" />
              Hot
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-muted-foreground">{community.sport}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3" />
            {community.membersCount.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            {community.activeMarkets} markets
          </span>
        </div>
      </div>

      {/* ROI + Volume */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <div
          className={cn(
            "flex items-center gap-0.5 text-sm font-bold",
            community.roi7d > 0 ? "text-success" : "text-destructive"
          )}
        >
          <TrendingUp className="size-3.5" />
          {community.roi7d > 0 ? "+" : ""}
          {community.roi7d}%
        </div>
        <span className="text-[11px] text-muted-foreground">
          {formatVolume(community.totalVolume)} CHZ
        </span>
      </div>

      <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block" />
    </Link>
  )
}

export function TopCommunities({
  communities,
}: {
  communities: TopCommunity[]
}) {
  return (
    <Card className="py-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Top Communities
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ranked by 7-day ROI and activity
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/community/premier-league-predictors" className="gap-1 text-xs text-primary">
            View All
            <ChevronRight className="size-3" />
          </Link>
        </Button>
      </div>

      {/* Community list */}
      <div className="flex flex-col px-2 pb-3">
        {communities.map((community) => (
          <CommunityRow key={community.id} community={community} />
        ))}
      </div>
    </Card>
  )
}
