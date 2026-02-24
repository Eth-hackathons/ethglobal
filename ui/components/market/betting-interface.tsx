"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import type { Market } from "@/lib/types/market"
import { StakeDialog } from "@/components/market/stake-dialog"

const MOCK_WALLET_BALANCE = 5000

function formatNumber(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

export function BettingInterface({ market }: { market: Market }) {
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false)
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes")

  function openStake(side: "yes" | "no") {
    setSelectedSide(side)
    setStakeDialogOpen(true)
  }

  const handleStake = useCallback(async (amount: number) => {
    // Simulate network delay for staking transaction
    await new Promise((resolve) => setTimeout(resolve, 1800))
    // In a real app, call your contract / API here
  }, [])

  const currentOdds = selectedSide === "yes" ? market.yesPercentage : market.noPercentage

  return (
    <>
      <Card className="group transition-shadow duration-300 hover:shadow-md hover:shadow-primary/5 gap-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Place Your Stake</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row">
          {/* YES Button */}
          <button
            onClick={() => openStake("yes")}
            className="flex flex-1 flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-success/10 to-success/5 p-6 border border-success/20 transition-all duration-200 hover:border-success/40 hover:shadow-sm cursor-pointer group/yes"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-success/15">
              <ThumbsUp className="size-5 text-success" />
            </div>
            <span className="text-2xl font-bold text-success">YES</span>
            <span className="text-sm font-medium text-success/80">{market.yesPercentage}% odds</span>
            {/* Mini pool bar */}
            <div className="w-full">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Pool</span>
                <span className="font-medium text-foreground">{formatNumber(market.yesPool)} CHZ</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-success/10">
                <div
                  className="h-full rounded-full bg-success transition-all duration-500"
                  style={{ width: `${market.yesPercentage}%` }}
                />
              </div>
            </div>
            <span className="mt-1 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-success-foreground transition-all duration-200 group-hover/yes:shadow-md group-hover/yes:shadow-success/25">
              Stake CHZ
            </span>
          </button>

          {/* NO Button */}
          <button
            onClick={() => openStake("no")}
            className="flex flex-1 flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 p-6 border border-destructive/20 transition-all duration-200 hover:border-destructive/40 hover:shadow-sm cursor-pointer group/no"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/15">
              <ThumbsDown className="size-5 text-destructive" />
            </div>
            <span className="text-2xl font-bold text-destructive">NO</span>
            <span className="text-sm font-medium text-destructive/80">{market.noPercentage}% odds</span>
            {/* Mini pool bar */}
            <div className="w-full">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Pool</span>
                <span className="font-medium text-foreground">{formatNumber(market.noPool)} CHZ</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-destructive/10">
                <div
                  className="h-full rounded-full bg-destructive transition-all duration-500"
                  style={{ width: `${market.noPercentage}%` }}
                />
              </div>
            </div>
            <span className="mt-1 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-all duration-200 group-hover/no:shadow-md group-hover/no:shadow-destructive/25">
              Stake CHZ
            </span>
          </button>
        </CardContent>
      </Card>

      <StakeDialog
        open={stakeDialogOpen}
        onOpenChange={setStakeDialogOpen}
        side={selectedSide}
        currentOdds={currentOdds}
        maxAmount={MOCK_WALLET_BALANCE}
        onStake={handleStake}
      />
    </>
  )
}
