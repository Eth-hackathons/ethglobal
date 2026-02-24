export type MarketStatus = "open" | "closing_soon" | "closed" | "resolved"

export interface Market {
  id: string
  title: string
  communityName: string
  communitySlug: string
  status: MarketStatus
  closesAt: string // ISO date
  totalBets: number
  totalVolume: number // in CHZ
  yesPercentage: number
  noPercentage: number
  yesPool: number
  noPool: number
  polymarketUrl: string
  resolvedOutcome?: "yes" | "no"
}

export interface UserStake {
  yesAmount: number
  noAmount: number
  totalStaked: number
  potentialPayout: number
  yesPercentageOfTotal: number
  noPercentageOfTotal: number
}

export interface ClaimReward {
  amount: number
  claimed: boolean
}

export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  text: string
  timestamp: string // ISO date
  upvotes: number
  downvotes: number
  userVote?: "up" | "down" | null
  betPosition?: "yes" | "no" | null
  betAmount?: number
  replies?: Comment[]
  isOP?: boolean
  edited?: boolean
}

export interface StakeFormData {
  side: "yes" | "no"
  amount: number
  walletBalance: number
  currentOdds: number
  poolAmount: number
  estimatedPayout: number
}
