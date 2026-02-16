import { test, expect } from "@playwright/test";
import { registerAndLogin, freshTestUser } from "../helpers";
import { type APIRequestContext } from "@playwright/test";

async function createWishlist(request: APIRequestContext, data: Record<string, unknown> = {}) {
  const res = await request.post("/api/wishlists", {
    data: { title: "Chat Test Wishlist", ownerVisibility: "full", ...data },
  });
  return res.json();
}

async function saveWishlist(request: APIRequestContext, token: string) {
  await request.get(`/api/share/${token}`);
}

test.describe("Chat API", () => {
  test("send and receive chat messages", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const sendRes = await request.post(`/api/wishlists/${wishlist.id}/chat`, {
      data: { content: "Hallo zusammen!" },
    });
    expect(sendRes.status()).toBe(201);
    const message = await sendRes.json();
    expect(message.content).toBe("Hallo zusammen!");
    expect(message.userName).toBe("Test User");

    const getRes = await request.get(`/api/wishlists/${wishlist.id}/chat`);
    expect(getRes.ok()).toBeTruthy();
    const { messages, hasMore } = await getRes.json();
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe("Hallo zusammen!");
    expect(hasMore).toBe(false);
  });

  test("reject empty message", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const res = await request.post(`/api/wishlists/${wishlist.id}/chat`, {
      data: { content: "" },
    });
    expect(res.status()).toBe(400);
  });

  test("reject message over 2000 chars", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const res = await request.post(`/api/wishlists/${wishlist.id}/chat`, {
      data: { content: "a".repeat(2001) },
    });
    expect(res.status()).toBe(400);
  });

  test("owner with surprise visibility cannot access chat", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request, { ownerVisibility: "surprise" });

    const getRes = await request.get(`/api/wishlists/${wishlist.id}/chat`);
    expect(getRes.status()).toBe(403);

    const postRes = await request.post(`/api/wishlists/${wishlist.id}/chat`, {
      data: { content: "Test" },
    });
    expect(postRes.status()).toBe(403);
  });

  test("unauthenticated user cannot access chat", async ({ request }) => {
    const res = await request.get("/api/wishlists/00000000-0000-0000-0000-000000000000/chat");
    expect(res.status()).toBe(401);
  });

  test("non-participant cannot access chat", async ({ request, browser }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const context2 = await browser.newContext();
    const request2 = context2.request;
    await registerAndLogin(request2);

    const getRes = await request2.get(`/api/wishlists/${wishlist.id}/chat`);
    expect(getRes.status()).toBe(403);

    await context2.close();
  });

  test("participant can send and receive chat messages", async ({ request, browser }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const context2 = await browser.newContext();
    const request2 = context2.request;
    await registerAndLogin(request2);

    await saveWishlist(request2, wishlist.shareToken);

    const sendRes = await request2.post(`/api/wishlists/${wishlist.id}/chat`, {
      data: { content: "Ich kaufe das Buch!" },
    });
    expect(sendRes.status()).toBe(201);

    const getRes = await request.get(`/api/wishlists/${wishlist.id}/chat`);
    const { messages } = await getRes.json();
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe("Ich kaufe das Buch!");

    await context2.close();
  });

  test("read cursor update", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const res = await request.patch(`/api/wishlists/${wishlist.id}/chat/read`);
    expect(res.ok()).toBeTruthy();
  });

  test("mute toggle", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const muteRes = await request.patch(`/api/wishlists/${wishlist.id}/chat/mute`, {
      data: { muted: true },
    });
    expect(muteRes.ok()).toBeTruthy();

    const unmuteRes = await request.patch(`/api/wishlists/${wishlist.id}/chat/mute`, {
      data: { muted: false },
    });
    expect(unmuteRes.ok()).toBeTruthy();
  });

  test("pagination with before parameter", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    for (let i = 0; i < 3; i++) {
      await request.post(`/api/wishlists/${wishlist.id}/chat`, {
        data: { content: `Nachricht ${i + 1}` },
      });
    }

    const allRes = await request.get(`/api/wishlists/${wishlist.id}/chat`);
    const { messages: allMessages } = await allRes.json();
    expect(allMessages).toHaveLength(3);

    const beforeTs = allMessages[2].createdAt;
    const pageRes = await request.get(`/api/wishlists/${wishlist.id}/chat?before=${beforeTs}`);
    const { messages: pageMessages } = await pageRes.json();
    expect(pageMessages.length).toBeLessThan(3);
  });

  test("unreadChatCount in wishlists response", async ({ request, browser }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const context2 = await browser.newContext();
    const request2 = context2.request;
    await registerAndLogin(request2);
    await saveWishlist(request2, wishlist.shareToken);

    await request2.post(`/api/wishlists/${wishlist.id}/chat`, {
      data: { content: "Neue Nachricht" },
    });

    const listRes = await request.get("/api/wishlists");
    const wishlists = await listRes.json();
    const found = wishlists.find((w: { id: string }) => w.id === wishlist.id);
    expect(found.unreadChatCount).toBeGreaterThanOrEqual(1);

    await context2.close();
  });
});
