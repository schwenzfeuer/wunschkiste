"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatFabProps {
  unreadCount?: number;
  onClick: () => void;
  className?: string;
}

export function ChatFab({ unreadCount = 0, onClick, className }: ChatFabProps) {
  return (
    <div className={cn("fixed bottom-6 right-6 z-40 hidden sm:flex", className)}>
      <Button
        variant="accent"
        size="icon-lg"
        onClick={onClick}
        aria-label="Chat"
        className="relative"
      >
        <MessageCircle className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center size-5 rounded-full bg-destructive text-white text-[10px] font-bold border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}
