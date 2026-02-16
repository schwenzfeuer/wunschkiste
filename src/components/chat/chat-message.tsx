"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/db/schema";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
  showHeader: boolean;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessage({ message, isOwn, showHeader }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
      {showHeader ? (
        <Avatar size="sm" className="mt-0.5 shrink-0">
          {message.userImage && <AvatarImage src={message.userImage} alt={message.userName} />}
          <AvatarFallback>{message.userName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-6 shrink-0" />
      )}
      <div className={cn("flex flex-col max-w-[75%]", isOwn && "items-end")}>
        {showHeader && (
          <span className="text-xs text-muted-foreground mb-0.5 px-1">{message.userName}</span>
        )}
        <div
          className={cn(
            "rounded-2xl px-3 py-1.5 text-sm break-words whitespace-pre-wrap",
            isOwn
              ? "bg-accent text-accent-foreground rounded-tr-sm"
              : "bg-muted rounded-tl-sm"
          )}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
          {formatTime(message.createdAt as unknown as string)}
        </span>
      </div>
    </div>
  );
}
