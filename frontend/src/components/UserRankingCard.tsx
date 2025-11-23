import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserRankingCardProps {
  rank: number;
  address: string;
  totalProfit: number;
  winRate: number;
  totalBets: number;
}

export const UserRankingCard = ({
  rank,
  address,
  totalProfit,
  winRate,
  totalBets,
}: UserRankingCardProps) => {
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  const isTopThree = rank <= 3;
  const medal = getMedalIcon(rank);

  const truncateAddress = (address: string) => {
    if (address.length < 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getAvatarFromAddress = (address: string) => {
    return address.slice(2, 4).toUpperCase();
  };

  const getWinRateColor = (rate: number) => {
    if (rate >= 70) return "text-success";
    if (rate >= 50) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <Card
      className={cn(
        "p-4 transition-all hover:shadow-lg hover:scale-[1.02] border-2",
        isTopThree && rank === 1 && "border-yellow-500/50 bg-yellow-500/5",
        isTopThree && rank === 2 && "border-gray-400/50 bg-gray-400/5",
        isTopThree && rank === 3 && "border-amber-600/50 bg-amber-600/5"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex flex-col items-center justify-center min-w-[60px]">
          {medal ? (
            <div className="text-4xl">{medal}</div>
          ) : (
            <div className="text-3xl font-bold text-muted-foreground">#{rank}</div>
          )}
        </div>

        {/* Avatar */}
        <div className="h-12 w-12 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
          {getAvatarFromAddress(address)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-mono font-medium text-sm mb-2">{truncateAddress(address)}</div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <div>
                <div className="text-xs text-muted-foreground">Total Profit</div>
                <div className="font-bold text-success">${totalProfit.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
                <div className={cn("font-bold", getWinRateColor(winRate))}>
                  {winRate}%
                </div>
              </div>
            </div>

            <Badge variant="outline">
              {totalBets} bets
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
