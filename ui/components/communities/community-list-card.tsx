"use client"

import Link from "next/link"
import {
  Users,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Zap,
  Activity,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { CommunityListItem } from "@/lib/data/mock-communities-list"

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

export function CommunityListCard({
  community,
  index,
}: {
  community: CommunityListItem
  index: number
}) {
  return (
    <Link
      href={`/community/${community.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200",
        "hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      aria-label={`${community.name} - ${community.sport}`}
    >
      {/* Banner strip */}
      <div
        className="h-2 w-full shrink-0"
        style={{ backgroundColor: community.bannerColor }}
      />

      {/* Card content */}
      <div className="flex items-start gap-4 p-4 sm:p-5">
        {/* Avatar with banner-colored ring */}
        <Avatar className="size-12 sm:size-14 shrink-0 rounded-xl ring-2 ring-offset-2 ring-offset-card" style={{ ["--tw-ring-color" as string]: community.bannerColor }}>
          <AvatarFallback
            className="rounded-xl text-sm sm:text-base font-bold text-white"
            style={{ backgroundColor: community.bannerColor }}
          >
            {community.avatarInitials}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
              {community.name}
            </h3>
            {community.verified && (
              <CheckCircle2 className="size-4 text-primary shrink-0" aria-label="Verified" />
            )}
            {community.trending && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 h-[18px] gap-0.5">
                <Zap className="size-2.5" />
                Trending
              </Badge>
            )}
            <Badge
              variant="outline"
              className="text-[10px] sm:text-[11px] px-1.5 py-0 h-[18px] font-medium text-muted-foreground"
            >
              {community.sport}
            </Badge>
          </div>

          {/* Row 2: Description */}
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1 leading-relaxed">
            {community.description}
          </p>

          {/* Row 3: Stats */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mt-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="size-3.5" />
              <span className="text-xs font-medium">{formatNumber(community.membersCount)}</span>
              <span className="text-xs hidden sm:inline">members</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BarChart3 className="size-3.5" />
              <span className="text-xs font-medium">{community.activeMarkets}</span>
              <span className="text-xs hidden sm:inline">active markets</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="size-3.5" />
              <span className="text-xs font-medium">{community.activity24h}</span>
              <span className="text-xs hidden sm:inline">bets/24h</span>
            </div>
          </div>
        </div>

        {/* Right column: ROI + Volume */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 self-center">
          <div
            className={cn(
              "flex items-center gap-1 text-sm sm:text-base font-bold",
              community.roi7d > 0 ? "text-success" : "text-destructive"
            )}
          >
            <TrendingUp className="size-4" />
            {community.roi7d > 0 ? "+" : ""}
            {community.roi7d}%
          </div>
          <span className="text-[11px] text-muted-foreground">7d ROI</span>
          <span className="text-[11px] text-muted-foreground mt-1">
            {formatNumber(community.totalVolume)} CHZ
          </span>
        </div>

        {/* Hover chevron */}
        <ChevronRight className="size-5 text-muted-foreground self-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden md:block" />
      </div>
    </Link>
  )
}
