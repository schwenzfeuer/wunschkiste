import { DurableObject } from "cloudflare:workers";

interface Env {
  WISHLIST_ROOM: DurableObjectNamespace<WishlistRoom>;
}

const ALLOWED_ORIGINS = [
  "https://wunschkiste.app",
  "http://localhost:3000",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export class WishlistRoom extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/notify")) {
      const websockets = this.ctx.getWebSockets();
      for (const ws of websockets) {
        ws.send(JSON.stringify({ type: "invalidate" }));
      }
      return new Response("OK", { status: 200 });
    }

    if (url.pathname.endsWith("/websocket")) {
      const upgradeHeader = request.headers.get("Upgrade");
      if (upgradeHeader !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
      }

      const pair = new WebSocketPair();
      this.ctx.acceptWebSocket(pair[1]);
      this.ctx.setWebSocketAutoResponse(
        new WebSocketRequestResponsePair("ping", "pong")
      );

      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    return new Response("Not found", { status: 404 });
  }

  async webSocketClose(
    ws: WebSocket,
    _code: number,
    _reason: string,
    _wasClean: boolean
  ): Promise<void> {
    ws.close();
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    // Expected paths: /{token}/websocket or /{token}/notify
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length !== 2) {
      return new Response("Not found", { status: 404 });
    }

    const [token, action] = parts;
    if (action !== "websocket" && action !== "notify") {
      return new Response("Not found", { status: 404 });
    }

    const roomId = env.WISHLIST_ROOM.idFromName(token);
    const room = env.WISHLIST_ROOM.get(roomId);

    const doUrl = new URL(request.url);
    doUrl.pathname = `/${action}`;

    const response = await room.fetch(new Request(doUrl, request));

    if (response.status === 101) {
      return response;
    }

    const newResponse = new Response(response.body, response);
    for (const [key, value] of Object.entries(corsHeaders(origin))) {
      newResponse.headers.set(key, value);
    }
    return newResponse;
  },
} satisfies ExportedHandler<Env>;
