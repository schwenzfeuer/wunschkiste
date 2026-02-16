"use client";

import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth/client";
import { useChat } from "@/hooks/use-chat";
import { useWishlistSync } from "@/hooks/use-wishlist-sync";
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

interface ChatPanelProps {
  wishlistId: string;
  wishlistTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatPanel({ wishlistId, wishlistTitle, open, onOpenChange }: ChatPanelProps) {
  const t = useTranslations("chat");
  const { data: session } = useSession();
  const {
    messages,
    sendMessage,
    isSending,
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
    onChatMessage,
  } = useChat(wishlistId, open);

  useWishlistSync(open ? wishlistId : undefined, [], onChatMessage);

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
        <ChatInput onSend={(content) => sendMessage(content)} isSending={isSending} />
      </SheetContent>
    </Sheet>
  );
}
