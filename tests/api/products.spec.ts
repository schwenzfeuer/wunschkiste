import { test, expect } from "@playwright/test";
import { registerAndLogin } from "../helpers";

async function createWishlist(request: any) {
  const res = await request.post("/api/wishlists", {
    data: { title: "Test Wishlist" },
  });
  return res.json();
}

test.describe("Products API", () => {
  test("add product to wishlist", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const res = await request.post(`/api/wishlists/${wishlist.id}/products`, {
      data: {
        originalUrl: "https://www.example.com/product/123",
        title: "Test Produkt",
        price: "29.99",
        currency: "EUR",
        shopName: "Example Shop",
      },
    });

    expect(res.status()).toBe(201);
    const product = await res.json();
    expect(product.title).toBe("Test Produkt");
    expect(product.price).toBe("29.99");
    expect(product.originalUrl).toBe("https://www.example.com/product/123");
  });

  test("list products of wishlist", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    // Add 2 products
    await request.post(`/api/wishlists/${wishlist.id}/products`, {
      data: { originalUrl: "https://example.com/1", title: "Produkt 1" },
    });
    await request.post(`/api/wishlists/${wishlist.id}/products`, {
      data: { originalUrl: "https://example.com/2", title: "Produkt 2" },
    });

    const res = await request.get(`/api/wishlists/${wishlist.id}/products`);
    expect(res.ok()).toBeTruthy();
    const products = await res.json();
    expect(products).toHaveLength(2);
  });

  test("add product without title fails", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const res = await request.post(`/api/wishlists/${wishlist.id}/products`, {
      data: { originalUrl: "https://example.com/test" },
    });

    expect(res.ok()).toBeFalsy();
  });

  test("delete product", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const createRes = await request.post(`/api/wishlists/${wishlist.id}/products`, {
      data: { originalUrl: "https://example.com/del", title: "Zum Löschen" },
    });
    const product = await createRes.json();

    const deleteRes = await request.delete(
      `/api/wishlists/${wishlist.id}/products/${product.id}`
    );
    expect(deleteRes.status()).toBe(204);

    // Verify deleted
    const listRes = await request.get(`/api/wishlists/${wishlist.id}/products`);
    const products = await listRes.json();
    expect(products).toHaveLength(0);
  });

  test("update product", async ({ request }) => {
    await registerAndLogin(request);
    const wishlist = await createWishlist(request);

    const createRes = await request.post(`/api/wishlists/${wishlist.id}/products`, {
      data: { originalUrl: "https://example.com/upd", title: "Original" },
    });
    const product = await createRes.json();

    const patchRes = await request.patch(
      `/api/wishlists/${wishlist.id}/products/${product.id}`,
      {
        data: { title: "Updated", price: "19.99" },
      }
    );
    expect(patchRes.ok()).toBeTruthy();
    const updated = await patchRes.json();
    expect(updated.title).toBe("Updated");
    expect(updated.price).toBe("19.99");
  });
});
