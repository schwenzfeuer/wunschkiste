import type { MetadataRoute } from "next";

const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/meine-wunschkisten",
        "/dashboard",
        "/anmelden",
        "/login",
        "/registrieren",
        "/register",
        "/passwort-vergessen",
        "/forgot-password",
        "/passwort-zuruecksetzen",
        "/reset-password",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
