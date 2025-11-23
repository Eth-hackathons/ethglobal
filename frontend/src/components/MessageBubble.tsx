import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: {
    id: string;
    userId: string;
    content: string;
    timestamp: Date;
  };
  isOwnMessage: boolean;
  isNew?: boolean;
}

export const MessageBubble = ({ message, isOwnMessage, isNew }: MessageBubbleProps) => {
  const truncateAddress = (address: string) => {
    if (address.length < 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getAvatarFromAddress = (address: string) => {
    return address.slice(2, 4).toUpperCase();
  };

  const formatTimestamp = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return new Date(date).toLocaleTimeString();
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isOwnMessage ? "flex-row-reverse" : "flex-row",
        isNew && "bg-primary/5 -mx-4 px-4 py-2 rounded-lg"
      )}
    >
      <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
        {getAvatarFromAddress(message.userId)}
      </div>
      <div className={cn("flex flex-col gap-1 max-w-[70%]", isOwnMessage && "items-end")}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{truncateAddress(message.userId)}</span>
          <span>•</span>
          <span>{formatTimestamp(message.timestamp)}</span>
        </div>
        <div
          className={cn(
            "rounded-2xl px-4 py-2 break-words",
            isOwnMessage
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  );
};
