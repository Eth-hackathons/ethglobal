import { defineChain } from "viem";

/**
 * Spicy Testnet chain configuration
 */
export const spicyTestnet = defineChain({
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
      webSocket: ["wss://spicy-rpc-ws.chiliz.com"],
    },
    public: {
      http: ["https://spicy-rpc.chiliz.com"],
      webSocket: ["wss://spicy-rpc-ws.chiliz.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Chiliscan",
      url: "https://testnet.chiliscan.com",
    },
  },
  testnet: true,
});

