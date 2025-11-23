"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BettingInterface } from "@/components/BettingInterface";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ChatContainer } from "@/components/ChatContainer";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  MessageSquare,
  Loader2,
  Trophy,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMemo, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useContractRead, useContractReads, useContractWrite } from "@/hooks";
import { useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/lib";
import MarketABI from "@/lib/abis/Market.json";
import PredictionHubABI from "@/lib/abis/PredictionHub.json";
import { formatEther } from "viem";
import { toast } from "sonner";
import type { Abi, Address } from "viem";

export default function EventDetailPage() {
  const params = useParams();
  const marketAddress = params.id as string;
  const { address, isConnected } = useAccount();

  // Fetch market data from contract
  const marketContracts = useMemo(
    () =>
      marketAddress && marketAddress.startsWith("0x")
        ? [
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "metadata" as const,
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "stakingDeadline" as const,
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "state" as const,
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "getTotalPool" as const,
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "getPoolInfo" as const,
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "polymarketId" as const,
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "hub" as const,
            },
          ]
        : [],
    [marketAddress]
  );

  const { data: marketData, isLoading: isLoadingMarket } = useContractReads({
    contracts: marketContracts,
    query: {
      enabled: marketContracts.length > 0,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  // Get community ID from hub contract
  const { data: hubAddress } = useContractRead({
    address: marketAddress as Address,
    abi: MarketABI as Abi,
    functionName: "hub",
    query: {
      enabled: !!marketAddress && marketAddress.startsWith("0x"),
    },
  });

  const { data: communityId } = useContractRead({
    address: hubAddress as Address,
    abi: PredictionHubABI as Abi,
    functionName: "getMarketCommunity",
    args: marketAddress ? [marketAddress as Address] : undefined,
    query: {
      enabled: !!hubAddress && !!marketAddress,
    },
  });

  // Get community data
  const { data: communityData } = useContractRead({
    address: hubAddress as Address,
    abi: PredictionHubABI as Abi,
    functionName: "getCommunity",
    args: communityId ? [BigInt(Number(communityId))] : undefined,
    query: {
      enabled: !!hubAddress && communityId !== undefined,
    },
  });

  // Fetch user's stake data and claim eligibility
  const userStakeContracts = useMemo(
    () =>
      marketAddress && marketAddress.startsWith("0x") && address
        ? [
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "getStake" as const,
              args: [address as Address, 0], // Outcome.A (Yes)
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "getStake" as const,
              args: [address as Address, 1], // Outcome.B (No)
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "canClaim" as const,
              args: [address as Address],
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "getPotentialReward" as const,
              args: [address as Address],
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "hasClaimed" as const,
              args: [address as Address],
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "chosenOutcome" as const,
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "winningOutcome" as const,
            },
            {
              address: marketAddress as Address,
              abi: MarketABI as Abi,
              functionName: "isSettled" as const,
            },
          ]
        : [],
    [marketAddress, address]
  );

  const { data: userStakeData, isLoading: isLoadingUserStake } =
    useContractReads({
      contracts: userStakeContracts,
      query: {
        enabled: userStakeContracts.length > 0 && isConnected,
        refetchInterval: 5000,
      },
    });

  // Parse user stake data
  const userStakeInfo = useMemo(() => {
    if (!userStakeData || userStakeData.length < 8 || !address) return null;

    const [
      stakeYesResult,
      stakeNoResult,
      canClaimResult,
      potentialRewardResult,
      hasClaimedResult,
      chosenOutcomeResult,
      winningOutcomeResult,
      isSettledResult,
    ] = userStakeData;

    if (
      stakeYesResult?.status !== "success" ||
      stakeNoResult?.status !== "success" ||
      canClaimResult?.status !== "success" ||
      potentialRewardResult?.status !== "success" ||
      hasClaimedResult?.status !== "success" ||
      chosenOutcomeResult?.status !== "success" ||
      winningOutcomeResult?.status !== "success" ||
      isSettledResult?.status !== "success"
    ) {
      return null;
    }

    const stakeYes = stakeYesResult.result as bigint;
    const stakeNo = stakeNoResult.result as bigint;
    const canClaim = canClaimResult.result as boolean;
    const potentialReward = potentialRewardResult.result as bigint;
    const hasClaimed = hasClaimedResult.result as boolean;
    const chosenOutcome = chosenOutcomeResult.result as number;
    const winningOutcome = winningOutcomeResult.result as number;
    const isSettled = isSettledResult.result as boolean;

    return {
      stakeYes: Number(formatEther(stakeYes)),
      stakeNo: Number(formatEther(stakeNo)),
      totalStake: Number(formatEther(stakeYes + stakeNo)),
      canClaim,
      potentialReward: Number(formatEther(potentialReward)),
      hasClaimed,
      chosenOutcome,
      winningOutcome,
      isSettled,
      hasStake: stakeYes > BigInt(0) || stakeNo > BigInt(0),
    };
  }, [userStakeData, address]);

  // Claim functionality
  const {
    write: claimWrite,
    hash: claimTxHash,
    isLoading: isClaimPending,
    error: claimError,
    canWrite: canClaimWrite,
    reset: resetClaim,
  } = useContractWrite({
    address: marketAddress as Address,
    abi: MarketABI as Abi,
    functionName: "claim",
  });

  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimConfirmed,
    error: claimTxError,
  } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  const [hasShownClaimSuccess, setHasShownClaimSuccess] = useState(false);
  const [hasShownClaimError, setHasShownClaimError] = useState(false);

  // Handle claim success
  useEffect(() => {
    if (isClaimConfirmed && claimTxHash && !hasShownClaimSuccess) {
      setHasShownClaimSuccess(true);
      toast.success("Rewards claimed successfully!", { id: "claim" });
      resetClaim();
    }
  }, [isClaimConfirmed, claimTxHash, hasShownClaimSuccess, resetClaim]);

  // Handle claim errors
  useEffect(() => {
    if ((claimError || claimTxError) && !hasShownClaimError) {
      setHasShownClaimError(true);
      const errorMsg =
        claimError?.message ||
        claimTxError?.message ||
        "Failed to claim rewards";
      toast.error(errorMsg, { id: "claim" });
      resetClaim();
    }
  }, [claimError, claimTxError, hasShownClaimError, resetClaim]);

  // Parse market data
  const marketInfo = useMemo(() => {
    if (!marketData || marketData.length < 7) return null;

    const [
      metadataResult,
      stakingDeadlineResult,
      stateResult,
      totalPoolResult,
      poolInfoResult,
      polymarketIdResult,
      hubResult,
    ] = marketData;

    if (
      metadataResult?.status !== "success" ||
      stakingDeadlineResult?.status !== "success" ||
      stateResult?.status !== "success" ||
      totalPoolResult?.status !== "success" ||
      poolInfoResult?.status !== "success" ||
      polymarketIdResult?.status !== "success"
    ) {
      return null;
    }

    const metadataStr = metadataResult.result as string;
    const stakingDeadline = stakingDeadlineResult.result as bigint;
    const state = stateResult.result as number;
    const totalPool = totalPoolResult.result as bigint;
    const poolInfo = poolInfoResult.result as [bigint, bigint, bigint];
    const polymarketId = polymarketIdResult.result as string;

    // Parse metadata
    let metadata: { title?: string; polymarketUrl?: string } = {};
    if (metadataStr && metadataStr.trim() !== "") {
      try {
        const parsed = JSON.parse(metadataStr);
        if (typeof parsed === "object" && parsed !== null) {
          metadata = parsed;
        } else {
          metadata = { title: String(parsed) };
        }
      } catch (e) {
        metadata = { title: metadataStr };
      }
    }

    // Calculate execution window (2 hours before staking deadline)
    const deadlineTimestamp = Number(stakingDeadline) * 1000;
    const executionWindowTime = new Date(
      deadlineTimestamp - 2 * 60 * 60 * 1000
    );

    // Calculate total bets (estimate: count non-zero stakes)
    // Since we can't easily count unique stakers, we'll use an estimate
    // based on the assumption that each bet is at least 0.01 CHZ
    const totalBetsEstimate = Math.max(
      1,
      Math.floor(Number(formatEther(totalPool)) / 0.01)
    );

    // Calculate odds
    const [totalA, totalB, totalDraw] = poolInfo;
    const totalPoolAmount = totalA + totalB + totalDraw;
    const yesOdds =
      totalPoolAmount > BigInt(0)
        ? Number(totalA) / Number(totalPoolAmount)
        : 0.5;
    const noOdds =
      totalPoolAmount > BigInt(0)
        ? Number(totalB) / Number(totalPoolAmount)
        : 0.5;

    // Determine status
    const now = Date.now();
    const deadline = deadlineTimestamp;
    const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

    let status: "open" | "closing-soon" | "closed" | "completed" = "open";
    if (state === 0 && hoursUntilDeadline < 24 && hoursUntilDeadline > 0) {
      status = "closing-soon";
    } else if (state > 0 || hoursUntilDeadline <= 0) {
      if (state === 5) {
        status = "completed";
      } else {
        status = "closed";
      }
    }

    // Build Polymarket URL
    const polymarketUrl =
      metadata.polymarketUrl || `https://polymarket.com/event/${polymarketId}`;

    // Get title with fallback
    let title = metadata.title;
    if (!title || title.trim() === "") {
      if (polymarketId && polymarketId.trim() !== "") {
        title = polymarketId
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      } else {
        title = `Market ${marketAddress.slice(0, 6)}...${marketAddress.slice(
          -4
        )}`;
      }
    }

    return {
      title,
      marketCloseTime: new Date(deadlineTimestamp),
      executionTime: executionWindowTime,
      odds: { yes: yesOdds, no: noOdds },
      totalBets: totalBetsEstimate,
      totalVolume: Number(formatEther(totalPool)),
      status,
      polymarketUrl,
      marketState: state,
      stakingDeadline: Number(stakingDeadline),
    };
  }, [marketData, marketAddress]);

  // Parse community data
  const communityInfo = useMemo(() => {
    if (!communityData || !Array.isArray(communityData)) return null;

    let name: string;
    if (Array.isArray(communityData)) {
      name = communityData[1] as string;
    } else {
      name = (communityData as any).name || "";
    }

    return {
      id: communityId?.toString() || "0",
      name: name || "Unknown Community",
    };
  }, [communityData, communityId]);

  const isExecutionWindow = marketInfo && new Date() < marketInfo.executionTime;
  const isCompleted =
    marketInfo?.status === "completed" || marketInfo?.status === "closed";

  const getStatusBadge = (status?: string) => {
    switch (status) {
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

  if (isLoadingMarket || !marketInfo) {
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
        <div className="mx-auto max-w-5xl">
          {/* Event Header */}
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="outline">
                {communityInfo?.name || "Community"}
              </Badge>
              {getStatusBadge(marketInfo.status)}
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {marketInfo.title}
            </h1>
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
                    targetTime={marketInfo.marketCloseTime}
                    size="lg"
                  />
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium text-muted-foreground">
                    Execution Window Closes
                  </div>
                  <CountdownTimer
                    targetTime={marketInfo.executionTime}
                    size="lg"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Bets
                  </div>
                  <div className="text-2xl font-bold">
                    {marketInfo.totalBets}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Volume
                  </div>
                  <div className="text-2xl font-bold">
                    {marketInfo.totalVolume.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    CHZ
                  </div>
                </div>

                {/*
                <Button variant="outline" asChild>
                  <a
                    href={marketInfo.polymarketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Polymarket
                  </a>
                </Button>
                */}
              </div>
            </div>
          )}

          {/* Betting Interface */}
          {!isCompleted && marketInfo && (
            <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="mb-6 text-2xl font-bold">Place Your Bet</h2>
              <BettingInterface
                eventId={marketAddress}
                currentOdds={marketInfo.odds}
                isExecutionWindow={isExecutionWindow || false}
                {...(marketInfo.marketState !== undefined && {
                  marketState: marketInfo.marketState,
                })}
                {...(marketInfo.stakingDeadline !== undefined && {
                  stakingDeadline: marketInfo.stakingDeadline,
                })}
              />
            </div>
          )}

          {/* User Stake Information */}
          {isConnected && userStakeInfo && userStakeInfo.hasStake && (
            <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="mb-4 text-xl font-bold">Your Bets</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {userStakeInfo.stakeYes > 0 && (
                  <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                    <div className="mb-2 text-sm text-muted-foreground">
                      YES Bet
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {userStakeInfo.stakeYes.toFixed(4)} CHZ
                    </div>
                  </div>
                )}
                {userStakeInfo.stakeNo > 0 && (
                  <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
                    <div className="mb-2 text-sm text-muted-foreground">
                      NO Bet
                    </div>
                    <div className="text-2xl font-bold text-danger">
                      {userStakeInfo.stakeNo.toFixed(4)} CHZ
                    </div>
                  </div>
                )}
              </div>
              {userStakeInfo.totalStake > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Staked
                    </span>
                    <span className="text-lg font-bold">
                      {userStakeInfo.totalStake.toFixed(4)} CHZ
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Claim Rewards Section */}
          {isConnected &&
            userStakeInfo &&
            userStakeInfo.isSettled &&
            !userStakeInfo.hasClaimed && (
              <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
                <div className="mb-4 flex items-start gap-4">
                  {userStakeInfo.canClaim ? (
                    <Trophy className="h-6 w-6 shrink-0 text-success" />
                  ) : (
                    <XCircle className="h-6 w-6 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold">
                      {userStakeInfo.canClaim
                        ? "🎉 You Won! Claim Your Rewards"
                        : "Market Settled - No Rewards Available"}
                    </h3>
                    {userStakeInfo.canClaim ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Congratulations! You bet on the winning outcome and
                          are eligible to claim your rewards.
                        </p>
                        <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                          <div className="mb-1 text-sm text-muted-foreground">
                            Potential Reward
                          </div>
                          <div className="text-2xl font-bold text-success">
                            {userStakeInfo.potentialReward.toFixed(4)} CHZ
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setHasShownClaimSuccess(false);
                            setHasShownClaimError(false);
                            toast.loading("Claiming rewards...", {
                              id: "claim",
                            });
                            claimWrite?.();
                          }}
                          disabled={
                            isClaimPending ||
                            isClaimConfirming ||
                            !canClaimWrite ||
                            !userStakeInfo.canClaim
                          }
                          className="w-full gradient-success hover:opacity-90"
                        >
                          {isClaimPending || isClaimConfirming ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              {isClaimConfirming
                                ? "Confirming..."
                                : "Claiming..."}
                            </>
                          ) : (
                            <>
                              <Trophy className="mr-2 h-5 w-5" />
                              Claim Rewards
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        You did not bet on the winning outcome, or the market
                        has not been settled yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Already Claimed Message */}
          {isConnected && userStakeInfo && userStakeInfo.hasClaimed && (
            <div className="mb-8 rounded-xl border border-success/30 bg-success/5 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
                <div>
                  <h3 className="font-bold text-success">Rewards Claimed</h3>
                  <p className="text-sm text-muted-foreground">
                    You have already claimed your rewards for this market.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Completed State Message */}
          {isCompleted && !userStakeInfo?.hasStake && (
            <div className="mb-8 rounded-xl border border-muted/50 bg-muted/5 p-6">
              <p className="text-center text-muted-foreground">
                This event has been completed. Betting is no longer available.
              </p>
            </div>
          )}

          {/* Chat/Discussion Section */}
          <div className="mb-8">
            <ChatContainer
              eventId={marketAddress}
              communityId={communityInfo?.id || "0"}
            />
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
