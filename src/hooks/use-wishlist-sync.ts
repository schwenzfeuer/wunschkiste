"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const REALTIME_URL =
  process.env.NODE_ENV === "production"
    ? "wss://rt.wunschkiste.app"
    : "ws://localhost:8787";

const PING_INTERVAL = 30_000;
const MAX_BACKOFF = 30_000;

export function useWishlistSync(
  wishlistId: string | undefined,
  queryKeys: string[][],
  onChatMessage?: (message: Record<string, unknown>) => void
) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(1000);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pingTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const queryKeysRef = useRef(queryKeys);
  const onChatMessageRef = useRef(onChatMessage);
  useEffect(() => {
    queryKeysRef.current = queryKeys;
    onChatMessageRef.current = onChatMessage;
  });

  useEffect(() => {
    if (!wishlistId) return;

    let mounted = true;
    let hasConnectedBefore = false;

    function connect() {
      if (!mounted) return;

      const ws = new WebSocket(`${REALTIME_URL}/${wishlistId}/websocket`);
      wsRef.current = ws;

      ws.addEventListener("open", () => {
        backoffRef.current = 1000;
        if (hasConnectedBefore) {
          for (const key of queryKeysRef.current) {
            queryClient.invalidateQueries({ queryKey: key });
          }
          queryClient.invalidateQueries({ queryKey: ["chat", wishlistId] });
        }
        hasConnectedBefore = true;
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, PING_INTERVAL);
      });

      ws.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "invalidate") {
            for (const key of queryKeysRef.current) {
              queryClient.invalidateQueries({ queryKey: key });
            }
          } else if (data.type === "chat_message" && onChatMessageRef.current) {
            onChatMessageRef.current(data.data);
          }
        } catch {
          // ignore non-JSON (e.g. "pong")
        }
      });

      ws.addEventListener("close", () => {
        cleanup();
        if (mounted) {
          reconnectTimerRef.current = setTimeout(() => {
            backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF);
            connect();
          }, backoffRef.current);
        }
      });

      ws.addEventListener("error", () => {
        ws.close();
      });
    }

    function cleanup() {
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
        pingTimerRef.current = undefined;
      }
    }

    connect();

    return () => {
      mounted = false;
      cleanup();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [wishlistId, queryClient]);
}
