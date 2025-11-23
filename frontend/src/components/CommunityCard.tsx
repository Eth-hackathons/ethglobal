import Link from "next/link";
import { Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityCardProps {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  activeEvents: number;
}

export const CommunityCard = ({ id, name, description, memberCount, activeEvents }: CommunityCardProps) => {
  return (
    <Link href={`/communities/${id}`}>
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card transition-smooth hover:border-primary/50 hover:shadow-glow">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-2xl transition-smooth group-hover:bg-primary/20" />

        <div className="relative">
          <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-primary transition-smooth">
            {name}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>

          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{memberCount} members</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              <span>{activeEvents} active</span>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full">
            View Community
          </Button>
        </div>
      </div>
    </Link>
  );
};
