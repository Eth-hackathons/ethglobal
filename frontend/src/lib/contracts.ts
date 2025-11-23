/**
 * Contract addresses for deployed contracts on Spicy Testnet (Chain ID: 88882)
 * These addresses are from the latest deployment
 */
export const CONTRACT_ADDRESSES = {
  NetworkConfig: "0xf6fcdf4eac93bf2f18ebac546981814ddc7b8f45" as const,
  MockPolymarket: "0xb2b8a0e5bf1e3333a797e611ec4f3b1d520ce433" as const,
  PredictionHub: "0xab402727bbad3bb067e439c3d3fc3c48806422d8" as const,
} as const;

/**
 * Contract address type for type safety
 */
export type ContractAddress = typeof CONTRACT_ADDRESSES[keyof typeof CONTRACT_ADDRESSES];

