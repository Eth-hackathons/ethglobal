import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, ThumbsDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface BettingInterfaceProps {
  eventId: string;
  currentOdds: { yes: number; no: number };
  isExecutionWindow: boolean;
}

export const BettingInterface = ({ eventId, currentOdds, isExecutionWindow }: BettingInterfaceProps) => {
  const [amount, setAmount] = useState<string>("");
  const [selectedSide, setSelectedSide] = useState<"yes" | "no" | null>(null);

  const handlePlaceBet = (side: "yes" | "no") => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!isExecutionWindow) {
      toast.error("Betting is closed - execution window has ended");
      return;
    }

    setSelectedSide(side);
    
    // Mock bet placement
    toast.success(`Bet placed: ${side.toUpperCase()} for $${amount}`, {
      description: "Your bet will be aggregated and executed before market close",
    });
    
    setAmount("");
    setSelectedSide(null);
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-success">YES</span>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-success">{(currentOdds.yes * 100).toFixed(1)}%</div>
          <div className="mt-1 text-xs text-muted-foreground">Current odds</div>
        </div>

        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-danger">NO</span>
            <TrendingUp className="h-4 w-4 rotate-180 text-danger" />
          </div>
          <div className="text-2xl font-bold text-danger">{(currentOdds.no * 100).toFixed(1)}%</div>
          <div className="mt-1 text-xs text-muted-foreground">Current odds</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Bet Amount ($)</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!isExecutionWindow}
            className="text-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handlePlaceBet("yes")}
            disabled={!isExecutionWindow}
            className="h-12 gradient-success hover:opacity-90 transition-smooth shadow-lg"
          >
            <ThumbsUp className="mr-2 h-5 w-5" />
            Bet YES
          </Button>
          <Button
            onClick={() => handlePlaceBet("no")}
            disabled={!isExecutionWindow}
            className="h-12 gradient-danger hover:opacity-90 transition-smooth shadow-lg"
          >
            <ThumbsDown className="mr-2 h-5 w-5" />
            Bet NO
          </Button>
        </div>

        {!isExecutionWindow && (
          <p className="text-center text-sm text-muted-foreground">
            Betting closed - execution window has ended
          </p>
        )}
      </div>
    </div>
  );
};
