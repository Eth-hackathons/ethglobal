import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// Define Spicy Testnet chain
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

// Create wagmi config
export const config = getDefaultConfig({
  appName: "BetTogether",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [spicyTestnet],
  ssr: true, // Enable SSR for Next.js
});
