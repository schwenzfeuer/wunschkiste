import { test, expect } from "@playwright/test";
import { freshTestUser } from "../helpers";

test.describe("Auth Flow", () => {
  test("register and redirect to dashboard", async ({ page }) => {
    const user = freshTestUser();

    await page.goto("/registrieren");
    await expect(page.locator("h1")).toContainText("Registrieren");

    await page.fill('input[id="name"]', user.name);
    await page.fill('input[id="email"]', user.email);
    await page.fill('input[id="password"]', user.password);
    await page.getByRole("button", { name: "Registrieren" }).click();

    await page.waitForURL("**/meine-wunschkisten");
    await expect(page.locator("h1")).toContainText("Meine Wunschkisten");
  });

  test("login with valid credentials", async ({ page, request }) => {
    const user = freshTestUser();

    // Register via API
    await request.post("/api/auth/sign-up/email", {
      data: { name: user.name, email: user.email, password: user.password },
    });

    await page.goto("/anmelden");
    await expect(page.locator("h1")).toContainText("Anmelden");

    await page.fill('input[id="email"]', user.email);
    await page.fill('input[id="password"]', user.password);
    await page.getByRole("button", { name: "Anmelden" }).click();

    await page.waitForURL("**/meine-wunschkisten");
  });

  test("login with wrong password shows error", async ({ page, request }) => {
    const user = freshTestUser();

    await request.post("/api/auth/sign-up/email", {
      data: { name: user.name, email: user.email, password: user.password },
    });

    await page.goto("/anmelden");
    await page.fill('input[id="email"]', user.email);
    await page.fill('input[id="password"]', "wrongpassword");
    await page.getByRole("button", { name: "Anmelden" }).click();

    await expect(page.getByText("Ungültige E-Mail oder Passwort")).toBeVisible();
  });

  test("google auth button is visible on login page", async ({ page }) => {
    await page.goto("/anmelden");
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
  });

  test("google auth button is visible on register page", async ({ page }) => {
    await page.goto("/registrieren");
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
  });

  test("register link from login page works", async ({ page }) => {
    await page.goto("/anmelden");
    await page.getByRole("link", { name: "Registrieren" }).click();
    await page.waitForURL("**/registrieren");
  });

  test("login link from register page works", async ({ page }) => {
    await page.goto("/registrieren");
    await page.getByRole("link", { name: "Anmelden" }).click();
    await page.waitForURL("**/anmelden");
  });
});
