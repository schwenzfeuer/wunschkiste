import { test, expect } from "@playwright/test";
import { registerAndLogin } from "../helpers";

async function createWishlistWithProduct(request: any) {
  const wishlistRes = await request.post("/api/wishlists", {
    data: { title: "Shared Wishlist", theme: "birthday" },
  });
  const wishlist = await wishlistRes.json();

  const productRes = await request.post(`/api/wishlists/${wishlist.id}/products`, {
    data: {
      originalUrl: "https://example.com/gift",
      title: "Nice Gift",
      price: "49.99",
      currency: "EUR",
    },
  });
  const product = await productRes.json();

  return { wishlist, product };
}

test.describe("Share API", () => {
  test("access shared wishlist by token", async ({ request }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request);

    // Access via share token (public, no auth needed)
    const shareRes = await request.get(`/api/share/${wishlist.shareToken}`);
    expect(shareRes.ok()).toBeTruthy();
    const shared = await shareRes.json();
    expect(shared.title).toBe("Shared Wishlist");
    expect(shared.theme).toBe("birthday");
    expect(shared.products).toHaveLength(1);
    expect(shared.products[0].title).toBe("Nice Gift");
  });

  test("invalid share token returns 404", async ({ request }) => {
    const res = await request.get("/api/share/nonexistent123");
    expect(res.status()).toBe(404);
  });

  test("reserve a product", async ({ request }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    const reserveRes = await request.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: {
        productId: product.id,
        reservedByName: "Tante Inge",
        message: "Wird besorgt!",
      },
    });
    expect(reserveRes.status()).toBe(201);
    const reservation = await reserveRes.json();
    expect(reservation.reservedByName).toBe("Tante Inge");
    expect(reservation.message).toBe("Wird besorgt!");

    // Verify product is now reserved
    const shareRes = await request.get(`/api/share/${wishlist.shareToken}`);
    const shared = await shareRes.json();
    expect(shared.products[0].isReserved).toBe(true);
  });

  test("cannot reserve already reserved product", async ({ request }) => {
    await registerAndLogin(request);
    const { wishlist, product } = await createWishlistWithProduct(request);

    // First reservation
    await request.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id, reservedByName: "Person 1" },
    });

    // Second reservation should fail
    const res = await request.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id, reservedByName: "Person 2" },
    });
    expect(res.status()).toBe(409);
  });
});
