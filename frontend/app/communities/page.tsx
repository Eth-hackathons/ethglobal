"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { CommunityCard } from "@/components/CommunityCard";
import { CreateCommunityForm } from "@/components/CreateCommunityForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus } from "lucide-react";

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);

  // Mock communities data
  const communities = [
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
    {
      id: "4",
      name: "Political Markets",
      description:
        "Election predictions, policy outcomes, and political event forecasting",
      memberCount: 2103,
      activeEvents: 15,
    },
    {
      id: "5",
      name: "Entertainment Bets",
      description:
        "Movie releases, award shows, celebrity news, and pop culture predictions",
      memberCount: 456,
      activeEvents: 7,
    },
    {
      id: "6",
      name: "Economic Indicators",
      description:
        "GDP, inflation, interest rates, and macroeconomic event predictions",
      memberCount: 789,
      activeEvents: 4,
    },
  ];

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Communities</h1>
          <p className="text-lg text-muted-foreground">
            Join communities and start betting together
          </p>
        </div>

        {/* Search and Create */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            className="gradient-primary shadow-glow"
            onClick={() => setIsCreateCommunityOpen(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Community
          </Button>
        </div>

        {/* Communities Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCommunities.map((community) => (
            <CommunityCard key={community.id} {...community} />
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              No communities found
            </p>
          </div>
        )}
      </div>

      {/* Create Community Dialog */}
      <Dialog
        open={isCreateCommunityOpen}
        onOpenChange={setIsCreateCommunityOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Community</DialogTitle>
            <DialogDescription>
              Create a new community for collective betting. You'll be the
              creator and can manage events for your community.
            </DialogDescription>
          </DialogHeader>
          <CreateCommunityForm
            onSuccess={() => setIsCreateCommunityOpen(false)}
            onCancel={() => setIsCreateCommunityOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
