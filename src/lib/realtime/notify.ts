import { getCloudflareContext } from "@opennextjs/cloudflare";

interface DurableObjectStub {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface DurableObjectId {}

interface DurableObjectBinding {
  idFromName(name: string): DurableObjectId;
  get(id: DurableObjectId): DurableObjectStub;
}

interface RealtimeEnv {
  WISHLIST_ROOM?: DurableObjectBinding;
}

export async function notifyWishlistRoom(shareToken: string): Promise<void> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const realtimeEnv = env as unknown as RealtimeEnv;
    const wishlistRoom = realtimeEnv.WISHLIST_ROOM;
    if (!wishlistRoom) return;

    const roomId = wishlistRoom.idFromName(shareToken);
    const stub = wishlistRoom.get(roomId);
    await stub.fetch(new Request("https://do/notify"));
  } catch {
    // Graceful degradation: no realtime in dev without DO binding
  }
}
