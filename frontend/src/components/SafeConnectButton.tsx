"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function SafeConnectButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to ensure this runs after initial render
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  // Always render ConnectButton - it will handle its own loading state
  // The mounted check ensures it only renders on client side to avoid hydration issues
  if (!mounted) {
    return <div className="h-10 w-[140px] rounded-md bg-muted animate-pulse" />;
  }

  return <ConnectButton />;
}
