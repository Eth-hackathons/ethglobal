"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { SafeConnectButton } from "@/components/SafeConnectButton";
import { CommunityCard } from "@/components/CommunityCard";
import { TrendingUp, Users, Clock, Shield } from "lucide-react";

export default function HomePage() {
  // Mock featured communities
  const featuredCommunities = [
    {
      id: "1",
      name: "Crypto Predictions",
      description:
        "Bet on cryptocurrency markets and blockchain events with fellow enthusiasts",
      memberCount: 1247,
      activeEvents: 8,
    },
    {
      id: "2",
      name: "Sports Analytics",
      description:
        "Data-driven sports betting with real-time market analysis and community insights",
      memberCount: 892,
      activeEvents: 12,
    },
    {
      id: "3",
      name: "Tech Trends",
      description:
        "Predict the future of technology, AI developments, and startup valuations",
      memberCount: 634,
      activeEvents: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />

        <div className="container relative px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Powered by Polymarket & Chiliz
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-bold md:text-7xl">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Bet Together,
              </span>
              <br />
              <span className="text-foreground">Win Together</span>
            </h1>

            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Join communities, aggregate predictions, and execute bets
              collectively on Polymarket.
              <br className="hidden sm:block" />
              Higher liquidity, better odds, stronger together.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="gradient-primary shadow-glow h-12 px-8 text-base"
                asChild
              >
                <Link href="/communities">
                  <Users className="mr-2 h-5 w-5" />
                  Explore Communities
                </Link>
              </Button>
              <SafeConnectButton />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-border py-20">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to start betting collectively
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="relative rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg gradient-primary shadow-glow">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold">1. Join a Community</h3>
              <p className="text-muted-foreground">
                Browse communities based on your interests - crypto, sports,
                tech, or create your own.
              </p>
            </div>

            <div className="relative rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg gradient-success shadow-glow">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold">2. Place Your Bets</h3>
              <p className="text-muted-foreground">
                Vote YES or NO on events. Your bets aggregate with the community
                for better execution.
              </p>
            </div>

            <div className="relative rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-warning to-warning/60 shadow-glow">
                <Clock className="h-6 w-6 text-black" />
              </div>
              <h3 className="mb-2 text-xl font-bold">3. Auto-Execution</h3>
              <p className="text-muted-foreground">
                Bets execute automatically 2 hours before market close via
                Chainlink for best pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Communities */}
      <section className="py-20">
        <div className="container px-4">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Featured Communities</h2>
              <p className="text-muted-foreground">
                Join active communities and start betting
              </p>
            </div>
            <Link href="/communities">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCommunities.map((community) => (
              <CommunityCard key={community.id} {...community} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-border py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Shield className="mx-auto mb-6 h-16 w-16 text-primary" />
            <h2 className="mb-4 text-3xl font-bold">Secure & Transparent</h2>
            <p className="text-lg text-muted-foreground">
              Built on Chiliz blockchain with Chainlink automation. All bets are
              transparent,
              <br className="hidden sm:block" />
              aggregated fairly, and executed trustlessly on Polymarket.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
