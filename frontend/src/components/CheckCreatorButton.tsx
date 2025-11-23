"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAccount, usePublicClient } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/lib";
import PredictionHubABI from "@/lib/abis/PredictionHub.json";
import { spicyTestnet } from "@/lib";
import type { Abi } from "viem";

export const CheckCreatorButton = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isCreator, setIsCreator] = useState<boolean | null>(null);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const handleCheck = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!publicClient) {
      toast.error("Public client not available");
      return;
    }

    try {
      setIsChecking(true);
      setIsCreator(null);
      toast.loading("Checking creator status...", { id: "check-creator" });

      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.PredictionHub,
        abi: PredictionHubABI as Abi,
        functionName: "isCreator",
        args: [address],
        chain: spicyTestnet,
      } as any);

      setIsCreator(result as boolean);

      if (result) {
        toast.success("You are a registered creator!", {
          id: "check-creator",
        });
      } else {
        toast.info("You are not registered as a creator yet.", {
          id: "check-creator",
        });
      }
    } catch (error: any) {
      console.error("Check creator error:", error);
      const errorMsg = error?.message || "Failed to check creator status";
      toast.error(errorMsg, { id: "check-creator" });
      setIsCreator(null);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleCheck}
        disabled={!isConnected || isChecking}
        variant="outline"
      >
        {isChecking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking...
          </>
        ) : (
          "Check Creator Status"
        )}
      </Button>
      {isCreator !== null && (
        <div className="flex items-center gap-1 text-sm">
          {isCreator ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">Creator</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Not Creator</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

