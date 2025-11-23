import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";
import { spicyTestnet } from "./chains";

// Re-export chain for convenience
export { spicyTestnet };

// Create wagmi config
export const config = getDefaultConfig({
  appName: "BetTogether",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [spicyTestnet],
  ssr: true, // Enable SSR for Next.js
});

/**
 * Public client for read operations
 * Can be used both client-side and server-side
 */
export const publicClient: PublicClient = createPublicClient({
  chain: spicyTestnet,
  transport: http(spicyTestnet.rpcUrls.default.http[0]),
}) as unknown as PublicClient;

/**
 * Get a public client instance
 * Useful for server-side operations or when you need a standalone client
 */
export function getPublicClient(): PublicClient {
  return publicClient;
}

/**
 * Get a wallet client instance
 * Note: This requires a browser environment with a wallet provider
 * For write operations in React components, use wagmi hooks instead
 *
 * In practice, wagmi hooks handle wallet clients automatically.
 * This function is provided for edge cases where you need direct access.
 */
export function getWalletClient(): WalletClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Note: In most cases, use wagmi hooks (useWriteContract, useWalletClient) instead
  // This is a fallback for programmatic wallet operations
  try {
    return createWalletClient({
      chain: spicyTestnet,
      transport: http(spicyTestnet.rpcUrls.default.http[0]),
    }) as unknown as WalletClient;
  } catch {
    return null;
  }
}
