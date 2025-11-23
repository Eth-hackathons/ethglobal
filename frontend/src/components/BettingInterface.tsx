"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, ThumbsDown, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useContractWrite, useContractRead } from "@/hooks";
import MarketABI from "@/lib/abis/Market.json";
import { parseEther } from "viem";
import type { Abi, Address } from "viem";

interface BettingInterfaceProps {
  eventId: string; // Market address
  currentOdds?: { yes: number; no: number }; // Optional fallback
  isExecutionWindow: boolean;
  marketState?: number; // MarketState enum: 0=Open, 1=Locked, etc.
  stakingDeadline?: number; // Unix timestamp in seconds
}

export const BettingInterface = ({
  eventId,
  currentOdds,
  isExecutionWindow,
  marketState = 0,
  stakingDeadline,
}: BettingInterfaceProps) => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<string>("");
  const [selectedSide, setSelectedSide] = useState<"yes" | "no" | null>(null);
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);

  // Fetch pool info from contract to calculate odds
  const { data: poolInfo, refetch: refetchPoolInfo } = useContractRead({
    address: eventId as Address,
    abi: MarketABI as Abi,
    functionName: "getPoolInfo",
    query: {
      enabled: !!eventId,
      refetchInterval: 5000, // Refetch every 5 seconds to update odds
    },
  });

  // Calculate odds from pool info
  const calculatedOdds = (() => {
    if (!poolInfo || !Array.isArray(poolInfo)) {
      // Fallback to provided odds or 50/50
      return currentOdds || { yes: 0.5, no: 0.5 };
    }

    const [totalA, totalB, totalDraw] = poolInfo as [bigint, bigint, bigint];
    const totalPool = totalA + totalB + totalDraw;

    if (totalPool === BigInt(0)) {
      // No stakes yet, default to 50/50
      return { yes: 0.5, no: 0.5 };
    }

    const yesOdds = Number(totalA) / Number(totalPool);
    const noOdds = Number(totalB) / Number(totalPool);

    return {
      yes: yesOdds,
      no: noOdds,
    };
  })();

  // Use calculated odds
  const odds = calculatedOdds;

  // Contract write hook for staking
  const {
    write,
    hash: txHash,
    isLoading: isPending,
    error: writeError,
    canWrite,
    reset,
  } = useContractWrite({
    address: eventId as Address,
    abi: MarketABI as Abi,
    functionName: "stake",
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Check if betting is allowed
  const isBettingAllowed = () => {
    if (!isConnected) {
      return { allowed: false, reason: "Please connect your wallet" };
    }
    if (marketState !== 0) {
      return { allowed: false, reason: "Market is not open for betting" };
    }
    if (stakingDeadline && Date.now() / 1000 >= stakingDeadline) {
      return { allowed: false, reason: "Staking deadline has passed" };
    }
    if (!isExecutionWindow) {
      return { allowed: false, reason: "Execution window has ended" };
    }
    return { allowed: true };
  };

  const handlePlaceBet = async (side: "yes" | "no") => {
    const validation = isBettingAllowed();
    if (!validation.allowed) {
      toast.error(validation.reason || "Betting is not allowed");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!canWrite) {
      toast.error("Wallet client not available");
      return;
    }

    setSelectedSide(side);
    setHasShownSuccess(false);
    setHasShownError(false);

    try {
      // Convert amount to wei (native token)
      const amountWei = parseEther(amount);

      // Map side to Outcome enum: A=0 (Yes), B=1 (No)
      const outcome = side === "yes" ? 0 : 1;

      toast.loading(`Placing bet: ${side.toUpperCase()} for ${amount} CHZ...`, {
        id: "place-bet",
      });

      // Call stake function with value
      write?.({
        args: [outcome],
        value: amountWei,
      });
    } catch (error: any) {
      console.error("Place bet error:", error);
      const errorMsg = error?.message || "Failed to place bet";
      toast.error(errorMsg, { id: "place-bet" });
      setHasShownError(true);
      setSelectedSide(null);
    }
  };

  // Handle success
  useEffect(() => {
    if (isConfirmed && txHash && !hasShownSuccess) {
      setHasShownSuccess(true);
      toast.success("Bet placed successfully!", {
        id: "place-bet",
      });
      setAmount("");
      setSelectedSide(null);
      reset();
      // Refetch pool info to update odds after bet
      refetchPoolInfo();
    }
  }, [isConfirmed, txHash, hasShownSuccess, reset, refetchPoolInfo]);

  // Handle transaction error
  useEffect(() => {
    if (txError && txHash && !hasShownError) {
      setHasShownError(true);
      toast.error(txError.message || "Transaction failed", {
        id: "place-bet",
      });
      setSelectedSide(null);
      reset();
    }
  }, [txError, txHash, hasShownError, reset]);

  // Handle write error
  useEffect(() => {
    if (writeError && !txHash && !hasShownError) {
      setHasShownError(true);
      const errorMsg = writeError.message || "Failed to place bet";

      // Provide user-friendly error messages
      if (errorMsg.includes("community member")) {
        toast.error("You must be a community member to place bets", {
          id: "place-bet",
        });
      } else if (errorMsg.includes("staking period ended")) {
        toast.error("Staking deadline has passed", {
          id: "place-bet",
        });
      } else if (errorMsg.includes("must stake non-zero")) {
        toast.error("Bet amount must be greater than zero", {
          id: "place-bet",
        });
      } else {
        toast.error(errorMsg, { id: "place-bet" });
      }
      setSelectedSide(null);
      reset();
    }
  }, [writeError, txHash, hasShownError, reset]);

  const isLoading = isPending || (!!txHash && (isConfirming || !isConfirmed));
  const bettingAllowed = isBettingAllowed();

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-success">YES</span>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-success">
            {(odds.yes * 100).toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Current odds</div>
        </div>

        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-danger">NO</span>
            <TrendingUp className="h-4 w-4 rotate-180 text-danger" />
          </div>
          <div className="text-2xl font-bold text-danger">
            {(odds.no * 100).toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Current odds</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Bet Amount (CHZ)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter amount in CHZ"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading || !bettingAllowed.allowed}
            className="text-lg"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum: 0.01 CHZ
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handlePlaceBet("yes")}
            disabled={
              isLoading ||
              !bettingAllowed.allowed ||
              !amount ||
              parseFloat(amount) <= 0 ||
              selectedSide === "yes"
            }
            className="h-12 gradient-success hover:opacity-90 transition-smooth shadow-lg"
          >
            {isLoading && selectedSide === "yes" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isConfirming ? "Confirming..." : "Placing bet..."}
              </>
            ) : (
              <>
                <ThumbsUp className="mr-2 h-5 w-5" />
                Bet YES
              </>
            )}
          </Button>
          <Button
            onClick={() => handlePlaceBet("no")}
            disabled={
              isLoading ||
              !bettingAllowed.allowed ||
              !amount ||
              parseFloat(amount) <= 0 ||
              selectedSide === "no"
            }
            className="h-12 gradient-danger hover:opacity-90 transition-smooth shadow-lg"
          >
            {isLoading && selectedSide === "no" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isConfirming ? "Confirming..." : "Placing bet..."}
              </>
            ) : (
              <>
                <ThumbsDown className="mr-2 h-5 w-5" />
                Bet NO
              </>
            )}
          </Button>
        </div>

        {!bettingAllowed.allowed && (
          <p className="text-center text-sm text-muted-foreground">
            {bettingAllowed.reason || "Betting is currently unavailable"}
          </p>
        )}

        {!isConnected && (
          <p className="text-center text-sm text-warning">
            Please connect your wallet to place bets
          </p>
        )}
      </div>
    </div>
  );
};
