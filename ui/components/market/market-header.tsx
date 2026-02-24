"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { Market, MarketStatus } from "@/lib/types/market"

function getStatusConfig(status: MarketStatus) {
  switch (status) {
    case "open":
      return { label: "Open", className: "border-transparent bg-success text-success-foreground" }
    case "closing_soon":
      return { label: "Closing Soon", className: "border-transparent bg-warning text-warning-foreground" }
    case "closed":
      return { label: "Closed", className: "border-transparent bg-muted text-muted-foreground" }
    case "resolved":
      return { label: "Resolved", className: "border-transparent bg-muted text-muted-foreground" }
  }
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function calculate() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }

    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

function CountdownUnit({ value, label, urgent }: { value: number; label: string; urgent?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-mono text-2xl font-bold tabular-nums md:text-3xl ${
          urgent ? "text-primary" : "text-foreground"
        }`}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

export function MarketHeader({ market }: { market: Market }) {
  const countdown = useCountdown(market.closesAt)
  const statusConfig = getStatusConfig(market.status)
  const isUrgent = countdown.days === 0 && countdown.hours < 6

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + Status */}
      <div className="flex flex-wrap items-center gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                Markets
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Badge
                variant="outline"
                className="rounded-full border-primary/30 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {market.communityName}
              </Badge>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate text-xs">
                {market.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.className}`}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Title */}
      <h1 className="text-balance text-2xl font-bold leading-tight text-foreground md:text-[2.5rem] md:leading-[1.15]">
        {market.title}
      </h1>

      {/* Countdown */}
      {market.status !== "closed" && market.status !== "resolved" && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Market Closes In
          </p>
          <div className="flex items-center gap-3">
            <CountdownUnit value={countdown.days} label="Days" urgent={isUrgent} />
            <span className="text-lg font-light text-muted-foreground/60">:</span>
            <CountdownUnit value={countdown.hours} label="Hours" urgent={isUrgent} />
            <span className="text-lg font-light text-muted-foreground/60">:</span>
            <CountdownUnit value={countdown.minutes} label="Mins" urgent={isUrgent} />
            <span className="text-lg font-light text-muted-foreground/60">:</span>
            <CountdownUnit value={countdown.seconds} label="Secs" urgent={isUrgent} />
          </div>
        </div>
      )}
    </div>
  )
}
