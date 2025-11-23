# Wagmi Clients Usage Guide

Simple guide for using wagmi clients to read from and write to contracts.

## Reading from Contracts

```tsx
import { useContractRead } from "@/hooks";
import { CONTRACT_ADDRESSES } from "@/lib";
import PredictionHubABI from "@/lib/abis/PredictionHub.json";

function CommunityCount() {
  const { data, isLoading, error } = useContractRead({
    address: CONTRACT_ADDRESSES.PredictionHub,
    abi: PredictionHubABI,
    functionName: "communityCount",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Total Communities: {data?.toString()}</div>;
}
```

## Writing to Contracts

```tsx
import { useContractWrite } from "@/hooks";
import { CONTRACT_ADDRESSES } from "@/lib";
import PredictionHubABI from "@/lib/abis/PredictionHub.json";

function CreateCommunity() {
  const { write, isLoading, error, canWrite } = useContractWrite({
    address: CONTRACT_ADDRESSES.PredictionHub,
    abi: PredictionHubABI,
    functionName: "createCommunity",
  });

  const handleCreate = () => {
    write?.({
      args: ["My Community", "Description", "ipfs://..."],
    });
  };

  if (!canWrite) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      {isLoading ? "Creating..." : "Create Community"}
    </button>
  );
}
```

## Server-Side Usage

For API routes or server components:

```tsx
import { getReadClient } from "@/lib/clients";
import { CONTRACT_ADDRESSES } from "@/lib";
import PredictionHubABI from "@/lib/abis/PredictionHub.json";

export async function GET() {
  const client = getReadClient();

  const communityCount = await client.readContract({
    address: CONTRACT_ADDRESSES.PredictionHub,
    abi: PredictionHubABI,
    functionName: "communityCount",
  });

  return Response.json({ count: communityCount.toString() });
}
```

## Contract Addresses

```tsx
import { CONTRACT_ADDRESSES } from "@/lib";

// Available:
// - CONTRACT_ADDRESSES.NetworkConfig
// - CONTRACT_ADDRESSES.MockPolymarket
// - CONTRACT_ADDRESSES.PredictionHub
```
