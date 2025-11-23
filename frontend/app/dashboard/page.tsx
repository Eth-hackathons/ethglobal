"use client";

import { Header } from "@/components/layout/Header";
import { BetCard } from "@/components/BetCard";

export default function DashboardPage() {
  // Mock user bets data
  const activeBets = [
    {
      id: "1",
      eventId: "1",
      eventTitle: "Will Bitcoin reach $100k by end of 2024?",
      communityName: "Crypto Predictions",
      side: "yes" as const,
      amount: 50,
      status: "pending" as const,
      executionTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
      odds: 0.65,
    },
    {
      id: "2",
      eventId: "2",
      eventTitle: "Ethereum ETF approval in Q1 2024?",
      communityName: "Crypto Predictions",
      side: "no" as const,
      amount: 100,
      status: "pending" as const,
      executionTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      odds: 0.58,
    },
  ];

  const completedBets = [
    {
      id: "3",
      eventId: "3",
      eventTitle: "Will Solana reach $200 by end of 2024?",
      communityName: "Crypto Predictions",
      side: "yes" as const,
      amount: 75,
      status: "won" as const,
      odds: 0.72,
      payout: 104.17,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  const stats = {
    totalBets: 15,
    activeBets: 2,
    totalVolume: 1250,
    winRate: 67,
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Track your bets and performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="mb-2 text-sm text-muted-foreground">Total Bets</div>
            <div className="text-3xl font-bold">{stats.totalBets}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="mb-2 text-sm text-muted-foreground">
              Active Bets
            </div>
            <div className="text-3xl font-bold text-warning">
              {stats.activeBets}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="mb-2 text-sm text-muted-foreground">
              Total Volume
            </div>
            <div className="text-3xl font-bold">${stats.totalVolume}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="mb-2 text-sm text-muted-foreground">Win Rate</div>
            <div className="text-3xl font-bold text-success">
              {stats.winRate}%
            </div>
          </div>
        </div>

        {/* Active Bets */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Active Bets</h2>
          <div className="space-y-4">
            {activeBets.map((bet) => (
              <BetCard
                key={bet.id}
                id={bet.id}
                eventId={bet.eventId}
                eventTitle={bet.eventTitle}
                communityName={bet.communityName}
                side={bet.side}
                amount={bet.amount}
                status={bet.status}
                odds={bet.odds}
                executionTime={bet.executionTime}
                isCompleted={false}
              />
            ))}
          </div>
        </div>

        {/* Recent History */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Recent History</h2>
          {completedBets.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No completed bets yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedBets.map((bet) => (
                <BetCard
                  key={bet.id}
                  id={bet.id}
                  eventId={bet.eventId}
                  eventTitle={bet.eventTitle}
                  communityName={bet.communityName}
                  side={bet.side}
                  amount={bet.amount}
                  status={bet.status}
                  odds={bet.odds}
                  payout={bet.payout}
                  isCompleted={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
