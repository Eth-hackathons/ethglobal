import type { MarketStatus } from "./market"

export interface Community {
  id: string
  name: string
  slug: string
  description: string
  verified: boolean
  membersCount: number
  activeMarkets: number
  totalVolume: number
  joined: boolean
  avatarUrl?: string
  avatarInitials?: string
  bannerColor?: string
  sport?: string
}

export type SportCategory = "all" | "football" | "basketball" | "tennis" | "motorsport" | "cycling"

export type SortOption = "newest" | "most_bets" | "highest_volume" | "closing_soon"

export interface CommunityMarket {
  id: string
  title: string
  status: MarketStatus
  closesAt: string
  createdAt: string
  totalBets: number
  totalVolume: number
  yesPercentage: number
  noPercentage: number
  sport: SportCategory
  communityBadge: string
}
