'use client';

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { EventCard } from "@/components/EventCard";
import { EventSuggestionForm } from "@/components/EventSuggestionForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, UserPlus, UserMinus, Plus, Crown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CommunityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [isMember, setIsMember] = useState(false);
  const [isSuggestEventOpen, setIsSuggestEventOpen] = useState(false);

  // Mock community data
  const community = {
    id: id || "1",
    name: "Crypto Predictions",
    description: "Join fellow crypto enthusiasts in predicting market movements, blockchain events, and cryptocurrency trends. We aggregate our predictions for better odds and execute collectively on Polymarket.",
    memberCount: 1247,
    activeEvents: 8,
    creator: "0x1234...5678",
  };

  // Mock ownership check - for design purposes, using a simple comparison
  // In production, this would check against connected wallet address
  const mockConnectedAddress = "0x1234...5678"; // Mock connected wallet
  const isCreator =
    mockConnectedAddress.toLowerCase() === community.creator.toLowerCase();

  // Mock events - using state so we can update after form submission
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Will Bitcoin reach $100k by end of 2024?",
      description: "Predicting if BTC will hit the 100k milestone before year end",
      marketCloseTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      odds: { yes: 0.65, no: 0.35 },
      status: "open" as const,
      polymarketUrl: "https://polymarket.com",
    },
    {
      id: "2",
      title: "Ethereum ETF approval in Q1 2024?",
      description: "Will the SEC approve spot Ethereum ETFs in the first quarter?",
      marketCloseTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      odds: { yes: 0.42, no: 0.58 },
      status: "open" as const,
      polymarketUrl: "https://polymarket.com",
    },
    {
      id: "3",
      title: "Solana network downtime in next 30 days?",
      description: "Will Solana experience any network outages in the coming month?",
      marketCloseTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000), // 1.5 hours from now
      odds: { yes: 0.28, no: 0.72 },
      status: "closing-soon" as const,
      polymarketUrl: "https://polymarket.com",
    },
  ]);

  const handleJoinLeave = () => {
    if (isMember) {
      setIsMember(false);
      toast.success("Left community");
    } else {
      setIsMember(true);
      toast.success("Joined community! You can now bet on events.");
    }
  };

  const handleEventSuggestionSuccess = () => {
    setIsSuggestEventOpen(false);
    // In a real implementation, this would fetch updated events from the API
    // For now, we'll just show a message that the event was added
    // The events list would be refreshed via API call in production
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container px-4 py-8">
        {/* Community Header */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-card md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold md:text-4xl">{community.name}</h1>
              <p className="text-lg text-muted-foreground">{community.description}</p>
            </div>
            <Button
              onClick={handleJoinLeave}
              className={isMember ? "bg-muted hover:bg-muted/80" : "gradient-primary shadow-glow"}
            >
              {isMember ? (
                <>
                  <UserMinus className="mr-2 h-5 w-5" />
                  Leave
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Join Community
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">{community.memberCount} members</span>
            </div>
            <div>
              <span className="font-medium">{community.activeEvents} active events</span>
            </div>
          </div>
        </div>

        {/* Suggest Event Section - Creator Only */}
        {isCreator && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Suggest Event</h2>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Creator Only
                </Badge>
              </div>
              <Button
                onClick={() => setIsSuggestEventOpen(true)}
                className="gradient-primary shadow-glow"
              >
                <Plus className="mr-2 h-4 w-4" />
                Suggest Event
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              As the community creator, you can propose new prediction events
              from Polymarket for the community to bet on.
            </p>
          </div>
        )}

        {/* Events Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Active Events</h2>
            <p className="text-muted-foreground">
              Place your bets before the execution window closes
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>

        {events.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">
              No active events yet
            </p>
            {isCreator && (
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setIsSuggestEventOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Be the first to suggest an event
              </Button>
            )}
          </div>
        )}

        {/* Suggest Event Dialog */}
        <Dialog open={isSuggestEventOpen} onOpenChange={setIsSuggestEventOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Suggest New Event
                <Badge variant="outline" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Creator Only
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Propose a new prediction event from Polymarket for your
                community to bet on.
              </DialogDescription>
            </DialogHeader>
            <EventSuggestionForm
              communityId={community.id}
              onSuccess={handleEventSuggestionSuccess}
              onCancel={() => setIsSuggestEventOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

