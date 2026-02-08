import { test, expect, type APIRequestContext } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";
import { registerAndLogin } from "../helpers";

function loadEnvLocal(): Record<string, string> {
  const envPath = resolve(__dirname, "../../.env.local");
  const content = readFileSync(envPath, "utf-8");
  const vars: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    vars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
  return vars;
}

const env = loadEnvLocal();
const CRON_API_KEY = env.CRON_API_KEY;

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

async function createWishlistWithProduct(
  request: APIRequestContext,
  opts?: { eventDate?: string }
) {
  const wishlistRes = await request.post("/api/wishlists", {
    data: {
      title: "Reminder Test Wishlist",
      theme: "birthday",
      ...(opts?.eventDate && { eventDate: opts.eventDate }),
    },
  });
  const wishlist = await wishlistRes.json();

  const productRes = await request.post(
    `/api/wishlists/${wishlist.id}/products`,
    {
      data: {
        originalUrl: "https://example.com/gift",
        title: "Test Gift",
        price: "29.99",
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

function reminderRequest(request: APIRequestContext, apiKey?: string) {
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  return request.post("/api/reminders/send", { headers });
}

test.describe("Reminders API", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  test("returns 401 without API key", async ({ request }) => {
    const res = await reminderRequest(request);
    expect(res.status()).toBe(401);
  });

  test("returns 401 with wrong API key", async ({ request }) => {
    const res = await reminderRequest(request, "wrong-key");
    expect(res.status()).toBe(401);
  });

  test("returns 200 with valid API key", async ({ request }) => {
    const res = await reminderRequest(request, CRON_API_KEY);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(typeof body.sent).toBe("number");
    expect(typeof body.skipped).toBe("number");
    expect(typeof body.errors).toBe("number");
  });

  test("fresh participant (joined < 24h ago) is not reminded", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);
    const { wishlist } = await createWishlistWithProduct(request, {
      eventDate: daysFromNow(3),
    });

    const participant = await createSecondUser(playwright);
    await participant.get(`/api/share/${wishlist.shareToken}`);

    // Drain any old reminders first
    await reminderRequest(request, CRON_API_KEY);

    // Participant just joined -> should not be reminded
    const res = await reminderRequest(request, CRON_API_KEY);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.sent).toBe(0);

    await participant.dispose();
  });

  test("buyer is skipped, owner is not reminded", async ({
    request,
    playwright,
  }) => {
    await registerAndLogin(request);

    const { wishlist, product } = await createWishlistWithProduct(request, {
      eventDate: daysFromNow(3),
    });
    const buyer = await createSecondUser(playwright);
    await buyer.get(`/api/share/${wishlist.shareToken}`);
    await buyer.post(`/api/share/${wishlist.shareToken}/reserve`, {
      data: { productId: product.id, status: "bought" },
    });

    // Wishlist without any participants (owner only)
    await createWishlistWithProduct(request, {
      eventDate: daysFromNow(3),
    });

    const res = await reminderRequest(request, CRON_API_KEY);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.sent).toBe(0);
    expect(body.errors).toBe(0);

    await buyer.dispose();
  });
});
