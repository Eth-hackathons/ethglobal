import { useState, useEffect, useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

interface ChatContainerProps {
  eventId: string;
  communityId: string;
  currentUserId?: string;
}

export const ChatContainer = ({
  eventId,
  communityId,
  currentUserId = "0x1234567890abcdef",
}: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const MAX_MESSAGE_LENGTH = 500;
  const characterCount = newMessage.length;
  const isNearLimit = characterCount > MAX_MESSAGE_LENGTH - 50;

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(
        `/api/comments?eventId=${encodeURIComponent(
          eventId
        )}&communityId=${encodeURIComponent(communityId)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load messages");
      setIsLoading(false);
    }
  }, [eventId, communityId]);

  // Polling for real-time updates
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [eventId, fetchMessages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending || characterCount > MAX_MESSAGE_LENGTH)
      return;

    setIsSending(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          communityId,
          userId: currentUserId,
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");

      toast({
        title: "Message sent",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Failed to send message",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Discussion</h3>
          <span className="text-sm text-muted-foreground">
            ({messages.length} {messages.length === 1 ? "message" : "messages"})
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchMessages}>
                Retry
              </Button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to start the discussion!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.userId === currentUserId}
            />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              maxLength={MAX_MESSAGE_LENGTH}
              className="resize-none"
            />
            {isNearLimit && (
              <p
                className={cn(
                  "text-xs mt-1",
                  characterCount > MAX_MESSAGE_LENGTH
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {characterCount}/{MAX_MESSAGE_LENGTH}
              </p>
            )}
          </div>
          <Button
            onClick={handleSend}
            disabled={
              !newMessage.trim() ||
              isSending ||
              characterCount > MAX_MESSAGE_LENGTH
            }
            size="icon"
          >
            {isSending ? (
              <span className="text-xs">...</span>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
