"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  Wallet,
  Copy,
  LogOut,
  ChevronDown,
  Zap,
  CircleDot,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/communities", label: "Communities" },
  { href: "/dashboard", label: "Dashboard" },
]

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// --- Logo ---
function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2 transition-transform duration-200 hover:scale-105"
    >
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
        <Zap className="size-4 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        STACK
        <span className="text-primary">BET</span>
      </span>
    </Link>
  )
}

// --- Desktop nav links ---
function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
      {NAV_LINKS.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors duration-200",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

// --- Network badge ---
function NetworkBadge({ isCorrectNetwork }: { isCorrectNetwork: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "hidden gap-1.5 border-border px-2.5 py-1 text-xs font-medium lg:inline-flex",
        !isCorrectNetwork && "border-warning/50 text-warning"
      )}
    >
      {!isCorrectNetwork && (
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-warning" />
        </span>
      )}
      <CircleDot className="size-3" />
      Chiliz
    </Badge>
  )
}

// --- Wallet dropdown (connected) ---
function WalletDropdown({
  address,
  balance,
  isCorrectNetwork,
  onDisconnect,
}: {
  address: string
  balance: string
  isCorrectNetwork: boolean
  onDisconnect: () => void
}) {
  const [copied, setCopied] = React.useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-full border-primary/30 px-3 hover:border-primary/60 hover:bg-accent"
        >
          <Avatar className="size-6">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {address.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            {truncateAddress(address)}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="pb-0 font-normal">
          <p className="text-xs text-muted-foreground">Connected Wallet</p>
        </DropdownMenuLabel>
        <div className="px-2 pb-2">
          <p className="font-mono text-sm text-foreground">
            {truncateAddress(address)}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex-col items-start gap-0.5">
            <span className="text-xs text-muted-foreground">Balance</span>
            <span className="text-sm font-semibold text-foreground">{balance} CHZ</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex-col items-start gap-0.5">
            <span className="text-xs text-muted-foreground">Network</span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <CircleDot className="size-3" />
              Chiliz Chain
              {!isCorrectNetwork && (
                <Badge variant="outline" className="border-warning/50 px-1.5 py-0 text-[10px] text-warning">
                  Wrong Network
                </Badge>
              )}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="size-4" />
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ExternalLink className="size-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDisconnect}>
          <LogOut className="size-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// --- Connect button ---
function ConnectButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="rounded-full bg-gradient-to-r from-primary to-primary-dark text-primary-foreground shadow-sm hover:opacity-90"
    >
      <Wallet className="size-4" />
      <span className="hidden sm:inline">Connect Wallet</span>
      <span className="sm:hidden">Connect</span>
    </Button>
  )
}

// --- Mobile sheet menu ---
function MobileMenu({
  open,
  onOpenChange,
  isConnected,
  address,
  balance,
  isCorrectNetwork,
  onConnect,
  onDisconnect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isConnected: boolean
  address: string
  balance: string
  isCorrectNetwork: boolean
  onConnect: () => void
  onDisconnect: () => void
}) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-sm">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Main navigation and wallet connection
        </SheetDescription>

        {/* Header area */}
        <div className="flex items-center justify-between p-6 pb-4">
          <Logo />
        </div>

        <Separator />

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center rounded-lg px-4 py-3 text-lg font-medium transition-colors duration-200",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="ml-auto size-1.5 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Wallet section at bottom */}
        <div className="mt-auto border-t border-border p-4">
          {isConnected ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {address.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {truncateAddress(address)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {balance} CHZ
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    !isCorrectNetwork && "border-warning/50 text-warning"
                  )}
                >
                  <CircleDot className="size-3" />
                  Chiliz
                </Badge>
              </div>
              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  onDisconnect()
                  onOpenChange(false)
                }}
              >
                <LogOut className="size-4" />
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <Button
              className="w-full rounded-full bg-gradient-to-r from-primary to-primary-dark text-primary-foreground hover:opacity-90"
              onClick={() => {
                onConnect()
                onOpenChange(false)
              }}
            >
              <Wallet className="size-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// --- Main header ---
export function NavHeader() {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Simulated wallet state
  const [isConnected, setIsConnected] = React.useState(false)
  const address = "0x1234567890abcdef1234567890abcdef12345678"
  const balance = "2,450.00"
  const isCorrectNetwork = true

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm transition-all duration-300",
        scrolled ? "py-2 shadow-md" : "py-3 md:py-4"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Left: Logo */}
        <Logo />

        {/* Center: Desktop nav */}
        <DesktopNav />

        {/* Right: Network + Wallet + Mobile trigger */}
        <div className="flex items-center gap-2">
          {isConnected && <NetworkBadge isCorrectNetwork={isCorrectNetwork} />}

          <div className="hidden md:block">
            {isConnected ? (
              <WalletDropdown
                address={address}
                balance={balance}
                isCorrectNetwork={isCorrectNetwork}
                onDisconnect={() => setIsConnected(false)}
              />
            ) : (
              <ConnectButton onClick={() => setIsConnected(true)} />
            )}
          </div>

          {/* Mobile: hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {/* Mobile sheet */}
      <MobileMenu
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        isConnected={isConnected}
        address={address}
        balance={balance}
        isCorrectNetwork={isCorrectNetwork}
        onConnect={() => setIsConnected(true)}
        onDisconnect={() => setIsConnected(false)}
      />
    </header>
  )
}
