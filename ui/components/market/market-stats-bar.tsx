import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, ExternalLink, Users, Coins } from "lucide-react"
import type { Market } from "@/lib/types/market"

function formatNumber(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

export function MarketStatsBar({ market }: { market: Market }) {
  return (
    <Card className="py-0 gap-0">
      <CardContent className="p-0">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {/* Total Bets */}
          <div className="flex items-center gap-3 border-b border-r border-border p-4 lg:border-b-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
              <Users className="size-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Bets</p>
              <p className="text-lg font-bold text-foreground">{market.totalBets.toLocaleString()}</p>
            </div>
          </div>

          {/* Total Volume */}
          <div className="flex items-center gap-3 border-b border-border p-4 lg:border-b-0 lg:border-r">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
              <Coins className="size-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Volume</p>
              <p className="text-lg font-bold text-foreground">{formatNumber(market.totalVolume)} CHZ</p>
            </div>
          </div>

          {/* Odds */}
          <div className="flex flex-col justify-center gap-2 border-r border-border p-4">
            <p className="text-xs text-muted-foreground">Current Odds</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-success">YES {market.yesPercentage}%</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-sm font-bold text-destructive">NO {market.noPercentage}%</span>
            </div>
            {/* Visual bar */}
            <div className="flex h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-success transition-all duration-500"
                style={{ width: `${market.yesPercentage}%` }}
              />
              <div
                className="bg-destructive transition-all duration-500"
                style={{ width: `${market.noPercentage}%` }}
              />
            </div>
          </div>

          {/* Polymarket Link */}
          <div className="flex items-center justify-center p-4">
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
              asChild
            >
              <a href={market.polymarketUrl} target="_blank" rel="noopener noreferrer">
                <BarChart3 className="size-4" />
                <span className="text-sm">View on Polymarket</span>
                <ExternalLink className="size-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
