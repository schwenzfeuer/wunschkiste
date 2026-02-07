import { test, expect, type APIRequestContext } from "@playwright/test";
import { registerAndLogin } from "../helpers";

async function createWishlistWithProduct(
  request: APIRequestContext,
  opts?: { ownerVisibility?: string; eventDate?: string }
) {
  const wishlistRes = await request.post("/api/wishlists", {
    data: {
      title: "Shared Wishlist",
      theme: "birthday",
      ...(opts?.ownerVisibility && { ownerVisibility: opts.ownerVisibility }),
      ...(opts?.eventDate && { eventDate: opts.eventDate }),
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

test.describe("Share API", () => {
  test("access shared wishlist by token", async ({ request }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const shareRes = await request.get(`/api/share/${wishlist.shareToken}`);
    expect(shareRes.ok()).toBeTruthy();
    const shared = await shareRes.json();
    expect(shared.title).toBe("Shared Wishlist");
    expect(shared.theme).toBe("birthday");
    expect(shared.products).toHaveLength(1);
    expect(shared.products[0].title).toBe("Nice Gift");
    expect(shared.products[0].status).toBe("available");
  });

  test("invalid share token returns 404", async ({ request }) => {
    const res = await request.get("/api/share/nonexistent123");
    expect(res.status()).toBe(404);
  });

  test("reserve a product (authenticated, non-owner)", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const otherUser = await createSecondUser(playwright);

    const reserveRes = await otherUser.post(
      `/api/share/${wishlist.shareToken}/reserve`,
      { data: { productId: product.id, message: "Wird besorgt!" } }
    );
    expect(reserveRes.status()).toBe(201);
    const reservation = await reserveRes.json();
    expect(reservation.status).toBe("reserved");
    expect(reservation.message).toBe("Wird besorgt!");

    // Verify product status via share endpoint
    const shareRes = await otherUser.get(
      `/api/share/${wishlist.shareToken}`
    );
    const shared = await shareRes.json();
    expect(shared.products[0].status).toBe("reserved");
    expect(shared.products[0].claimedByMe).toBe(true);

    await otherUser.dispose();
  });

  test("cannot reserve already reserved product", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const user2 = await createSecondUser(playwright);
    const user3 = await createSecondUser(playwright);

    await user2.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    const res = await user3.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });
    expect(res.status()).toBe(409);

    await user2.dispose();
    await user3.dispose();
  });
});

test.describe("Reserve Auth & Permissions", () => {
  test("reserve without auth returns 401", async ({ request, playwright }) => {
    const ownerCtx = await createSecondUser(playwright);
    const { wishlist, product } = await createWishlistWithProduct(ownerCtx);

    // Unauthenticated request context
    const res = await request.post(
      `/api/share/${wishlist.shareToken}/reserve`,
      { data: { productId: product.id } }
    );
    expect(res.status()).toBe(401);

    await ownerCtx.dispose();
  });

  test("owner cannot reserve own wishlist", async ({ request }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const res = await request.post(
      `/api/share/${wishlist.shareToken}/reserve`,
      { data: { productId: product.id } }
    );
    expect(res.status()).toBe(403);
  });

  test("buy product directly (status=bought)", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const otherUser = await createSecondUser(playwright);
    const reserveRes = await otherUser.post(
      `/api/share/${wishlist.shareToken}/reserve`,
      { data: { productId: product.id, status: "bought" } }
    );
    expect(reserveRes.status()).toBe(201);
    const reservation = await reserveRes.json();
    expect(reservation.status).toBe("bought");

    await otherUser.dispose();
  });
});

test.describe("Unreserve (DELETE)", () => {
  test("unreserve own reservation returns 204", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const otherUser = await createSecondUser(playwright);
    await otherUser.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    const deleteRes = await otherUser.delete(
      `/api/share/${wishlist.shareToken}/reserve?productId=${product.id}`
    );
    expect(deleteRes.status()).toBe(204);

    // Verify product is available again
    const shareRes = await otherUser.get(
      `/api/share/${wishlist.shareToken}`
    );
    const shared = await shareRes.json();
    expect(shared.products[0].status).toBe("available");

    await otherUser.dispose();
  });

  test("cannot unreserve someone else's reservation", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const user2 = await createSecondUser(playwright);
    const user3 = await createSecondUser(playwright);

    await user2.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    const deleteRes = await user3.delete(
      `/api/share/${wishlist.shareToken}/reserve?productId=${product.id}`
    );
    expect(deleteRes.status()).toBe(403);

    await user2.dispose();
    await user3.dispose();
  });
});

test.describe("PATCH reserved→bought upgrade", () => {
  test("upgrade reservation from reserved to bought", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const otherUser = await createSecondUser(playwright);
    await otherUser.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    const patchRes = await otherUser.patch(
      `/api/share/${wishlist.shareToken}/reserve`,
      { data: { productId: product.id } }
    );
    expect(patchRes.ok()).toBeTruthy();
    const updated = await patchRes.json();
    expect(updated.status).toBe("bought");

    await otherUser.dispose();
  });

  test("cannot upgrade someone else's reservation", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const user2 = await createSecondUser(playwright);
    const user3 = await createSecondUser(playwright);

    await user2.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    const patchRes = await user3.patch(
      `/api/share/${wishlist.shareToken}/reserve`,
      { data: { productId: product.id } }
    );
    expect(patchRes.status()).toBe(403);

    await user2.dispose();
    await user3.dispose();
  });

  test("cannot upgrade already bought reservation", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const otherUser = await createSecondUser(playwright);
    await otherUser.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id, status: "bought" },
    });

    const patchRes = await otherUser.patch(
      `/api/share/${wishlist.shareToken}/reserve`,
      { data: { productId: product.id } }
    );
    expect(patchRes.status()).toBe(400);

    await otherUser.dispose();
  });
});

test.describe("Owner Visibility", () => {
  test("full visibility: owner sees who reserved", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request, {
      ownerVisibility: "full",
    });

    const otherUser = await createSecondUser(playwright);
    await otherUser.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    // Owner views share page
    const shareRes = await request.get(
      `/api/share/${wishlist.shareToken}`
    );
    const shared = await shareRes.json();
    expect(shared.isOwner).toBe(true);
    expect(shared.products[0].status).toBe("reserved");
    expect(shared.products[0].claimedByName).toBeTruthy();

    await otherUser.dispose();
  });

  test("partial visibility: owner sees status but not name", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request, {
      ownerVisibility: "partial",
    });

    const otherUser = await createSecondUser(playwright);
    await otherUser.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    const shareRes = await request.get(
      `/api/share/${wishlist.shareToken}`
    );
    const shared = await shareRes.json();
    expect(shared.isOwner).toBe(true);
    expect(shared.products[0].status).toBe("reserved");
    expect(shared.products[0].claimedByName).toBeNull();

    await otherUser.dispose();
  });

  test("surprise visibility: owner sees nothing about reservations", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request, {
      ownerVisibility: "surprise",
    });

    const otherUser = await createSecondUser(playwright);
    await otherUser.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    const shareRes = await request.get(
      `/api/share/${wishlist.shareToken}`
    );
    const shared = await shareRes.json();
    expect(shared.isOwner).toBe(true);
    expect(shared.claimedCount).toBe(1);
    expect(shared.products[0].status).toBe("available");
    expect(shared.products[0].claimedByName).toBeNull();

    await otherUser.dispose();
  });

  test("non-owner always sees reservation status and name", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request, {
      ownerVisibility: "surprise",
    });

    const user2 = await createSecondUser(playwright);
    await user2.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id },
    });

    const user3 = await createSecondUser(playwright);
    const shareRes = await user3.get(
      `/api/share/${wishlist.shareToken}`
    );
    const shared = await shareRes.json();
    expect(shared.isOwner).toBe(false);
    expect(shared.products[0].status).toBe("reserved");
    expect(shared.products[0].claimedByName).toBeTruthy();

    await user2.dispose();
    await user3.dispose();
  });
});

test.describe("EventDate & OwnerVisibility in Wishlists CRUD", () => {
  test("create wishlist with eventDate and ownerVisibility", async ({
    request,
  }) => {
    await registerAndLogin(request);

    const eventDate = "2026-12-25T00:00:00.000Z";
    const createRes = await request.post("/api/wishlists", {
      data: {
        title: "Weihnachten",
        theme: "christmas",
        eventDate,
        ownerVisibility: "surprise",
      },
    });
    expect(createRes.status()).toBe(201);
    const wishlist = await createRes.json();
    expect(wishlist.eventDate).toBeTruthy();
    expect(wishlist.ownerVisibility).toBe("surprise");
  });

  test("update wishlist eventDate and ownerVisibility", async ({
    request,
  }) => {
    await registerAndLogin(request);

    const createRes = await request.post("/api/wishlists", {
      data: { title: "Test", ownerVisibility: "full" },
    });
    const wishlist = await createRes.json();
    expect(wishlist.ownerVisibility).toBe("full");

    const patchRes = await request.patch(`/api/wishlists/${wishlist.id}`, {
      data: {
        eventDate: "2026-06-15T00:00:00.000Z",
        ownerVisibility: "partial",
      },
    });
    expect(patchRes.ok()).toBeTruthy();
    const updated = await patchRes.json();
    expect(updated.eventDate).toBeTruthy();
    expect(updated.ownerVisibility).toBe("partial");
  });

  test("clear eventDate by setting null", async ({ request }) => {
    await registerAndLogin(request);

    const createRes = await request.post("/api/wishlists", {
      data: {
        title: "With date",
        eventDate: "2026-12-25T00:00:00.000Z",
      },
    });
    const wishlist = await createRes.json();

    const patchRes = await request.patch(`/api/wishlists/${wishlist.id}`, {
      data: { eventDate: null },
    });
    expect(patchRes.ok()).toBeTruthy();
    const updated = await patchRes.json();
    expect(updated.eventDate).toBeNull();
  });

  test("share endpoint returns eventDate and ownerVisibility", async ({
    request,
  }) => {
    await registerAndLogin(request);

    const createRes = await request.post("/api/wishlists", {
      data: {
        title: "Birthday",
        theme: "birthday",
        eventDate: "2026-08-20T00:00:00.000Z",
        ownerVisibility: "full",
      },
    });
    const wishlist = await createRes.json();

    const shareRes = await request.get(
      `/api/share/${wishlist.shareToken}`
    );
    expect(shareRes.ok()).toBeTruthy();
    const shared = await shareRes.json();
    expect(shared.eventDate).toBeTruthy();
    expect(shared.ownerVisibility).toBe("full");
  });
});
