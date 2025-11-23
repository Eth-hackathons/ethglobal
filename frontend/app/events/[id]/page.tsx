"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BettingInterface } from "@/components/BettingInterface";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ChatContainer } from "@/components/ChatContainer";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Mock event data
  const event = {
    id: id || "1",
    title: "Will Bitcoin reach $100k by end of 2024?",
    description:
      "This market predicts whether Bitcoin (BTC) will reach or exceed $100,000 USD before December 31st, 2024, 23:59:59 UTC. The resolution will be based on data from major exchanges including Coinbase, Binance, and Kraken. If BTC reaches $100k on any of these exchanges for at least 1 minute, this resolves to YES.",
    marketCloseTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    executionTime: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000
    ),
    odds: { yes: 0.65, no: 0.35 },
    communityId: "1", // Mock community ID - in production this would come from the event data
    communityName: "Crypto Predictions",
    polymarketUrl: "https://polymarket.com",
    totalBets: 127,
    totalVolume: 45230,
    status: "open" as "open" | "closing-soon" | "closed" | "completed",
  };

  const isExecutionWindow = new Date() < event.executionTime;
  let isCompleted = event.status === "completed" || event.status === "closed";
  // Temporary hack to test completed state
  if (id === "3") {
    isCompleted = true;
    event.status = "completed";
  }

  const getStatusBadge = () => {
    switch (event.status) {
      case "open":
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            Open
          </Badge>
        );
      case "closing-soon":
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            Closing Soon
          </Badge>
        );
      case "closed":
        return <Badge className="bg-muted text-muted-foreground">Closed</Badge>;
      case "completed":
        return (
          <Badge className="bg-muted text-muted-foreground">Completed</Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container px-4 py-8">
        <div className="mx-auto max-w-5xl">
          {/* Event Header */}
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="outline">{event.communityName}</Badge>
              {getStatusBadge()}
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {event.title}
            </h1>
            <p className="text-lg text-muted-foreground">{event.description}</p>
          </div>

          {/* Countdown Section */}
          {!isCompleted && (
            <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-medium text-muted-foreground">
                    Market Closes
                  </div>
                  <CountdownTimer
                    targetTime={event.marketCloseTime}
                    size="lg"
                  />
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium text-muted-foreground">
                    Execution Window Closes
                  </div>
                  <CountdownTimer targetTime={event.executionTime} size="lg" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Bets
                  </div>
                  <div className="text-2xl font-bold">{event.totalBets}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Volume
                  </div>
                  <div className="text-2xl font-bold">
                    ${event.totalVolume.toLocaleString()}
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <a
                    href={event.polymarketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Polymarket
                  </a>
                </Button>
              </div>
            </div>
          )}

          {/* Betting Interface */}
          {!isCompleted && (
            <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="mb-6 text-2xl font-bold">Place Your Bet</h2>
              <BettingInterface
                eventId={event.id}
                currentOdds={event.odds}
                isExecutionWindow={isExecutionWindow}
              />
            </div>
          )}

          {/* Completed State Message */}
          {isCompleted && (
            <div className="mb-8 rounded-xl border border-muted/50 bg-muted/5 p-6">
              <p className="text-center text-muted-foreground">
                This event has been completed. Betting is no longer available.
              </p>
            </div>
          )}

          {/* Chat/Discussion Section */}
          <div className="mb-8">
            <ChatContainer eventId={event.id} communityId={event.communityId} />
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <div className="flex items-start gap-4">
              <MessageSquare className="h-6 w-6 shrink-0 text-primary" />
              <div>
                <h3 className="mb-2 font-bold text-primary">How It Works</h3>
                <p className="text-sm text-muted-foreground">
                  Your bet will be aggregated with other community members. Two
                  hours before the market closes, all bets are automatically
                  executed on Polymarket using Chainlink automation. This
                  ensures better liquidity and pricing for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
