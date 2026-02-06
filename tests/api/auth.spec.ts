import { test, expect } from "@playwright/test";
import { freshTestUser } from "../helpers";

test.describe("Auth API", () => {
  test("register a new user via email", async ({ request }) => {
    const user = freshTestUser();

    const response = await request.post("/api/auth/sign-up/email", {
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(user.email);
    expect(body.user.name).toBe(user.name);
  });

  test("login with registered user", async ({ request }) => {
    const user = freshTestUser();

    // Register first
    await request.post("/api/auth/sign-up/email", {
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    // Login
    const response = await request.post("/api/auth/sign-in/email", {
      data: {
        email: user.email,
        password: user.password,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(user.email);
  });

  test("login with wrong password fails", async ({ request }) => {
    const user = freshTestUser();

    // Register first
    await request.post("/api/auth/sign-up/email", {
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    // Login with wrong password
    const response = await request.post("/api/auth/sign-in/email", {
      data: {
        email: user.email,
        password: "wrongpassword123",
      },
    });

    expect(response.ok()).toBeFalsy();
  });

  test("duplicate registration fails", async ({ request }) => {
    const user = freshTestUser();

    // Register first time
    await request.post("/api/auth/sign-up/email", {
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    // Register same email again
    const response = await request.post("/api/auth/sign-up/email", {
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    expect(response.ok()).toBeFalsy();
  });
});
