import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import MarketABI from "@/lib/abis/Market.json";

// Define Spicy Testnet chain
const spicyTestnet = defineChain({
  id: 88882,
  name: "Spicy Testnet",
  network: "spicy-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Chiliz",
    symbol: "CHZ",
  },
  rpcUrls: {
    default: {
      http: ["https://spicy-rpc.chiliz.com"],
    },
  },
});

// Outcome enum values
const Outcome = {
  A: 0,
  B: 1,
  Draw: 2,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketAddress, outcome } = body;

    // Validation
    if (!marketAddress) {
      return NextResponse.json(
        { error: "marketAddress is required" },
        { status: 400 }
      );
    }

    if (outcome === undefined || outcome === null) {
      return NextResponse.json(
        { error: "outcome is required (0=A, 1=B, 2=Draw)" },
        { status: 400 }
      );
    }

    if (![0, 1, 2].includes(outcome)) {
      return NextResponse.json(
        { error: "outcome must be 0 (A), 1 (B), or 2 (Draw)" },
        { status: 400 }
      );
    }

    // Get private key from environment
    const privateKey = process.env.CREATOR_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "CREATOR_PRIVATE_KEY not configured" },
        { status: 500 }
      );
    }

    // Create wallet client
    const account = privateKeyToAccount(
      `0x${privateKey.replace(/^0x/, "")}` as `0x${string}`
    );
    const walletClient = createWalletClient({
      account,
      chain: spicyTestnet,
      transport: http(),
    });

    // Create public client for reading receipts
    const publicClient = createPublicClient({
      chain: spicyTestnet,
      transport: http(),
    });

    // Call triggerExecution
    const hash = await walletClient.writeContract({
      address: marketAddress as `0x${string}`,
      abi: MarketABI,
      functionName: "triggerExecution",
      args: [outcome],
      account,
      chain: spicyTestnet,
    });

    // Wait for transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      success: true,
      txHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      status: receipt.status,
    });
  } catch (error: any) {
    console.error("Error locking market:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to lock market",
        details: error.shortMessage || error.details,
      },
      { status: 500 }
    );
  }
}
