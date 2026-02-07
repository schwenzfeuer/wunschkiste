import { test, expect, type Page } from "@playwright/test";
import { freshTestUser } from "../helpers";

async function registerAndLoginUI(page: Page) {
  const user = freshTestUser();

  await page.goto("/register");
  await page.fill('input[id="name"]', user.name);
  await page.fill('input[id="email"]', user.email);
  await page.fill('input[id="password"]', user.password);
  await page.getByRole("button", { name: "Registrieren" }).click();
  await page.waitForURL("**/dashboard");

  return user;
}

test.describe("Wishlist Flow", () => {
  test("create a new wishlist", async ({ page }) => {
    await registerAndLoginUI(page);

    await page.getByRole("link", { name: /Neue Kiste/i }).click();
    await page.waitForURL("**/wishlist/new");

    await page.fill('input[id="title"]', "Mein 30. Geburtstag");
    await page.fill('textarea[id="description"]', "Wünsche zum runden Geburtstag");

    // Select birthday theme
    await page.getByText("🎂").click();

    await page.getByRole("button", { name: /erstellen/i }).click();
    await page.waitForURL("**/wishlist/**");

    await expect(page.locator("h1")).toContainText("Mein 30. Geburtstag");
  });

  test("empty dashboard shows create prompt", async ({ page }) => {
    await registerAndLoginUI(page);

    await expect(page.getByText("Noch keine Wunschkisten")).toBeVisible();
    await expect(page.getByRole("link", { name: /Erste Wunschkiste erstellen/i })).toBeVisible();
  });

  test("dashboard shows created wishlist", async ({ page, request }) => {
    const user = freshTestUser();

    // Register via API
    await request.post("/api/auth/sign-up/email", {
      data: { name: user.name, email: user.email, password: user.password },
    });

    // Login via UI
    await page.goto("/login");
    await page.fill('input[id="email"]', user.email);
    await page.fill('input[id="password"]', user.password);
    await page.getByRole("button", { name: "Anmelden" }).click();
    await page.waitForURL("**/dashboard");

    // Create wishlist via API
    const createRes = await request.post("/api/wishlists", {
      data: { title: "Weihnachten 2026", theme: "christmas" },
    });
    expect(createRes.status()).toBe(201);

    // Reload dashboard
    await page.reload();
    await expect(page.getByText("Weihnachten 2026")).toBeVisible();
    await expect(page.getByText("🎄")).toBeVisible();
  });
});
