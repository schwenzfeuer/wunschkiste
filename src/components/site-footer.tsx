"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-xs text-foreground/40">
          {t("affiliateDisclosure")}
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <Link href="/impressum" className="text-foreground/40 hover:text-foreground transition-colors">
            {t("imprint")}
          </Link>
          <Link href="/datenschutz" className="text-foreground/40 hover:text-foreground transition-colors">
            {t("privacy")}
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
