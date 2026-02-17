import { test, expect, type APIRequestContext } from "@playwright/test";
import { registerAndLogin } from "../helpers";

async function createWishlistWithProduct(request: APIRequestContext) {
  const wishlistRes = await request.post("/api/wishlists", {
    data: { title: "Editor Test Wishlist" },
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

async function makeEditor(
  ownerRequest: APIRequestContext,
  wishlistId: string,
  userId: string
) {
  const res = await ownerRequest.patch(
    `/api/wishlists/${wishlistId}/participants`,
    { data: { userId, role: "editor" } }
  );
  expect(res.ok()).toBeTruthy();
}

async function joinWishlist(
  userRequest: APIRequestContext,
  shareToken: string
) {
  const res = await userRequest.get(`/api/share/${shareToken}`);
  expect(res.ok()).toBeTruthy();
  return res.json();
}

test.describe("Co-Editor Role Management", () => {
  test("owner can promote participant to editor", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    // Get participants
    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    expect(participants).toHaveLength(1);
    expect(participants[0].role).toBe("participant");

    // Promote to editor
    const patchRes = await request.patch(
      `/api/wishlists/${wishlist.id}/participants`,
      { data: { userId: participants[0].id, role: "editor" } }
    );
    expect(patchRes.ok()).toBeTruthy();
    const patchData = await patchRes.json();
    expect(patchData.role).toBe("editor");

    // Verify role changed
    const participantsRes2 = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants2 = await participantsRes2.json();
    expect(participants2[0].role).toBe("editor");
  });

  test("owner can demote editor to participant", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    const userId = participants[0].id;

    await makeEditor(request, wishlist.id, userId);

    // Demote
    const demoteRes = await request.patch(
      `/api/wishlists/${wishlist.id}/participants`,
      { data: { userId, role: "participant" } }
    );
    expect(demoteRes.ok()).toBeTruthy();

    const participantsRes2 = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants2 = await participantsRes2.json();
    expect(participants2[0].role).toBe("participant");
  });

  test("non-owner cannot change roles", async ({ request, playwright }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const otherCtx = await createSecondUser(playwright);
    await joinWishlist(otherCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();

    // Non-owner tries to promote
    const patchRes = await otherCtx.patch(
      `/api/wishlists/${wishlist.id}/participants`,
      { data: { userId: participants[0].id, role: "editor" } }
    );
    expect(patchRes.status()).toBe(404);
  });

  test("owner cannot change own role", async ({ request }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    // Get owner's session to find their userId
    const wishlistRes = await request.get(`/api/wishlists/${wishlist.id}`);
    const wishlistData = await wishlistRes.json();
    const ownerId = wishlistData.userId;

    const patchRes = await request.patch(
      `/api/wishlists/${wishlist.id}/participants`,
      { data: { userId: ownerId, role: "editor" } }
    );
    expect(patchRes.status()).toBe(400);
  });
});

test.describe("Editor Product Access", () => {
  test("editor can list products", async ({ request, playwright }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    await makeEditor(request, wishlist.id, participants[0].id);

    // Editor lists products
    const productsRes = await editorCtx.get(
      `/api/wishlists/${wishlist.id}/products`
    );
    expect(productsRes.ok()).toBeTruthy();
    const products = await productsRes.json();
    expect(products).toHaveLength(1);
  });

  test("editor can add product", async ({ request, playwright }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    await makeEditor(request, wishlist.id, participants[0].id);

    // Editor adds product
    const addRes = await editorCtx.post(
      `/api/wishlists/${wishlist.id}/products`,
      {
        data: {
          originalUrl: "https://example.com/editor-gift",
          title: "Editor Added Gift",
        },
      }
    );
    expect(addRes.status()).toBe(201);
  });

  test("editor can update product", async ({ request, playwright }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    await makeEditor(request, wishlist.id, participants[0].id);

    // Editor updates product
    const patchRes = await editorCtx.patch(
      `/api/wishlists/${wishlist.id}/products/${product.id}`,
      { data: { title: "Updated by Editor" } }
    );
    expect(patchRes.ok()).toBeTruthy();
    const updated = await patchRes.json();
    expect(updated.title).toBe("Updated by Editor");
  });

  test("editor can delete product", async ({ request, playwright }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    await makeEditor(request, wishlist.id, participants[0].id);

    // Editor deletes product
    const deleteRes = await editorCtx.delete(
      `/api/wishlists/${wishlist.id}/products/${product.id}`
    );
    expect(deleteRes.status()).toBe(204);
  });

  test("non-editor participant cannot access products API", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const otherCtx = await createSecondUser(playwright);
    await joinWishlist(otherCtx, wishlist.shareToken);

    // Participant (not editor) tries to list products
    const productsRes = await otherCtx.get(
      `/api/wishlists/${wishlist.id}/products`
    );
    expect(productsRes.status()).toBe(404);
  });
});

test.describe("Editor Restrictions", () => {
  test("editor cannot update wishlist settings", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    await makeEditor(request, wishlist.id, participants[0].id);

    // Editor tries to update wishlist
    const patchRes = await editorCtx.patch(`/api/wishlists/${wishlist.id}`, {
      data: { title: "Hijacked" },
    });
    expect(patchRes.status()).toBe(404);
  });

  test("editor cannot delete wishlist", async ({ request, playwright }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    await makeEditor(request, wishlist.id, participants[0].id);

    // Editor tries to delete wishlist
    const deleteRes = await editorCtx.delete(`/api/wishlists/${wishlist.id}`);
    expect(deleteRes.status()).toBe(404);
  });

  test("editor cannot reserve on co-managed wishlist", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    await makeEditor(request, wishlist.id, participants[0].id);

    // Editor tries to reserve
    const reserveRes = await editorCtx.post(
      `/api/share/${wishlist.shareToken}/reserve`,
      { data: { productId: product.id } }
    );
    expect(reserveRes.status()).toBe(403);
  });
});

test.describe("Editor GET Wishlist", () => {
  test("editor can GET wishlist with role field", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    await makeEditor(request, wishlist.id, participants[0].id);

    // Editor GETs wishlist
    const wishlistRes = await editorCtx.get(`/api/wishlists/${wishlist.id}`);
    expect(wishlistRes.ok()).toBeTruthy();
    const data = await wishlistRes.json();
    expect(data.role).toBe("editor");
    expect(data.title).toBe("Editor Test Wishlist");
  });

  test("owner GET wishlist returns role=owner", async ({ request }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const wishlistRes = await request.get(`/api/wishlists/${wishlist.id}`);
    expect(wishlistRes.ok()).toBeTruthy();
    const data = await wishlistRes.json();
    expect(data.role).toBe("owner");
  });
});

test.describe("Share API isEditor", () => {
  test("share response includes isEditor=true for editors", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    await makeEditor(request, wishlist.id, participants[0].id);

    // Editor checks share page
    const shareRes = await editorCtx.get(
      `/api/share/${wishlist.shareToken}`
    );
    expect(shareRes.ok()).toBeTruthy();
    const shareData = await shareRes.json();
    expect(shareData.isEditor).toBe(true);
  });

  test("share response includes isEditor=false for participants", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const otherCtx = await createSecondUser(playwright);
    const shareData = await joinWishlist(otherCtx, wishlist.shareToken);
    expect(shareData.isEditor).toBe(false);
  });
});

test.describe("Shared Wishlists API role", () => {
  test("shared wishlists include role field", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    await makeEditor(request, wishlist.id, participants[0].id);

    // Editor checks shared wishlists
    const sharedRes = await editorCtx.get("/api/wishlists/shared");
    expect(sharedRes.ok()).toBeTruthy();
    const sharedData = await sharedRes.json();
    expect(sharedData).toHaveLength(1);
    expect(sharedData[0].role).toBe("editor");
  });
});

test.describe("Demotion Edge Case", () => {
  test("demoted editor loses product access", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    const editorCtx = await createSecondUser(playwright);
    await joinWishlist(editorCtx, wishlist.shareToken);

    const participantsRes = await request.get(
      `/api/wishlists/${wishlist.id}/participants`
    );
    const participants = await participantsRes.json();
    const userId = participants[0].id;

    // Promote
    await makeEditor(request, wishlist.id, userId);

    // Verify access
    const productsRes = await editorCtx.get(
      `/api/wishlists/${wishlist.id}/products`
    );
    expect(productsRes.ok()).toBeTruthy();

    // Demote
    await request.patch(`/api/wishlists/${wishlist.id}/participants`, {
      data: { userId, role: "participant" },
    });

    // Verify no access
    const productsRes2 = await editorCtx.get(
      `/api/wishlists/${wishlist.id}/products`
    );
    expect(productsRes2.status()).toBe(404);
  });
});
