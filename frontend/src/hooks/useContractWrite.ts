"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useCanWrite } from "./useWriteClient";
import type { Address, Abi } from "viem";

/**
 * Hook for writing to a contract
 *
 * @example
 * const { write, isLoading, error, canWrite } = useContractWrite({
 *   address: CONTRACT_ADDRESSES.PredictionHub,
 *   abi: PredictionHubABI,
 *   functionName: "createCommunity",
 * });
 *
 * // Call write with args
 * write({
 *   args: ["My Community", "Description", "ipfs://..."],
 * });
 */
export function useContractWrite<
  TAbi extends Abi,
  TFunctionName extends string
>({
  address,
  abi,
  functionName,
  args,
  value,
  query,
}: {
  address: Address;
  abi: TAbi;
  functionName: TFunctionName;
  args?: readonly unknown[];
  value?: bigint;
  query?: {
    enabled?: boolean;
  };
}) {
  const canWrite = useCanWrite();

  const {
    data: hash,
    writeContract,
    isPending,
    error,
    reset,
  } = useWriteContract({
    mutation: {
      onError: (error) => {
        console.error("Contract write error:", error);
      },
    },
  });

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    write: canWrite
      ? (params?: { args?: readonly unknown[]; value?: bigint }) => {
          writeContract({
            address,
            abi,
            functionName,
            args: params?.args || args,
            value: params?.value || value,
          } as any);
        }
      : undefined,
    hash,
    receipt,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading: isPending || isConfirming,
    error,
    reset,
    canWrite,
  };
}
