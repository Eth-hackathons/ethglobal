"use client";

import { useAccount, useWalletClient } from "wagmi";
import type { WalletClient } from "viem";

/**
 * Hook to get a write client for blockchain operations
 * Returns the wagmi wallet client when a wallet is connected
 * 
 * @returns WalletClient instance for write operations, or null if not connected
 */
export function useWriteClient(): WalletClient | null {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  if (!isConnected || !walletClient) {
    return null;
  }
  
  return walletClient;
}

/**
 * Hook to check if write operations are available
 * 
 * @returns boolean indicating if a wallet is connected and ready for writes
 */
export function useCanWrite(): boolean {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  return isConnected && !!walletClient;
}

