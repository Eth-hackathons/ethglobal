"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Trophy,
  Flame,
  TrendingUp,
  CircleDot,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { UserBet, UserBetsSummary } from "@/lib/data/mock-home"

function formatVolume(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

function getTimeRemaining(closesAt: string): string {
  const diff = new Date(closesAt).getTime() - Date.now()
  if (diff <= 0) return "Ended"
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h`
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

// --- Mini stat pill ---
function StatPill({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <div
        className={cn(
          "flex items-center justify-center size-9 rounded-lg",
          accent ? "bg-primary/10" : "bg-muted"
        )}
      >
        <Icon
          className={cn("size-4", accent ? "text-primary" : "text-muted-foreground")}
        />
      </div>
      <span className="text-lg font-bold text-foreground leading-none">{value}</span>
      <span className="text-[11px] text-muted-foreground leading-none">{label}</span>
    </div>
  )
}

// --- Bet row (compact) ---
function BetRow({ bet }: { bet: UserBet }) {
  const isOpen = bet.status === "open" || bet.status === "closing_soon"
  const isWon = bet.status === "won"
  const isLost = bet.status === "lost"
  const isClosingSoon = bet.status === "closing_soon"

  return (
    <Link
      href={`/market/${bet.id}`}
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60"
    >
      {/* Side indicator */}
      <div
        className={cn(
          "flex items-center justify-center size-8 rounded-md text-[11px] font-bold shrink-0",
          bet.side === "yes"
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive"
        )}
      >
        {bet.side === "yes" ? "Y" : "N"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {bet.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {bet.community}
          </span>
          {isClosingSoon && (
            <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px] px-1.5 py-0 h-4">
              <Clock className="size-2.5" />
              {getTimeRemaining(bet.closesAt)}
            </Badge>
          )}
        </div>
      </div>

      {/* Payout / Result */}
      <div className="flex flex-col items-end shrink-0">
        {isOpen && (
          <>
            <span className="text-sm font-semibold text-foreground">
              {bet.potentialPayout.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground">CHZ payout</span>
          </>
        )}
        {isWon && (
          <div className="flex items-center gap-1 text-success">
            <ArrowUpRight className="size-3.5" />
            <span className="text-sm font-semibold">
              +{(bet.potentialPayout - bet.staked).toLocaleString()}
            </span>
          </div>
        )}
        {isLost && (
          <div className="flex items-center gap-1 text-destructive">
            <ArrowDownRight className="size-3.5" />
            <span className="text-sm font-semibold">
              -{bet.staked.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  )
}

// --- Tab button ---
function TabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "ml-1.5 text-xs",
            active ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

// --- Main export ---
export function YourBetsDashboard({
  summary,
  bets,
}: {
  summary: UserBetsSummary
  bets: UserBet[]
}) {
  const [tab, setTab] = useState<"open" | "settled">("open")

  const openBets = bets.filter(
    (b) => b.status === "open" || b.status === "closing_soon"
  )
  const settledBets = bets.filter(
    (b) => b.status === "won" || b.status === "lost"
  )
  const displayBets = tab === "open" ? openBets : settledBets

  return (
    <Card className="py-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-0">
        <h2 className="text-lg font-bold text-foreground">Your Bets</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="gap-1 text-xs text-primary">
            View All
            <ChevronRight className="size-3" />
          </Link>
        </Button>
      </div>

      {/* Stats strip */}
      <div className="flex items-stretch px-5 pt-4 pb-4">
        <StatPill
          label="Open"
          value={summary.openBets.toString()}
          icon={CircleDot}
          accent
        />
        <Separator orientation="vertical" className="mx-3 h-auto" />
        <StatPill
          label="Settled"
          value={summary.settledBets.toString()}
          icon={Trophy}
        />
        <Separator orientation="vertical" className="mx-3 h-auto" />
        <StatPill
          label="ROI"
          value={`${summary.roi > 0 ? "+" : ""}${summary.roi}%`}
          icon={TrendingUp}
          accent={summary.roi > 0}
        />
        <Separator orientation="vertical" className="mx-3 h-auto" />
        <StatPill
          label="Streak"
          value={`${summary.streak}${summary.streakType === "win" ? "W" : "L"}`}
          icon={Flame}
          accent={summary.streakType === "win"}
        />
      </div>

      <Separator />

      {/* Tabs + Bet list */}
      <div className="px-3 pt-3">
        <div className="flex items-center gap-1 px-2">
          <TabButton
            active={tab === "open"}
            label="Open"
            count={openBets.length}
            onClick={() => setTab("open")}
          />
          <TabButton
            active={tab === "settled"}
            label="Settled"
            count={settledBets.length}
            onClick={() => setTab("settled")}
          />
        </div>
      </div>

      <CardContent className="px-2 pt-1 pb-3">
        {displayBets.length > 0 ? (
          <div className="flex flex-col">
            {displayBets.map((bet) => (
              <BetRow key={bet.id} bet={bet} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex items-center justify-center size-10 rounded-full bg-muted">
              <CircleDot className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {tab === "open" ? "No open bets yet" : "No settled bets yet"}
            </p>
            {tab === "open" && (
              <Button size="sm" asChild>
                <Link href="/community/premier-league-predictors">
                  Browse Markets
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
