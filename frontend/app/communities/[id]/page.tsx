"use client";

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
import { Users, UserPlus, UserMinus, Plus, Crown, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useContractRead, useContractReads } from "@/hooks";
import { CONTRACT_ADDRESSES } from "@/lib";
import PredictionHubABI from "@/lib/abis/PredictionHub.json";
import MarketABI from "@/lib/abis/Market.json";
import type { Abi, Address } from "viem";

export default function CommunityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { address } = useAccount();
  const [isMember, setIsMember] = useState(false);
  const [isSuggestEventOpen, setIsSuggestEventOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const communityId = useMemo(() => {
    const parsed = parseInt(id || "0", 10);
    const result = isNaN(parsed) ? -1 : parsed; // Use -1 for invalid, 0 is valid
    if (result < 0) {
      console.warn("Invalid community ID:", id);
    }
    return result;
  }, [id]);

  // Fetch community data
  const {
    data: communityData,
    isLoading: isLoadingCommunity,
    error: communityError,
  } = useContractRead({
    address: CONTRACT_ADDRESSES.PredictionHub,
    abi: PredictionHubABI as Abi,
    functionName: "getCommunity",
    args: [BigInt(communityId)],
    query: {
      enabled: communityId >= 0,
    },
  });

  // Fetch market addresses for this community
  const { data: marketAddresses, isLoading: isLoadingMarkets } =
    useContractRead({
      address: CONTRACT_ADDRESSES.PredictionHub,
      abi: PredictionHubABI as Abi,
      functionName: "getCommunityMarkets",
      args: [BigInt(communityId)],
      query: {
        enabled: communityId > 0,
        refetchInterval: 5000, // Refetch every 5 seconds to catch new markets
      },
    });

  // Create contracts array for reading market data
  const marketContracts = useMemo(() => {
    if (!marketAddresses || !Array.isArray(marketAddresses)) return [];
    return marketAddresses.flatMap((marketAddress: Address) => [
      {
        address: marketAddress,
        abi: MarketABI as Abi,
        functionName: "metadata" as const,
      },
      {
        address: marketAddress,
        abi: MarketABI as Abi,
        functionName: "stakingDeadline" as const,
      },
      {
        address: marketAddress,
        abi: MarketABI as Abi,
        functionName: "state" as const,
      },
      {
        address: marketAddress,
        abi: MarketABI as Abi,
        functionName: "getPoolInfo" as const,
      },
      {
        address: marketAddress,
        abi: MarketABI as Abi,
        functionName: "polymarketId" as const,
      },
    ]);
  }, [marketAddresses]);

  // Fetch all market data
  const { data: marketsData, isLoading: isLoadingMarketData } =
    useContractReads({
      contracts: marketContracts,
      query: {
        enabled: marketContracts.length > 0,
      },
    });

  // Transform community data
  const community = useMemo(() => {
    if (!communityData) {
      console.log("No community data available");
      return null;
    }

    console.log("Community data received:", communityData);

    // Handle both array (tuple) and object formats
    let id: bigint, name: string, description: string, metadataURI: string;
    let creator: Address,
      createdAt: bigint,
      memberCount: bigint,
      marketCount: bigint,
      isActive: boolean;

    if (Array.isArray(communityData)) {
      // Tuple format: [id, name, description, metadataURI, creator, createdAt, memberCount, marketCount, isActive]
      [
        id,
        name,
        description,
        metadataURI,
        creator,
        createdAt,
        memberCount,
        marketCount,
        isActive,
      ] = communityData as [
        bigint,
        string,
        string,
        string,
        Address,
        bigint,
        bigint,
        bigint,
        boolean
      ];
    } else {
      // Object format (named struct properties)
      const data = communityData as any;
      id =
        typeof data.id === "bigint"
          ? data.id
          : BigInt(data.id || data[0] || "0");
      name = data.name || data[1] || "";
      description = data.description || data[2] || "";
      metadataURI = data.metadataURI || data[3] || "";
      creator = data.creator || data[4] || "0x";
      createdAt =
        typeof data.createdAt === "bigint"
          ? data.createdAt
          : BigInt(data.createdAt || data[5] || "0");
      memberCount =
        typeof data.memberCount === "bigint"
          ? data.memberCount
          : BigInt(data.memberCount || data[6] || "0");
      marketCount =
        typeof data.marketCount === "bigint"
          ? data.marketCount
          : BigInt(data.marketCount || data[7] || "0");
      isActive =
        data.isActive !== undefined
          ? data.isActive
          : data[8] !== undefined
          ? data[8]
          : false;
    }

    // Validate that we have at least a name (basic validation)
    if (!name || name.trim() === "") {
      console.warn("Community data missing name:", { id, name, description });
      return null;
    }

    const result = {
      id: id.toString(),
      name,
      description,
      metadataURI,
      creator,
      memberCount: Number(memberCount),
      marketCount: Number(marketCount),
      isActive,
    };

    console.log("Transformed community:", result);
    return result;
  }, [communityData]);

  // Transform market data to EventCard format
  const events = useMemo(() => {
    if (!marketsData || !marketAddresses || !Array.isArray(marketAddresses))
      return [];

    const eventsList = [];
    const chunkSize = 5; // 5 reads per market

    for (let i = 0; i < marketAddresses.length; i++) {
      const marketAddress = marketAddresses[i] as Address;
      const startIdx = i * chunkSize;
      const chunk = marketsData.slice(startIdx, startIdx + chunkSize);

      if (chunk.length < chunkSize) continue;

      const [
        metadataResult,
        stakingDeadlineResult,
        stateResult,
        poolInfoResult,
        polymarketIdResult,
      ] = chunk;

      if (
        metadataResult?.status !== "success" ||
        stakingDeadlineResult?.status !== "success" ||
        stateResult?.status !== "success" ||
        poolInfoResult?.status !== "success" ||
        polymarketIdResult?.status !== "success"
      ) {
        continue;
      }

      const metadataStr = metadataResult.result as string;
      const stakingDeadline = stakingDeadlineResult.result as bigint;
      const state = stateResult.result as number;
      const poolInfo = poolInfoResult.result as [bigint, bigint, bigint];
      const polymarketId = polymarketIdResult.result as string;

      // Parse metadata JSON (only title and polymarketUrl)
      let metadata: {
        title?: string;
        polymarketUrl?: string;
      } = {};

      if (metadataStr && metadataStr.trim() !== "") {
        try {
          const parsed = JSON.parse(metadataStr);
          // Ensure parsed is an object
          if (typeof parsed === "object" && parsed !== null) {
            metadata = parsed;
          } else {
            // If parsed value is not an object, use it as title
            metadata = { title: String(parsed) };
          }
        } catch (e) {
          // If metadata is not JSON, use it as title
          console.warn(
            `Failed to parse metadata for market ${marketAddress}:`,
            e
          );
          metadata = { title: metadataStr };
        }
      } else {
        console.warn(
          `Empty metadata for market ${marketAddress}, using polymarketId as fallback`
        );
      }

      // Calculate odds from pool info (A = yes, B = no)
      const [totalA, totalB, totalDraw] = poolInfo;
      const totalPool = totalA + totalB + totalDraw;
      const yesOdds =
        totalPool > BigInt(0) ? Number(totalA) / Number(totalPool) : 0.5;
      const noOdds =
        totalPool > BigInt(0) ? Number(totalB) / Number(totalPool) : 0.5;

      // Determine status based on state and deadline
      // MarketState: Open=0, Locked=1, MockBridged=2, MockTrading=3, Settled=4, Completed=5
      const now = Date.now();
      const deadline = Number(stakingDeadline) * 1000;
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

      let status: "open" | "closing-soon" | "closed" = "open";
      if (state === 0 && hoursUntilDeadline < 24 && hoursUntilDeadline > 0) {
        status = "closing-soon";
      } else if (state > 0 || hoursUntilDeadline <= 0) {
        status = "closed";
      }

      // Build Polymarket URL
      const polymarketUrl =
        metadata.polymarketUrl ||
        `https://polymarket.com/event/${polymarketId}`;

      // Determine title with fallbacks
      let title = metadata.title;
      if (!title || title.trim() === "") {
        // Fallback 1: Use polymarketId if available
        if (polymarketId && polymarketId.trim() !== "") {
          // Format polymarketId nicely (replace hyphens with spaces, capitalize)
          title = polymarketId
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        } else {
          // Fallback 2: Use market address
          title = `Market ${marketAddress.slice(0, 6)}...${marketAddress.slice(
            -4
          )}`;
        }
      }

      console.log(`Market ${marketAddress}:`, {
        metadataStr,
        parsedMetadata: metadata,
        title,
        polymarketId,
      });

      eventsList.push({
        id: marketAddress,
        title: title.trim(),
        marketCloseTime: new Date(deadline),
        odds: {
          yes: yesOdds,
          no: noOdds,
        },
        status,
        polymarketUrl,
      });
    }

    return eventsList;
  }, [marketsData, marketAddresses]);

  // Check if user is creator
  const isCreator = useMemo(() => {
    if (!community || !address) return false;
    return community.creator.toLowerCase() === address.toLowerCase();
  }, [community, address]);

  // Check if user is member
  const { data: isCommunityMember } = useContractRead({
    address: CONTRACT_ADDRESSES.PredictionHub,
    abi: PredictionHubABI as Abi,
    functionName: "isCommunityMember",
    args: address ? [BigInt(communityId), address] : undefined,
    query: {
      enabled: communityId > 0 && !!address,
    },
  });

  // Update member state when contract data changes
  useEffect(() => {
    if (isCommunityMember !== undefined) {
      setIsMember(isCommunityMember as boolean);
    }
  }, [isCommunityMember]);

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
    // Trigger refresh by updating key
    setRefreshKey((prev) => prev + 1);
    toast.success("Market created! Refreshing events...");
  };

  const isLoading =
    isLoadingCommunity || isLoadingMarkets || isLoadingMarketData;

  // Show loading state
  if (isLoading && !community && !communityError) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  // Show error or not found state
  if (communityError || (!community && !isLoading)) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container px-4 py-8">
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">
              {communityError
                ? `Error: ${communityError.message || "Community not found"}`
                : "Community not found"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Community ID: {id || "N/A"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If still loading but we have community data, show it (optimistic)
  if (!community) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container px-4 py-8">
        {/* Community Header */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-card md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                {community.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {community.description}
              </p>
            </div>
            <Button
              onClick={handleJoinLeave}
              className={
                isMember
                  ? "bg-muted hover:bg-muted/80"
                  : "gradient-primary shadow-glow"
              }
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
              <span className="font-medium">
                {community.memberCount} members
              </span>
            </div>
            <div>
              <span className="font-medium">{events.length} active events</span>
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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
          </>
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
