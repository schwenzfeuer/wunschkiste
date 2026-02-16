"use client";

import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage } from "@/lib/db/schema";

interface ChatPanelProps {
  wishlistTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  sendMessage: (content: string) => void;
  isSending: boolean;
}

export function ChatPanel({
  wishlistTitle,
  open,
  onOpenChange,
  messages,
  isLoading,
  hasMore,
  isLoadingMore,
  loadMore,
  sendMessage,
  isSending,
}: ChatPanelProps) {
  const t = useTranslations("chat");
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 gap-0 max-sm:w-full max-sm:!max-w-full max-sm:h-full max-sm:inset-0 max-sm:rounded-none" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription className="text-xs truncate">
            {wishlistTitle}
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="flex-1 p-4 space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2 ml-auto" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        ) : (
          <ChatMessageList
            messages={messages}
            currentUserId={session.user.id}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />
        )}
        <ChatInput onSend={sendMessage} isSending={isSending} />
      </SheetContent>
    </Sheet>
  );
}
