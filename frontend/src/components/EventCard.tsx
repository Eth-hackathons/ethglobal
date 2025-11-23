import Link from "next/link";
import { CountdownTimer } from "./CountdownTimer";
import { TrendingUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  marketCloseTime: Date;
  odds: { yes: number; no: number };
  status: "open" | "closing-soon" | "closed";
  polymarketUrl: string;
}

export const EventCard = ({ id, title, description, marketCloseTime, odds, status, polymarketUrl }: EventCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "open":
        return <Badge className="bg-success/20 text-success border-success/30">Open</Badge>;
      case "closing-soon":
        return <Badge className="bg-warning/20 text-warning border-warning/30">Closing Soon</Badge>;
      case "closed":
        return <Badge className="bg-muted text-muted-foreground">Closed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Link href={`/events/${id}`}>
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-smooth hover:border-primary/50 hover:shadow-glow">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-bold text-foreground group-hover:text-primary transition-smooth line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="mb-3 flex items-center gap-3">
          <div className="flex-1 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
            <div className="text-xs text-success">YES</div>
            <div className="text-lg font-bold text-success">{(odds.yes * 100).toFixed(0)}%</div>
          </div>
          <div className="flex-1 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2">
            <div className="text-xs text-danger">NO</div>
            <div className="text-lg font-bold text-danger">{(odds.no * 100).toFixed(0)}%</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <CountdownTimer targetTime={marketCloseTime} size="sm" />
          <a
            href={polymarketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary-glow transition-smooth"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            Polymarket
          </a>
        </div>
      </div>
    </Link>
  );
};
