"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BetCardProps {
  id: string;
  eventId: string;
  eventTitle: string;
  communityName: string;
  side: "yes" | "no";
  amount: number;
  status: "pending" | "executed" | "won" | "lost" | "completed";
  odds: number;
  executionTime?: Date;
  payout?: number;
  isCompleted?: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30">
          Pending
        </Badge>
      );
    case "executed":
      return (
        <Badge className="bg-success/20 text-success border-success/30">
          Executed
        </Badge>
      );
    case "won":
      return (
        <Badge className="bg-success/20 text-success border-success/30">
          Won
        </Badge>
      );
    case "lost":
      return <Badge className="bg-muted text-muted-foreground">Lost</Badge>;
    case "completed":
      return (
        <Badge className="bg-muted text-muted-foreground">Completed</Badge>
      );
    default:
      return null;
  }
};

export const BetCard = ({
  id,
  eventId,
  eventTitle,
  communityName,
  side,
  amount,
  status,
  odds,
  executionTime,
  payout,
  isCompleted,
}: BetCardProps) => {
  // Automatically detect if bet is completed based on status
  const betIsCompleted =
    isCompleted !== undefined
      ? isCompleted
      : status === "completed" || status === "won" || status === "lost";

  return (
    <Link href={`/events/${eventId}`} className="block group">
      <div
        className={cn(
          "rounded-xl border bg-card p-6 shadow-card transition-smooth",
          betIsCompleted
            ? "border-muted/50 opacity-75 hover:opacity-100 hover:border-muted"
            : "border-border hover:border-primary/50 hover:shadow-glow"
        )}
      >
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h3
              className={cn(
                "mb-2 text-lg font-bold transition-smooth",
                betIsCompleted
                  ? "text-muted-foreground group-hover:text-foreground"
                  : "group-hover:text-primary"
              )}
            >
              {eventTitle}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{communityName}</span>
              <span>•</span>
              <span>${amount}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={
                side === "yes"
                  ? "bg-success/20 text-success border-success/30"
                  : "bg-danger/20 text-danger border-danger/30"
              }
            >
              {side.toUpperCase()}
            </Badge>
            {getStatusBadge(status)}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {betIsCompleted ? (
            <div className="flex items-center gap-2">
              {status === "won" ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : status === "lost" ? (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "text-sm",
                  status === "won"
                    ? "text-success font-medium"
                    : status === "completed"
                    ? "text-muted-foreground"
                    : "text-muted-foreground"
                )}
              >
                {status === "won"
                  ? `Won $${payout?.toFixed(2)}`
                  : status === "lost"
                  ? "Lost"
                  : "Completed"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Execution in:
              </span>
              {executionTime && (
                <CountdownTimer targetTime={executionTime} size="sm" />
              )}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Odds: {(odds * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
