"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ArrowUpDown, LayoutGrid, List, Users, BarChart3, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CommunityListCard } from "./community-list-card"
import { CommunitiesListSkeleton } from "./community-card-skeleton"
import { CreateCommunityDialog } from "./create-community-dialog"
import {
  mockCommunitiesList,
  type CommunityListItem,
  type CommunitySortOption,
} from "@/lib/data/mock-communities-list"

const SPORT_FILTERS = [
  "All Sports",
  "Football",
  "Basketball",
  "Motorsport",
  "Tennis",
  "MMA",
  "Cricket",
  "Golf",
  "Cycling",
]

const SORT_OPTIONS: { value: CommunitySortOption; label: string; icon: React.ReactNode }[] = [
  { value: "trending", label: "Trending", icon: <Zap className="size-3.5" /> },
  { value: "most_active", label: "Most Active", icon: <BarChart3 className="size-3.5" /> },
  { value: "highest_roi", label: "Highest ROI", icon: <ArrowUpDown className="size-3.5" /> },
]

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

function sortCommunities(
  list: CommunityListItem[],
  sort: CommunitySortOption
): CommunityListItem[] {
  const sorted = [...list]
  switch (sort) {
    case "trending":
      return sorted.sort((a, b) => {
        if (a.trending && !b.trending) return -1
        if (!a.trending && b.trending) return 1
        return b.activity24h - a.activity24h
      })
    case "most_active":
      return sorted.sort((a, b) => b.activity24h - a.activity24h)
    case "highest_roi":
      return sorted.sort((a, b) => b.roi7d - a.roi7d)
    default:
      return sorted
  }
}

export function CommunitiesListPage() {
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sport, setSport] = useState("All Sports")
  const [sort, setSort] = useState<CommunitySortOption>("trending")
  const [viewMode, setViewMode] = useState<"list" | "compact">("list")

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    let list = mockCommunitiesList

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.sport.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      )
    }

    if (sport !== "All Sports") {
      list = list.filter((c) => c.sport === sport)
    }

    return sortCommunities(list, sort)
  }, [search, sport, sort])

  // Aggregate stats
  const totalMembers = mockCommunitiesList.reduce((s, c) => s + c.membersCount, 0)
  const totalMarkets = mockCommunitiesList.reduce((s, c) => s + c.activeMarkets, 0)
  const totalVolume = mockCommunitiesList.reduce((s, c) => s + c.totalVolume, 0)

  return (
    <div className="min-h-screen bg-background-alt">
      {/* Page header */}
      <header className="bg-card border-b">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-foreground text-3xl sm:text-4xl tracking-wide leading-none">
                Communities
              </h1>
              <p className="text-muted-foreground text-sm mt-2 max-w-lg leading-relaxed">
                Browse prediction communities by sport. Join rooms, explore active markets, and stake with the crowd.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-xs font-medium bg-muted text-muted-foreground border-0">
                <Users className="size-3.5" />
                {formatNumber(totalMembers)} Bettors
              </Badge>
              <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-xs font-medium bg-muted text-muted-foreground border-0">
                <BarChart3 className="size-3.5" />
                {totalMarkets} Markets
              </Badge>
              <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-xs font-medium bg-primary/10 text-primary border-0">
                <Zap className="size-3.5" />
                {formatNumber(totalVolume)} CHZ
              </Badge>
              <CreateCommunityDialog />
            </div>
          </div>
        </div>
      </header>

      {/* Sticky toolbar */}
      <div className="sticky top-[57px] z-30 bg-background/80 backdrop-blur-md border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Search + Sport filter */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search communities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select value={sport} onValueChange={setSport}>
                <SelectTrigger className="w-auto gap-1.5 text-sm h-9 hidden sm:flex" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPORT_FILTERS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Right: Sort + View toggle */}
            <div className="flex items-center gap-2">
              {/* Sport filter on mobile */}
              <Select value={sport} onValueChange={setSport}>
                <SelectTrigger className="w-auto gap-1.5 text-sm h-9 sm:hidden" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPORT_FILTERS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort chips */}
              <div className="hidden sm:flex items-center gap-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      sort === opt.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Sort dropdown on mobile */}
              <Select value={sort} onValueChange={(v) => setSort(v as CommunitySortOption)}>
                <SelectTrigger className="w-auto gap-1.5 text-sm h-9 sm:hidden" size="sm">
                  <ArrowUpDown className="size-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View mode toggle */}
              <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 hidden md:flex">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "rounded-md p-1.5 transition-all",
                    viewMode === "list"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={cn(
                    "rounded-md p-1.5 transition-all",
                    viewMode === "compact"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Compact view"
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>

              {/* Result count */}
              <span className="text-xs text-muted-foreground whitespace-nowrap hidden lg:inline">
                {filtered.length} {filtered.length === 1 ? "community" : "communities"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <CommunitiesListSkeleton count={6} />
        ) : filtered.length === 0 ? (
          <EmptySearch search={search} sport={sport} onClear={() => { setSearch(""); setSport("All Sports") }} />
        ) : viewMode === "list" ? (
          <div className="flex flex-col gap-3">
            {filtered.map((community, i) => (
              <CommunityListCard key={community.id} community={community} index={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((community, i) => (
              <CommunityListCard key={community.id} community={community} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function EmptySearch({
  search,
  sport,
  onClear,
}: {
  search: string
  sport: string
  onClear: () => void
}) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center size-14 rounded-full bg-muted mb-4">
        <Search className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No communities found</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {search
          ? `No results for "${search}"${sport !== "All Sports" ? ` in ${sport}` : ""}.`
          : `No communities found in ${sport}.`}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={onClear}
      >
        Clear filters
      </Button>
    </Card>
  )
}
