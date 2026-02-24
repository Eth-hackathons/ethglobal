"use client"

import { useState } from "react"
import {
  ArrowDownToLine,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  X,
  Link2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PolymarketPreview {
  title: string
  volume: string
  participants: number
  yesPrice: number
  noPrice: number
  endDate: string
  category: string
  sourceUrl: string
}

// Simulated market previews based on URL patterns
const MOCK_PREVIEWS: Record<string, PolymarketPreview> = {
  default: {
    title: "Will Manchester City win the Premier League 2025/26?",
    volume: "$1.2M",
    participants: 4832,
    yesPrice: 0.64,
    noPrice: 0.36,
    endDate: "May 25, 2026",
    category: "Sports",
    sourceUrl: "https://polymarket.com/event/man-city-pl-2526",
  },
  nba: {
    title: "Boston Celtics to win 2026 NBA Championship?",
    volume: "$890K",
    participants: 3241,
    yesPrice: 0.28,
    noPrice: 0.72,
    endDate: "Jun 18, 2026",
    category: "Sports",
    sourceUrl: "https://polymarket.com/event/celtics-nba-2026",
  },
  f1: {
    title: "Max Verstappen to win 2026 F1 World Championship?",
    volume: "$2.1M",
    participants: 6712,
    yesPrice: 0.41,
    noPrice: 0.59,
    endDate: "Dec 7, 2026",
    category: "Sports",
    sourceUrl: "https://polymarket.com/event/verstappen-f1-2026",
  },
}

type FetchState = "idle" | "fetching" | "preview" | "importing" | "success" | "error"

export function ImportPolymarketDialog() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [state, setState] = useState<FetchState>("idle")
  const [preview, setPreview] = useState<PolymarketPreview | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  function reset() {
    setUrl("")
    setState("idle")
    setPreview(null)
    setErrorMsg("")
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    setOpen(next)
  }

  function isValidPolymarketUrl(input: string): boolean {
    try {
      const u = new URL(input)
      return u.hostname.includes("polymarket.com")
    } catch {
      return false
    }
  }

  async function handleFetch() {
    if (!url.trim()) {
      setErrorMsg("Please enter a Polymarket URL")
      return
    }

    if (!isValidPolymarketUrl(url)) {
      setErrorMsg("Enter a valid polymarket.com URL (e.g. https://polymarket.com/event/...)")
      return
    }

    setErrorMsg("")
    setState("fetching")

    // Simulate fetching market data
    await new Promise((r) => setTimeout(r, 1500))

    // Pick a mock preview based on URL content
    const lower = url.toLowerCase()
    let mockKey = "default"
    if (lower.includes("nba") || lower.includes("celtics") || lower.includes("basketball")) mockKey = "nba"
    else if (lower.includes("f1") || lower.includes("verstappen") || lower.includes("formula")) mockKey = "f1"

    setPreview({ ...MOCK_PREVIEWS[mockKey], sourceUrl: url })
    setState("preview")
  }

  async function handleImport() {
    setState("importing")
    await new Promise((r) => setTimeout(r, 2000))
    setState("success")

    toast.success("Market imported!", {
      description: `"${preview?.title}" is now live in your community.`,
    })

    setTimeout(() => {
      setOpen(false)
      reset()
    }, 1200)
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary-dark"
      >
        <ArrowDownToLine className="size-4" />
        <span className="hidden sm:inline">Import from Polymarket</span>
        <span className="sm:hidden">Import</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg gap-0 p-0 overflow-hidden">
          {/* Header with Polymarket branding accent */}
          <div className="px-6 pt-6 pb-0">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-xl bg-[#0066FF]/10">
                  <svg viewBox="0 0 24 24" className="size-5 text-[#0066FF]" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-foreground">
                    Import from Polymarket
                  </DialogTitle>
                  <DialogDescription className="mt-0.5">
                    Paste a Polymarket event URL to create a mirrored prediction market.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="px-6 pt-5 pb-6">
            {/* URL Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="poly-url" className="flex items-center gap-1.5 text-sm">
                <Link2 className="size-3.5 text-muted-foreground" />
                Polymarket Event URL
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="poly-url"
                    placeholder="https://polymarket.com/event/..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      setErrorMsg("")
                      if (state === "preview" || state === "error") {
                        setState("idle")
                        setPreview(null)
                      }
                    }}
                    className={cn(
                      "pr-8 text-sm",
                      errorMsg && "border-destructive focus-visible:ring-destructive/20"
                    )}
                    disabled={state === "fetching" || state === "importing" || state === "success"}
                  />
                  {url && state === "idle" && (
                    <button
                      onClick={() => { setUrl(""); setPreview(null); setState("idle") }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={handleFetch}
                  disabled={state === "fetching" || state === "importing" || state === "success" || !url.trim()}
                  className="bg-[#0066FF] hover:bg-[#0052CC] text-white shrink-0"
                  size="default"
                >
                  {state === "fetching" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Fetch"
                  )}
                </Button>
              </div>
              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Fetching state */}
            {state === "fetching" && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Loader2 className="size-8 animate-spin text-[#0066FF]" />
                <div>
                  <p className="text-sm font-medium text-foreground">Fetching market data...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pulling odds, volume, and metadata from Polymarket</p>
                </div>
              </div>
            )}

            {/* Preview card */}
            {(state === "preview" || state === "importing" || state === "success") && preview && (
              <div className="mt-5">
                <div className="rounded-xl border bg-muted/30 overflow-hidden">
                  {/* Mini header bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#0066FF]/5 border-b">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20 text-[10px] px-1.5 py-0 h-[18px]">
                        Polymarket
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-[18px] text-muted-foreground">
                        {preview.category}
                      </Badge>
                    </div>
                    <a
                      href={preview.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      Source
                      <ExternalLink className="size-3" />
                    </a>
                  </div>

                  {/* Market info */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-foreground leading-snug">
                      {preview.title}
                    </h3>

                    {/* Odds bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-success">
                          YES {(preview.yesPrice * 100).toFixed(0)}%
                        </span>
                        <span className="text-xs font-semibold text-destructive">
                          NO {(preview.noPrice * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
                        <div
                          className="bg-success rounded-l-full transition-all"
                          style={{ width: `${preview.yesPrice * 100}%` }}
                        />
                        <div
                          className="bg-destructive rounded-r-full transition-all"
                          style={{ width: `${preview.noPrice * 100}%` }}
                        />
                      </div>
                    </div>

                    <Separator className="my-3" />

                    {/* Stats row */}
                    <div className="flex items-center flex-wrap gap-x-5 gap-y-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="size-3.5" />
                        <span className="text-xs font-medium">{preview.volume}</span>
                        <span className="text-xs">volume</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="size-3.5" />
                        <span className="text-xs font-medium">{preview.participants.toLocaleString()}</span>
                        <span className="text-xs">traders</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span className="text-xs font-medium">Ends {preview.endDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Import mapping info */}
                <div className="flex items-start gap-2.5 rounded-lg bg-primary/8 border border-primary/15 p-3 mt-4">
                  <TrendingUp className="size-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Odds will be mirrored</span> from Polymarket as initial values. Your community members can then stake CHZ independently. The market resolution will track the original Polymarket outcome via Chainlink oracle.
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-5">
                  {state === "success" ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="size-5" />
                      <span className="text-sm font-semibold">Market Imported</span>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setState("idle"); setPreview(null); setUrl("") }}
                        disabled={state === "importing"}
                        className="text-muted-foreground"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={state === "importing"}
                        className="bg-primary hover:bg-primary-dark text-primary-foreground gap-2 min-w-[160px]"
                      >
                        {state === "importing" ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <ArrowDownToLine className="size-4" />
                            Import to Community
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Idle helper text */}
            {state === "idle" && !errorMsg && (
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <AlertCircle className="size-3.5 shrink-0" />
                Paste any Polymarket event URL. We will fetch the market details and let you preview before importing.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
