"use client"

import { useState, useMemo } from "react"
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Zap,
  Pencil,
  XCircle,
  Download,
  Search,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { CreatorMarket } from "@/lib/types/dashboard"
import type { MarketStatus } from "@/lib/types/market"

interface MarketsTableProps {
  markets: CreatorMarket[]
}

type SortKey = "title" | "totalStaked" | "totalBets" | "closesAt"
type SortDir = "asc" | "desc"

const statusConfig: Record<
  MarketStatus,
  { label: string; className: string }
> = {
  open: {
    label: "Open",
    className:
      "border-success/30 bg-success/10 text-success",
  },
  closing_soon: {
    label: "Closing Soon",
    className:
      "border-warning/30 bg-warning/10 text-warning",
  },
  closed: {
    label: "Closed",
    className:
      "border-muted-foreground/30 bg-muted text-muted-foreground",
  },
  resolved: {
    label: "Resolved",
    className:
      "border-primary/30 bg-primary/10 text-primary",
  },
}

function formatCountdown(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return "Ended"
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h`
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${mins}m`
}

function MobileMarketCard({ market }: { market: CreatorMarket }) {
  const cfg = statusConfig[market.status]
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 bg-card transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-card-foreground line-clamp-2">
          {market.title}
        </h3>
        <MarketActions />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="border-primary/30 text-primary text-xs"
        >
          {market.community}
        </Badge>
        <Badge variant="outline" className={cfg.className}>
          {cfg.label}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="flex flex-col">
          <span className="text-muted-foreground">Staked</span>
          <span className="font-semibold text-card-foreground">
            {market.totalStaked.toLocaleString()} CHZ
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Bets</span>
          <span className="font-semibold text-card-foreground">
            {market.totalBets.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Closes</span>
          <span className="font-semibold text-card-foreground">
            {formatCountdown(market.closesAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

function MarketActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Market actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="size-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Zap className="size-4" />
          Trigger Execution
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <XCircle className="size-4" />
          Close Market
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MarketsTable({ markets }: MarketsTableProps) {
  const [tab, setTab] = useState("all")
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("closesAt")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const filtered = useMemo(() => {
    let list = markets
    if (tab !== "all") {
      list = list.filter((m) => m.status === tab)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.community.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === "title") cmp = a.title.localeCompare(b.title)
      else if (sortKey === "totalStaked") cmp = a.totalStaked - b.totalStaked
      else if (sortKey === "totalBets") cmp = a.totalBets - b.totalBets
      else if (sortKey === "closesAt")
        cmp = new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime()
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [markets, tab, search, sortKey, sortDir])

  function SortButton({
    label,
    field,
  }: {
    label: string
    field: SortKey
  }) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => toggleSort(field)}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <ArrowUpDown
          className={`size-3 ${
            sortKey === field ? "text-primary" : "text-muted-foreground/50"
          }`}
        />
      </button>
    )
  }

  return (
    <Card className="py-0">
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-lg">Your Active Markets</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Download className="size-4" />
            Download CSV
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-5">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="closing_soon">Closing Soon</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
            <div className="relative sm:ml-auto sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
                aria-label="Search markets"
              />
            </div>
          </div>

          {/* All tabs render the same filtered list */}
          {["all", "open", "closing_soon", "closed"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="mt-0">
              {filtered.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="min-w-[280px]">
                            <SortButton label="Market" field="title" />
                          </TableHead>
                          <TableHead>Community</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>
                            <SortButton label="Deadline" field="closesAt" />
                          </TableHead>
                          <TableHead className="text-right">
                            <SortButton label="Staked" field="totalStaked" />
                          </TableHead>
                          <TableHead className="text-right">
                            <SortButton label="Bets" field="totalBets" />
                          </TableHead>
                          <TableHead className="w-10">
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((market) => {
                          const cfg = statusConfig[market.status]
                          return (
                            <TableRow key={market.id} className="group">
                              <TableCell>
                                <span className="font-medium text-card-foreground line-clamp-1">
                                  {market.title}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="border-primary/30 text-primary text-xs"
                                >
                                  {market.community}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cfg.className}
                                >
                                  {cfg.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatCountdown(market.closesAt)}
                              </TableCell>
                              <TableCell className="text-right font-medium text-card-foreground tabular-nums">
                                {market.totalStaked.toLocaleString()} CHZ
                              </TableCell>
                              <TableCell className="text-right font-medium text-card-foreground tabular-nums">
                                {market.totalBets.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <MarketActions />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="flex flex-col gap-3 md:hidden">
                    {filtered.map((market) => (
                      <MobileMarketCard key={market.id} market={market} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Search className="size-7 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-card-foreground">No markets found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first prediction market to get started.
        </p>
      </div>
      <Button className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
        Create Market
      </Button>
    </div>
  )
}
