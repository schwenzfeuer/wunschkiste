"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import type { ChatMessage } from "@/lib/db/schema";

interface ChatResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

export function useChat(wishlistId: string, enabled = true) {
  const queryClient = useQueryClient();
  const queryKey = ["chat", wishlistId];

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ChatResponse>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const url = new URL(`/api/wishlists/${wishlistId}/chat`, window.location.origin);
      if (pageParam) {
        url.searchParams.set("before", pageParam as string);
      }
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to load messages");
      return response.json();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.messages.length === 0) return undefined;
      return lastPage.messages[0].createdAt;
    },
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
    }),
    enabled,
  });

  const messages = data?.pages
    ? data.pages.flatMap((page) => page.messages)
    : [];

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/wishlists/${wishlistId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json() as Promise<ChatMessage>;
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<typeof data>(queryKey, (old) => {
        if (!old) return old;
        const allMessages = old.pages.flatMap((p) => p.messages);
        if (allMessages.some((m) => m.id === newMessage.id)) return old;
        const lastPageIndex = old.pages.length - 1;
        const newPages = old.pages.map((page, i) => {
          if (i === lastPageIndex) {
            return {
              ...page,
              messages: [...page.messages, newMessage],
            };
          }
          return page;
        });
        return { ...old, pages: newPages };
      });
    },
  });

  const onChatMessage = useCallback(
    (incomingMessage: Record<string, unknown>) => {
      const msg = incomingMessage as unknown as ChatMessage;
      queryClient.setQueryData<typeof data>(queryKey, (old) => {
        if (!old) return old;
        const allMessages = old.pages.flatMap((p) => p.messages);
        if (allMessages.some((m) => m.id === msg.id)) return old;
        const lastPageIndex = old.pages.length - 1;
        const newPages = old.pages.map((page, i) => {
          if (i === lastPageIndex) {
            return {
              ...page,
              messages: [...page.messages, msg],
            };
          }
          return page;
        });
        return { ...old, pages: newPages };
      });
    },
    [queryClient, queryKey]
  );

  const markAsRead = useCallback(() => {
    fetch(`/api/wishlists/${wishlistId}/chat/read`, { method: "PATCH" }).catch(() => {});
  }, [wishlistId]);

  useEffect(() => {
    if (enabled) markAsRead();
  }, [enabled, markAsRead]);

  const lastMessageCount = useRef(messages.length);
  useEffect(() => {
    if (enabled && messages.length > lastMessageCount.current) {
      markAsRead();
    }
    lastMessageCount.current = messages.length;
  }, [messages.length, markAsRead, enabled]);

  return {
    messages,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    isLoading,
    hasMore: hasNextPage ?? false,
    loadMore: fetchNextPage,
    isLoadingMore: isFetchingNextPage,
    onChatMessage,
  };
}
