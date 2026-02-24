export interface TopCommunity {
  id: string
  name: string
  slug: string
  sport: string
  sportIcon: string
  membersCount: number
  activeMarkets: number
  totalVolume: number
  roi7d: number
  verified: boolean
  rank: number
  trending: boolean
}

export interface UserBet {
  id: string
  title: string
  community: string
  side: "yes" | "no"
  staked: number
  odds: number
  potentialPayout: number
  status: "open" | "closing_soon" | "won" | "lost"
  closesAt: string
}

export interface UserBetsSummary {
  openBets: number
  settledBets: number
  totalStaked: number
  totalWon: number
  roi: number
  streak: number
  streakType: "win" | "loss"
}

export interface TrendingMarket {
  id: string
  title: string
  communityName: string
  communityBadge: string
  sport: string
  yesPercentage: number
  noPercentage: number
  totalVolume: number
  totalBets: number
  closesAt: string
  status: "open" | "closing_soon"
  hot: boolean
}

export const mockTopCommunities: TopCommunity[] = [
  {
    id: "c1",
    name: "Premier League Predictors",
    slug: "premier-league-predictors",
    sport: "Football",
    sportIcon: "football",
    membersCount: 3847,
    activeMarkets: 24,
    totalVolume: 584200,
    roi7d: 14.2,
    verified: true,
    rank: 1,
    trending: true,
  },
  {
    id: "c2",
    name: "NBA Predictions Hub",
    slug: "nba-predictions-hub",
    sport: "Basketball",
    sportIcon: "basketball",
    membersCount: 2156,
    activeMarkets: 18,
    totalVolume: 412800,
    roi7d: 11.8,
    verified: true,
    rank: 2,
    trending: false,
  },
  {
    id: "c3",
    name: "F1 Forecasters",
    slug: "f1-forecasters",
    sport: "Motorsport",
    sportIcon: "motorsport",
    membersCount: 1834,
    activeMarkets: 12,
    totalVolume: 287500,
    roi7d: 9.3,
    verified: true,
    rank: 3,
    trending: true,
  },
  {
    id: "c4",
    name: "Tennis Oracle",
    slug: "tennis-oracle",
    sport: "Tennis",
    sportIcon: "tennis",
    membersCount: 978,
    activeMarkets: 8,
    totalVolume: 143600,
    roi7d: 7.1,
    verified: false,
    rank: 4,
    trending: false,
  },
  {
    id: "c5",
    name: "La Liga Legends",
    slug: "la-liga-legends",
    sport: "Football",
    sportIcon: "football",
    membersCount: 1423,
    activeMarkets: 15,
    totalVolume: 198400,
    roi7d: 5.6,
    verified: true,
    rank: 5,
    trending: false,
  },
]

export const mockUserBetsSummary: UserBetsSummary = {
  openBets: 4,
  settledBets: 23,
  totalStaked: 12450,
  totalWon: 18230,
  roi: 46.4,
  streak: 5,
  streakType: "win",
}

export const mockUserBets: UserBet[] = [
  {
    id: "ub1",
    title: "Man City to Win PL Title",
    community: "Premier League Predictors",
    side: "yes",
    staked: 500,
    odds: 1.54,
    potentialPayout: 770,
    status: "open",
    closesAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ub2",
    title: "Lakers vs Celtics Finals",
    community: "NBA Predictions Hub",
    side: "no",
    staked: 1200,
    odds: 1.82,
    potentialPayout: 2184,
    status: "closing_soon",
    closesAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ub3",
    title: "Ferrari Constructors' Champ",
    community: "F1 Forecasters",
    side: "yes",
    staked: 350,
    odds: 2.38,
    potentialPayout: 833,
    status: "open",
    closesAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ub4",
    title: "Liverpool vs Chelsea Over 2.5",
    community: "Premier League Predictors",
    side: "yes",
    staked: 800,
    odds: 1.38,
    potentialPayout: 1104,
    status: "closing_soon",
    closesAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ub5",
    title: "Djokovic Wimbledon Title",
    community: "Tennis Oracle",
    side: "no",
    staked: 200,
    odds: 1.61,
    potentialPayout: 322,
    status: "won",
    closesAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ub6",
    title: "Hamilton Monaco Podium",
    community: "F1 Forecasters",
    side: "yes",
    staked: 450,
    odds: 2.1,
    potentialPayout: 945,
    status: "lost",
    closesAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockTrendingMarkets: TrendingMarket[] = [
  {
    id: "tm1",
    title: "Will Erling Haaland Score a Hat-trick This Weekend?",
    communityName: "Premier League Predictors",
    communityBadge: "PL",
    sport: "Football",
    yesPercentage: 28,
    noPercentage: 72,
    totalVolume: 45200,
    totalBets: 834,
    closesAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    status: "open",
    hot: true,
  },
  {
    id: "tm2",
    title: "Verstappen to Win the Next 3 Consecutive Races?",
    communityName: "F1 Forecasters",
    communityBadge: "F1",
    sport: "Motorsport",
    yesPercentage: 41,
    noPercentage: 59,
    totalVolume: 67800,
    totalBets: 1203,
    closesAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "open",
    hot: true,
  },
  {
    id: "tm3",
    title: "Sinner vs Alcaraz - Who Wins the US Open Final?",
    communityName: "Tennis Oracle",
    communityBadge: "GS",
    sport: "Tennis",
    yesPercentage: 52,
    noPercentage: 48,
    totalVolume: 38400,
    totalBets: 645,
    closesAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "open",
    hot: false,
  },
  {
    id: "tm4",
    title: "Arsenal to Beat Tottenham in the North London Derby?",
    communityName: "Premier League Predictors",
    communityBadge: "PL",
    sport: "Football",
    yesPercentage: 62,
    noPercentage: 38,
    totalVolume: 91300,
    totalBets: 1567,
    closesAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: "closing_soon",
    hot: true,
  },
  {
    id: "tm5",
    title: "Will the Celtics Have a 10+ Game Win Streak This Season?",
    communityName: "NBA Predictions Hub",
    communityBadge: "NBA",
    sport: "Basketball",
    yesPercentage: 35,
    noPercentage: 65,
    totalVolume: 29100,
    totalBets: 412,
    closesAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: "open",
    hot: false,
  },
  {
    id: "tm6",
    title: "Barcelona to Score 4+ Goals in El Clasico?",
    communityName: "La Liga Legends",
    communityBadge: "LL",
    sport: "Football",
    yesPercentage: 18,
    noPercentage: 82,
    totalVolume: 52700,
    totalBets: 987,
    closesAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: "open",
    hot: false,
  },
]
