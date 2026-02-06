import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("shows hero section with CTA", async ({ page }) => {
    await page.goto("/de");
    await expect(page.locator("h1")).toContainText("Wünsche teilen");
    await expect(page.getByRole("link", { name: /Wunschliste erstellen/i })).toBeVisible();
  });

  test("navigation shows login and register links", async ({ page }) => {
    await page.goto("/de");
    await expect(page.getByRole("link", { name: /Anmelden/i })).toBeVisible();
    await expect(page.locator("nav").getByText(/Loslegen/i)).toBeVisible();
  });

  test("footer shows legal links", async ({ page }) => {
    await page.goto("/de");
    await expect(page.getByRole("link", { name: /Impressum/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Datenschutz/i })).toBeVisible();
  });
});
