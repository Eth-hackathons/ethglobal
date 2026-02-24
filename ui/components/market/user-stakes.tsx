import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TrendingUp } from "lucide-react"
import type { UserStake } from "@/lib/types/market"

export function UserStakes({ stake }: { stake: UserStake }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Your Bets</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* YES stakes */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-success/20 bg-success/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-success">Yes Stake</span>
              <span className="text-xs text-muted-foreground">{stake.yesPercentageOfTotal}% of pool</span>
            </div>
            <span className="text-xl font-bold text-success">{stake.yesAmount.toLocaleString()} CHZ</span>
          </div>

          {/* NO stakes */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-destructive">No Stake</span>
              <span className="text-xs text-muted-foreground">{stake.noPercentageOfTotal}% of pool</span>
            </div>
            <span className="text-xl font-bold text-destructive">{stake.noAmount.toLocaleString()} CHZ</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Total Staked</span>
            <span className="text-base font-bold text-foreground">{stake.totalStaked.toLocaleString()} CHZ</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-muted-foreground">Potential Payout</span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-success" />
              <span className="text-base font-bold text-success">{stake.potentialPayout.toLocaleString()} CHZ</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
