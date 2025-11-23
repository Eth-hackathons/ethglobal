/**
 * Reusable blockchain clients for read and write operations
 * 
 * This module provides utilities for interacting with the blockchain
 * both in client-side React components and server-side code.
 */

import { publicClient, getPublicClient, getWalletClient } from "./wagmi";
import type { PublicClient, WalletClient } from "viem";

/**
 * Get a public client for read operations
 * Works in both client and server environments
 * 
 * @returns PublicClient instance
 */
export function getReadClient(): PublicClient {
  return getPublicClient();
}

/**
 * Get a wallet client for write operations
 * Only works in browser environments with a connected wallet
 * 
 * @returns WalletClient instance or null
 */
export function getWriteClient(): WalletClient | null {
  return getWalletClient();
}

/**
 * Default public client export for convenience
 * Use this for read operations when you don't need React hooks
 */
export { publicClient };

/**
 * Type exports for convenience
 */
export type { PublicClient, WalletClient };

