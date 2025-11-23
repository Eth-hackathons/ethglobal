import Link from "next/link";
import { SafeConnectButton } from "@/components/SafeConnectButton";
import { TrendingUp } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-smooth hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            BetTogether
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/communities"
            className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
          >
            Communities
          </Link>
          <Link
            href="/rankings"
            className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
          >
            Rankings
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <SafeConnectButton />
        </div>
      </div>
    </header>
  );
};
