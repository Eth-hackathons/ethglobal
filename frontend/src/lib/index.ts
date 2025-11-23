/**
 * Reusable blockchain clients and utilities
 * 
 * This module exports all the clients, contracts, and utilities needed
 * for blockchain interactions.
 */

// Clients
export { publicClient, getPublicClient, getWalletClient, config } from "./wagmi";
export { getReadClient, getWriteClient } from "./clients";
export type { PublicClient, WalletClient } from "./clients";

// Contracts
export { CONTRACT_ADDRESSES } from "./contracts";
export type { ContractAddress } from "./contracts";

// Chains
export { spicyTestnet } from "./chains";

