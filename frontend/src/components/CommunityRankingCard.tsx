'use client';

import { useRouter } from "next/navigation";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunityRankingCardProps {
  rank: number;
  id: string;
  name: string;
  description: string;
  totalProfit: number;
  successfulBets: number;
  memberCount: number;
}

export const CommunityRankingCard = ({
  rank,
  id,
  name,
  description,
  totalProfit,
  successfulBets,
  memberCount,
}: CommunityRankingCardProps) => {
  const router = useRouter();

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

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2",
        isTopThree && rank === 1 && "border-yellow-500/50 bg-yellow-500/5",
        isTopThree && rank === 2 && "border-gray-400/50 bg-gray-400/5",
        isTopThree && rank === 3 && "border-amber-600/50 bg-amber-600/5"
      )}
      onClick={() => router.push(`/communities/${id}`)}
    >
      <div className="flex items-start gap-4">
        {/* Rank */}
        <div className="flex flex-col items-center justify-center min-w-[60px]">
          {medal ? (
            <div className="text-4xl mb-1">{medal}</div>
          ) : (
            <div className="text-3xl font-bold text-muted-foreground">#{rank}</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1 truncate">{name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {truncateDescription(description)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <div>
                <div className="text-xs text-muted-foreground">Total Profit</div>
                <div className="font-bold text-success">${totalProfit.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Successful Bets</div>
                <div className="font-bold">{successfulBets}</div>
              </div>
            </div>

            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {memberCount} members
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
