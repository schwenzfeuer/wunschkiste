import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/dashboard": {
      de: "/meine-wunschkisten",
      en: "/dashboard",
    },
    "/wishlist/new": {
      de: "/wunschkiste/neu",
      en: "/wishlist/new",
    },
    "/wishlist/[id]": {
      de: "/wunschkiste/[id]",
      en: "/wishlist/[id]",
    },
    "/share/[token]": {
      de: "/teilen/[token]",
      en: "/share/[token]",
    },
    "/login": {
      de: "/anmelden",
      en: "/login",
    },
    "/register": {
      de: "/registrieren",
      en: "/register",
    },
    "/forgot-password": {
      de: "/passwort-vergessen",
      en: "/forgot-password",
    },
    "/reset-password": {
      de: "/passwort-zuruecksetzen",
      en: "/reset-password",
    },
    "/impressum": "/impressum",
    "/datenschutz": {
      de: "/datenschutz",
      en: "/privacy",
    },
    "/admin": "/admin",
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
