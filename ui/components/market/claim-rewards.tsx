"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Loader2 } from "lucide-react"
import type { ClaimReward } from "@/lib/types/market"

export function ClaimRewards({ reward }: { reward: ClaimReward }) {
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(reward.claimed)

  async function handleClaim() {
    setClaiming(true)
    await new Promise((r) => setTimeout(r, 2000))
    setClaiming(false)
    setClaimed(true)
  }

  if (claimed) {
    return (
      <div className="rounded-xl border border-success/20 bg-success/5 p-6 text-center">
        <Trophy className="mx-auto mb-2 size-8 text-success" />
        <p className="text-lg font-bold text-success">Rewards Claimed!</p>
        <p className="text-sm text-muted-foreground">{reward.amount.toLocaleString()} CHZ has been sent to your wallet</p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-dark p-6 text-primary-foreground">
      {/* Subtle pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative flex flex-col items-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary-foreground/15">
          <Trophy className="size-7 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-bold">You Won! Claim Your Rewards</h3>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Your prediction was correct. Claim your winnings below.
          </p>
        </div>
        <p className="text-4xl font-bold">{reward.amount.toLocaleString()} CHZ</p>
        <Button
          onClick={handleClaim}
          disabled={claiming}
          className="h-12 w-full max-w-xs bg-success text-success-foreground hover:bg-success/90 text-base font-semibold shadow-lg shadow-success/25"
        >
          {claiming ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Claiming...
            </>
          ) : (
            "Claim Rewards"
          )}
        </Button>
      </div>
    </div>
  )
}
