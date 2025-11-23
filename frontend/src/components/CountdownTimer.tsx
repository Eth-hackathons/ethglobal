import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetTime: Date;
  variant?: "default" | "urgent" | "warning";
  size?: "sm" | "md" | "lg";
}

export const CountdownTimer = ({ targetTime, variant = "default", size = "md" }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [urgency, setUrgency] = useState<"safe" | "warning" | "urgent">("safe");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft("Closed");
        setUrgency("urgent");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Determine urgency based on time left
      if (hours < 1) {
        setUrgency("urgent");
      } else if (hours < 3) {
        setUrgency("warning");
      } else {
        setUrgency("safe");
      }

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const getColorClasses = () => {
    if (variant !== "default") return variant;
    
    switch (urgency) {
      case "urgent":
        return "text-danger border-danger/30 bg-danger/10";
      case "warning":
        return "text-warning border-warning/30 bg-warning/10";
      default:
        return "text-primary border-primary/30 bg-primary/10";
    }
  };

  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-1.5",
    lg: "text-2xl px-6 py-3",
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border font-mono font-bold transition-smooth ${getColorClasses()} ${sizeClasses[size]}`}>
      <Clock className={size === "lg" ? "h-6 w-6" : size === "md" ? "h-4 w-4" : "h-3 w-3"} />
      <span>{timeLeft}</span>
    </div>
  );
};
