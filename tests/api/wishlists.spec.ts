import { test, expect } from "@playwright/test";
import { registerAndLogin } from "../helpers";

test.describe("Wishlists API", () => {
  test("unauthenticated request returns 401", async ({ request }) => {
    const response = await request.get("/api/wishlists");
    expect(response.status()).toBe(401);
  });

  test("create and list wishlists", async ({ request }) => {
    await registerAndLogin(request);

    // Create
    const createRes = await request.post("/api/wishlists", {
      data: {
        title: "Mein Geburtstag",
        description: "Wünsche zum 30.",
        theme: "birthday",
      },
    });
    expect(createRes.status()).toBe(201);
    const wishlist = await createRes.json();
    expect(wishlist.title).toBe("Mein Geburtstag");
    expect(wishlist.theme).toBe("birthday");
    expect(wishlist.shareToken).toBeDefined();

    // List
    const listRes = await request.get("/api/wishlists");
    expect(listRes.ok()).toBeTruthy();
    const wishlists = await listRes.json();
    expect(wishlists).toHaveLength(1);
    expect(wishlists[0].id).toBe(wishlist.id);
  });

  test("create wishlist with default theme", async ({ request }) => {
    await registerAndLogin(request);

    const createRes = await request.post("/api/wishlists", {
      data: { title: "Standard Liste" },
    });
    expect(createRes.status()).toBe(201);
    const wishlist = await createRes.json();
    expect(wishlist.theme).toBe("standard");
  });

  test("create wishlist without title fails", async ({ request }) => {
    await registerAndLogin(request);

    const response = await request.post("/api/wishlists", {
      data: { description: "Nur Beschreibung" },
    });
    expect(response.ok()).toBeFalsy();
  });

  test("get single wishlist", async ({ request }) => {
    await registerAndLogin(request);

    const createRes = await request.post("/api/wishlists", {
      data: { title: "Test Liste" },
    });
    const wishlist = await createRes.json();

    const getRes = await request.get(`/api/wishlists/${wishlist.id}`);
    expect(getRes.ok()).toBeTruthy();
    const fetched = await getRes.json();
    expect(fetched.title).toBe("Test Liste");
  });

  test("update wishlist", async ({ request }) => {
    await registerAndLogin(request);

    const createRes = await request.post("/api/wishlists", {
      data: { title: "Original", theme: "standard" },
    });
    const wishlist = await createRes.json();

    const patchRes = await request.patch(`/api/wishlists/${wishlist.id}`, {
      data: { title: "Updated", theme: "christmas" },
    });
    expect(patchRes.ok()).toBeTruthy();
    const updated = await patchRes.json();
    expect(updated.title).toBe("Updated");
    expect(updated.theme).toBe("christmas");
  });

  test("delete wishlist", async ({ request }) => {
    await registerAndLogin(request);

    const createRes = await request.post("/api/wishlists", {
      data: { title: "Zum Löschen" },
    });
    const wishlist = await createRes.json();

    const deleteRes = await request.delete(`/api/wishlists/${wishlist.id}`);
    expect(deleteRes.status()).toBe(204);

    // Verify deleted
    const getRes = await request.get(`/api/wishlists/${wishlist.id}`);
    expect(getRes.status()).toBe(404);
  });

  test("cannot access other user's wishlist", async ({ playwright }) => {
    // User 1 creates wishlist
    const ctx1 = await playwright.request.newContext({
      baseURL: "http://localhost:3000",
      extraHTTPHeaders: { origin: "http://localhost:3000" },
    });
    await registerAndLogin(ctx1);
    const createRes = await ctx1.post("/api/wishlists", {
      data: { title: "Private Liste" },
    });
    const wishlist = await createRes.json();

    // User 2 tries to access
    const ctx2 = await playwright.request.newContext({
      baseURL: "http://localhost:3000",
      extraHTTPHeaders: { origin: "http://localhost:3000" },
    });
    await registerAndLogin(ctx2);
    const getRes = await ctx2.get(`/api/wishlists/${wishlist.id}`);
    expect(getRes.status()).toBe(404);

    await ctx1.dispose();
    await ctx2.dispose();
  });
});
