"use client"

import { Users, TrendingUp, DollarSign, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardStats } from "@/lib/types/dashboard"

interface StatsCardsProps {
  stats: DashboardStats
}

const statConfig = [
  {
    key: "totalCommunities" as const,
    label: "Total Communities",
    icon: Users,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    format: (v: number) => v.toLocaleString(),
    valueColor: "text-foreground",
  },
  {
    key: "activeMarkets" as const,
    label: "Active Markets",
    icon: TrendingUp,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    format: (v: number) => v.toLocaleString(),
    valueColor: "text-primary",
  },
  {
    key: "totalVolume" as const,
    label: "Total Volume",
    icon: DollarSign,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    format: (v: number) => `$${v.toLocaleString()}`,
    suffix: "CHZ",
    valueColor: "text-foreground",
  },
  {
    key: "winRate" as const,
    label: "Your Win Rate",
    icon: Target,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    format: (v: number) => `${v}%`,
    valueColor: "text-success",
  },
]

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map((config) => {
        const Icon = config.icon
        return (
          <Card
            key={config.key}
            className="group py-0 transition-shadow hover:shadow-md cursor-default"
          >
            <CardContent className="flex flex-col gap-3 p-5">
              <div
                className={`flex size-10 items-center justify-center rounded-lg ${config.iconBg}`}
              >
                <Icon className={`size-5 ${config.iconColor}`} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-2xl font-bold tracking-tight ${config.valueColor}`}>
                  {config.format(stats[config.key])}
                </span>
                <span className="text-sm text-muted-foreground">
                  {config.label}
                  {config.suffix && (
                    <span className="ml-1 text-xs text-muted-foreground/70">
                      {config.suffix}
                    </span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
