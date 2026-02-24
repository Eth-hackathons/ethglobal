"use client"

import { useState } from "react"
import { BadgeCheck, Share2, Users, BarChart3, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Community } from "@/lib/types/community"

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

interface CommunityHeaderProps {
  community: Community
}

export function CommunityHeader({ community }: CommunityHeaderProps) {
  const [joined, setJoined] = useState(community.joined)
  const [copied, setCopied] = useState(false)

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const bannerColor = community.bannerColor || "#FF6B35"

  return (
    <header className="bg-card border-b">
      {/* Banner */}
      <div
        className="relative h-28 sm:h-36 w-full overflow-hidden"
        style={{ backgroundColor: bannerColor }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
        }} />
        {/* Bottom gradient fade into card */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Avatar overlaps the banner */}
        <div className="-mt-10 sm:-mt-12 relative z-10 mb-4">
          <Avatar className="size-20 sm:size-24 ring-4 ring-card rounded-2xl shadow-lg">
            <AvatarFallback
              className="rounded-2xl text-2xl sm:text-3xl font-bold text-white"
              style={{ backgroundColor: bannerColor }}
            >
              {community.avatarInitials || community.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col gap-5 pb-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Left - Name, description, stats */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-foreground text-3xl sm:text-5xl tracking-wide leading-none text-balance">
                {community.name}
              </h1>
              {community.verified && (
                <BadgeCheck
                  className="size-6 sm:size-7 shrink-0 text-primary"
                  aria-label="Verified community"
                />
              )}
            </div>

            {community.sport && (
              <Badge variant="outline" className="w-fit text-xs font-medium px-2.5 py-0.5">
                {community.sport}
              </Badge>
            )}

            <p className="text-muted-foreground text-sm sm:text-base max-w-xl leading-relaxed">
              {community.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs font-medium bg-muted text-muted-foreground border-0">
                <Users className="size-3.5" />
                {formatNumber(community.membersCount)} Members
              </Badge>
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs font-medium bg-muted text-muted-foreground border-0">
                <BarChart3 className="size-3.5" />
                {community.activeMarkets} Active Markets
              </Badge>
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs font-medium bg-muted text-muted-foreground border-0">
                <TrendingUp className="size-3.5" />
                {formatNumber(community.totalVolume)} CHZ Volume
              </Badge>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {joined ? (
              <Badge
                className="bg-success/10 text-success border-success/20 px-4 py-1.5 text-sm font-medium"
              >
                Joined
              </Badge>
            ) : (
              <Button
                onClick={() => setJoined(true)}
                className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md hover:shadow-lg transition-shadow font-semibold px-6"
                size="lg"
              >
                Join Community
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              aria-label="Share community"
              className="text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <span className="text-xs font-medium text-success">Copied</span>
              ) : (
                <Share2 className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
