"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "./stats-cards"
import { QuickActions } from "./quick-actions"
import { MarketsTable } from "./markets-table"
import { ActivityFeed } from "./activity-feed"
import { DashboardSkeleton } from "./dashboard-skeleton"
import {
  mockDashboardStats,
  mockCreatorMarkets,
  mockActivityFeed,
} from "@/lib/data/mock-dashboard"
import type { DashboardStats, CreatorMarket, ActivityItem } from "@/lib/types/dashboard"

export function CreatorDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [markets, setMarkets] = useState<CreatorMarket[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(mockDashboardStats)
      setMarkets(mockCreatorMarkets)
      setActivity(mockActivityFeed)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background-alt">
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl tracking-wide text-foreground lg:text-4xl">
            CREATOR DASHBOARD
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your prediction markets, communities, and track performance.
          </p>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            {/* 1. Stats Overview */}
            {stats && <StatsCards stats={stats} />}

            {/* 2. Quick Actions */}
            <QuickActions />

            {/* 3. Markets Table + 4. Activity Feed */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
              <MarketsTable markets={markets} />
              <ActivityFeed items={activity} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
