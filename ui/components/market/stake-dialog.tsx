"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import {
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  Check,
  Wallet,
  Link2,
  AlertTriangle,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StakeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side: "yes" | "no"
  currentOdds: number
  maxAmount: number
  onStake: (amount: number) => Promise<void>
}

type StakePhase = "idle" | "loading" | "success" | "error"

// ─── Constants ──────────────────────────────────────────────────────────────

const MIN_STAKE = 0.01

// ─── Inner Form ─────────────────────────────────────────────────────────────

function StakeForm({ side, currentOdds, maxAmount, onStake, onClose }: Omit<StakeDialogProps, "open" | "onOpenChange"> & { onClose: () => void }) {
  const [rawInput, setRawInput] = useState("")
  const [phase, setPhase] = useState<StakePhase>("idle")
  const [touched, setTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const amount = parseFloat(rawInput) || 0
  const isYes = side === "yes"
  const sideLabel = isYes ? "YES" : "NO"

  // Validation
  const errorMessage = useMemo(() => {
    if (!touched || rawInput === "") return null
    if (amount < MIN_STAKE) return `Minimum stake is ${MIN_STAKE} CHZ`
    if (amount > maxAmount) return `Exceeds your balance of ${maxAmount.toLocaleString()} CHZ`
    return null
  }, [touched, rawInput, amount, maxAmount])

  const isValid = amount >= MIN_STAKE && amount <= maxAmount

  // Payout calculation
  const estimatedPayout = useMemo(() => {
    if (amount <= 0 || currentOdds <= 0) return 0
    return amount * (100 / currentOdds)
  }, [amount, currentOdds])

  const potentialReturn = useMemo(() => {
    if (amount <= 0 || estimatedPayout <= 0) return 0
    return ((estimatedPayout - amount) / amount) * 100
  }, [amount, estimatedPayout])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current)
    }
  }, [])

  function handleMax() {
    setRawInput(String(maxAmount))
    setTouched(true)
  }

  function handleInputChange(val: string) {
    setRawInput(val)
    if (!touched) setTouched(true)
  }

  async function handleStake() {
    if (!isValid || phase === "loading") return
    setPhase("loading")
    try {
      await onStake(amount)
      setPhase("success")
      toast.success(`Successfully staked ${amount.toLocaleString()} CHZ on ${sideLabel}!`, {
        duration: 4000,
      })
      autoCloseTimer.current = setTimeout(() => {
        onClose()
      }, 2000)
    } catch {
      setPhase("error")
    }
  }

  function handleRetry() {
    setPhase("idle")
  }

  const sideColorClass = isYes ? "text-success" : "text-destructive"
  const sideBgClass = isYes ? "bg-success/15" : "bg-destructive/15"

  return (
    <div className="flex flex-col gap-5">
      {/* ── 1. Header icon + odds badge ── */}
      <div className="flex items-center gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${sideBgClass}`}>
          {isYes ? (
            <CheckCircle2 className="size-5 text-success" />
          ) : (
            <XCircle className="size-5 text-destructive" />
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-foreground">
            {"Stake on "}
            <span className={sideColorClass}>{sideLabel}</span>
          </span>
          <span
            className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-semibold ${sideBgClass} ${sideColorClass}`}
          >
            {currentOdds}% chance
          </span>
        </div>
      </div>

      {/* ── 2. Input Section ── */}
      <div className="flex flex-col gap-2">
        <label htmlFor="stake-input" className="text-sm font-medium text-foreground">
          CHZ Amount
        </label>
        <div className="relative">
          <Input
            ref={inputRef}
            id="stake-input"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={rawInput}
            onChange={(e) => handleInputChange(e.target.value)}
            min={MIN_STAKE}
            step="0.01"
            max={maxAmount}
            disabled={phase === "loading" || phase === "success"}
            aria-invalid={!!errorMessage}
            className={`h-12 pr-16 text-lg font-semibold ${
              errorMessage
                ? "border-destructive ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/30"
                : ""
            }`}
          />
          <button
            type="button"
            onClick={handleMax}
            disabled={phase === "loading" || phase === "success"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-primary hover:text-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Max
          </button>
        </div>
        {errorMessage ? (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="size-3" />
            {errorMessage}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {"Available: "}
            <span className="font-medium text-foreground">{maxAmount.toLocaleString()} CHZ</span>
          </p>
        )}
      </div>

      {/* ── 3. Summary Section ── */}
      <div className="flex flex-col gap-2.5 rounded-xl bg-muted/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">You stake</span>
          <span className="text-sm font-medium text-foreground">
            {amount > 0 ? `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHZ` : "-- CHZ"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current odds</span>
          <span className={`text-sm font-medium ${sideColorClass}`}>{currentOdds}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estimated payout</span>
          <span className={`text-sm font-bold ${estimatedPayout > amount && amount > 0 ? "text-primary" : "text-foreground"}`}>
            {estimatedPayout > 0
              ? `${estimatedPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHZ`
              : "-- CHZ"}
          </span>
        </div>

        <Separator className="my-0.5" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Potential return</span>
          <span className={`text-base font-bold ${potentialReturn > 0 ? "text-success" : "text-foreground"}`}>
            {potentialReturn > 0 ? `+${potentialReturn.toFixed(1)}%` : "--%"}
          </span>
        </div>
      </div>

      {/* ── 4. Info Banner ── */}
      <div className="flex gap-3 rounded-xl bg-accent px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
        <p className="text-xs leading-relaxed text-accent-foreground">
          Your bet will be pooled with the community and executed 2 hours before market close via Chainlink.
        </p>
      </div>

      {/* ── 5. Action Button ── */}
      {phase === "error" ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            <AlertTriangle className="size-4" />
            Transaction failed
          </div>
          <Button
            onClick={handleRetry}
            variant="outline"
            className="h-12 w-full text-base font-semibold border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Retry
          </Button>
        </div>
      ) : phase === "success" ? (
        <Button
          disabled
          className="h-12 w-full text-base font-semibold bg-success text-success-foreground hover:bg-success"
        >
          <Check className="size-4" />
          Staked!
        </Button>
      ) : (
        <Button
          onClick={handleStake}
          disabled={!isValid || phase === "loading"}
          className="h-12 w-full text-base font-semibold bg-gradient-to-r from-primary to-primary-dark text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50"
        >
          {phase === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Confirming...
            </>
          ) : !isValid && !touched ? (
            <>
              <Wallet className="size-4" />
              Connect Wallet
            </>
          ) : (
            <>
              Stake {amount > 0 ? `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} CHZ` : "CHZ"}
            </>
          )}
        </Button>
      )}

      {/* ── 6. Footer ── */}
      <div className="flex items-center justify-center gap-1.5 pb-1">
        <Link2 className="size-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Powered by Chainlink</span>
      </div>
    </div>
  )
}

// ─── Responsive Wrapper ─────────────────────────────────────────────────────

export function StakeDialog({
  open,
  onOpenChange,
  side,
  currentOdds,
  maxAmount,
  onStake,
}: StakeDialogProps) {
  const isMobile = useIsMobile()

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const form = (
    <StakeForm
      side={side}
      currentOdds={currentOdds}
      maxAmount={maxAmount}
      onStake={onStake}
      onClose={handleClose}
    />
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92dvh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Stake on {side === "yes" ? "YES" : "NO"}</DrawerTitle>
            <DrawerDescription>Place your stake on this market outcome</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6 pt-2">
            {form}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>Stake on {side === "yes" ? "YES" : "NO"}</DialogTitle>
          <DialogDescription>Place your stake on this market outcome</DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  )
}
