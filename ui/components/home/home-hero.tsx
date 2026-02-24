"use client"

import { Activity, DollarSign, Users, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HomeHeroProps {
  platformStats: {
    totalVolume: string
    activeBettors: number
    liveCommunities: number
  }
}

export function HomeHero({ platformStats }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative">
        {/* Greeting */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-success/10 text-success border-success/20 text-xs gap-1">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                </span>
                Chiliz Mainnet
              </Badge>
            </div>
            <h1 className="font-serif text-3xl tracking-wide text-foreground sm:text-4xl">
              PREDICT. STAKE. WIN.
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Join sport communities, stake on outcomes you believe in, and earn rewards on-chain.
            </p>
          </div>

          {/* Platform stats inline */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center size-7 rounded-md bg-primary/10">
                <DollarSign className="size-3.5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-none">
                  {platformStats.totalVolume}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  Volume
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center size-7 rounded-md bg-muted">
                <Users className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-none">
                  {platformStats.activeBettors.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  Bettors
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center size-7 rounded-md bg-muted">
                <Activity className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-none">
                  {platformStats.liveCommunities}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  Communities
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
