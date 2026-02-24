"use client"

import { Coins, Zap, Trophy, PlusCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { ActivityItem } from "@/lib/types/dashboard"

interface ActivityFeedProps {
  items: ActivityItem[]
}

const typeConfig: Record<
  ActivityItem["type"],
  { icon: typeof Coins; iconBg: string; iconColor: string }
> = {
  stake: {
    icon: Coins,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  execution: {
    icon: Zap,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  win: {
    icon: Trophy,
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  new_market: {
    icon: PlusCircle,
    iconBg: "bg-chart-3/10",
    iconColor: "text-chart-3",
  },
}

function formatTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Card className="py-0">
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col gap-1">
          {items.map((item) => {
            const cfg = typeConfig[item.type]
            const Icon = cfg.icon
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                {/* Unread dot */}
                <div className="relative mt-2.5 flex shrink-0">
                  {item.unread && (
                    <span className="absolute -left-2 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-primary" />
                  )}
                  <div
                    className={`flex size-8 items-center justify-center rounded-lg ${cfg.iconBg}`}
                  >
                    <Icon className={`size-4 ${cfg.iconColor}`} />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p
                    className={`text-sm leading-snug ${
                      item.unread
                        ? "font-medium text-card-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.message}
                  </p>
                  <span className="text-xs text-muted-foreground/70">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
