"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { CommunityCard } from "@/components/CommunityCard";
import { CreateCommunityForm } from "@/components/CreateCommunityForm";
import { RegisterCreatorButton } from "@/components/RegisterCreatorButton";
import { CheckCreatorButton } from "@/components/CheckCreatorButton";
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
import { useContractRead, useContractReads } from "@/hooks";
import { CONTRACT_ADDRESSES } from "@/lib";
import PredictionHubABI from "@/lib/abis/PredictionHub.json";
import type { Abi } from "viem";

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);

  // Get community count
  const { data: communityCount, isLoading: isLoadingCount } = useContractRead({
    address: CONTRACT_ADDRESSES.PredictionHub,
    abi: PredictionHubABI as Abi,
    functionName: "communityCount",
  });

  // Create contracts array for all communities
  const communityContracts = useMemo(() => {
    if (!communityCount) return [];
    const count = Number(communityCount);
    return Array.from({ length: count }, (_, i) => ({
      address: CONTRACT_ADDRESSES.PredictionHub,
      abi: PredictionHubABI as Abi,
      functionName: "communities" as const,
      args: [BigInt(i)] as readonly unknown[],
    }));
  }, [communityCount]);

  // Fetch all communities
  const { data: communitiesData, isLoading: isLoadingCommunities } =
    useContractReads({
      contracts: communityContracts,
      query: {
        enabled: communityContracts.length > 0,
      },
    });

  // Map blockchain data to component format
  const communities = useMemo(() => {
    if (!communitiesData) return [];

    return communitiesData
      .map((data) => {
        if (!data || data.status !== "success") return null;

        const community = data.result as [
          bigint, // id
          string, // name
          string, // description
          string, // metadataURI
          string, // creator
          bigint, // createdAt
          bigint, // memberCount
          bigint, // marketCount
          boolean // isActive
        ];

        if (!community[8]) return null; // Skip inactive communities

        return {
          id: community[0].toString(),
          name: community[1],
          description: community[2],
          memberCount: Number(community[6]),
          activeEvents: Number(community[7]),
        };
      })
      .filter((c) => c !== null) as Array<{
      id: string;
      name: string;
      description: string;
      memberCount: number;
      activeEvents: number;
    }>;
  }, [communitiesData]);

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = isLoadingCount || isLoadingCommunities;

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
          <div className="flex flex-wrap gap-3">
            <CheckCreatorButton />
            <RegisterCreatorButton />
            <Button
              className="gradient-primary shadow-glow"
              onClick={() => setIsCreateCommunityOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Community
            </Button>
          </div>
        </div>

        {/* Communities Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              Loading communities...
            </p>
          </div>
        ) : (
          <>
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
          </>
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
