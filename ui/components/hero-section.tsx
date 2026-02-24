"use client"

import { useEffect, useState } from "react"
import { Users, Wallet, Trophy, Target, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function FloatingCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial gradient overlay - top right */}
      <div
        className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 70% 20%, rgba(255,107,53,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Corner decorative icons */}
      <Trophy
        className="absolute top-16 right-16 size-24 text-primary/[0.07] hidden lg:block"
        strokeWidth={1}
      />
      <Target
        className="absolute bottom-24 left-16 size-20 text-primary/[0.07] hidden lg:block"
        strokeWidth={1}
      />

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`transition-all duration-700 delay-100 ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <Badge
              variant="outline"
              className="mb-8 rounded-full border-primary/20 bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground"
            >
              <Link2 className="size-3.5" />
              Powered by Chainlink & Chiliz
            </Badge>
          </div>

          {/* Headline */}
          <h1
            className={`font-serif text-[2.5rem] leading-[1.05] tracking-wide md:text-[3.5rem] lg:text-[4.5rem] transition-all duration-700 delay-200 ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            <span className="block bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent">
              Predict Together,
            </span>
            <span className="block text-foreground">Win Together</span>
          </h1>

          {/* Subheading */}
          <p
            className={`mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg transition-all duration-700 delay-300 ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Join communities, stake on sports predictions, and execute bets
            collectively on Polymarket. Better odds, bigger wins.
          </p>

          {/* CTA Buttons */}
          <div
            className={`mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center transition-all duration-700 delay-[400ms] ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-primary to-primary-dark text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 transition-all duration-200 h-12 px-8 text-base"
            >
              <Users className="size-5" />
              Explore Communities
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-lg border-primary/30 text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 h-12 px-8 text-base"
            >
              <Wallet className="size-5" />
              Connect Wallet
            </Button>
          </div>
        </div>

        {/* Floating stat cards */}
        <div className="mt-16 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <FloatingCard delay={600}>
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-5 py-3 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
                <Trophy className="size-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  1,247
                </p>
                <p className="text-xs text-muted-foreground">
                  Active Bettors
                </p>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard delay={800}>
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-5 py-3 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
                <span className="text-lg" role="img" aria-label="Money bag">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5 text-accent-foreground"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                    <path d="M12 18V6" />
                  </svg>
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  $127K
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Volume
                </p>
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>
    </section>
  )
}
