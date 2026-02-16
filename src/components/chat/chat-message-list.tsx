"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./chat-message";
import type { ChatMessage as ChatMessageType } from "@/lib/db/schema";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  currentUserId: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function formatDateSeparator(date: Date, t: ReturnType<typeof useTranslations<"chat">>) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return t("today");
  if (isSameDay(date, yesterday)) return t("yesterday");
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

export function ChatMessageList({
  messages,
  currentUserId,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: ChatMessageListProps) {
  const t = useTranslations("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const wasAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (messages.length > prevMessageCountRef.current && wasAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    wasAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
    >
      {hasMore && (
        <div className="flex justify-center py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "..." : t("loadMore")}
          </Button>
        </div>
      )}
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          {t("empty")}
        </div>
      )}
      {messages.map((msg, i) => {
        const msgDate = new Date(msg.createdAt as unknown as string);
        const prevMsg = i > 0 ? messages[i - 1] : null;
        const prevDate = prevMsg ? new Date(prevMsg.createdAt as unknown as string) : null;

        const showDateSeparator = !prevDate || !isSameDay(msgDate, prevDate);
        const showHeader = !prevMsg || prevMsg.userId !== msg.userId || showDateSeparator;

        return (
          <div key={msg.id}>
            {showDateSeparator && (
              <div className="flex items-center gap-3 py-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {formatDateSeparator(msgDate, t)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <ChatMessage
              message={msg}
              isOwn={msg.userId === currentUserId}
              showHeader={showHeader}
            />
          </div>
        );
      })}
    </div>
  );
}
