import { test, expect, type APIRequestContext } from "@playwright/test";
import { registerAndLogin } from "../helpers";

async function createWishlistWithProduct(request: APIRequestContext) {
  const wishlistRes = await request.post("/api/wishlists", {
    data: {
      title: "Freundes Wunschkiste",
      theme: "birthday",
    },
  });
  const wishlist = await wishlistRes.json();

  const productRes = await request.post(
    `/api/wishlists/${wishlist.id}/products`,
    {
      data: {
        originalUrl: "https://example.com/gift",
        title: "Nice Gift",
        price: "49.99",
        currency: "EUR",
      },
    }
  );
  const product = await productRes.json();

  return { wishlist, product };
}

async function createSecondUser(playwright: any) {
  const ctx = await playwright.request.newContext({
    baseURL: "http://localhost:3000",
    extraHTTPHeaders: { origin: "http://localhost:3000" },
  });
  await registerAndLogin(ctx);
  return ctx;
}

test.describe("Shared Wishlists API", () => {
  test("unauthenticated request returns 401", async ({ request }) => {
    const response = await request.get("/api/wishlists/shared");
    expect(response.status()).toBe(401);
  });

  test("user without saved wishlists gets empty array", async ({ request }) => {
    await registerAndLogin(request);

    const response = await request.get("/api/wishlists/shared");
    expect(response.ok()).toBeTruthy();
    const shared = await response.json();
    expect(shared).toEqual([]);
  });

  test("visiting share page auto-saves wishlist to shared list", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const otherUser = await createSecondUser(playwright);

    // Visit share page (triggers auto-save)
    const shareRes = await otherUser.get(`/api/share/${wishlist.shareToken}`);
    expect(shareRes.ok()).toBeTruthy();

    // Wishlist should now appear in shared list without any reservations
    const sharedRes = await otherUser.get("/api/wishlists/shared");
    expect(sharedRes.ok()).toBeTruthy();
    const shared = await sharedRes.json();
    expect(shared).toHaveLength(1);
    expect(shared[0].id).toBe(wishlist.id);
    expect(shared[0].title).toBe("Freundes Wunschkiste");
    expect(shared[0].shareToken).toBe(wishlist.shareToken);
    expect(shared[0].ownerName).toBeTruthy();
    expect(shared[0].myReservedCount).toBe(0);
    expect(shared[0].myBoughtCount).toBe(0);

    await otherUser.dispose();
  });

  test("multiple visits do not create duplicate entries", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const otherUser = await createSecondUser(playwright);

    // Visit share page multiple times
    await otherUser.get(`/api/share/${wishlist.shareToken}`);
    await otherUser.get(`/api/share/${wishlist.shareToken}`);
    await otherUser.get(`/api/share/${wishlist.shareToken}`);

    const sharedRes = await otherUser.get("/api/wishlists/shared");
    const shared = await sharedRes.json();
    expect(shared).toHaveLength(1);

    await otherUser.dispose();
  });

  test("owner visiting share page does not save", async ({ request }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    // Owner visits own share page
    await request.get(`/api/share/${wishlist.shareToken}`);

    const sharedRes = await request.get("/api/wishlists/shared");
    const shared = await sharedRes.json();
    expect(shared).toEqual([]);
  });

  test("unauthenticated visit does not save", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    // Anonymous user visits share page
    const anonCtx = await playwright.request.newContext({
      baseURL: "http://localhost:3000",
      extraHTTPHeaders: { origin: "http://localhost:3000" },
    });
    const shareRes = await anonCtx.get(`/api/share/${wishlist.shareToken}`);
    expect(shareRes.ok()).toBeTruthy();

    await anonCtx.dispose();
  });

  test("returns wishlist where user has reservation", async ({
    request,
    playwright,
  }) => {
    // Owner creates wishlist with product
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    // Second user reserves a product (reserve also visits share page which auto-saves)
    const otherUser = await createSecondUser(playwright);
    // Visit share page first (auto-save)
    await otherUser.get(`/api/share/${wishlist.shareToken}`);
    await otherUser.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    // Second user checks shared wishlists
    const sharedRes = await otherUser.get("/api/wishlists/shared");
    expect(sharedRes.ok()).toBeTruthy();
    const shared = await sharedRes.json();
    expect(shared).toHaveLength(1);
    expect(shared[0].id).toBe(wishlist.id);
    expect(shared[0].title).toBe("Freundes Wunschkiste");
    expect(shared[0].shareToken).toBe(wishlist.shareToken);
    expect(shared[0].ownerName).toBeTruthy();
    expect(shared[0].myReservedCount).toBe(1);
    expect(shared[0].myBoughtCount).toBe(0);

    await otherUser.dispose();
  });

  test("counts reserved and bought correctly", async ({
    request,
    playwright,
  }) => {
    // Owner creates wishlist with 2 products
    await registerAndLogin(request);
    const wishlistRes = await request.post("/api/wishlists", {
      data: { title: "Multi Product" },
    });
    const wishlist = await wishlistRes.json();

    const product1Res = await request.post(
      `/api/wishlists/${wishlist.id}/products`,
      {
        data: {
          originalUrl: "https://example.com/gift1",
          title: "Gift 1",
        },
      }
    );
    const product1 = await product1Res.json();

    const product2Res = await request.post(
      `/api/wishlists/${wishlist.id}/products`,
      {
        data: {
          originalUrl: "https://example.com/gift2",
          title: "Gift 2",
        },
      }
    );
    const product2 = await product2Res.json();

    // Second user visits share page, then reserves one and buys the other
    const otherUser = await createSecondUser(playwright);
    await otherUser.get(`/api/share/${wishlist.shareToken}`);
    await otherUser.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product1.id, status: "reserved" },
    });
    await otherUser.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product2.id, status: "bought" },
    });

    const sharedRes = await otherUser.get("/api/wishlists/shared");
    const shared = await sharedRes.json();
    expect(shared).toHaveLength(1);
    expect(shared[0].myReservedCount).toBe(1);
    expect(shared[0].myBoughtCount).toBe(1);

    await otherUser.dispose();
  });

  test("own wishlists do not appear in shared list", async ({ request }) => {
    await registerAndLogin(request);

    // Create own wishlist
    await request.post("/api/wishlists", {
      data: { title: "Meine eigene Kiste" },
    });

    const sharedRes = await request.get("/api/wishlists/shared");
    const shared = await sharedRes.json();
    expect(shared).toEqual([]);
  });

  test("unreserving all products keeps wishlist in shared list with zero counts", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const otherUser = await createSecondUser(playwright);
    await otherUser.get(`/api/share/${wishlist.shareToken}`);
    await otherUser.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    // Verify it appears with reservation count
    let sharedRes = await otherUser.get("/api/wishlists/shared");
    let shared = await sharedRes.json();
    expect(shared).toHaveLength(1);
    expect(shared[0].myReservedCount).toBe(1);

    // Unreserve
    await otherUser.delete(
      `/api/share/${wishlist.shareToken}/reserve?productId=${product.id}`
    );

    // Wishlist still appears but with zero counts
    sharedRes = await otherUser.get("/api/wishlists/shared");
    shared = await sharedRes.json();
    expect(shared).toHaveLength(1);
    expect(shared[0].myReservedCount).toBe(0);
    expect(shared[0].myBoughtCount).toBe(0);

    await otherUser.dispose();
  });

  test("deleted wishlist disappears from shared list", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const otherUser = await createSecondUser(playwright);
    await otherUser.get(`/api/share/${wishlist.shareToken}`);
    await otherUser.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    // Verify it appears
    let sharedRes = await otherUser.get("/api/wishlists/shared");
    let shared = await sharedRes.json();
    expect(shared).toHaveLength(1);

    // Owner deletes wishlist
    await request.delete(`/api/wishlists/${wishlist.id}`);

    // Verify it disappears (cascade delete removes saved_wishlists entry)
    sharedRes = await otherUser.get("/api/wishlists/shared");
    shared = await sharedRes.json();
    expect(shared).toEqual([]);

    await otherUser.dispose();
  });
});
