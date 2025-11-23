import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import MarketABI from "@/../../contracts/ABI/Market.json";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketAddress, winningOutcome, payout } = body;

    // Validation
    if (!marketAddress) {
      return NextResponse.json(
        { error: "marketAddress is required" },
        { status: 400 }
      );
    }

    if (winningOutcome === undefined || winningOutcome === null) {
      return NextResponse.json(
        { error: "winningOutcome is required (0=A, 1=B, 2=Draw)" },
        { status: 400 }
      );
    }

    if (![0, 1, 2].includes(winningOutcome)) {
      return NextResponse.json(
        { error: "winningOutcome must be 0 (A), 1 (B), or 2 (Draw)" },
        { status: 400 }
      );
    }

    if (!payout) {
      return NextResponse.json(
        { error: "payout is required (in CHZ, e.g., '1.5' for 1.5 CHZ)" },
        { status: 400 }
      );
    }

    // Parse payout amount
    let payoutWei: bigint;
    try {
      payoutWei = parseEther(payout.toString());
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid payout amount. Must be a valid number." },
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
    const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, "")}` as `0x${string}`);
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

    // Call mockPolymarketReturn (payable function)
    const hash = await walletClient.writeContract({
      address: marketAddress as `0x${string}`,
      abi: MarketABI,
      functionName: "mockPolymarketReturn",
      args: [winningOutcome, payoutWei],
      value: payoutWei, // Send CHZ with the transaction
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
      payout: payout,
    });
  } catch (error: any) {
    console.error("Error submitting results:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to submit results",
        details: error.shortMessage || error.details,
      },
      { status: 500 }
    );
  }
}