import { type APIRequestContext } from "@playwright/test";

export function freshTestUser() {
  return {
    name: "Test User",
    email: `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    password: "testpassword123",
  };
}

/**
 * Registers a fresh user. Playwright's APIRequestContext automatically
 * stores cookies from the response, so subsequent requests are authenticated.
 */
export async function registerAndLogin(request: APIRequestContext) {
  const user = freshTestUser();

  const signUpRes = await request.post("/api/auth/sign-up/email", {
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  });

  if (!signUpRes.ok()) {
    throw new Error(`Registration failed: ${signUpRes.status()} ${await signUpRes.text()}`);
  }

  return { user };
}
