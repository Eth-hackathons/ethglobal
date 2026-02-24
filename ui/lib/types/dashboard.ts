import type { MarketStatus } from "./market"

export interface DashboardStats {
  totalCommunities: number
  activeMarkets: number
  totalVolume: number
  winRate: number
}

export interface CreatorMarket {
  id: string
  title: string
  community: string
  status: MarketStatus
  closesAt: string
  totalStaked: number
  totalBets: number
}

export interface ActivityItem {
  id: string
  type: "stake" | "execution" | "win" | "new_market"
  message: string
  timestamp: string
  unread: boolean
}
