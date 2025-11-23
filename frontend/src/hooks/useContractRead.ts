"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { useReadClient } from "./useReadClient";
import type { Address, Abi } from "viem";

/**
 * Generic hook for reading from a contract
 * Wraps wagmi's useReadContract with our client setup
 * 
 * @example
 * const { data, isLoading, error } = useContractRead({
 *   address: CONTRACT_ADDRESSES.PredictionHub,
 *   abi: PredictionHubABI,
 *   functionName: "communityCount",
 * });
 */
export function useContractRead<TAbi extends Abi, TFunctionName extends string>({
  address,
  abi,
  functionName,
  args,
  query,
}: {
  address: Address;
  abi: TAbi;
  functionName: TFunctionName;
  args?: readonly unknown[];
  query?: {
    enabled?: boolean;
    refetchInterval?: number;
  };
}) {
  return useReadContract({
    address,
    abi,
    functionName,
    args: args as any,
    query: query as any,
  } as any);
}

/**
 * Hook for reading multiple contract calls in parallel
 * 
 * @example
 * const { data, isLoading } = useContractReads({
 *   contracts: [
 *     {
 *       address: CONTRACT_ADDRESSES.PredictionHub,
 *       abi: PredictionHubABI,
 *       functionName: "communityCount",
 *     },
 *     {
 *       address: CONTRACT_ADDRESSES.PredictionHub,
 *       abi: PredictionHubABI,
 *       functionName: "allMarkets",
 *       args: [0],
 *     },
 *   ],
 * });
 */
export function useContractReads({
  contracts,
  query,
}: {
  contracts: Array<{
    address: Address;
    abi: Abi;
    functionName: string;
    args?: readonly unknown[];
  }>;
  query?: {
    enabled?: boolean;
    refetchInterval?: number;
  };
}) {
  return useReadContracts({
    contracts: contracts as any,
    query: query as any,
  } as any);
}

// Note: For direct reads outside React components, use getReadClient from @/lib/clients
// Example:
// import { getReadClient } from "@/lib/clients";
// const client = getReadClient();
// const data = await client.readContract({ ... });

