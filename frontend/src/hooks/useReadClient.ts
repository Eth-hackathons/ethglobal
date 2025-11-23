"use client";

import { usePublicClient } from "wagmi";
import { publicClient } from "@/lib/wagmi";
import type { PublicClient } from "viem";

/**
 * Hook to get a read client for blockchain operations
 * Returns the wagmi public client if available, otherwise falls back to the default public client
 * 
 * @returns PublicClient instance for read operations
 */
export function useReadClient(): PublicClient {
  const wagmiClient = usePublicClient();
  
  // Use wagmi client if available (when connected), otherwise use default public client
  return wagmiClient || publicClient;
}

