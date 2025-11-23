"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { createWalletClient, custom, type WalletClient } from "viem";
import { CONTRACT_ADDRESSES } from "@/lib";
import PredictionHubABI from "@/lib/abis/PredictionHub.json";
import { spicyTestnet } from "@/lib";
import type { Abi } from "viem";

// Extend Window interface for ethereum provider
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const RegisterCreatorButton = () => {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const { address, isConnected } = useAccount();

  // Create viem wallet client from browser wallet provider
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) {
      setWalletClient(null);
      return;
    }

    try {
      const client = createWalletClient({
        transport: custom(window.ethereum),
      });
      setWalletClient(client);
    } catch (error) {
      console.error("Failed to create wallet client:", error);
      setWalletClient(null);
    }
  }, []);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleRegister = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!walletClient) {
      toast.error("Wallet client not available");
      return;
    }

    try {
      toast.loading("Registering as creator...", { id: "register-creator" });

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.PredictionHub,
        abi: PredictionHubABI as Abi,
        functionName: "registerCreator",
        args: ["Creator", "ipfs://my-metadata-uri"],
        account: address,
        chain: {
          id: 88882,
          name: "Spicy Testnet",
          nativeCurrency: {
            name: "Chiliz",
            symbol: "CHZ",
            decimals: 18,
          },
          rpcUrls: {
            default: { http: ["https://spicy-rpc.chiliz.com"] },
          },
        } as any,
      } as any);

      setTxHash(hash);
      toast.loading("Waiting for confirmation...", { id: "register-creator" });
    } catch (error: any) {
      console.error("Register creator error:", error);
      const errorMsg = error?.message || "Failed to register as creator";
      toast.error(errorMsg, { id: "register-creator" });

      // Log full error for debugging
      if (errorMsg.includes("RPC") || errorMsg.includes("not available")) {
        console.error("RPC Error Details:", {
          error,
          walletClient: !!walletClient,
          address,
          chain: spicyTestnet.id,
        });
      }
    }
  };

  // Handle success
  if (isConfirmed && txHash) {
    toast.success("Successfully registered as creator!", {
      id: "register-creator",
    });
    setTxHash(undefined);
  }

  // Handle transaction error
  if (txError && txHash) {
    toast.error(txError.message || "Transaction failed", {
      id: "register-creator",
    });
    setTxHash(undefined);
  }

  const isLoading = !!txHash && (isConfirming || !isConfirmed);

  return (
    <Button
      onClick={handleRegister}
      disabled={!isConnected || isLoading}
      className="gradient-primary shadow-glow"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isConfirming ? "Confirming..." : "Registering..."}
        </>
      ) : (
        "Register as Creator"
      )}
    </Button>
  );
};
